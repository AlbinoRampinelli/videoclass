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
  const { title, slug, description, initialCode, expected, order } = await req.json();

  const challenge = await prisma.challenge.update({
    where: { id },
    data: {
      title,
      slug,
      description: description || "",
      initialCode: initialCode || "",
      expected: expected || "",
      order: Number(order) || 0,
    },
  });

  return NextResponse.json(challenge);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const { id } = await params;
  await prisma.challenge.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
