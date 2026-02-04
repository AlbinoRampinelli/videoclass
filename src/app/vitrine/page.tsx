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

  // 3. PASSAMOS TUDO PARA O CLIENT COMPONENT
  return (
    <VitrineCursos 
      session={session} 
      userDb={userDb} 
      courses={courses} // Agora os cursos chegam lá!
      travarCpf={true} 
    />
  );
}