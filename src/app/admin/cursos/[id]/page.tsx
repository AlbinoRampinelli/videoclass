export const dynamic = 'force-dynamic';
import { db } from "../../../../../prisma/db";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import SortableModulesList from "../../_components/SortableModulesList";
import ToggleOpenButton from "./ToggleOpenButton";

export default async function CourseHubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const course = await db.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          _count: { select: { videos: true, challenges: true } },
        },
      },
    },
  });

  if (!course) return <div className="p-20 text-white font-black italic">Curso não encontrado.</div>;

  async function updateCourse(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const price = parseFloat(formData.get("price") as string);
    const duration = formData.get("duration") as string;
    const features = (formData.get("features") as string)
      .split(",").map((f) => f.trim()).filter(Boolean);

    await db.course.update({ where: { id }, data: { title, price, duration, features } });
    revalidatePath(`/admin/cursos/${id}`);
    revalidatePath("/vitrine");
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href="/admin/cursos" className="flex items-center gap-1.5 text-zinc-500 hover:text-[#81FE88] transition-colors text-[10px] font-black uppercase">
          <ArrowLeft size={12} /> Cursos
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-400 text-[10px] font-black uppercase truncate">{course.title}</span>
      </div>

      <div className="flex items-center justify-between -mt-4">
        <h1 className="text-2xl font-black italic uppercase text-white">
          {course.title}<span className="text-[#81FE88]">.</span>
        </h1>
        <ToggleOpenButton courseId={id} isOpen={course.isOpen} />
      </div>

      {/* ── DETALHES ─────────────────────────────────────── */}
      <section>
        <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Detalhes do Curso</h2>
        <form action={updateCourse} className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl space-y-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Nome da Oficina</label>
            <input name="title" defaultValue={course.title}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Preço (R$)</label>
              <input name="price" type="number" step="0.01" defaultValue={course.price}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Duração</label>
              <input name="duration" defaultValue={course.duration || ""}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">
              Tópicos (separados por vírgula)
            </label>
            <textarea name="features" rows={3} defaultValue={course.features?.join(", ")}
              placeholder="Certificado, Acesso Vitalício, Kit Incluso"
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none resize-none" />
          </div>

          <button type="submit"
            className="bg-[#81FE88] text-black font-black uppercase italic px-8 py-3 rounded-2xl hover:scale-[1.02] transition-all text-sm">
            Salvar Detalhes
          </button>
        </form>
      </section>

      {/* ── MÓDULOS ──────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Módulos</h2>
            <p className="text-zinc-700 text-[9px] uppercase font-black mt-0.5">
              {course.modules.length} módulo{course.modules.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href={`/admin/cursos/${id}/modulos/novo`}
            className="flex items-center gap-2 bg-[#81FE88] text-black font-black italic uppercase text-[10px] px-5 py-2.5 rounded-2xl hover:scale-105 transition-all"
          >
            <Plus size={13} /> Novo Módulo
          </Link>
        </div>

        <SortableModulesList initialModules={course.modules as any} courseId={id} />
      </section>
    </div>
  );
}
