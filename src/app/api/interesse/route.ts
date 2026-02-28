import { auth } from "@/auth"; // No v5, importamos apenas o 'auth'
import { db } from "../../../../prisma/db";

export async function POST(req: Request) {
  try {
    // 1. Pega a sessão do jeito v5 (simples e direto)
    const session = await auth();

    // 2. Verifica se o usuário está logado
    if (!session?.user?.id) {
      return new Response("Não autorizado", { status: 401 });
    }

    // 3. Pega os dados enviados pelo modal (JSON)
    const body = await req.json();
    const { cursoId, cpf } = body;

    // 4. Grava no banco usando UPSERT (evita erro de duplicidade)
    const novoInteresse = await db.interest.upsert({
      where: {
        // Usa o índice composto userId + courseId
        userId_courseId: {
          userId: session.user.id,
          courseId: String(cursoId),
        },
      },
      update: {
        // Se já existir, apenas atualiza a data e garante que o CPF esteja lá
        createdAt: new Date(),
        cpf: cpf
      },
      create: {
        userId: session.user.id,
        courseId: String(cursoId),
        cpf: cpf, // Aqui mata o erro "Argument cpf is missing"
      },
    });

    return Response.json(novoInteresse);
  } catch (error) {
    console.error("ERRO_INTERESSE_API:", error);
    return new Response("Erro ao registrar interesse", { status: 500 });
  }
}