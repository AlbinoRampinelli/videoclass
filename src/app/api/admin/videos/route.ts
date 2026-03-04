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

  const body = await req.json();
  const { title, moduleId, order, url, pdfUrl, description } = body;

  if (!title || !moduleId) {
    return NextResponse.json({ message: "Título e módulo são obrigatórios." }, { status: 400 });
  }

  const video = await prisma.video.create({
    data: {
      title,
      moduleId,
      order: Number(order) || 0,
      url: url || null,
      pdfUrl: pdfUrl || null,
      description: description || null,
    },
  });

  return NextResponse.json(video, { status: 201 });
}
