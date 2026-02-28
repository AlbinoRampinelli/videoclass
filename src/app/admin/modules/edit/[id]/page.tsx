import { db } from "../../../../../../prisma/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
export const dynamic = 'force-dynamic';
export default async function EditModulePage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    // 1. Busca os dados do módulo e a lista de cursos
    const [module, courses] = await Promise.all([
        db.module.findUnique({ where: { id } }),
        db.course.findMany({ orderBy: { title: 'asc' } })
    ]);

    if (!module) return <div className="p-20 text-white font-black italic">Módulo não encontrado!</div>;

    // 2. Server Action para atualizar
    async function updateModule(formData: FormData) {
        "use server";
        const title = formData.get("title") as string;
        const videoUrl = formData.get("videoUrl") as string; // <-- Novo campo
        const courseId = formData.get("courseId") as string;
        const order = parseInt(formData.get("order") as string) || 0;

        await db.module.update({
            where: { id },
            data: { title, videoUrl, courseId, order },
        });

        revalidatePath("/admin/challenges");
        redirect("/admin/challenges");
    }
    return (
        <div className="p-10 max-w-2xl mx-auto text-white">
            <h1 className="text-2xl font-black italic uppercase mb-8">
                Editar Módulo: <span className="text-[#81FE88]">{module.title}</span>
            </h1>

            <form action={updateModule} className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl space-y-6">

                {/* SELEÇÃO DA OFICINA */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Pertence à Oficina:</label>
                    <select
                        name="courseId"
                        defaultValue={module.courseId}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none"
                    >
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.title}</option>
                        ))}
                    </select>
                </div>

                {/* TÍTULO */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Nome do Módulo</label>
                    <input
                        name="title"
                        defaultValue={module.title}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-black text-[#81FE88] tracking-widest">URL do Vídeo (Instalação)</label>
                    <input
                        name="videoUrl"
                        defaultValue={module.videoUrl || ""}
                        placeholder="Ex: https://youtube.com/embed/..."
                        className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none"
                    />
                </div>
                {/* ORDEM */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Ordem</label>
                    <input
                        name="order"
                        type="number"
                        defaultValue={module.order}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none w-32"
                    />
                </div>

                <div className="flex gap-4">
                    <button type="submit" className="flex-1 bg-[#81FE88] text-black font-black uppercase italic py-4 rounded-2xl hover:scale-[1.02] transition-all">
                        Salvar Módulo
                    </button>
                    <Link
                        href="/admin/challenges"
                        className="px-8 border border-zinc-800 rounded-2xl font-black uppercase italic text-[10px] flex items-center justify-center"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </div>
    );
}