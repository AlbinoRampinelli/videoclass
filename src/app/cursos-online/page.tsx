// src/app/cursos-online/page.tsx

import { prisma } from "@/lib/prisma";
import db from "../../../prisma/db";

export default async function CursosOnline() {

  const courses = await prisma.course.findMany({
    where: { format: "ONLINE" },
  });

  return (
    <div className="p-8 w-full max-w-5xl mx-auto">
      <h1 className="text-3xl font-black italic uppercase text-white mb-10 tracking-tighter">
        Cursos <span className="text-[#81FE88]">Online</span>
      </h1>

      <div className="flex flex-col gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[32px] flex flex-col md:flex-row justify-between items-center group hover:border-[#81FE88]/30 transition-all backdrop-blur-sm"
          >
            <div className="flex flex-col md:flex-row items-center gap-6 w-full">
              {/* Thumbnail Simbolizada */}
              <div className="w-full md:w-40 h-24 bg-zinc-800 rounded-2xl flex items-center justify-center text-[#81FE88] border border-zinc-700 group-hover:border-[#81FE88]/50 transition-all overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#81FE88]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="font-black italic text-xl tracking-tighter">PLAY</span>
              </div>

              <div className="flex flex-col gap-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <span className="bg-[#81FE88] text-black text-[10px] font-black uppercase px-2 py-1 rounded-md italic">
                    Digital
                  </span>
                  <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                    Acesso Vitalício
                  </span>
                </div>

                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mt-2 group-hover:text-[#81FE88] transition-colors">
                  {course.title}
                </h2>

                <p className="text-zinc-500 text-sm font-medium">
                  Aprenda no seu ritmo com videoaulas exclusivas.
                </p>
              </div>
            </div>

            {/* Botão Padronizado */}
            <button className="mt-6 md:mt-0 w-full md:w-auto whitespace-nowrap px-10 py-4 bg-zinc-800 border border-zinc-700 text-white font-black uppercase italic rounded-2xl hover:bg-[#81FE88] hover:text-black hover:border-[#81FE88] transition-all shadow-xl active:scale-95">
              Informações sobre
            </button>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="p-20 text-center border-2 border-dashed border-zinc-800 rounded-[40px]">
            <p className="text-zinc-600 font-bold uppercase italic">Nenhum curso online disponível no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}