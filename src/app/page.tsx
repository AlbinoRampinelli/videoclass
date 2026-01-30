import { auth } from "@/auth";
import db from "../../prisma/db";
import LandingPage from "./components/LandingPage";
import VitrineCursos from "./components/VitrineCursos";
import CpfModal from "./components/CpfModal";

export default async function Home() {
  const session = await auth();

  // 1. DESLOGADO -> Landing Page Pura
  if (!session) {
    return <LandingPage />;
  }

  // 2. LOGADO -> Busca dados do usuário
  const userDb = await db.user.findUnique({
    where: { email: session.user?.email || "" }, // Evita erro se o email vier nulo
    include: { enrollments: true }
  });

  // --- TRAVA DE SEGURANÇA ---
  // Se logou (ex: via Google) mas o banco não tem CPF:
  if (userDb && !userDb.cpf) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        {/* Renderizamos o modal e passamos o ID do usuário para ele atualizar o banco depois */}
        <CpfModal userId={userDb.id} />
        
        {/* Opcional: Você pode renderizar a Vitrine borrada ao fundo para ficar bonito */}
        <div className="opacity-20 pointer-events-none w-full">
           <VitrineCursos userDb={userDb} session={session} />
        </div>
      </div>
    );
  }

  // 3. LOGADO E COM CPF -> Vitrine Liberada
  return (
    <VitrineCursos
      userDb={userDb}
      session={session}
    />
  );
}