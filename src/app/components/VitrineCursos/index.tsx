"use client";

import { useEffect, useState } from "react";
import CpfModal from "../CpfModal";
import { CourseCard } from "../CourseCard";
import { VideoPlayer } from "../VideoPlayer";
import ModalInteresse from "../ModalInteresse";

export default function VitrineCursos({ userDb, session, courses = [], travarCpf = false }: any) {
  const [comprasLocais, setComprasLocais] = useState<string[]>([]);
  const [cursoInteresse, setCursoInteresse] = useState<any>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    try {
      const cache = JSON.parse(localStorage.getItem("meus_cursos") || "[]");
      setComprasLocais(cache);
    } catch (e) {
      console.error("Erro ao carregar cache local");
    }
  }, []);

  const firstName = session?.user?.name?.split(' ')[0] || "Aluno";
  const mostrarModalCpf = travarCpf && (!userDb?.cpf || !userDb?.userType);
  const isEscolaParceira = userDb?.schoolName === "MINHA_ESCOLA_ATUAL";

  const safeCourses = Array.isArray(courses) ? courses : [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-4 md:px-10 md:py-6 max-w-7xl mx-auto flex flex-col text-white">

      {mostrarModalCpf && <CpfModal userName={firstName} userId={userDb?.id} />}

      {cursoInteresse && (
        <ModalInteresse
          key={cursoInteresse?.id}
          course={cursoInteresse}
          onClose={() => setCursoInteresse(null)}
          userDb={userDb}
        />
      )}

      <header className="mb-4 md:mb-6">
        <p className="text-[#81FE88] font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
          Ambiente de Aprendizado
        </p>
        <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-[0.9]">
          OLÁ, {firstName}!
        </h1>
      </header>

      <div className="rounded-xl md:rounded-[1.5rem] overflow-hidden border border-zinc-800 shadow-2xl mb-6 max-w-md lg:max-w-lg ml-0 bg-zinc-900">
        <div className="aspect-video w-full">
          {/* Usando a tag nativa para testar a acessibilidade direta */}
          <video
            controls
            className="w-full h-full object-cover"
            preload="metadata"
            playsInline
          >
            <source src="/python-video.mp4" type="video/mp4" />
            {/* Adicione uma versão MP4 aqui assim que converter */}
            Seu navegador não suporta a reprodução de vídeos.
          </video>
        </div>
      </div>

      <section className="flex-1">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-lg md:text-xl font-black uppercase italic tracking-tighter">
            Nossas Oficinas
          </h2>
          <div className="h-[1px] flex-1 bg-zinc-800/50"></div>
        </div>

        {safeCourses.length === 0 ? (
          <div className="p-10 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500">
            Nenhuma oficina disponível no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {safeCourses.map((course: any) => {
              // 1. Verifica no Banco de Dados
              const matriculadoNoBanco = userDb?.enrollments?.some((e: any) => e.courseId === course.id);

              // 2. Verifica no LocalStorage (o cache que você carrega no useEffect)
              const matriculadoNoCache = comprasLocais.includes(course.id);

              // O botão vira "ACESSAR" se estiver no Banco OU no Cache Local
              const jaComprou = matriculadoNoBanco || matriculadoNoCache;

              // REGRAS DEFINIDAS:
              const ehEspecial = course.id === "2" || course.id === "3" || course.format === '';
              const precisaSaberMais = ehEspecial && !isEscolaParceira;

              return (
                <div key={course.id || Math.random()} className="transform scale-95 origin-top-left md:scale-100">
                  <CourseCard
                    course={course}
                    jaComprou={jaComprou}
                    buttonType={precisaSaberMais ? "saber-mais" : "matricula"}
                    onSaberMais={() => setCursoInteresse(course)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}