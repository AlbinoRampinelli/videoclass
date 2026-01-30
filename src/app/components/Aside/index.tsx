import Link from "next/link";
import { auth } from "@/auth"; 
import { handleLogout } from "../../../app/actions"; // Sua action externa

export default async function Aside() {
  const session = await auth(); 

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 justify-between h-screen shrink-0 border-r border-zinc-800">
      <nav className="flex flex-col gap-6">
        <div className="text-[#81FE88] font-bold text-2xl tracking-tighter mb-4 italic">
          \\ VIDEOCLASS
        </div>
        
        <Link href="/" className="text-zinc-400 hover:text-[#81FE88] transition-colors font-bold uppercase text-[10px] tracking-widest">
          Home
        </Link>
        
        {session && (
          <Link href="/vitrine" className="text-zinc-400 hover:text-[#81FE88] transition-colors font-bold uppercase text-[10px] tracking-widest">
            Meus Cursos
          </Link>
        )}
      </nav>

      <div className="border-t border-zinc-800 pt-6">
        {session ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
               {session.user?.image && (
                 <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full border border-zinc-700" />
               )}
               <span className="text-sm text-zinc-200 font-medium">
                 {session.user?.name?.split(' ')[0]}
               </span>
            </div>
            
            {/* AGORA SIM: Chamando a action externa corretamente */}
            <form action={handleLogout}>
              <button 
                type="submit"
                className="w-full bg-red-500/10 text-red-500 border border-red-500/20 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase"
              >
                Logout
              </button>
            </form>
          </div>
        ) : (
          <Link 
            href="/api/auth/signin" 
            className="w-full bg-[#81FE88] text-black py-3 rounded-xl text-center block font-black text-[10px] hover:brightness-90 transition-all uppercase"
          >
            Login
          </Link>
        )}
      </div>
    </aside>
  );
}