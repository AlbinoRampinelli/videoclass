import { auth } from "@/auth";
import VitrineCursos from "../components/VitrineCursos";
import { db } from "../../../prisma/db";

export default async function VitrinePage() {
  const session = await auth(); // Pega a sessão no servidor
  
  // Busca o usuário no banco para passar o userDb
  const userDb = await db.user.findUnique({
    where: { email: session?.user?.email || "" },
    include: { enrollments: true }
  });

  // IMPORTANTE: Passar a session e o userDb como props
  return <VitrineCursos session={session} userDb={userDb} />;
}