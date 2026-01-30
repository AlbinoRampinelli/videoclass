// src/app/layout.tsx
import Aside from "./components/Aside";
import "./globals.css";
import SessionWrapper from "./components/SessionWrapper";
import CpfGuard from "./components/CpfGuard"; 
import { db } from "../../prisma/db";

// --- TESTE DE CONEXÃO (Roda no servidor ao iniciar) ---
async function checkDbConnection() {
  try {
    // Tenta contar os usuários apenas para ver se o Prisma fala com o Postgres
    const count = await db.user.count();
    console.log(`🚀 [PRISMA] Conectado! Total de usuários no banco: ${count}`);
  } catch (error) {
    console.error("❌ [PRISMA] Erro crítico de conexão:", error);
  }
}

// Executa o check (não precisa de await aqui para não travar o carregamento do app)
checkDbConnection();
// -------------------------------------------------------

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="bg-[#09090b] text-white antialiased">
        <SessionWrapper>
          <div className="flex min-h-screen">
            
            {/* O Aside carrega a sessão no servidor via auth() */}
            <Aside />
            
            {/* O CpfGuard vigia a sessão no cliente e abre o modal se CPF for null */}
            <CpfGuard />

            <main className="flex-1 flex flex-col items-center">
              <div className="w-full max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </SessionWrapper>
      </body>
    </html>
  );
}