import { LayoutDashboard, PlayCircle, LogOut } from "lucide-react";
import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-zinc-800 bg-[#09090b] p-6 flex flex-col h-screen sticky top-0 shrink-0">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="text-[#81FE88] font-bold text-2xl">\\</div>
        <span className="font-bold tracking-wider text-lg">VIDEOCLASS</span>
      </div>
      
      <nav className="flex-1 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#81FE88]/10 text-[#81FE88] font-medium border border-[#81FE88]/20">
          <LayoutDashboard size={20} /> Home
        </Link>
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-500 hover:text-white transition-all">
          <PlayCircle size={20} /> Meus Cursos
        </a>
      </nav>

      <div className="pt-6 border-t border-zinc-800">
        <a href="/api/auth/signout" className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-500 transition-colors">
          <LogOut size={20} /> Sair
        </a>
      </div>
    </aside>
  );
}