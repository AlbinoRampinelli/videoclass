// src/app/admin/page.tsx
import { db } from "../../../prisma/db";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  // 1. Aguardar os parâmetros de busca (Next.js 15+)
  const { query: queryParam } = await searchParams; 
  const query = queryParam || "";

  try {
    // 2. BUSCA CONTADORES
    const countAlunos = await db.user.count({ where: { userType: 'ALUNO' } });
    const countPais = await db.user.count({ where: { userType: 'PAI' } });

    // 3. BUSCA LISTA DE USUÁRIOS
    const users = await db.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        _count: { select: { enrollments: true } }
      },
      orderBy: { name: 'asc' }
    });

    return (
      <div className="p-8 w-full max-w-7xl mx-auto">
        {/* CABEÇALHO */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              Painel Admin<span className="text-[#81FE88]">.</span>
            </h1>
            <p className="text-zinc-500 text-sm uppercase font-bold tracking-widest mt-1">
              Gestão de Alunos e Matrículas
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl min-w-[140px]">
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Alunos</p>
              <p className="text-2xl font-black text-[#81FE88] italic">{countAlunos}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl min-w-[140px]">
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Pais</p>
              <p className="text-2xl font-black text-white italic">{countPais}</p>
            </div>
          </div>
        </div>

        {/* TABELA */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/50 text-zinc-400 text-[10px] uppercase font-black tracking-[0.2em]">
                <th className="p-5">Informações do Aluno</th>
                <th className="p-5 text-center">Perfil</th>
                <th className="p-5 text-center">CPF</th>
                <th className="p-5 text-center">Cursos</th>
                <th className="p-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-5">
                    <div className="flex flex-col">
                      <span className="text-white font-bold italic uppercase tracking-tighter group-hover:text-[#81FE88] transition-colors">
                        {user.name || "Sem Nome"}
                      </span>
                      <span className="text-zinc-500 text-xs">{user.email}</span>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase italic ${
                      user.userType === 'ALUNO' 
                      ? 'bg-[#81FE88]/10 text-[#81FE88]' 
                      : 'bg-white/10 text-white'
                    }`}>
                      {user.userType}
                    </span>
                  </td>
                  <td className="p-5 text-center font-mono text-xs text-zinc-400">
                    {user.cpf || "---.---.------"}
                  </td>
                  <td className="p-5 text-center">
                    <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                      {user._count.enrollments} Matrícula(s)
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button className="text-[10px] font-black uppercase italic tracking-widest text-[#81FE88] hover:brightness-125 border border-[#81FE88]/20 px-4 py-2 rounded-xl transition-all">
                      Gerenciar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-3">
              <span className="text-zinc-600 font-bold uppercase italic">Nenhum registro encontrado</span>
              <p className="text-zinc-700 text-xs">A busca não retornou resultados.</p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erro no Admin:", error);
    return (
      <div className="p-20 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-red-500 font-black italic uppercase text-2xl mb-2">Erro de Conexão</div>
        <p className="text-zinc-500 max-w-xs">Não foi possível carregar os dados. Verifique o console.</p>
      </div>
    );
  }
}