"use client";

import { useEffect, useState } from "react";
import { Info, PlayCircle } from "lucide-react";
import CpfModal from "../CpfModal";
import { CourseCard } from "../CourseCard";
import ModalInteresse from "../ModalInteresseNovo";
import CourseRegistrationModal from "../CourseRegistrationModal";
import { useRouter } from "next/navigation";

// 1. MAPEAMENTO DE VÍDEOS
const VIDEO_MAP: Record<string, string> = {
  "1": "/python-video.mp4",
  "2": "/steam-video.mp4",
  "3": "/robotica-video.mp4",
  "default": "/python-video.mp4"
};

const COURSE_DETAILS: Record<string, { oQueAprende: string[], beneficios: string[] }> = {
  "1": {
    oQueAprende: ["Lógica de Programação", "Criação de Jogos 2D", "Automação de Tarefas", "Sintaxe de IA"],
    beneficios: ["Raciocínio Lógico", "Carreira Tech", "Resolução de Problemas"]
  },
  "2": {
    oQueAprende: ["Experimentos Científicos", "Engenharia de Papel", "Design Thinking", "Matemática Aplicada"],
    beneficios: ["Curiosidade", "Visão 360°", "Trabalho em Equipe"]
  },
  "3": {
    oQueAprende: ["Circuitos Eletrônicos", "Programação de Motores", "Sensores e Atuadores", "Montagem Maker"],
    beneficios: ["Coordenação Motora", "Autonomia", "Persistência"]
  }
};

