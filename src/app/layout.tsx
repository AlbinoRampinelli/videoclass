// src/app/layout.tsx
import Aside from "./components/Aside";
import "./globals.css";
import SessionWrapper from "./components/SessionWrapper"; // <--- VERIFIQUE ESTA LINHA
import { db } from "../../prisma/db";
import Script from "next/script"; 

// ... resto do código (checkDbConnection, etc)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="bg-[#09090b] text-white antialiased">
        <SessionWrapper> {/* Agora ele vai reconhecer o componente */}
          {/*Exemplo de como deve estar sua estrutura pai: */}
          <div className="flex min-h-screen bg-[#0a0a0a]">
            {/* O Aside que acabamos de ajustar */}
            <Aside />
            <Script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js" />
            {/* O conteúdo principal (Vitrine) */}
            <main className="flex-1 w-full">
              {/* Adicionamos um padding-top no mobile (pt-20) 
       para o botão de "Sanduíche" não cobrir o seu "Olá, Albino!"  */}
              <div className="pt-20 lg:pt-0">
                {children}
              </div>
            </main>
          </div>
        </SessionWrapper>
      </body>
    </html>
  );
}