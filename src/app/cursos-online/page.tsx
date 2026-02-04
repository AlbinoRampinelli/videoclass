// src/app/cursos-online/page.tsx
import { prisma } from "@/lib/prisma"; // Verifique se seu import do prisma é este
import CourseList from "./CourseList";
export const dynamic = 'force-dynamic'

export default async function CursosOnline() {
  const courses = await prisma.course.findMany({
    where: { format: "ONLINE" },
  });

  return (
    <div className="p-8 w-full max-w-5xl mx-auto">
      <h1 className="text-3xl font-black italic uppercase text-white mb-10 tracking-tighter">
        Cursos <span className="text-[#81FE88]">Online</span>
      </h1>

      {/* Aqui a mágica acontece: O Servidor passa apenas os dados puros para o Cliente */}
      <CourseList courses={courses} />

      {courses.length === 0 && (
        <div className="p-20 text-center border-2 border-dashed border-zinc-800 rounded-[40px]">
          <p className="text-zinc-600 font-bold uppercase italic">Nenhum curso disponível.</p>
        </div>
      )}
    </div>
  );
}