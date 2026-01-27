// src/app/layout.tsx
import Aside from "./components/Aside";
import "./globals.css";
import SessionWrapper from "./components/SessionWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="bg-[#09090b] text-white antialiased"> 
        <SessionWrapper>
          <div className="flex min-h-screen">
            {/* O Aside continua aqui, mas vamos movê-lo para dentro das páginas ou usar CSS para esconder na home */}
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