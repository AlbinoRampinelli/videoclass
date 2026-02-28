"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  MonitorPlay,
  MapPin,
  ShieldCheck,
  LogOut,
  Home,
  Menu,
  X,
  BookOpen,
  Terminal,
  PlayCircle,
} from "lucide-react";

export default function Aside({ modulosAtivos }: { modulosAtivos?: any }) {
  const { data: session } = useSession();
  const pathname = usePathname() || "";
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
  if (pathname) {
    setIsOpen(false);
  }
}, [pathname]);
if (!mounted) return null;

  // Lógica de Identificação de Rota
  const isStudyArea = pathname.includes('/minha-classe');
  const partes = pathname.split('/');
  const slug = partes[2] || "";

  // Verificação de Admin (Professor ou Admin)
  const isAdmin =
    session?.user?.userType === "professor" ||
    session?.user?.userType === "PROFESSOR" ||
    session?.user?.email === "arampinelli10@gmail.com";

  

  
  return (
    <>
      {/* Botão Hambúrguer Mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-[#81FE88] text-black rounded-xl shadow-lg"
      >
        <Menu size={24} />
      </button>

      {/* Overlay Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[51] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[52] w-72 bg-[#09090b] border-r border-zinc-900 flex flex-col h-screen transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:relative lg:translate-x-0 lg:flex lg:sticky lg:top-0
      `}>

        <button onClick={() => setIsOpen(false)} className="lg:hidden absolute top-4 right-4 text-zinc-500">
          <X size={24} />
        </button>

        {/* LOGO */}
        <div className="pl-8 pt-12 pb-12">
          <Link href="/" onClick={() => setIsOpen(false)} className="group">
            <div className="font-black italic text-3xl text-white tracking-tighter uppercase transition-all group-hover:text-[#81FE88]">
              VIDEOCLASS<span className="text-[#81FE88]">.</span>
            </div>
          </Link>
        </div>

        <nav className="flex flex-col px-6 flex-1 overflow-y-auto gap-6">

          {isStudyArea ? (
            /* ==========================================
               MODO ÁREA DE ESTUDO (DENTRO DO CURSO)
               ========================================== */
            <>
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black text-[#81FE88] uppercase tracking-[0.3em] px-3 mb-2">
                  Conteúdo em Vídeo
                </p>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-800 text-white text-sm font-bold italic uppercase">
                    <BookOpen size={18} className="text-[#81FE88]" />
                    <span>Módulo 1: Ambientação</span>
                  </div>
                  <div className="ml-4 border-l border-zinc-800 pl-4 py-2 flex flex-col gap-3">
                    <button className="flex items-center gap-2 text-[11px] text-white hover:text-[#81FE88] transition-all font-bold uppercase italic text-left">
                      <PlayCircle size={14} className="text-[#81FE88]" />
                      <span>1.1 Instalação do Python</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] px-3 mb-2">
                  Laboratório Prático
                </p>
                <div className="flex flex-col gap-2">
                  <Link href={`/minha-classe/${slug}/desafio-1`} onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-[#81FE88] transition-all">
                    <Terminal size={16} />
                    <span className="text-[11px] font-bold uppercase italic">Desafio 1: Hello World</span>
                  </Link>
                </div>
              </div>

              <Link href="/vitrine" onClick={() => setIsOpen(false)} className="mt-4 text-[10px] text-zinc-500 hover:text-white transition-all uppercase font-black text-center border border-zinc-800 p-3 rounded-xl">
                ← Voltar para a Vitrine
              </Link>
            </>
          ) : (
            /* ==========================================
               MODO NAVEGAÇÃO (LANDING PAGE / VITRINE)
               ========================================== */
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-black text-[#81FE88] uppercase tracking-[0.3em] px-3 mb-2">
                Menu Principal
              </p>

              <Link href="/" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${pathname === '/' ? 'bg-[#81FE88]/10 border-[#81FE88] text-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white'}`}>
                <Home size={18} />
                <span className="text-xs font-bold uppercase italic">Início</span>
              </Link>

              <Link
                href="/vitrine?tipo=online"
                // Remova o onClick daqui
                style={{ WebkitTapHighlightColor: 'transparent' }}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${pathname.includes('online')
                    ? 'bg-[#81FE88]/10 border-[#81FE88] text-white'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
              >
                <MonitorPlay size={18} />
                <span className="text-xs font-bold uppercase italic">Cursos Online</span>
              </Link>

              <Link href="/vitrine?tipo=presencial" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${pathname.includes('presencial') ? 'bg-[#81FE88]/10 border-[#81FE88] text-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white'}`}>
                <MapPin size={18} />
                <span className="text-xs font-bold uppercase italic">Presenciais</span>
              </Link>
            </div>
          )}

          {/* ==========================================
              SEÇÃO ADMIN (SEMPRE VISÍVEL PARA QUEM TEM PERMISSÃO)
              ========================================== */}
          {isAdmin && (
            <div className="mt-4 pt-6 border-t border-zinc-900">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] px-3 mb-2">
                Administração
              </p>
              <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-[#81FE88]/5 border border-[#81FE88]/10 text-[#81FE88] hover:bg-[#81FE88] hover:text-black transition-all">
                <ShieldCheck size={18} />
                <span className="font-bold italic uppercase text-xs">Painel de Gestão</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Footer com Sair / Sessão */}
        <div className="p-6 mt-auto border-t border-zinc-900 bg-zinc-950/50 pb-10 lg:pb-6">
          {session ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-2 bg-zinc-900/50 rounded-2xl border border-zinc-800 truncate">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#81FE88]/20 flex items-center justify-center bg-zinc-800 flex-shrink-0">
                  {session.user?.image ? (
                    <img src={session.user.image} className="w-full h-full object-cover" alt="User" />
                  ) : (
                    <span className="text-[#81FE88] font-bold text-xs">{session.user?.name?.charAt(0)}</span>
                  )}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-white font-bold text-[10px] uppercase italic truncate">{session.user?.name}</span>
                  <span className="text-[#81FE88] text-[8px] font-black uppercase tracking-widest leading-none">Status: Online</span>
                </div>
              </div>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-3 p-2 text-zinc-500 hover:text-red-500 transition-all">
                <LogOut size={16} /> <span className="font-bold text-[10px] uppercase italic"></span>
              </button>
            </div>
          ) : (
            <button
              // No iPhone, o 'onMouseDown' às vezes é capturado antes do clique 'concorrer' com o fechamento do menu
              onMouseDown={() => {
                setIsOpen(false);
                router.push("/api/auth/signin");
              }}
              className="w-full p-4 rounded-2xl bg-[#81FE88] text-black font-black text-xs uppercase italic active:opacity-80 transition-all"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Entrar
            </button>)}
        </div>
      </aside>
    </>
  );
}