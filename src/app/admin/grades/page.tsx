export const dynamic = 'force-dynamic';
import { db } from "../../../../prisma/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function GradesPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).userType !== "ADMIN") {
    return redirect("/signin");
  }

  const submissions = await db.submission.findMany({
    include: { challenge: true },
    orderBy: { createdAt: 'desc' },
  });

  const userIds = [...new Set(submissions.map((s) => s.userId))];
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
          Notas e <span className="text-[#81FE88]">Respostas</span>
        </h1>
        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">
          {submissions.length} submissão{submissions.length !== 1 ? "ões" : ""} registrada{submissions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {submissions.length === 0 && (
        <div className="border border-dashed border-zinc-700 rounded-2xl p-10 text-center">
          <p className="text-zinc-600 text-[10px] uppercase font-black italic">Nenhuma submissão ainda.</p>
        </div>
      )}

      <div className="space-y-4">
        {submissions.map((sub) => {
          const user = userMap[sub.userId];
          return (
            <div key={sub.id} className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white font-black italic uppercase text-sm">{user?.name || "—"}</p>
                  <p className="text-zinc-500 text-[11px]">{user?.email}</p>
                  <p className="text-zinc-400 text-[11px] mt-1">
                    Desafio:{" "}
                    <span className="text-white font-bold">{sub.challenge.title}</span>
                  </p>
                  <p className="text-zinc-600 text-[10px] mt-0.5">
                    {new Date(sub.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-3xl font-black italic ${sub.completed ? "text-[#81FE88]" : "text-red-400"}`}>
                    {sub.grade}/10
                  </span>
                  <p className={`text-[9px] font-black uppercase ${sub.completed ? "text-[#81FE88]" : "text-red-400"}`}>
                    {sub.completed ? "Aprovado" : "Reprovado"}
                  </p>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-2 border-b border-zinc-800">
                  <span className="text-zinc-600 text-[9px] font-black uppercase">Resposta do aluno</span>
                </div>
                <pre className="p-4 text-[11px] font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap max-h-64">
                  {sub.code}
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
