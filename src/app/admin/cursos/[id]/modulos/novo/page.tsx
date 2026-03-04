export const dynamic = 'force-dynamic';
import { db } from "../../../../../../../prisma/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ModuleForm from "../../../../modules/_components/ModuleForm";

export default async function NovoModuloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = await params;
  const courses = await db.course.findMany({ orderBy: { title: "asc" } });

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link
        href={`/admin/cursos/${courseId}`}
        className="flex items-center gap-1.5 text-zinc-500 hover:text-[#81FE88] transition-colors text-[10px] font-black uppercase mb-8"
      >
        <ArrowLeft size={12} /> Voltar ao Curso
      </Link>

      <h1 className="text-2xl font-black italic uppercase text-white mb-8 tracking-tighter">
        Novo <span className="text-[#81FE88]">Módulo</span>
      </h1>

      <ModuleForm courses={courses} defaultCourseId={courseId} backToCourseId={courseId} />
    </div>
  );
}
