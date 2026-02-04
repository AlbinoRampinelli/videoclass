
import { db } from "../../../../../prisma/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function EditCoursePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const course = await db.course.findUnique({ where: { id: id } });

  if (!course) return <div className="text-white p-10 font-black italic">CURSO NÃO ENCONTRADO.</div>;

  // ESTA FUNÇÃO SALVA OS DADOS NO BANCO
  async function updateCourse(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const price = parseFloat(formData.get("price") as string);
    const duration = formData.get("duration") as string;
    const featuresRaw = formData.get("features") as string;
    
    // Converte o texto da área de texto em uma lista (Array)
    const features = featuresRaw.split(",").map(f => f.trim()).filter(f => f !== "");

    await db.course.update({
      where: { id: id },
      data: { title, price, duration, features }
    });

    revalidatePath("/admin");
    revalidatePath("/vitrine");
    revalidatePath("/");
    redirect("/admin");
  }

  return (
    <div className="p-8 max-w-2xl mx-auto min-h-screen">
      <header className="mb-10">
        <Link href="/admin" className="text-[#81FE88] text-xs font-bold uppercase tracking-widest hover:underline">
          ← Voltar ao Painel
        </Link>
        <h1 className="text-4xl font-black italic uppercase text-white mt-4 leading-none">
          Editar {course.title}<span className="text-[#81FE88]">.</span>
        </h1>
      </header>

      <form action={updateCourse} className="space-y-6 bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 backdrop-blur-sm">
        {/* NOME DO CURSO */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Nome da Oficina</label>
          <input name="title" defaultValue={course.title} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none transition-all" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* PREÇO */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Preço (R$)</label>
            <input name="price" type="number" step="0.01" defaultValue={course.price} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none" />
          </div>

          {/* DURAÇÃO */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Duração (Ex: 40h)</label>
            <input name="duration" defaultValue={course.duration || ""} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none" />
          </div>
        </div>

        {/* TÓPICOS COMERCIAIS */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">
            Tópicos (Separe por vírgula para criar os checks verdes)
          </label>
          <textarea 
            name="features" 
            defaultValue={course.features?.join(", ")} 
            rows={5} 
            placeholder="Ex: Certificado, Acesso Vitalício, Kit Incluso"
            className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none resize-none shadow-inner"
          />
        </div>

        {/* BOTÕES */}
        <div className="flex gap-4 pt-4">
          <button type="submit" className="flex-1 py-4 bg-[#81FE88] text-black rounded-2xl font-black uppercase italic text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(129,254,136,0.2)]">
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}