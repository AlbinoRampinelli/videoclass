import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "ADMIN") {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  const { items } = await req.json() as { items: { id: string; order: number }[] };

  await Promise.all(
    items.map((item) =>
      prisma.module.update({ where: { id: item.id }, data: { order: item.order } })
    )
  );

  return NextResponse.json({ success: true });
}
