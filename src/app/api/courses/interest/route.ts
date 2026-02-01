import { auth } from "@/auth"; 
import { NextResponse } from "next/server";
import db from "../../../../../prisma/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { courseId, userType, schoolName } = await req.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 1. Primeiro atualizamos os dados de perfil do usuário (Pai/Escola)
    await db.user.update({
      where: { email: session.user.email },
      data: { userType, schoolName }
    });

    // 2. Criamos o registro de interesse/matrícula
    // Certifique-se de que sua tabela chama 'enrollment' ou 'interest'
    const interest = await db.enrollment.create({
      data: {
        userId: session.user.id, // O ID do usuário na sessão
        courseId: courseId,      // O ID do curso que vem do modal
        status: "INTERESSADO",   // Um status inicial
      }
    });

    return NextResponse.json(interest);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao salvar interesse" }, { status: 500 });
  }
}