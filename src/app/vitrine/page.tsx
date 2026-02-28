import { auth } from "@/auth";
import VitrineCursos from "../components/VitrineCursos";
import { db } from "../../../prisma/db";
export const dynamic = "force-dynamic";

export default async function VitrinePage() {
  const session = await auth();

  // 1. Buscamos o usuário
  const userDb = await db.user.findUnique({
    where: { email: session?.user?.email || "" },
    include: { enrollments: true }
  });

  // 2. BUSCAMOS OS CURSOS (O que estava faltando!)
  const courses = await db.course.findMany({
    orderBy: {
      title: 'asc' // Opcional: organiza por nome
    }
  });
  // Verificamos se ele está logado MAS não tem CPF cadastrado
  const usuarioPrecisaCadastrarCpf = session?.user && !userDb?.cpf;
  // 3. PASSAMOS TUDO PARA O CLIENT COMPONENT
  return (
    <VitrineCursos
      key={session?.user?.id || "guest"}
      session={session}
      userDb={userDb}
      courses={courses} // Agora os cursos chegam lá!
      travarCpf={true}
    />
  );
}