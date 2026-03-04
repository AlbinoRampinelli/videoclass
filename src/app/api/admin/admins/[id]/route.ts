import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  if (session.user.userType !== "ADMIN") {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  const { id: targetId } = await params;
  const callerId = session.user.id;

  if (callerId === targetId) {
    return NextResponse.json(
      { message: "Você não pode remover seu próprio acesso de ADMIN." },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, userType: true },
  });

  if (!target) {
    return NextResponse.json({ message: "Usuário não encontrado." }, { status: 404 });
  }

  if (target.userType !== "ADMIN") {
    return NextResponse.json({ message: "Este usuário não é ADMIN." }, { status: 409 });
  }

  await prisma.user.update({
    where: { id: targetId },
    data: { userType: "OUTRO" },
  });

  return NextResponse.json({ success: true });
}
