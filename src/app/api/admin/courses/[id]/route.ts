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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const { id } = await params;
  const body = await req.json();

  const course = await prisma.course.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.duration !== undefined && { duration: body.duration }),
      ...(body.features !== undefined && { features: body.features }),
      ...(body.isOpen !== undefined && { isOpen: body.isOpen }),
    },
  });

  return NextResponse.json(course);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const { id } = await params;
  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
