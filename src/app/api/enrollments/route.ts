import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST: aluno se auto-matricula após pagamento
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Você precisa estar logado." }, { status: 401 });
  }

  const { courseId } = await req.json();
  if (!courseId) {
    return NextResponse.json({ message: "courseId é obrigatório." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ message: "Usuário não encontrado." }, { status: 404 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.isOpen) {
    return NextResponse.json({ message: "Curso não está disponível." }, { status: 400 });
  }

  // Idempotente: não duplica matrícula
  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    update: {},
    create: { userId: user.id, courseId },
  });

  return NextResponse.json(enrollment, { status: 201 });
}
