"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  MonitorPlay,
  MapPin,
  ShieldCheck,
  LogOut,
  LogIn,
} from "lucide-react";


export default function Aside() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const estaNaClasse = pathname?.includes("/minha-classe/");
  const isAdmin = session?.user?.userType === "ADMIN";
  const isActive = (path: string) => pathname === path;

  // Na tela da classe a navegação é gerenciada pelo MinhaClasseClient
  if (estaNaClasse) {
    return null;
  }

  // --- 2. RENDERIZAÇÃO NO MODO VITRINE ---
  const navItems = [
    { href: "/vitrine", icon: <LayoutDashboard size={20} />, label: "Início", active: isActive("/vitrine") || isActive("/") },
    { href: "/cursos-online", icon: <MonitorPlay size={20} />, label: "Online", active: isActive("/cursos-online") },
    { href: "/cursos-presenciais", icon: <MapPin size={20} />, label: "Presenciais", active: isActive("/cursos-presenciais") },
  ];

  return (
    <>
      {/* ── SIDEBAR DESKTOP ─────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-[#09090b] border-r border-zinc-900 h-screen sticky top-0 pt-20 pr-6">

        <div className="pl-8 pb-12">
          <Link href="/" className="font-black italic text-3xl text-white tracking-tighter uppercase">
            VIDEOCLASS<span className="text-[#81FE88]">.</span>
          </Link>
        </div>

        <nav className="flex flex-col gap-2 px-6 flex-1">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4 px-3">Menu Principal</p>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${item.active ? "bg-[#81FE88]/10 text-[#81FE88]" : "text-zinc-500 hover:text-white"}`}>
              {item.icon}
              <span className="font-bold italic uppercase text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-zinc-900 bg-zinc-950/50">
          {session ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-2 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#81FE88]/20">
                  <img src={session.user?.image || ""} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-white font-bold text-[10px] uppercase italic truncate">{session.user?.name?.split(' ')[0]}</span>
                  <span className="text-[#81FE88] text-[8px] font-black uppercase tracking-widest leading-none">Online</span>
                </div>
              </div>
              {isAdmin && (
                <Link href="/admin" className="flex items-center gap-3 p-3 rounded-xl text-[#81FE88] border border-[#81FE88]/10 hover:bg-[#81FE88]/5 transition-all">
                  <ShieldCheck size={18} />
                  <span className="font-bold text-[10px] uppercase italic">Admin</span>
                </Link>
              )}
              <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-3 p-3 rounded-xl text-zinc-500 hover:text-red-500 transition-all">
                <LogOut size={18} />
                <span className="font-bold text-[10px] uppercase italic">Sair</span>
              </button>
            </div>
          ) : (
            <button onClick={() => router.push('/signin')} className="flex items-center gap-3 p-3 rounded-xl text-[#81FE88] hover:bg-[#81FE88]/5 w-full">
              <LogIn size={20} />
              <span className="font-black text-[10px] uppercase italic">Entrar</span>
            </button>
          )}
        </div>
      </aside>

      {/* ── BOTTOM NAV MOBILE ───────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#09090b]/95 backdrop-blur border-t border-zinc-900 flex items-stretch">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${item.active ? "text-[#81FE88]" : "text-zinc-600 hover:text-white"}`}
          >
            {item.icon}
            <span className="text-[9px] font-black uppercase">{item.label}</span>
          </Link>
        ))}
        {session ? (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-zinc-600 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-[9px] font-black uppercase">Sair</span>
          </button>
        ) : (
          <button
            onClick={() => router.push('/signin')}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-[#81FE88]"
          >
            <LogIn size={20} />
            <span className="text-[9px] font-black uppercase">Entrar</span>
          </button>
        )}
      </nav>
    </>
  );
}