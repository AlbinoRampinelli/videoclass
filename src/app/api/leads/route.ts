import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("DADOS RECEBIDOS NA API:", body);

    const { nome, email, cpf, whatsapp, escola, cursoId, userType } = body;

    // Validação básica
    if (!nome || !email || !cpf) {
       return NextResponse.json({ message: "Campos obrigatórios faltando." }, { status: 400 });
    }

    // UPSERT: Se o CPF existir, ele ATUALIZA (update). Se não existir, ele CRIA (create).
    const lead = await prisma.lead.upsert({
      where: {
        cpf: cpf, // O Prisma usa o CPF para identificar se o registro é único
      },
      update: {
        // Se já existe, atualizamos o interesse dele
        nome,
        email,
        whatsapp,
        escola,
        cursoId,
        userType: userType || "PAI", // Garante que o tipo de usuário seja salvo
        status: "INTERESSE_ATUALIZADO" 
      },
      create: {
        // Se não existe, cria um novo
        nome,
        email,
        cpf,
        whatsapp,
        escola,
        cursoId,
        userType,
        status: "PENDENTE"
      }
    });

    console.log("SUCESSO NO PRISMA (Lead/Interesse):", lead.id);
    
    // Retornamos 201 se for novo ou 200 se for apenas uma atualização
    return NextResponse.json(lead, { status: 201 });

  } catch (error: any) {
    console.error("ERRO CRÍTICO NO PRISMA:", error.code, error.message);

    // O erro P2002 não deve mais acontecer por causa do Upsert, 
    // mas mantemos o tratamento por segurança para outros campos Unique (como email se houver)
    if (error.code === 'P2002') {
      return NextResponse.json({ message: "Este registro já existe em nossa base." }, { status: 409 });
    }

    return NextResponse.json({ message: "Erro ao salvar no banco.", error: error.message }, { status: 500 });
  }
}