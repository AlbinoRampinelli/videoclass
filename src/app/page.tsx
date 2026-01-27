import { auth } from "@/auth";
import db from "../../prisma/db";
import LandingPage from "./components/LandingPage";
import VitrineCursos from "./components/VitrineCursos";

export default async function Home() {
  const session = await auth();

  // 1. DESLOGADO -> Landing Page Pura
  if (!session) {
    return <LandingPage />;
  }

  // 2. LOGADO -> Busca dados e manda para a Vitrine Interna
  const userDb = await db.user.findUnique({
    where: { email: session.user?.email! },
    include: { enrollments: true }
  });

  return (
    <VitrineCursos 
      userDb={userDb} 
      session={session} 
    />
  );
}