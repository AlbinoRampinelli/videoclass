import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import SaberMaisBtn from "../components/SaberMaisBtn";

export default async function CursosPresenciais() {
    const session = await auth();

    const courses = await prisma.course.findMany({
        where: { format: 'PRESENCIAL' }
    });

    return (
        <div className="p-8 w-full max-w-5xl mx-auto min-h-screen bg-black">
            <h1 className="text-3xl font-black italic uppercase text-white mb-10 tracking-tighter">
                Treinamentos <span className="text-[#81FE88]">Presenciais</span>
            </h1>

            <div className="mb-12 p-8 border-l-4 border-[#81FE88] bg-zinc-900/20 rounded-r-3xl">
                <h2 className="text-white text-lg font-bold uppercase italic mb-2">A experiência na Sede</h2>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-3xl">
                    Nossos treinamentos presenciais são projetados para máxima imersão. Você terá acesso a laboratórios equipados e mentoria constante.
                </p>
            </div>

            <div className="flex flex-col gap-10">
                {courses.map((course) => {
                    const isSteam = course.title.toUpperCase().includes("STEAM");
                    const isRobotica = course.title.toUpperCase().includes("ROBÓTICA");

                    const displayDescription = isSteam
                        ? "Aprenda com seus erros e domine a teoria do ENEM na prática. Oficinas exclusivas para alunos 8+ construindo soluções reais."
                        : isRobotica
                            ? "Prepare-se para a OBR. Uma jornada anual de 36 oficinas práticas que unem engenharia e lógica para competições de alto nível."
                            : course.description;

                    return (
                        <div
                            key={course.id}
                            className="relative bg-zinc-900/40 border border-zinc-800 p-8 rounded-[40px] group hover:border-[#81FE88]/40 transition-all overflow-hidden"
                        >
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#81FE88]/5 blur-[80px] rounded-full group-hover:bg-[#81FE88]/10 transition-all" />

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-[#81FE88] animate-pulse" />
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                                            {isSteam ? "Foco ENEM" : isRobotica ? "Foco OBR" : "Conteúdo Exclusivo"}
                                        </span>
                                    </div>

                                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-4 group-hover:text-[#81FE88] transition-colors">
                                        {course.title}
                                    </h2>

                                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                                        {/* Texto em zinc-200 para ficar mais legível que o anterior */}
                                        <p className="text-zinc-200 leading-relaxed text-sm md:text-base italic">
                                            {displayDescription || "Detalhes específicos deste treinamento estão sendo atualizados."}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                                    <SaberMaisBtn courseId={course.id} courseTitle={course.title} />
                                    <span className="text-[10px] text-zinc-600 font-bold uppercase">Vagas Limitadas</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}