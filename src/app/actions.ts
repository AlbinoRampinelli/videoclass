"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Função exigida pela página de SignOn (Cadastro manual)
 * Resolve o erro de 'Export createUser doesn't exist' no build.
 */
export async function createUser(prevState: any, formData: FormData) {
  // Como o foco agora é Google Login, deixamos um aviso caso alguém tente usar o manual
  return { error: "O cadastro manual está desativado. Por favor, use o Login via Google." };
}
export async function updateCourseAction(courseId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const price = parseFloat(formData.get("price") as string);
  const duration = formData.get("duration") as string;
  // Transforma a string de tópicos em um Array
  const featuresString = formData.get("features") as string;
  const features = featuresString.split(",").map(f => f.trim()).filter(f => f !== "");

  try {
    await db.course.update({
      where: { id: courseId },
      data: {
        title,
        price,
        duration,
        features,
      },
    });
    
    revalidatePath("/admin/courses");
    revalidatePath("/vitrine");
    revalidatePath("/"); // Atualiza a Landing Page também
    
    return { success: true };
  } catch (error) {
    return { error: "Erro ao atualizar curso." };
  }
}
/**
 * Função para atualizar o perfil do usuário (CPF/Tipo) e registrar interesse.
 * Esta é a lógica que você enviou na API, agora como Server Action.
 */
export async function handleLeadAction(data: { cpf: string; userType: string; courseId: string }) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return { error: "Você precisa estar logado." };
  }

  try {
    const { cpf, userType, courseId } = data;

    // 1. Atualiza o CPF e Tipo no perfil do usuário
    await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        cpf: cpf,
        userType: userType 
      }
    });

    // 2. Cria o registro de lead (interesse no curso)
    const lead = await prisma.lead.create({
      data: {
        userId: session.user.id,
        courseId: courseId,
      }
    });

    // Limpa o cache para mostrar os dados atualizados
    revalidatePath("/vitrine");
    
    return { success: true, lead };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "Este CPF já está cadastrado em outra conta." };
    }
    return { error: "Erro interno ao processar seus dados." };
  }
}