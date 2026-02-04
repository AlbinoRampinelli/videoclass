"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = session?.user?.email === "arampinelli10@gmail.com";
  const isActive = (path: string) => pathname === path;

  const handleLogin = () => {
    const targetPath = "/vitrine";
    const destination = `/signin?callbackUrl=${encodeURIComponent(targetPath)}`;
    router.push(destination);
  };

  return (
    <aside className="w-72 min-w-[18rem] bg-[#09090b] border-r border-zinc-900 flex flex-col h-screen sticky top-0 pt-20 pr-6">
       
      {/* 1. TOPO: Logo Videoclass Grande */}
     <div className="pl-8 pb-12"> {/* Aumentei o pb (padding bottom) para afastar do menu */}
    <Link href="/" className="group">
      <div className="font-black italic text-3xl text-white tracking-tighter uppercase transition-all group-hover:text-[#81FE88]">
        VIDEOCLASS<span className="text-[#81FE88]">.</span>
      </div>
    </Link>
  </div>

      {/* 2. MEIO: Menu Principal (Início, Online, Presenciais) */}
      <nav className="flex flex-col gap-2 px-6 flex-1">
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4 px-3">
          Menu Principal
        </p>

        {/* Link Início */}
        <Link
          href="/"
          className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${isActive("/") ? "bg-[#81FE88]/10 text-[#81FE88]" : "text-zinc-500 hover:text-white"}`}
        >
          <LayoutDashboard size={20} className={isActive("/") ? "text-[#81FE88]" : ""} />
          <span className="font-bold italic uppercase tracking-tighter text-sm">Início</span>
        </Link>

        {/* Link Online */}
        <Link
          href="/cursos-online"
          className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${isActive("/cursos-online") ? "bg-[#81FE88]/10 text-[#81FE88]" : "text-zinc-500 hover:text-white"}`}
        >
          <MonitorPlay size={20} className={isActive("/cursos-online") ? "text-[#81FE88]" : ""} />
          <span className="font-bold italic uppercase tracking-tighter text-sm">Online</span>
        </Link>

        {/* Link Presenciais - ADICIONADO AQUI */}
        <Link
          href="/cursos-presenciais"
          className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${isActive("/cursos-presenciais") ? "bg-[#81FE88]/10 text-[#81FE88]" : "text-zinc-500 hover:text-white"}`}
        >
          <MapPin size={20} className={isActive("/cursos-presenciais") ? "text-[#81FE88]" : ""} />
          <span className="font-bold italic uppercase tracking-tighter text-sm">Presenciais</span>
        </Link>
      </nav>

      {/* 3. RODAPÉ: Admin, Foto e Logout */}
      <div className="p-6 mt-auto border-t border-zinc-900 bg-zinc-950/50">
        {session ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-2 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#81FE88]/20">
                {session.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[#81FE88] font-bold">
                    {session.user?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-white font-bold text-xs uppercase italic truncate">
                  {session.user?.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#81FE88] animate-pulse" />
                  <span className="text-[#81FE88] text-[9px] font-black uppercase tracking-widest">
                    Online
                  </span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-3 p-3 rounded-xl text-[#81FE88] hover:bg-[#81FE88]/5 transition-all border border-[#81FE88]/10">
                <ShieldCheck size={18} />
                <span className="font-bold text-[10px] uppercase italic">Admin</span>
              </Link>
            )}

            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-3 p-3 rounded-xl text-zinc-500 hover:text-red-500 hover:bg-red-500/5 transition-all"
            >
              <LogOut size={18} />
              <span className="font-bold text-[10px] uppercase italic">Sair</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-[#81FE88] text-black hover:bg-[#81FE88]/90 transition-all shadow-lg shadow-[#81FE88]/10"
          >
            <LogIn size={20} />
            <span className="font-black text-xs uppercase italic">Entrar</span>
          </button>
        )}
      </div>
    </aside>
  );
}