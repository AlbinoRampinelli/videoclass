import { db } from "../../../prisma/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SearchInput from "./_components/SearchInput";
import { ShieldCheck, AlertTriangle, User as UserIcon } from "lucide-react";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const session = await auth();

  // 1. PROTEÇÃO DE ACESSO: Altere para o seu e-mail do Google
  const adminEmail = "arampinelli10@gmail.com"; 
  
  if (!session?.user || session.user.email !== adminEmail) {
    redirect("/vitrine");
  }

  const query = searchParams?.query || "";

  // 2. BUSCA NO BANCO: Filtra por Nome, Email ou CPF
  const users = await db.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { cpf: { contains: query } },
      ],
    },
    include: {
      _count: { select: { enrollments: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header com Busca */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic text-[#81FE88]">
              \\ Gestão de Alunos
            </h1>
            <p className="text-zinc-500 text-sm">Controle de acessos e integridade de CPFs.</p>
          </div>
          <SearchInput />
        </div>

        {/* Listagem de Usuários */}
        {users.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl">
            <p className="text-zinc-500 italic text-lg text-white/50">
                Nenhum resultado para "{query}"
            </p>
          </div>
        ) : (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-800/50 text-zinc-400 text-xs uppercase font-bold tracking-widest">
                  <th className="p-5">Aluno</th>
                  <th className="p-5">Documento</th>
                  <th className="p-5 text-center">Cursos</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Cadastrado em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                            <img src={user.image} className="w-10 h-10 rounded-full border border-zinc-700" alt={user.name || ""} />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center"><UserIcon size={18}/></div>
                        )}
                        <div>
                          <p className="font-bold text-sm text-zinc-100">{user.name}</p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 font-mono text-xs tracking-wider">
                      {user.cpf ? (
                        <span className="text-zinc-300">{user.cpf}</span>
                      ) : (
                        <span className="text-red-500 font-black italic">PENDENTE</span>
                      )}
                    </td>
                    <td className="p-5 text-center">
                      <span className="bg-[#81FE88]/10 text-[#81FE88] px-3 py-1 rounded-full text-[10px] font-black border border-[#81FE88]/20">
                        {user._count.enrollments} MATRÍCULAS
                      </span>
                    </td>
                    <td className="p-5">
                      {user.cpf ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
                          <ShieldCheck size={14} /> VALIDADO
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-500 text-[10px] font-bold italic underline underline-offset-4">
                          <AlertTriangle size={14} /> SEM CPF
                        </div>
                      )}
                    </td>
                    <td className="p-5 text-right text-xs text-zinc-500">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}