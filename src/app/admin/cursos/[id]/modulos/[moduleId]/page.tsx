export const dynamic = 'force-dynamic';
import { db } from "../../../../../../../prisma/db";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import ModuleForm from "../../../../modules/_components/ModuleForm";
import SortableVideosTable from "../../../../modules/edit/[id]/SortableVideosTable";
import DeleteVideoButton from "../../../../modules/edit/[id]/DeleteVideoButton";
import ChallengeSection from "../../../../_components/ChallengeSection";

export default async function ModuleManagePage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>;
}) {
  const { id: courseId, moduleId } = await params;

  const [course, module, courses] = await Promise.all([
    db.course.findUnique({ where: { id: courseId }, select: { id: true, title: true, slug: true } }),
    db.module.findUnique({
      where: { id: moduleId },
      include: {
        videos: { orderBy: { order: "asc" } },
        challenges: { where: { videoId: null }, orderBy: { order: 'asc' } },
      },
    }),
    db.course.findMany({ orderBy: { title: "asc" } }),
  ]);

  if (!module || !course) {
    return <div className="p-20 text-white font-black italic">Módulo não encontrado.</div>;
  }

  async function deleteVideo(formData: FormData) {
    "use server";
    const videoId = formData.get("videoId") as string;
    await db.video.delete({ where: { id: videoId } });
    revalidatePath(`/admin/cursos/${courseId}/modulos/${moduleId}`);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link href="/admin/cursos" className="text-zinc-500 hover:text-[#81FE88] transition-colors text-[10px] font-black uppercase">
          Cursos
        </Link>
        <span className="text-zinc-700">/</span>
        <Link href={`/admin/cursos/${courseId}`} className="flex items-center gap-1 text-zinc-500 hover:text-[#81FE88] transition-colors text-[10px] font-black uppercase">
          <ArrowLeft size={10} /> {course.title}
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-400 text-[10px] font-black uppercase truncate">{module.title}</span>
      </div>

      <h1 className="text-2xl font-black italic uppercase text-white -mt-4">
        {module.title}<span className="text-[#81FE88]">.</span>
      </h1>

      {/* ── FORM DO MÓDULO ───────────────────────────────── */}
      <section>
        <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Detalhes do Módulo</h2>
        <ModuleForm
          courses={courses}
          initial={{
            id: module.id,
            title: module.title,
            courseId: module.courseId,
            order: module.order,
            videoUrl: module.videoUrl ?? null,
            pdfUrl: (module as any).pdfUrl ?? null,
          }}
        />
      </section>

      {/* ── DESAFIO DO MÓDULO ────────────────────────────── */}
      <section>
        <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Desafio do Módulo</h2>
        <ChallengeSection
          courseSlug={course.slug}
          moduleId={moduleId}
          initialChallenges={module.challenges as any}
        />
      </section>

      {/* ── AULAS / SUB-MÓDULOS ──────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Aulas / Sub-módulos</h2>
            <p className="text-zinc-700 text-[9px] uppercase font-black mt-0.5">
              {module.videos.length} aula{module.videos.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href={`/admin/modules/${moduleId}/aulas/new`}
            className="flex items-center gap-2 bg-[#81FE88] text-black font-black italic uppercase text-[10px] px-5 py-2.5 rounded-2xl hover:scale-105 transition-all"
          >
            <Plus size={13} /> Nova Aula
          </Link>
        </div>

        {module.videos.length === 0 ? (
          <div className="border border-dashed border-zinc-700 rounded-2xl p-10 text-center">
            <p className="text-zinc-600 text-[10px] uppercase font-black italic">
              Nenhuma aula. Clique em "Nova Aula" para começar.
            </p>
          </div>
        ) : (
          <SortableVideosTable
            initialVideos={module.videos}
            moduleId={moduleId}
            deleteAction={deleteVideo}
          />
        )}
      </section>
    </div>
  );
}
