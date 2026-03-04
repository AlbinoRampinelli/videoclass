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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const { id } = await params;
  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) return NextResponse.json({ message: "Não encontrado." }, { status: 404 });

  return NextResponse.json(video);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const { id } = await params;
  const { title, description, order, url, pdfUrl } = await req.json();

  const video = await prisma.video.update({
    where: { id },
    data: {
      title,
      description: description || null,
      order: Number(order) || 0,
      url: url || null,
      pdfUrl: pdfUrl || null,
    },
  });

  return NextResponse.json(video);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const { id } = await params;

  await prisma.video.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
