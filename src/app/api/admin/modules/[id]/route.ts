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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const { id } = await params;
  const { title, courseId, order, videoUrl, pdfUrl } = await req.json();

  const module = await prisma.module.update({
    where: { id },
    data: {
      title,
      courseId,
      order: Number(order) || 0,
      videoUrl: videoUrl || null,
      pdfUrl: pdfUrl || null,
    },
  });

  return NextResponse.json(module);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const { id } = await params;
  await prisma.module.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
