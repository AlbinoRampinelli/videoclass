import { db } from "../../../../../prisma/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
export const dynamic = 'force-dynamic';

export default async function NewChallengePage() {
  const [courses, modules] = await Promise.all([
    db.course.findMany({ orderBy: { title: 'asc' } }),
    db.module.findMany({ 
      include: { course: true },
      orderBy: { order: 'asc' } 
    })
  ]);

  async function createChallenge(formData: FormData) {
    "use server";
    
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const courseSlug = formData.get("courseSlug") as string;
    const moduleId = formData.get("moduleId") as string;
    const description = formData.get("description") as string;
    const initialCode = formData.get("initialCode") as string;
    const expected = formData.get("expected") as string;
    const order = parseInt(formData.get("order") as string) || 0;

    await db.challenge.create({
      data: {
        title,
        slug,
        courseSlug,
        moduleId: moduleId || null,
        description,
        initialCode,
        expected,
        order,
        testCode: "", 
      },
    });

    revalidatePath("/admin/challenges");
    redirect("/admin/challenges");
  }

  return (
    <div className="p-8 max-w-4xl mx-auto text-white">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-2xl font-black italic uppercase tracking-tighter">
          Novo Desafio <span className="text-[#81FE88]">Python</span>
        </h1>
        <div className="h-[2px] flex-1 bg-zinc-800/50" />
      </div>

      <form action={createChallenge} className="space-y-6 bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl">
        
        {/* LINHA 1: VÍNCULOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Oficina (Curso)</label>
            <select name="courseSlug" className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-[#81FE88] outline-none appearance-none">
              {courses.map(c => (
                <option key={c.id} value={c.slug}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black text-[#81FE88] tracking-widest">Módulo Destino</label>
            <select name="moduleId" className="bg-zinc-950 border border-[#81FE88]/20 rounded-xl p-3 text-white focus:border-[#81FE88] outline-none appearance-none">
              <option value="">Nenhum (Desafio Solto)</option>
              {modules.map(m => (
                <option key={m.id} value={m.id}>
                  {m.course.title} ➔ {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LINHA 2: IDENTIFICAÇÃO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Título do Desafio</label>
            <input name="title" type="text" placeholder="Ex: Soma de dois números" className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-[#81FE88] outline-none" required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Slug (URL)</label>
            <input name="slug" type="text" placeholder="soma-numeros" className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-[#81FE88] outline-none font-mono text-xs" required />
          </div>
        </div>

        {/* DESCRIÇÃO */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Instruções do Desafio</label>
          <textarea name="description" rows={3} placeholder="Explique o que o aluno deve fazer..." className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-[#81FE88] outline-none text-sm" required />
        </div>

        {/* CÓDIGO E SAÍDA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Código Inicial (Python)</label>
                <textarea name="initialCode" rows={6} placeholder="# Escreva seu código aqui" className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-sm text-[#81FE88]/80 outline-none" />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-[#81FE88] tracking-widest">Saída Esperada (Terminal)</label>
                <textarea name="expected" rows={6} placeholder="O que o sistema deve validar..." className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-sm outline-none" required />
            </div>
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full bg-[#81FE88] text-black font-black uppercase italic py-5 rounded-2xl hover:scale-[1.01] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(129,254,136,0.1)]">
            Criar Desafio e Publicar no Módulo
          </button>
        </div>
      </form>
    </div>
  );
}