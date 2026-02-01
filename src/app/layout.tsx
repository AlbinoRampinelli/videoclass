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
          <div className="flex min-h-screen">
            
            <Aside />
            
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