import { auth } from "@/auth";
import { db } from "../../../../../prisma/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { cpf, phone } = body;

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Você precisa estar logado para completar o perfil." }, 
        { status: 401 }
      );
    }

    // 1. BUSCA SE JÁ EXISTE ALGUÉM COM ESSE CPF
    const existingCpfOwner = await db.user.findUnique({
      where: { cpf: cpf },
      select: { email: true }
    });

    // 2. SE O CPF JÁ EXISTE E NÃO É DO USUÁRIO LOGADO -> ERRO
    if (existingCpfOwner && existingCpfOwner.email !== session.user.email) {
      return NextResponse.json(
        { error: "Este CPF já está cadastrado em outra conta." }, 
        { status: 400 }
      );
    }

    // 3. SE O CPF JÁ É DELE OU ESTÁ LIVRE -> ATUALIZA
    const updatedUser = await db.user.update({
      where: { email: session.user.email },
      data: { 
        cpf: cpf,
        phone: phone,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error: any) {
    console.error("ERRO_PRISMA:", error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Erro de duplicidade. Verifique se os dados estão corretos." }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno ao salvar." }, 
      { status: 500 }
    );
  }
}