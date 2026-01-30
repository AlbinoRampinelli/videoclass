import { auth } from "@/auth";
import { db } from "../../../../../prisma/db"; // Use o @ para não errar o caminho
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    
    // Limpa os dados
    const cleanCpf = body.cpf?.replace(/\D/g, "");
    const cleanPhone = body.phone?.replace(/\D/g, "");

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    }

    if (!cleanCpf || cleanCpf.length !== 11) {
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 });
    }

    // 1. Verifica se o CPF já existe em outro usuário
    const existingUserWithCpf = await db.user.findUnique({
      where: { cpf: cleanCpf }
    });

    if (existingUserWithCpf && existingUserWithCpf.email !== session.user.email) {
      return NextResponse.json({ 
        error: "Este CPF já está vinculado a outra conta." 
      }, { status: 409 }); 
    }

    // 2. Salva no banco (Docker)
    await db.user.update({
      where: { email: session.user.email },
      data: { 
        cpf: cleanCpf,
        phone: cleanPhone 
      },
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("ERRO NA API:", error);
    return NextResponse.json({ error: "Erro ao salvar no banco" }, { status: 500 });
  }
}