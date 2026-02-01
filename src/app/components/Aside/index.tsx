"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard,
  MonitorPlay,
  MapPin,
  ShieldCheck,
  LogOut,
  LogIn
} from "lucide-react";

export default function Aside() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.email === "arampinelli10@gmail.com";

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-900 p-6 flex flex-col min-h-screen">

      {/* 1. Videoclass */}
      <Link href="/" className="group">
        <div className="font-black italic text-2xl text-white tracking-tighter uppercase mb-10 transition-all group-hover:text-[#81FE88]">
          VIDEOCLASS<span className="text-[#81FE88]">.</span>
        </div>
      </Link>

      <nav className="flex flex-col gap-2 flex-1">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2 px-4">
          Menu Principal
        </p>

        <Link href="/" className="flex items-center gap-3 p-4 rounded-2xl hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all group">
          <LayoutDashboard size={20} className="group-hover:text-[#81FE88]" />
          <span className="font-bold text-sm italic uppercase tracking-tighter">Início</span>
        </Link>

        <Link href="/cursos-online" className="flex items-center gap-3 p-4 rounded-2xl hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all group">
          <MonitorPlay size={20} className="group-hover:text-[#81FE88]" />
          <span className="font-bold text-sm italic uppercase tracking-tighter">Online</span>
        </Link>

        <Link href="/cursos-presenciais" className="flex items-center gap-3 p-4 rounded-2xl hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all group">
          <MapPin size={20} className="group-hover:text-[#81FE88]" />
          <span className="font-bold text-sm italic uppercase tracking-tighter">Presencial</span>
        </Link>
      </nav>


     {/* RODAPÉ COM PERFIL E SAIR */}
      <div className="mt-auto pt-6 border-t border-zinc-900 flex flex-col gap-2">
        
        {/* SÓ MOSTRA O PERFIL SE ESTIVER LOGADO */}
        {session?.user && (
          <div className="flex items-center gap-3 px-4 py-2 mb-2 bg-zinc-900/50 rounded-2xl mx-2 border border-zinc-800/50">
            <div className="w-9 h-9 min-w-[36px] rounded-full overflow-hidden border border-zinc-700 bg-zinc-950 flex-shrink-0">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#81FE88] font-bold text-xs">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-white font-bold text-[11px] uppercase italic truncate">
                {session.user.name}
              </span>
              <span className="text-[#81FE88] text-[9px] font-bold uppercase tracking-widest">
                Online
              </span>
            </div>
          </div>
        )}

        {/* BOTÕES DE AÇÃO */}
        <div className="flex flex-col">
          {session && isAdmin && (
            <Link href="/admin" className="flex items-center gap-3 p-4 rounded-2xl text-[#81FE88] hover:bg-zinc-900 transition-all group">
              <ShieldCheck size={20} />
              <span className="font-bold text-xs uppercase italic">Gestão Admin</span>
            </Link>
          )}

          {!session ? (
            <Link
              href="/signin"
              className="flex items-center gap-3 p-4 bg-[#81FE88] text-black font-black rounded-2xl mx-2 justify-center hover:scale-[1.02] transition-all"
            >
              <LogIn size={20} />
              <span className="font-bold text-sm uppercase">Entrar</span>
            </Link>
          ) : (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 p-4 text-zinc-500 hover:text-red-500 transition-colors w-full group text-left"
            >
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
              <span className="font-bold text-sm uppercase italic">Sair da Conta</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}