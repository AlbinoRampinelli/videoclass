"use server"

import { db } from "../../prisma/db";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";

/**
 * ACTION: Cadastro de Usuário (Sem Senha)
 */
export async function createUser(prevState: any, formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        
        // Limpamos CPF e Phone para salvar apenas números
        const cpf = (formData.get("cpf") as string)?.replace(/\D/g, "");
        const phone = (formData.get("phone") as string)?.replace(/\D/g, "");

        // 1. Validações básicas (Removido senha daqui)
        if (!name || !email || !cpf || !phone) {
            return { message: "Preencha todos os campos obrigatórios." };
        }

        if (cpf.length !== 11) {
            return { message: "CPF inválido. Digite os 11 números." };
        }

        // 2. Verificar se o CPF já existe
        const existingUser = await db.user.findUnique({
            where: { cpf: cpf }
        });

        if (existingUser) {
            return { message: "Este CPF já está cadastrado. Vá para a tela de login." };
        }

        // 3. Criar o usuário no Banco (Sem o campo password)
        await db.user.create({
            data: {
                name,
                email,
                cpf,
                phone,
            },
        });

        console.log("✅ Usuário criado com sucesso:", email);

    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT') throw error; // Necessário para o redirect funcionar
        console.error("ERRO AO CRIAR USUÁRIO:", error);
        return { message: "Erro interno ao criar conta." };
    }

    // Redireciona para o login para ele receber o código OTP
    redirect("/signin");
}

/**
 * ACTION: Logout (Resolve o erro do componente Aside)
 */
export async function handleLogout() {
    await signOut({ redirectTo: "/signin" });
}