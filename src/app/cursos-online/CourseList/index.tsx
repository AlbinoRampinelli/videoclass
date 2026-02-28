"use client";

import { useState } from "react";
// Ajuste os ../ conforme a profundidade da sua pasta components
import InfoPythonModal from "../../components/InfoPythonModal"; 
import CourseRegistrationModal from "../../components/CourseRegistrationModal";
import StatusFeedbackModal from "../../components/StatusFeedbackModal";

interface Course {
  id: string;
  title: string;
  slug: string;
}

export default function CourseList({ courses }: { courses: Course[] }) {
  // Controle dos dois modais (Info e Cadastro)
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isLeadOpen, setIsLeadOpen] = useState(false);
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Controle do Feedback (Vaga já garantida)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"success" | "conflict" | "error">("success");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // 1. Abre o primeiro modal (Informações Sobre)
  const handleShowInfo = (course: Course) => {
    setSelectedCourse(course);
    setIsInfoOpen(true);
  };

  // 2. Transição entre o modal de Info para o de Cadastro
  const handleGoToRegistration = () => {
    setIsInfoOpen(false);
    setTimeout(() => setIsLeadOpen(true), 100);
  };

  // 3. Trata o retorno do cadastro (Sucesso ou Vaga já garantida)
  const handleShowFeedback = (type: "success" | "conflict" | "error", message: string) => {
    setIsLeadOpen(false);
    setFeedbackType(type);
    setFeedbackMessage(message);
    setTimeout(() => setIsFeedbackOpen(true), 100);
  };

  return (
    <div className="flex flex-col gap-6">
      {courses.map((course) => (
        <div key={course.id} className="group relative bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between transition-all hover:border-[#81FE88]/30 overflow-hidden">
          <div className="z-10">
            <span className="text-[#81FE88] text-[10px] font-black uppercase tracking-widest">Curso Online</span>
            <h3 className="text-white text-2xl md:text-3xl font-black italic uppercase italic">{course.title}</h3>
          </div>

          <button 
            onClick={() => handleShowInfo(course)}
            className="z-10 px-8 py-4 bg-zinc-800/50 text-white font-bold uppercase italic rounded-2xl border border-zinc-700 hover:bg-[#81FE88] hover:text-black transition-all"
          >
            Informações Sobre
          </button>
        </div>
      ))}

      {/* MODAL 1: Informações (Aquele com "Garantir Minha Vaga Agora") */}
      <InfoPythonModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        cursoNome={selectedCourse?.title || ""}
        onAction={handleGoToRegistration} // Esta prop faz o botão verde funcionar
      />

      {/* MODAL 2: Cadastro (O formulário com CPF) */}
      <CourseRegistrationModal
        isOpen={isLeadOpen}
        onClose={() => setIsLeadOpen(false)}
        cursoId={selectedCourse?.id || ""}
        cursoNome={selectedCourse?.title || ""}
        openFeedback={handleShowFeedback}
      />

      {/* MODAL 3: Feedback (Vaga já garantida) */}
      <StatusFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        type={feedbackType}
        message={feedbackMessage}
      />
    </div>
  );
}