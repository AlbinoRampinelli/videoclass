import { db } from "../../../../../../prisma/db";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Plus } from "lucide-react";
import SortableVideosTable from "./SortableVideosTable";
import ModuleForm from "../../_components/ModuleForm";
export const dynamic = 'force-dynamic';

export default async function EditModulePage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    const [module, courses] = await Promise.all([
        db.module.findUnique({
            where: { id },
            include: { videos: { orderBy: { order: 'asc' } } }
        }),
        db.course.findMany({ orderBy: { title: 'asc' } })
    ]);

    if (!module) return <div className="p-20 text-white font-black italic">Módulo não encontrado!</div>;

    async function deleteVideo(formData: FormData) {
        "use server";
        const videoId = formData.get("videoId") as string;
        await db.video.delete({ where: { id: videoId } });
        revalidatePath(`/admin/modules/edit/${id}`);
    }

    return (
        <div className="p-10 max-w-4xl mx-auto text-white space-y-10">
            <h1 className="text-2xl font-black italic uppercase">
                Editar Módulo: <span className="text-[#81FE88]">{module.title}</span>
            </h1>

            {/* ── FORM MÓDULO ─────────────────────────────────────── */}
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

            {/* ── SUB-MÓDULOS (AULAS) ──────────────────────────────── */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-black italic uppercase tracking-tighter">
                            Aulas / <span className="text-[#81FE88]">Sub-módulos</span>
                        </h2>
                        <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest mt-1">
                            {module.videos.length} aula{module.videos.length !== 1 ? "s" : ""} cadastrada{module.videos.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <Link
                        href={`/admin/modules/${id}/aulas/new`}
                        className="bg-[#81FE88] text-black font-black italic uppercase text-[10px] px-6 py-3 rounded-2xl hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Plus size={14} />
                        Nova Aula
                    </Link>
                </div>

                {module.videos.length === 0 ? (
                    <div className="bg-zinc-900/40 border border-dashed border-zinc-700 rounded-3xl p-12 text-center">
                        <p className="text-zinc-600 italic uppercase font-black text-[10px]">
                            Nenhuma aula cadastrada. Clique em "Nova Aula" para começar.
                        </p>
                    </div>
                ) : (
                    <SortableVideosTable
                        initialVideos={module.videos}
                        moduleId={id}
                        deleteAction={deleteVideo}
                    />
                )}
            </div>
        </div>
    );
}
