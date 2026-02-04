import { db } from "../../../../prisma/db";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";

export default async function AdminCoursesPage() {
  const courses = await db.course.findMany({
    orderBy: { title: 'asc' }
  });

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            Gestão de Cursos<span className="text-[#81FE88]">.</span>
          </h1>
          <p className="text-zinc-500 text-sm uppercase font-bold tracking-widest">
            Preços, Duração e Conteúdo Comercial
          </p>
        </div>

        <Link 
          href="/admin/courses/new" 
          className="bg-[#81FE88] text-black font-black uppercase italic px-6 py-3 rounded-2xl flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Plus size={20} /> Novo Curso
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl relative group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[#81FE88] font-black text-xl italic">R$ {course.price}</span>
              <span className="text-zinc-500 text-[10px] font-bold uppercase bg-zinc-800 px-2 py-1 rounded-md">
                {course.duration || "40h"}
              </span>
            </div>
            
            <h3 className="text-white font-bold text-lg uppercase italic mb-6">
              {course.title}
            </h3>

            <div className="flex gap-2">
              <Link 
                href={`/admin/courses/${course.id}`}
                className="flex-1 text-center bg-zinc-800 text-white text-[10px] font-black uppercase py-3 rounded-xl hover:bg-zinc-700 transition-colors"
              >
                Editar Detalhes
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}