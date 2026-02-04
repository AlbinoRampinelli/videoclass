import { auth } from "@/auth";
import { db } from "../../../../prisma/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { cursoId, userType, schoolName, cpf } = body;

    // 1. Atualiza o Usuário (Isso garante que o CPF salve no perfil)
    await db.user.update({
      where: { id: session.user.id },
      data: { 
        userType: userType, 
        schoolName: schoolName,
        cpf: cpf // <-- Certifique-se que o campo 'cpf' existe no model User
      }
    });

    // 2. SALVA NA TABELA CERTA: 'Interest' (conforme sua foto)
    // Se o código antes usava 'enrollment', ele estava mandando para a aba errada
    const novoInteresse = await db.interest.create({
      data: {
        userId: session.user.id,
        courseId: cursoId,
        cpf: cpf, // A sua foto mostra que a tabela Interest tem uma coluna CPF!
      }
    });

    return NextResponse.json({ success: true, data: novoInteresse });

  } catch (error: any) {
    console.error("ERRO_PRISMA:", error);
    return NextResponse.json(
      { error: "Erro ao salvar", details: error.message }, 
      { status: 500 }
    );
  }
}