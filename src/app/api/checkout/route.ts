import { MercadoPagoConfig, Payment } from 'mercadopago';
import db from "../../../../prisma/db"; // <<-- CERTIFIQUE-SE QUE ESTE CAMINHO EXISTE
import { auth } from "@/auth"; 
import { NextRequest, NextResponse } from "next/server"; // Importação única e correta

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "" 
});

export async function POST(request: Request) {
    try {
        const session = await auth();
        
        // Verificação de segurança
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const { courseId, paymentMethod, cardToken, installments } = body;

        // 1. Busca o usuário para pegar o CPF do modal
        const user = await db.user.findUnique({
            where: { email: session.user.email }
        });

        // 2. Busca o curso para o preço
        const course = await db.course.findUnique({
            where: { id: courseId }
        });

        if (!user || !course) {
            return NextResponse.json({ error: "Dados não encontrados" }, { status: 404 });
        }

        const payment = new Payment(client);

        const paymentData: any = {
            body: {
                transaction_amount: Number(course.price), // Garante que é número
                description: `Curso: ${course.title}`,
                payment_method_id: paymentMethod, 
                external_reference: user.id, 
                metadata: { course_id: course.id },
                payer: {
                    email: user.email,
                    identification: {
                        type: 'CPF',
                        number: user.cpf?.replace(/\D/g, '') || ''
                    },
                },
            },
        };

        if (paymentMethod !== 'pix') {
            paymentData.body.token = cardToken;
            paymentData.body.installments = installments || 1;
        }

        const response = await payment.create(paymentData);

        return NextResponse.json(response);

    } catch (error: any) {
        console.error("Erro no checkout:", error);
        return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
    }
}