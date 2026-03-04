export const dynamic = 'force-dynamic';
import { db } from "../../../../../prisma/db";
import ModuleForm from "../_components/ModuleForm";

export default async function NewModulePage() {
  const courses = await db.course.findMany({ orderBy: { title: 'asc' } });

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black italic uppercase text-white mb-8 tracking-tighter">
        Criar Novo <span className="text-[#81FE88]">Módulo</span>
      </h1>
      <ModuleForm courses={courses} />
    </div>
  );
}
