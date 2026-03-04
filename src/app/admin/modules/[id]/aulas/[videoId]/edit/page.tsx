export const dynamic = 'force-dynamic';
import { db } from "../../../../../../../../prisma/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import EditAulaForm from "./EditAulaForm";
import ChallengeSection from "../../../../../_components/ChallengeSection";

export default async function EditAulaPage({
  params,
}: {
  params: Promise<{ id: string; videoId: string }>;
}) {
  const { id: moduleId, videoId } = await params;

  const video = await db.video.findUnique({
    where: { id: videoId },
    include: {
      module: { include: { course: true } },
      challenges: { orderBy: { order: 'asc' } },
    },
  });

  if (!video) {
    return <div className="p-20 text-white font-black italic">Aula não encontrada.</div>;
  }

  const courseSlug = video.module.course.slug;

  return (
    <div className="p-10 max-w-2xl mx-auto text-white space-y-8">
      <Link
        href={`/admin/modules/edit/${moduleId}`}
        className="flex items-center gap-2 text-zinc-500 hover:text-[#81FE88] transition-colors text-[10px] font-black uppercase"
      >
        <ArrowLeft size={14} /> Voltar ao Módulo
      </Link>

      <h1 className="text-2xl font-black italic uppercase">
        Editar <span className="text-[#81FE88]">Aula</span>
      </h1>

      <EditAulaForm
        moduleId={moduleId}
        videoId={videoId}
        initial={{
          title: video.title,
          description: video.description ?? "",
          order: video.order,
          url: video.url ?? null,
          pdfUrl: video.pdfUrl ?? null,
        }}
      />

      <div>
        <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">
          Desafio da Aula
        </h2>
        <ChallengeSection
          courseSlug={courseSlug}
          videoId={videoId}
          initialChallenges={video.challenges as any}
        />
      </div>
    </div>
  );
}
