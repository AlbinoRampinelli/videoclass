"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  MonitorPlay,
  MapPin,
  ShieldCheck,
  LogOut,
  LogIn,
  PlayCircle,
  Terminal,
  ChevronLeft,
  BookOpen,
  CheckCircle2
} from "lucide-react";


export default function Aside() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const estaNaClasse = pathname?.includes("/minha-classe/");
  const isAdmin = session?.user?.email === "arampinelli10@gmail.com";
  const isActive = (path: string) => pathname === path;

  // --- 1. RENDERIZAÇÃO NO MODO CLASSE (EXATAMENTE A SUA VERSÃO) ---
  if (estaNaClasse) {
    
    return (
      <aside className="w-20 md:w-72 bg-[#09090b] border-r border-zinc-900 flex flex-col h-screen sticky top-0 pt-10 md:px-4 transition-all">

        <div className="flex justify-center md:justify-start md:pl-4 pb-8">
          <div className="font-black italic text-2xl text-white tracking-tighter uppercase">
            VIDEOCLASS<span className="text-[#81FE88]">.</span>
          </div>
        </div>

        <nav className="flex flex-col gap-6 flex-1 overflow-y-auto custom-scrollbar px-2">

          {/* SEÇÃO 1: CONTEÚDO EM VÍDEO */}
          <div>
            <p className="text-[9px] font-black text-[#81FE88] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              Conteúdo em Vídeo
            </p>
            <div className="space-y-1">
              <div className="flex items-start gap-3 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                <BookOpen size={16} className="text-[#81FE88] mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase text-white leading-tight">Módulo 1: Ambientação</span>
                </div>
              </div>
              <div className="ml-4 mt-2 space-y-2 border-l border-zinc-800 pl-4">
                {/* Exemplo para a aula 1.1 */}
                <button
                  onClick={() => router.push(`${pathname}?aula=1.1`)}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <CheckCircle2 size={14} className="text-[#81FE88]" />
                  <span className="text-[10px] font-bold uppercase italic">1.1 Instalação do Python</span>
                </button>

                {/* Exemplo para a aula 1.2 */}
                <button
                  onClick={() => router.push(`${pathname}?aula=1.2`)}
                  className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
                >
                  <PlayCircle size={14} />
                  <span className="text-[10px] font-bold uppercase italic">1.2 Instalação do VS Code</span>
                </button>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: LABORATÓRIO PRÁTICO (RECUPERADO) */}
          <div>
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">
              Laboratório Prático
            </p>
            <div className="space-y-2">
              {/* DESAFIO 1 */}
              <button
                onClick={() => router.push(`${pathname}?desafio=1`)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all group ${searchParams.get("desafio") === "1"
                  ? "bg-[#81FE88]/10 border-[#81FE88]/50"
                  : "bg-zinc-900/30 border-zinc-800 hover:border-[#81FE88]/30"
                  }`}
              >
                <Terminal size={16} className={searchParams.get("desafio") === "1" ? "text-[#81FE88]" : "text-zinc-500 group-hover:text-[#81FE88]"} />
                <span className={`text-[10px] font-black uppercase italic ${searchParams.get("desafio") === "1" ? "text-white" : "text-zinc-400 group-hover:text-white"}`}>
                  Desafio 1: Hello World
                </span>
              </button>

              {/* DESAFIO 2 */}
              <button
                onClick={() => router.push(`${pathname}?desafio=2`)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all group ${searchParams.get("desafio") === "2"
                  ? "bg-[#81FE88]/10 border-[#81FE88]/50"
                  : "bg-zinc-900/30 border-zinc-800 hover:border-[#81FE88]/30"
                  }`}
              >
                <Terminal size={16} className={searchParams.get("desafio") === "2" ? "text-[#81FE88]" : "text-zinc-500 group-hover:text-[#81FE88]"} />
                <span className={`text-[10px] font-black uppercase italic ${searchParams.get("desafio") === "2" ? "text-white" : "text-zinc-400 group-hover:text-white"}`}>
                  Desafio 2: Configuração
                </span>
              </button>
            </div>
          </div>

          {/* SEÇÃO 3: ADMIN (SE FOR ADMIN) */}
          {isAdmin && (
            <Link href="/admin" className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#81FE88]/5 border border-[#81FE88]/20 text-[#81FE88] hover:bg-[#81FE88]/10 transition-all">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase italic">Gestão Admin</span>
            </Link>
          )}
        </nav>

        {/* RODAPÉ DA CLASSE */}
        <div className="mt-auto py-6 space-y-4 border-t border-zinc-900 bg-black/20">
          <Link href="/vitrine" className="flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-[#81FE88] transition-colors group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-black text-[10px] uppercase italic">Voltar para a Vitrine</span>
          </Link>

          {session && (
            <div className="px-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#81FE88]/20">
                <img src={session.user?.image || ""} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-[10px] font-black text-white uppercase italic truncate w-24">{session.user?.name?.split(' ')[0]}</span>
                <span className="text-[8px] text-[#81FE88] font-black uppercase tracking-widest leading-none">Status: Online</span>
              </div>
            </div>
          )}

          <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full flex items-center gap-3 px-4 py-2 text-zinc-600 hover:text-red-500 transition-colors border-t border-zinc-900/50 mt-2">
            <LogOut size={16} />
            <span className="font-black text-[10px] uppercase italic tracking-tighter">Encerrar Sessão</span>
          </button>
        </div>
      </aside>
    );
  }

  // --- 2. RENDERIZAÇÃO NO MODO VITRINE (COM PRESENCIAIS) ---
  return (
    <aside className="w-20 md:w-72 bg-[#09090b] border-r border-zinc-900 flex flex-col h-screen sticky top-0 pt-20 md:pr-6" style={{ minWidth: '5rem' }}>

      <div className="flex justify-center md:pl-8 pb-12">
        <Link href="/" className="group font-black italic text-3xl text-white tracking-tighter uppercase">
          <span className="md:hidden">V<span className="text-[#81FE88]">.</span></span>
          <span className="hidden md:inline">VIDEOCLASS<span className="text-[#81FE88]">.</span></span>
        </Link>
      </div>

      <nav className="flex flex-col gap-2 px-2 md:px-6 flex-1">
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4 px-3 hidden md:block">Menu Principal</p>

        <Link href="/vitrine" className={`flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl transition-all ${isActive("/vitrine") || isActive("/") ? "bg-[#81FE88]/10 text-[#81FE88]" : "text-zinc-500 hover:text-white"}`}>
          <LayoutDashboard size={20} />
          <span className="font-bold italic uppercase text-sm hidden md:inline">Início</span>
        </Link>

        <Link href="/cursos-online" className={`flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl transition-all ${isActive("/cursos-online") ? "bg-[#81FE88]/10 text-[#81FE88]" : "text-zinc-500 hover:text-white"}`}>
          <MonitorPlay size={20} />
          <span className="font-bold italic uppercase text-sm hidden md:inline">Online</span>
        </Link>

        <Link href="/cursos-presenciais" className={`flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl transition-all ${isActive("/cursos-presenciais") ? "bg-[#81FE88]/10 text-[#81FE88]" : "text-zinc-500 hover:text-white"}`}>
          <MapPin size={20} />
          <span className="font-bold italic uppercase text-sm hidden md:inline">Presenciais</span>
        </Link>
      </nav>

      <div className="p-6 mt-auto border-t border-zinc-900 bg-zinc-950/50">
        {session ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center md:justify-start gap-3 p-2 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#81FE88]/20">
                <img src={session.user?.image || ""} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col truncate hidden md:flex">
                <span className="text-white font-bold text-[10px] uppercase italic truncate">{session.user?.name?.split(' ')[0]}</span>
                <span className="text-[#81FE88] text-[8px] font-black uppercase tracking-widest leading-none">Online</span>
              </div>
            </div>

            {isAdmin && (
              <Link href="/admin" className="flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl text-[#81FE88] border border-[#81FE88]/10 hover:bg-[#81FE88]/5 transition-all">
                <ShieldCheck size={18} />
                <span className="font-bold text-[10px] uppercase italic hidden md:inline">Admin</span>
              </Link>
            )}

            <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl text-zinc-500 hover:text-red-500 transition-all">
              <LogOut size={18} />
              <span className="font-bold text-[10px] uppercase italic hidden md:inline">Sair</span>
            </button>
          </div>
        ) : (
          <button onClick={() => router.push('/signin')} className="flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl text-[#81FE88] hover:bg-[#81FE88]/5 rounded-xl w-full">
            <LogIn size={20} />
            <span className="font-black text-[10px] uppercase italic hidden md:inline">Entrar</span>
          </button>
        )}
      </div>
    </aside>
  );
}