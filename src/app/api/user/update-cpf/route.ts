import { auth } from "@/auth";
import { db } from "../../../../../prisma/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const cleanCpf = body.cpf.replace(/\D/g, "");

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    }

    if (cleanCpf.length !== 11) {
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 });
    }

    // 1. Verificar se esse CPF já está em uso por outro e-mail
    const existingUserWithCpf = await db.user.findUnique({
      where: { cpf: cleanCpf }
    });

    if (existingUserWithCpf && existingUserWithCpf.email !== session.user.email) {
      return NextResponse.json({ 
        error: "Este CPF já está vinculado a outra conta." 
      }, { status: 409 }); // Conflict
    }

    // 2. Prosseguir com o update/upsert
    const updatedUser = await db.user.upsert({
      where: { email: session.user.email },
      update: { cpf: cleanCpf },
      create: { 
        email: session.user.email,
        name: session.user.name || "",
        cpf: cleanCpf,
        image: session.user.image || ""
      },
    });

    console.log("3. Sucesso! Usuário atualizado:", updatedUser.email);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("ERRO CRÍTICO NA API:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}