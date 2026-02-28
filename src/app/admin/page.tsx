export const dynamic = 'force-dynamic';
import { db } from "../../../prisma/db"; 
import Link from "next/link";

export default async function AdminChallengesPage() {
  // Busca desafios trazendo o módulo para podermos acessar o ID de edição dele
  const challenges = await db.challenge.findMany({
    include: {
      module: true,
    },
    orderBy: [
      { courseSlug: 'asc' },
      { order: 'asc' }
    ]
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black italic uppercase text-white tracking-tighter">
            Laboratório <span className="text-[#81FE88]">Python</span>
          </h1>
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
            Gerenciamento de Conteúdo
          </p>
        </div>
      </div>

      {/* BOTÕES DE AÇÃO RÁPIDA */}
      <div className="flex gap-4 mb-6">
        <Link
          href="/admin/modules/new"
          className="bg-white/5 text-zinc-400 border border-zinc-800 px-6 py-3 rounded-2xl font-black italic uppercase text-[10px] hover:bg-[#81FE88] hover:text-black hover:border-[#81FE88] transition-all"
        >
          + Criar Módulo
        </Link>

        <Link
          href="/admin/challenges/new"
          className="bg-[#81FE88] text-black px-6 py-3 rounded-2xl font-black italic uppercase text-[10px] hover:scale-105 transition-all shadow-[0_0_20px_rgba(129,254,136,0.2)]"
        >
          + Novo Desafio Python
        </Link>
      </div>

      {/* TABELA DE DESAFIOS */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-800/50 text-zinc-400 text-[10px] uppercase font-black tracking-[0.2em]">
              <th className="p-5 text-center w-16">#</th>
              <th className="p-5">Desafio</th>
              <th className="p-5">Módulo / Curso</th>
              <th className="p-5 text-center">Slug</th>
              <th className="p-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {challenges.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center">
                  <p className="text-zinc-500 italic uppercase font-black">Nenhum desafio encontrado.</p>
                </td>
              </tr>
            ) : (
              challenges.map((ch) => (
                <tr key={ch.id} className="border-b border-zinc-800/50 hover:bg-white/[0.02] transition-colors group">
                  <td className="p-5 text-center font-mono text-[#81FE88] text-xs">{ch.order}</td>
                  <td className="p-5">
                    <span className="font-bold italic uppercase text-white">{ch.title}</span>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-300 text-[10px] font-bold uppercase">
                          {ch.module?.title || "Sem Módulo"}
                        </span>
                        {/* BINGO: ACESSO PARA EDITAR O MÓDULO AQUI */}
                        {ch.moduleId && (
                          <Link 
                            href={`/admin/modules/edit/${ch.moduleId}`}
                            className="opacity-0 group-hover:opacity-100 text-[#81FE88] text-[9px] font-black uppercase underline decoration-[#81FE88]/30 transition-all"
                          >
                            Editar Módulo
                          </Link>
                        )}
                      </div>
                      <span className="text-zinc-600 text-[9px] uppercase font-black tracking-tighter italic">
                        {ch.courseSlug}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-center text-zinc-500 font-mono text-[10px]">{ch.slug}</td>
                  <td className="p-5 text-right flex justify-end gap-2">
                    <Link
                      href={`/admin/challenges/edit/${ch.id}`}
                      className="text-[9px] font-black uppercase italic tracking-widest text-[#81FE88] border border-[#81FE88]/20 px-3 py-1.5 rounded-lg hover:bg-[#81FE88] hover:text-black transition-all"
                    >
                      Editar
                    </Link>
                    <button className="text-[9px] font-black uppercase italic tracking-widest text-red-500/50 border border-red-500/10 px-3 py-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}