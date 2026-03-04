export const dynamic = 'force-dynamic';
import { db } from "../../../../prisma/db";
import LeadsKanban from "./LeadsTable";

export default async function LeadsPage() {
  const [leads, courses] = await Promise.all([
    db.lead.findMany({ orderBy: { createdAt: 'desc' } }),
    db.course.findMany({ select: { id: true, title: true } }),
  ]);

  const courseMap = Object.fromEntries(courses.map((c) => [c.id, c.title]));

  const leadsWithCourse = leads.map((l) => ({
    ...l,
    cursoNome: l.cursoId ? (courseMap[l.cursoId] ?? l.cursoId) : null,
  }));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black italic uppercase text-white tracking-tighter">
            Gestão de <span className="text-[#81FE88]">Leads</span>
          </h1>
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">
            {leads.length} lead{leads.length !== 1 ? "s" : ""} registrado{leads.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <LeadsKanban leads={leadsWithCourse} />
    </div>
  );
}
