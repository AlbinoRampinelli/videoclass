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

// DELETE: remover matrícula
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const { id } = await params;
  await prisma.enrollment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
