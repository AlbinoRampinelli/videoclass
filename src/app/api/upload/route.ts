import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { randomUUID } from "crypto";

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "ADMIN") {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return NextResponse.json({ message: "Arquivo não encontrado." }, { status: 400 });
  }

  const ext = extname(file.name) || "";
  const filename = `${randomUUID()}${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  await writeFile(join(uploadDir, filename), Buffer.from(bytes));

  return NextResponse.json({ url: `/uploads/${filename}` });
}
