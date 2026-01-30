import { prisma as db } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, userType, schoolName } = body;

    console.log(" [DEBUG] Tentando atualizar:", email);

    // Teste 1: O usuário existe?
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      console.log(" [ERRO] Usuário não encontrado no banco!");
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 400 });
    }

    // Teste 2: Atualização
    await db.user.update({
      where: { email },
      data: { 
        userType: userType as any, 
        schoolName: schoolName 
      },
    });

    console.log(" ✅ [SUCESSO] Banco atualizado!");
    return NextResponse.json({ success: true });

  } catch (error: any) {
    // ESSE LOG VAI APARECER NO TERMINAL EM VERMELHO
    console.error(" ❌ [ERRO CRÍTICO NO PRISMA]:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}