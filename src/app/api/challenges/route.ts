import { db } from "../../../../prisma/db";
import { NextResponse } from "next/server";

// --- MÉTODO PARA BUSCAR DESAFIOS (O que o Lab usa) ---
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseSlug = searchParams.get("courseSlug");

    if (!courseSlug) {
      return NextResponse.json({ error: "Faltou o courseSlug" }, { status: 400 });
    }

    const challenges = await db.challenge.findMany({
      where: { courseSlug: courseSlug },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(challenges);
  } catch (error) {
    console.error("Erro no GET challenges:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// --- MÉTODO PARA SALVAR (O que o Admin usa) ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, slug, description, expected, courseSlug, order, initialCode, testCode } = body;

    const challenge = await db.challenge.create({
      data: {
        title,
        slug,
        description,
        expected,
        courseSlug,
        order: Number(order),
        initialCode,
        testCode: testCode || "# Teste padrão\nprint(solucao())",
      },
    });

    return NextResponse.json(challenge);
  } catch (error) {
    console.error("Erro no POST challenges:", error);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}