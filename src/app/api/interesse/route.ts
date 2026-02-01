import { auth } from "@/auth";
import { db } from "../../../../prisma/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    // 1. Verificação de segurança
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { cursoId, userType, schoolName } = body;

    // 2. Atualiza os dados extras no perfil do usuário
    await db.user.update({
      where: { id: session.user.id },
      data: { 
        userType: userType, 
        schoolName: schoolName 
      }
    });

    // 3. Cria o interesse na tabela Enrollment (Exatamente como no seu schema)
    const novoInteresse = await db.enrollment.create({
      data: {
        userId: session.user.id,
        courseId: cursoId, // Aqui usamos cursoId que vem do modal para preencher o courseId do banco
      }
    });

    return NextResponse.json({ success: true, data: novoInteresse });

  } catch (error: any) {
    console.error("ERRO_PRISMA:", error);
    return NextResponse.json(
      { error: "Erro ao registrar no banco", details: error.message }, 
      { status: 500 }
    );
  }
}