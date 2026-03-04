import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.userType !== "ADMIN") {
    return { error: NextResponse.json({ message: "Acesso negado." }, { status: 403 }) };
  }
  return { session };
}

export async function POST(req: Request) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const { title, courseId, order, videoUrl, pdfUrl } = await req.json();

  if (!title || !courseId) {
    return NextResponse.json({ message: "Título e oficina são obrigatórios." }, { status: 400 });
  }

  const module = await prisma.module.create({
    data: {
      title,
      courseId,
      order: Number(order) || 0,
      videoUrl: videoUrl || null,
      pdfUrl: pdfUrl || null,
    },
  });

  return NextResponse.json(module, { status: 201 });
}