export default function VitrineCursos({ userDb, session, courses = [], travarCpf = false }: any) {
  const [comprasLocais, setComprasLocais] = useState<string[]>([]);
  const [cursoInteresse, setCursoInteresse] = useState<any>(null);
  const [isLeadOpen, setIsLeadOpen] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState(VIDEO_MAP["default"]);
  const [activeKey, setActiveKey] = useState("1");
  const details = COURSE_DETAILS[activeKey];
  const [cursoSelecionadoParaRegistro, setCursoSelecionadoParaRegistro] = useState<any>(null);
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const router = useRouter();

  // 1. Definição da constante do Modal (Colocada aqui para o useEffect ler)
  const mostrarModalCpf = travarCpf && (!userDb?.cpf || !userDb?.userType);
    
  useEffect(() => {
    // Trava o refresh se o usuário estiver digitando no Modal
    if (mostrarModalCpf) return;

    if (session?.user && (!userDb?.enrollments || userDb.enrollments.length === 0)) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session?.user?.id, userDb?.enrollments?.length, mostrarModalCpf]);

  useEffect(() => {
    const success = searchParams?.get("success");
    const idDoCurso = searchParams?.get("id");

    if (success === "true" && idDoCurso) {
      setComprasLocais(prev => {
        if (!prev.includes(idDoCurso)) {
            const novaLista = [...prev, idDoCurso];
            localStorage.setItem("meus_cursos", JSON.stringify(novaLista)); // Salva na hora
            return novaLista;
        }
        return prev;
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  useEffect(() => {
    const carregarComprasDoCheckout = () => {
      try {
        const cursosPagos = JSON.parse(localStorage.getItem("meus_cursos") || "[]");
        if (cursosPagos.length > 0) {
          setComprasLocais(cursosPagos);
        }
      } catch (e) {
        console.error("Erro ao sincronizar localStorage", e);
      }
    };
    carregarComprasDoCheckout();
  }, []);

  const handleGoToRegistration = () => {
    setIsLeadOpen(true);
    setTimeout(() => {
      setCursoInteresse(null);
    }, 50);
  };

  const firstName = session?.user?.name?.split(' ')[0] || "Aluno";
  const safeCourses = Array.isArray(courses) ? courses : [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-4 md:px-10 md:py-6 max-w-7xl mx-auto flex flex-col text-white">

      {mostrarModalCpf && (
        <CpfModal userName={firstName} userId={userDb?.id} isGoogleLogin={true} />
      )}

      {cursoSelecionadoParaRegistro && (
        <ModalInteresse
          course={cursoSelecionadoParaRegistro}
          onClose={() => setCursoSelecionadoParaRegistro(null)}
          onAction={handleGoToRegistration}
          userDb={userDb}
        />
      )}

      <CourseRegistrationModal
        isOpen={isLeadOpen}
        onClose={() => {
          setIsLeadOpen(false);
          setCursoSelecionadoParaRegistro(null);
        }}
        onSuccess={(id) => {
          const idStr = String(id);
          setComprasLocais(prev => {
             const novaLista = prev.includes(idStr) ? prev : [...prev, idStr];
             localStorage.setItem("meus_cursos", JSON.stringify(novaLista));
             return novaLista;
          });
        }}
        cursoId={cursoSelecionadoParaRegistro?.id || ""}
        cursoNome={cursoSelecionadoParaRegistro?.title || ""}
        openFeedback={(type, msg) => console.log(type, msg)}
        userDefaultData={{
          nome: session?.user?.name || "",
          email: session?.user?.email || ""
        }}
      />

      <header className="mb-4 md:mb-6 pt-4 lg:pt-0">
        <p className="text-[#81FE88] font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
          Ambiente de Aprendizado
        </p>
        <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-[0.9] pl-12 lg:pl-0">
          OLÁ, {firstName}!
        </h1>
      </header>

      {/* GRID DE VÍDEO E DETALHES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12 items-start">
        <div className="w-full">
          <div className="rounded-xl md:rounded-[2rem] overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl">
            <div className="aspect-video w-full flex items-center justify-center relative">
              <video key={activeVideoUrl} controls className="w-full h-full object-cover" playsInline>
                <source src={activeVideoUrl} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>

        <div className="w-full">
          {activeVideoUrl && activeKey !== "default" && details ? (
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-5 w-[2px] bg-[#81FE88]" />
                <h3 className="text-white font-black italic uppercase text-xl md:text-2xl tracking-tighter">
                  {activeKey === "1" ? "Python na Prática" : activeKey === "2" ? "Oficina STEAM" : "Robótica Educacional"}
                </h3>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800 p-4 md:p-6 rounded-[1.2rem] md:rounded-[1.5rem] backdrop-blur-md">
                <div className="space-y-6">
                  <ul className="grid grid-cols-1 gap-2">
                    {details.oQueAprende.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-zinc-300 text-xs md:text-sm">
                        <div className="w-1 h-1 rounded-full bg-[#81FE88]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center border border-dashed border-zinc-800 rounded-xl">
              <p className="text-zinc-500 text-xs italic">Selecione uma oficina abaixo.</p>
            </div>
          )}
        </div>
      </div>

      {/* SEÇÃO DE CURSOS (OFICINAS) */}
      <section className="flex-1">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-lg md:text-xl font-black uppercase italic tracking-tighter">Nossas Oficinas</h2>
          <div className="h-[1px] flex-1 bg-zinc-800/50"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {safeCourses.map((course: any) => {
            const currentId = String(course.id);
            const ehCursoDeInformacao = currentId === "2" || currentId === "3";

            // LOGICA DA VERDADE UNIFICADA:
            // Checa no banco OU no estado local que capturou o pagamento agora
            const matriculadoNoBanco = userDb?.enrollments?.some((e: any) => String(e.courseId) === currentId);
            const matriculadoLocalmente = comprasLocais.includes(currentId);
            
            const jaComprouFinal = ehCursoDeInformacao ? false : (matriculadoNoBanco || matriculadoLocalmente);

            return (
              <div
                key={course.id}
                className="transform scale-95 origin-top-left md:scale-100 cursor-pointer"
                onClick={() => {
                  setActiveKey(currentId);
                  setActiveVideoUrl(VIDEO_MAP[currentId] || VIDEO_MAP["default"]);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <CourseCard
                  course={course}
                  jaComprou={jaComprouFinal}
                  buttonType={ehCursoDeInformacao ? "saber-mais" : "matricula"}
                  onSaberMais={(deveAbrirModal) => {
                    if (deveAbrirModal) setCursoSelecionadoParaRegistro(course);
                  }}
                  estado_atual={activeKey === currentId}
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}