import { auth } from "@/auth"; // Certifique-se que o arquivo auth.ts está na sua pasta /src
import { db } from "../../../../../prisma/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Pega a sessão usando o padrão do Auth.js v5 / Next.js 15
    const session = await auth();
    
    const body = await req.json();
    const { cpf, phone } = body;

    // Se não houver e-mail na sessão, o Prisma vai dar erro de 'undefined'.
    // Esta verificação impede que o servidor trave (tela vermelha).
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Você precisa estar logado para completar o perfil." }, 
        { status: 401 }
      );
    }

    // Atualiza o usuário que acabou de logar via Google
    const updatedUser = await db.user.update({
      where: { 
        email: session.user.email 
      },
      data: { 
        cpf: cpf,
        phone: phone,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error: any) {
    console.error("ERRO_PRISMA:", error);

    // Se o CPF já existir no banco, o Prisma lança o erro P2002
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Este CPF já está cadastrado em nossa base." }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Ocorreu um erro interno ao salvar seus dados." }, 
      { status: 500 }
    );
  }
}