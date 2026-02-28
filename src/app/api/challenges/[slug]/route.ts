import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Use o @ para evitar o ../../../../

export async function GET(
  request: Request,
  props: { params: Promise<{ slug: string }> } // Tipagem padrão do Next.js 15
) {
  try {
    // 1. Desembrulha os parâmetros com await
    const { slug } = await props.params;

    // 2. Busca no banco
    const challenge = await prisma.challenge.findUnique({
      where: { slug: slug },
    });

    // 3. Se não encontrar, retorna 404
    if (!challenge) {
      return NextResponse.json(
        { error: "Desafio não encontrado", slugEnviado: slug }, 
        { status: 404 }
      );
    }

    // 4. Se encontrar, retorna o JSON
    return NextResponse.json(challenge);

  } catch (error) {
    console.error("Erro na API de Challenges:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" }, 
      { status: 500 }
    );
  }
}