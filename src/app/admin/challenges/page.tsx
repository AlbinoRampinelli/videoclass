export const dynamic = 'force-dynamic';
import { db } from "../../../../prisma/db"; // Ajuste o caminho se necessário
import Link from "next/link";

export default async function ChallengesListPage() {
  const challenges = await db.challenge.findMany({
    orderBy: { order: 'asc' }
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter">
            LISTA DE <span className="text-[#81FE88]">DESAFIOS</span>
          </h1>
        </div>

        {/* Deixamos apenas UM botão aqui. Se aparecer outro, ele está no seu Layout.tsx */}
        <Link
          href="/admin/challenges/new"
          className="bg-[#81FE88] text-black px-6 py-3 rounded-2xl font-black italic uppercase text-[10px] hover:scale-105 transition-all shadow-[0_0_20px_rgba(129,254,136,0.2)]"
        >
          + Novo Desafio
        </Link>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-800/50 text-zinc-400 text-[10px] uppercase font-black tracking-widest">
              <th className="p-5">Ordem</th>
              <th className="p-5">Título</th>
              <th className="p-5">Slug</th>
              <th className="p-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {challenges.map((ch) => (
              <tr key={ch.id} className="border-b border-zinc-800/50 hover:bg-white/[0.02]">
                <td className="p-5 font-mono text-[#81FE88]">{ch.order}</td>
                <td className="p-5 font-bold uppercase text-white italic">{ch.title}</td>
                <td className="p-5 text-zinc-500 font-mono text-xs">{ch.slug}</td>
                <td className="p-5 text-right">
                  <Link
                    href={`/admin/challenges/edit/${ch.id}`} // <--- Aponta para a pasta do desafio
                    className="bg-[#81FE88] text-black px-3 py-1 rounded-md font-bold text-[10px]"
                  >
                    EDITAR DESAFIO
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}