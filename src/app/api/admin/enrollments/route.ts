import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).userType !== "ADMIN") {
    return { error: NextResponse.json({ message: "Acesso negado." }, { status: 403 }) };
  }
  return { session };
}

// POST: matricular usuário num curso
export async function POST(req: Request) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const { userId, courseId } = await req.json();
  if (!userId || !courseId) {
    return NextResponse.json({ message: "userId e courseId são obrigatórios." }, { status: 400 });
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) {
    return NextResponse.json({ message: "Aluno já matriculado neste curso." }, { status: 409 });
  }

  const enrollment = await prisma.enrollment.create({
    data: { userId, courseId },
  });

  return NextResponse.json(enrollment, { status: 201 });
}
