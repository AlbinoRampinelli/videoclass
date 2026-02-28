import { db } from "../../../../../prisma/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
export const dynamic = 'force-dynamic';
export default async function NewChallengePage() {
  // 1. BUSCA OS MÓDULOS E CURSOS PARA OS SELECTS
  const [courses, modules] = await Promise.all([
    db.course.findMany({ orderBy: { title: 'asc' } }),
    db.module.findMany({ 
      include: { course: true }, // Para sabermos de qual oficina é o módulo
      orderBy: { order: 'asc' } 
    })
  ]);

  async function createChallenge(formData: FormData) {
    "use server";
    
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const courseSlug = formData.get("courseSlug") as string;
    const moduleId = formData.get("moduleId") as string; // O ID que vem do select
    const description = formData.get("description") as string;
    const initialCode = formData.get("initialCode") as string;
    const expected = formData.get("expected") as string;
    const order = parseInt(formData.get("order") as string) || 0;

    await db.challenge.create({
      data: {
        title,
        slug,
        courseSlug,
        moduleId: moduleId || null, // Se não escolher, fica sem módulo
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
      <h1 className="text-2xl font-black italic uppercase mb-8">
        Novo Desafio <span className="text-[#81FE88]">Python</span>
      </h1>

      <form action={createChallenge} className="space-y-6 bg-zinc-900/40 p-8 rounded-3xl border border-zinc-800">
        <div className="grid grid-cols-2 gap-6">
          {/* CAMPO: OFICINA */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Oficina (Slug)</label>
            <select name="courseSlug" className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-[#81FE88] outline-none">
              {courses.map(c => (
                <option key={c.id} value={c.slug}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* CAMPO NOVO: MÓDULO DESTINO (O QUE ESTAVA FALTANDO) */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black text-[#81FE88] tracking-widest">Módulo Destino</label>
            <select name="moduleId" className="bg-zinc-950 border border-[#81FE88]/20 rounded-xl p-3 text-white focus:border-[#81FE88] outline-none">
              <option value="">Nenhum (Desafio Solto)</option>
              {modules.map(m => (
                <option key={m.id} value={m.id}>
                  {m.course.title} ➔ {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ... Resto dos campos (Title, Slug, Description, Code) ... */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Título do Desafio</label>
          <input name="title" type="text" placeholder="Ex: Soma de dois números" className="bg-zinc-950 border border-zinc-800 rounded-xl p-3" required />
        </div>

        <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Código Inicial</label>
                <textarea name="initialCode" rows={5} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 font-mono text-sm" />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-[#81FE88] tracking-widest">Saída Esperada</label>
                <textarea name="expected" rows={5} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 font-mono text-sm" required />
            </div>
        </div>

        <button type="submit" className="w-full bg-[#81FE88] text-black font-black uppercase italic py-4 rounded-2xl hover:scale-[1.02] transition-all">
          Criar Desafio e Vincular ao Módulo
        </button>
      </form>
    </div>
  );
}