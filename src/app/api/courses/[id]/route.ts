import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    select: { id: true, title: true, price: true, slug: true, isOpen: true },
  });
  if (!course) return NextResponse.json({ message: "Curso não encontrado." }, { status: 404 });
  return NextResponse.json(course);
}
