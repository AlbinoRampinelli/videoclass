"use server"

import { db } from "../../prisma/db";
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
    await db.user.update({
      where: { email: session.user.email },
      data: {
        cpf: cpf,
        userType: userType
      }
    });

    // 2. Cria o registro de lead (interesse no curso)
    const lead = await db.lead.create({
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

/**
 * Cria um novo Módulo para um Curso
 */
export async function createModuleAction(courseId: string, title: string, order: number) {
  try {
    const newModule = await db.module.create({
      data: {
        courseId,
        title,
        order,
      },
    });
    revalidatePath("/admin/cursos");
    return { success: true, module: newModule };
  } catch (error) {
    return { error: "Erro ao criar módulo." };
  }
}

/**
 * Adiciona um Vídeo ou um Desafio (Exercício) ao Módulo
 */
export async function addContentToModuleAction(moduleId: string, type: "VIDEO" | "CHALLENGE", data: any) {
  try {
    if (type === "VIDEO") {
      await db.video.create({
        data: {
          title: data.title,
          url: data.url, // Ex: /videos/instalacao_python.mp4
          order: data.order,
          moduleId: moduleId,
        },
      });
    } else {
      await db.challenge.create({
        data: {
          title: data.title,
          description: data.description,
          order: data.order,
          slug: data.slug,
          initialCode: data.initialCode || "",
          testCode: data.testCode || "",
          expected: data.expected || "",
          courseSlug: data.courseSlug,
          moduleId: moduleId,
        },
      });
    }

    revalidatePath("/admin/cursos");
    revalidatePath("/minha-classe");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao adicionar conteúdo ao módulo." };
  }
}
export async function marcarVideoConcluidoAction(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    await db.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId,
        },
      },
      update: { completed: true },
      create: {
        userId: session.user.id,
        lessonId: lessonId,
        completed: true,
      },
    });

    revalidatePath("/minha-classe");
    return { success: true };
  } catch (error) {
    return { error: "Erro ao salvar progresso" };
  }
}

export async function criarConteudoAction(formData: FormData) {
  const title = formData.get("title") as string;
  const url = formData.get("url") as string;
  const type = formData.get("type") as string; // 'VIDEO' ou 'DESAFIO'
  const moduleSlug = formData.get("moduleSlug") as string; // Ex: 'python-do-zero'

  // 1. Busca o módulo pelo slug para pegar o ID
  const modulo = await db.module.findFirst({
    where: { course: { slug: moduleSlug } }
  });

  if (!modulo) throw new Error("Módulo não encontrado");

  // 2. Cria o vídeo/desafio no banco
  await db.video.create({
    data: {
      title,
      url,
      moduleId: modulo.id,
      order: 1, // Você pode automatizar a ordem depois
    }
  });

  // Limpa o cache para a aula nova aparecer no Aside na hora
  revalidatePath(`/minha-classe/${moduleSlug}`);
}

export async function salvarSubmissaoAction(challengeId: string, code: string, grade: number) {
  // Por enquanto, como teste, vamos usar um ID fixo ou pegar da sessão se você tiver Auth
  const userId = "id-do-aluno-teste"; 

  return await db.submission.create({
    data: {
      userId,
      challengeId,
      code,
      grade,
      completed: grade >= 10, // Fica true se a nota for 10
    },
  });
}

export async function editarDesafioAction(formData: FormData) {
  const id = formData.get("id") as string; // ID do registro que está editando
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const initialCode = formData.get("initialCode") as string;
  const expectedOutput = formData.get("expectedOutput") as string;

  await db.video.update({
    where: { id },
    data: {
      title,
      description,
      initialCode,
      expectedOutput, // Garanta que este campo existe no seu schema.prisma
    }
  });

  revalidatePath("/admin");
}