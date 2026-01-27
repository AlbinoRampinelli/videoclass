"use server"

import { auth } from "@/auth";
import db from "../../prisma/db"; 
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

// FUNÇÃO DO MODAL (SALVAR CPF)
export async function saveCpf(formData: FormData) {
  const session = await auth();
  const rawCpf = formData.get("cpf")?.toString();
  const cpf = rawCpf ? rawCpf.replace(/\D/g, '') : null;

  if (!session?.user?.email) return { error: "Usuário não autenticado" };
  if (!cpf || cpf.length !== 11) return { error: "CPF inválido" };

  try {
    await db.user.update({
      where: { email: session.user.email },
      data: { cpf: cpf },
    });

    revalidatePath("/"); 
    return { success: true };
  } catch (error) {
    console.error("Erro no Prisma:", error);
    return { error: "Falha ao gravar no banco" };
  }
}

// FUNÇÃO DE CADASTRO MANUAL (RESOLVENDO O ERRO DO PASSWORD)
export async function createUser(formData: FormData) {
  const email = formData.get("email")?.toString();
  const rawPassword = formData.get("password")?.toString();

  // A validação de senha agora está DENTRO da função correta
  if (!rawPassword || rawPassword.trim() === "") {
    return { error: "Senha é obrigatória" };
  }

  const password: string = rawPassword; 
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.user.create({
      data: {
        email: email as string,
        passwordHash: hashedPassword, // Usando o nome exato do seu schema.prisma
      }
    });
    return { success: true };
  } catch (error) {
    return { error: "Erro ao criar conta" };
  }
}