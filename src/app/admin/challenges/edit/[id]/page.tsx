import { db } from "../../../../../../prisma/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
export const dynamic = 'force-dynamic';
export default async function EditChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Busca o desafio e todos os módulos disponíveis
  const [challenge, modules] = await Promise.all([
    db.challenge.findUnique({ where: { id } }),
    db.module.findMany({ orderBy: { title: 'asc' } })
  ]);

  if (!challenge) return <div className="p-20 text-white">Desafio não encontrado!</div>;

  // 2. Ação de atualizar (Server Action)
  async function updateChallenge(formData: FormData) {
    "use server";
    
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const rawModuleId = formData.get("moduleId") as string;

    // Se o moduleId for uma string vazia "", mandamos null
    const moduleId = rawModuleId === "" ? null : rawModuleId;

    await db.challenge.update({
      where: { id: id },
      data: {
        title,
        slug,
        moduleId, // Agora vai funcionar porque está na lista de "?" do seu erro
        
        // Mantendo os outros campos para não ficarem null
        description: formData.get("description") as string || undefined,
        initialCode: formData.get("initialCode") as string || undefined,
        expected: formData.get("expected") as string || undefined,
      },
    });

    revalidatePath("/admin/challenges");
    redirect("/admin/challenges");
  }
 return (
    <div className="p-10 max-w-4xl mx-auto text-white">
      <h1 className="text-2xl font-black italic uppercase mb-8">
        Editando: <span className="text-[#81FE88]">{challenge.title}</span>
      </h1>

      <form action={updateChallenge} className="space-y-6 bg-zinc-900/40 p-8 rounded-3xl border border-zinc-800 shadow-2xl">
        
        {/* SLUG: Agora visível para você conferir qual é, mas bloqueado para edição */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Slug (URL do Desafio)</label>
          <input 
            name="slug" 
            defaultValue={challenge.slug} 
            className="bg-zinc-950 border border-zinc-800 rounded-xl p-4" 
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Título do Desafio</label>
            <input 
              name="title" 
              defaultValue={challenge.title} 
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black text-[#81FE88] tracking-widest">Módulo Destino</label>
            <select 
              name="moduleId" 
              defaultValue={challenge.moduleId || ""} 
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none"
            >
              <option value="">-- Sem Módulo (Desafio Solto) --</option>
              {modules.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CAMPO DE DESCRIÇÃO (Faltava este!) */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Descrição / Instruções</label>
          <textarea 
            name="description" 
            defaultValue={challenge.description || ""} 
            rows={4}
            className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none resize-none" 
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* CÓDIGO INICIAL (Faltava este!) */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Estrutura Inicial (Python)</label>
            <textarea 
              name="initialCode" 
              defaultValue={challenge.initialCode || ""} 
              rows={8}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-sm text-zinc-300 focus:border-[#81FE88] outline-none" 
            />
          </div>

          {/* SAÍDA ESPERADA (Faltava este!) */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black text-[#81FE88] tracking-widest">Output Esperado</label>
            <textarea 
              name="expected" 
              defaultValue={challenge.expected || ""} 
              rows={8}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-sm text-[#81FE88] focus:border-[#81FE88] outline-none" 
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" className="flex-1 bg-[#81FE88] text-black font-black uppercase italic py-4 rounded-2xl hover:scale-[1.02] transition-all">
            Salvar Alterações do Desafio
          </button>
        </div>
      </form>
    </div>
  );
}