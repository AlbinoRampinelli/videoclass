import { auth } from "@/auth";
import db from "../../prisma/db";
import LandingPage from "./components/LandingPage";
import VitrineCursos from "./components/VitrineCursos";
import CpfModal from "./components/CpfModal";

export default async function Home() {
  const session = await auth();

  // 1. SE NÃO ESTIVER LOGADO -> LANDING PAGE (Sua lógica original)
  if (!session) {
    return <LandingPage />;
  }

  // 2. BUSCA DADOS NO BANCO (Aqui o await é permitido por ser Server Component)
  const [userDb, courses] = await Promise.all([
    db.user.findUnique({
      where: { email: session.user?.email || "" },
      include: { enrollments: true }
    }),
    db.course.findMany() // Buscamos os cursos para a vitrine
  ]);

  // 3. SE LOGOU MAS NÃO TEM CPF -> TRAVA COM BLUR (Sua lógica original)
  // ... dentro do seu componente de página
  const isGoogle = session?.user?.image?.includes("googleusercontent.com") || false;
  // Dica: Geralmente checamos pela URL da imagem ou pelo campo 'account' no backend

  if (userDb && !userDb.cpf) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Vitrine de fundo com BLUR */}
        <div className="absolute inset-0 blur-xl opacity-30 grayscale pointer-events-none scale-105">
          <VitrineCursos userDb={userDb} session={session} courses={courses} />
        </div>

        {/* Modal centralizado passando a FLAG isGoogleLogin */}
        <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-500">
          <CpfModal
            userId={userDb.id}
            userName={userDb.name || ""}
            isGoogleLogin={isGoogle}
          />
        </div>
      </div>
    );
  }

  // 4. SE ESTIVER TUDO OK -> VITRINE REAL (Sua lógica original)
  return (
    <VitrineCursos
      userDb={userDb}
      session={session}
      courses={courses} // Passamos os cursos buscados no passo 2
    />
  );
}