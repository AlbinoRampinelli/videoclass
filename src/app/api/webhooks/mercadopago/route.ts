import { MercadoPagoConfig, Payment } from 'mercadopago';
import db from "../../../../../prisma/db";
import { NextResponse } from 'next/server';

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "" 
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // O MP às vezes envia o ID na URL (query) ou no body
        const { searchParams } = new URL(request.url);
        const paymentId = body.data?.id || body.id || searchParams.get("data.id");

        console.log("-----------------------------------------");
        console.log("🔔 WEBHOOK RECEBIDO");
        console.log("🆔 ID do Pagamento:", paymentId);

        if (!paymentId || paymentId === "123456") {
            console.log("⏭️ Ignorando teste genérico.");
            return NextResponse.json({ ok: true }, { status: 200 });
        }

        const payment = new Payment(client);
        const p = await payment.get({ id: String(paymentId) }).catch((err) => {
            console.error("❌ Erro ao buscar pagamento no MP:", err.message);
            return null;
        });

        if (!p) {
            console.log("❌ Pagamento não encontrado no Mercado Pago.");
            return NextResponse.json({ ok: true }, { status: 200 });
        }

        console.log("📊 Status do Pagamento:", p.status);
        console.log("👤 External Reference (User ID):", p.external_reference);
        console.log("📚 Metadata (Course ID):", p.metadata?.course_id);

        if (p.status === 'approved' || p.status === 'pending') {
            const userId = p.external_reference;
            const courseId = String(p.metadata?.course_id || "");

            if (userId && courseId) {
                console.log("📝 Tentando gravar no banco...");
                const enrollment = await db.enrollment.upsert({
                    where: {
                        userId_courseId: { userId, courseId }
                    },
                    update: {},
                    create: { userId, courseId }
                });
                console.log("✅ MATRÍCULA SALVA COM SUCESSO!", enrollment);
            } else {
                console.log("⚠️ Faltando UserId ou CourseId no pagamento.");
            }
        } else {
            console.log("⏳ Pagamento ainda não está aprovado.");
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error("💥 ERRO FATAL NO WEBHOOK:", error);
        return NextResponse.json({ received: true }, { status: 200 });
    }
}

export const dynamic = 'force-dynamic';