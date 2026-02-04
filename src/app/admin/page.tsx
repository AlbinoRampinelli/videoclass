// src/app/admin/page.tsx
import { db } from "../../../prisma/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  // 1. Busca todos os cursos para listar na tabela
  const courses = await db.course.findMany({
    orderBy: { title: 'asc' }
  });

  // 2. Busca os contadores de usuários (como você já tinha)
  const countAlunos = await db.user.count({ where: { userType: 'ALUNO' } });

  return (
    <div className="p-8">
      {/* ... seu cabeçalho ... */}

      {/* TABELA DE CURSOS */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden mt-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-800/50 text-zinc-400 text-[10px] uppercase font-black tracking-[0.2em]">
              <th className="p-5">Oficina</th>
              <th className="p-5 text-center">Preço</th>
              <th className="p-5 text-center">Duração</th>
              <th className="p-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b border-zinc-800/50 hover:bg-white/[0.02]">
                <td className="p-5 font-bold italic uppercase text-white">{course.title}</td>
                <td className="p-5 text-center text-[#81FE88] font-mono">R$ {course.price}</td>
                <td className="p-5 text-center text-zinc-400">{course.duration || "---"}</td>
                <td className="p-5 text-right">
                  <Link 
                    href={`/admin/cursos/${course.id}`}
                    className="text-[10px] font-black uppercase italic tracking-widest text-[#81FE88] border border-[#81FE88]/20 px-4 py-2 rounded-xl"
                  >
                    Editar
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