import { db } from "../../../../../prisma/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
export const dynamic = 'force-dynamic';

export default async function NewModulePage() {
  // 1. Busca as oficinas (cursos) para vincular o módulo
  const courses = await db.course.findMany({ orderBy: { title: 'asc' } });

  async function createModule(formData: FormData) {
    "use server";
    
    const title = formData.get("title") as string;
    const courseId = formData.get("courseId") as string;
    const order = parseInt(formData.get("order") as string) || 0;

    // Criamos o módulo no banco
    await db.module.create({
      data: {
        title,
        courseId,
        order,
      },
    });

    // Revalida e volta para a página principal do admin ou de módulos
    revalidatePath("/admin");
    redirect("/admin");
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black italic uppercase text-white mb-8 tracking-tighter">
        Criar Novo <span className="text-[#81FE88]">Módulo</span>
      </h1>

      <form action={createModule} className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl space-y-6">
        
        {/* SELEÇÃO DA OFICINA */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Pertence à Oficina:</label>
          <select 
            name="courseId" 
            required
            className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none appearance-none cursor-pointer"
          >
            <option value="">Selecione a Oficina...</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {/* TÍTULO DO MÓDULO */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Nome do Módulo</label>
          <input 
            name="title" 
            type="text" 
            placeholder="Ex: Introdução a Variáveis" 
            required
            className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none" 
          />
        </div>

        {/* ORDEM */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Ordem de Exibição</label>
          <input 
            name="order" 
            type="number" 
            placeholder="Ex: 1" 
            className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none w-32" 
          />
          <p className="text-zinc-600 text-[9px] uppercase italic">Define a sequência: Módulo 1, Módulo 2, etc.</p>
        </div>

        <button 
          type="submit" 
          className="w-full bg-[#81FE88] text-black font-black uppercase italic py-4 rounded-2xl hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(129,254,136,0.1)] mt-4"
        >
          Registrar Módulo
        </button>
      </form>
    </div>
  );
}