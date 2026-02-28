import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ajuste o caminho do seu prisma client
import { auth } from "@/auth";

export async function POST(req: Request) {
 const session = await auth();
  if (!session?.user?.email) return new NextResponse("Não autorizado", { status: 401 });

  const { challengeId, grade, code } = await req.json();

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return new NextResponse("Usuário não encontrado", { status: 404 });

  const result = await prisma.submission.create({
    data: {
      userId: user.id,
      challengeId,
      grade,
      code,
      completed: grade >= 7,
    },
  });

  return NextResponse.json(result);
}