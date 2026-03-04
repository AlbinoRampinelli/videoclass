import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ message: "Não autenticado." }, { status: 401 }) };
  }
  if (session.user.userType !== "ADMIN") {
    return { error: NextResponse.json({ message: "Acesso negado." }, { status: 403 }) };
  }
  return { session };
}

export async function GET() {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const admins = await prisma.user.findMany({
    where: { userType: "ADMIN" },
    select: {
      id: true,
      name: true,
      email: true,
      cpf: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(admins);
}

export async function POST(req: Request) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const body = await req.json();
  const { query } = body;

  if (!query || typeof query !== "string" || query.trim() === "") {
    return NextResponse.json({ message: "Informe um e-mail ou CPF válido." }, { status: 400 });
  }

  const searchTerm = query.trim();
  const cpfClean = searchTerm.replace(/\D/g, "");

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: searchTerm },
        ...(cpfClean.length > 0 ? [{ cpf: cpfClean }] : []),
      ],
    },
    select: { id: true, name: true, email: true, cpf: true, userType: true },
  });

  if (!user) {
    return NextResponse.json({ message: "Usuário não encontrado." }, { status: 404 });
  }

  if (user.userType === "ADMIN") {
    return NextResponse.json({ message: "Este usuário já é ADMIN." }, { status: 409 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { userType: "ADMIN" },
    select: { id: true, name: true, email: true, cpf: true },
  });

  return NextResponse.json(updated, { status: 201 });
}
