export const dynamic = 'force-dynamic';
import { db } from "../../../prisma/db";
import Link from "next/link";
import { ShieldCheck, Users, Plus, GraduationCap, BarChart2 } from "lucide-react";

export default async function AdminHomePage() {
  const courses = await db.course.findMany({
    orderBy: { title: "asc" },
    select: {
      id: true, title: true, price: true, duration: true, isOpen: true,
      _count: { select: { modules: true, enrollments: true } },
    },
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            Painel <span className="text-[#81FE88]">Admin</span>
          </h1>
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">
            Gerenciamento de Conteúdo
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/alunos"
            className="flex items-center gap-2 bg-white/5 text-zinc-400 border border-zinc-800 px-5 py-2.5 rounded-2xl font-black italic uppercase text-[10px] hover:bg-[#81FE88] hover:text-black hover:border-[#81FE88] transition-all"
          >
            <GraduationCap size={13} /> Alunos
          </Link>
          <Link
            href="/admin/leads"
            className="flex items-center gap-2 bg-white/5 text-zinc-400 border border-zinc-800 px-5 py-2.5 rounded-2xl font-black italic uppercase text-[10px] hover:bg-[#81FE88] hover:text-black hover:border-[#81FE88] transition-all"
          >
            <Users size={13} /> Leads
          </Link>
          <Link
            href="/admin/admins"
            className="flex items-center gap-2 bg-white/5 text-zinc-400 border border-zinc-800 px-5 py-2.5 rounded-2xl font-black italic uppercase text-[10px] hover:bg-[#81FE88] hover:text-black hover:border-[#81FE88] transition-all"
          >
            <ShieldCheck size={13} /> Admins
          </Link> 
        </div>
      </div>

      {/* CURSOS */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Cursos</h2>
            <p className="text-zinc-700 text-[9px] uppercase font-black mt-0.5">
              {courses.length} curso{courses.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/admin/cursos/new"
            className="flex items-center gap-2 bg-[#81FE88] text-black font-black italic uppercase text-[10px] px-5 py-2.5 rounded-2xl hover:scale-105 transition-all"
          >
            <Plus size={13} /> Novo Curso
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="border border-dashed border-zinc-700 rounded-2xl p-10 text-center">
            <p className="text-zinc-600 text-[10px] uppercase font-black italic">
              Nenhum curso cadastrado ainda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/admin/cursos/${course.id}`}
                className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl hover:border-[#81FE88]/40 hover:bg-zinc-900/60 transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[#81FE88] font-black text-lg italic">
                    R$ {course.price.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-zinc-500 text-[9px] font-bold uppercase bg-zinc-800 px-2 py-1 rounded-md">
                    {course.duration || "—"}
                  </span>
                </div>
                <h3 className="text-white font-bold text-base uppercase italic mb-4 group-hover:text-[#81FE88] transition-colors">
                  {course.title}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-[9px] font-black uppercase text-zinc-600">
                    <span>{course._count.modules} módulo{course._count.modules !== 1 ? "s" : ""}</span>
                    <span>·</span>
                    <span>{course._count.enrollments} aluno{course._count.enrollments !== 1 ? "s" : ""}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${
                    (course as any).isOpen
                      ? "bg-[#81FE88]/10 text-[#81FE88]"
                      : "bg-zinc-800 text-zinc-600"
                  }`}>
                    {(course as any).isOpen ? "Aberto" : "Fechado"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}