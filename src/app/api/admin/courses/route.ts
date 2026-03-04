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

export async function POST(req: Request) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const { title, slug, price, duration, features } = await req.json();

  if (!title || !slug) {
    return NextResponse.json({ message: "Título é obrigatório." }, { status: 400 });
  }

  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ message: "Já existe um curso com esse slug." }, { status: 409 });
  }

  const course = await prisma.course.create({
    data: {
      title,
      slug,
      price: price || 0,
      duration: duration || null,
      features: features || [],
    },
  });

  return NextResponse.json(course, { status: 201 });
}
