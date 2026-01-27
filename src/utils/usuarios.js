import { prisma } from "../lib/prisma";

export async function buscarUsuarioPorCPF(cpfQueVemDoFront) {
  try {
    // 1. Criamos a versão limpa (apenas números)
    const cpfLimpo = cpfQueVemDoFront.replace(/\D/g, '');

    // 2. Criamos a versão com pontos (exatamente como está na foto do seu Prisma Studio)
    // Isso transforma 75474964749 em 754.749.647-49
    const cpfComPontos = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

    console.log("Tentando buscar por:", cpfLimpo, "OU", cpfComPontos);

    const usuario = await prisma.user.findFirst({
      where: {
        OR: [
          { cpf: cpfLimpo },     // Caso esteja sem pontos no banco
          { cpf: cpfComPontos }  // Caso esteja COM pontos no banco (seu caso atual)
        ]
      }
    });

    return usuario;
  } catch (error) {
    console.error("Erro na busca:", error);
    return null;
  }
}