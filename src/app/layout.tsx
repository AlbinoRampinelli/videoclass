// src/app/layout.tsx
import Aside from "./components/Aside";
import "./globals.css";
import SessionWrapper from "./components/SessionWrapper"; // <--- VERIFIQUE ESTA LINHA
import { db } from "../../prisma/db";

// ... resto do código (checkDbConnection, etc)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="bg-[#09090b] text-white antialiased">
        <SessionWrapper> {/* Agora ele vai reconhecer o componente */}
          <div className="flex min-h-screen w-full overflow-x-hidden">

            {/* O Aside fixo com largura garantida */}
            <div className="shrink-0">
              <Aside />
            </div>

            {/* O Conteúdo que se adapta ao espaço que sobra */}
            <main className="flex-1 w-full overflow-y-auto">
              <div className="w-full max-w-7xl mx-auto">
                {children}
              </div>
            </main>

          </div>
        </SessionWrapper>
      </body>
    </html>
  );
}