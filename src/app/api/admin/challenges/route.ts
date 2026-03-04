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
  const { title, slug, description, initialCode, expected, courseSlug, moduleId, videoId, order } = body;

  if (!title || !slug || !courseSlug) {
    return NextResponse.json({ message: "Título, slug e curso são obrigatórios." }, { status: 400 });
  }

  const challenge = await prisma.challenge.create({
    data: {
      title,
      slug,
      description: description || "",
      initialCode: initialCode || "",
      expected: expected || "",
      testCode: "",
      courseSlug,
      moduleId: moduleId || null,
      videoId: videoId || null,
      order: Number(order) || 0,
    },
  });

  return NextResponse.json(challenge, { status: 201 });
}
