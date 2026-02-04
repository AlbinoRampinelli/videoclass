"use client";

import { useState } from "react";
import CourseInquiryModal from "../components/CourseInquiryModal";
import CourseRegistrationModal from "../components/CourseRegistrationModal";
import StatusFeedbackModal from '../components/StatusFeedbackModal'
import { useCallback } from "react";

interface Course {
    id: string;
    title: string;
}

export default function CourseList({ courses }: { courses: Course[] }) {
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isLeadOpen, setIsLeadOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [selectedCourseNome, setSelectedCourseNome] = useState<string>("");

    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [feedbackType, setFeedbackType] = useState<"success" | "conflict" | "error">("success");
    const [feedbackMessage, setFeedbackMessage] = useState("");

    // Função robusta de feedback
    const showFeedback = useCallback((type: "success" | "conflict" | "error", msg: string) => {
        setIsLeadOpen(false);

        setFeedbackType(type);
        setFeedbackMessage(msg);
        // Um pequeno delay para o React processar o fechamento do anterior
        setTimeout(() => {
            setIsFeedbackOpen(true);
        }, 100);
    }, []); // Isso trava a função na memória

    const handleOpenInfo = (courseId: string) => {
        const cursoSelecionado = courses.find(c => c.id === courseId);
        setSelectedCourseId(courseId);
        setSelectedCourseNome(cursoSelecionado?.title || "");
        setIsInfoOpen(true);
    };

    const handleOpenLead = () => {
        setIsInfoOpen(false);
        // Pequeno delay para evitar conflito de overlays
        setTimeout(() => setIsLeadOpen(true), 300);
    };

    return (
        <div className="flex flex-col gap-6">
            {courses?.map((course) => (
                <div key={course.id} className="group relative bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between transition-all hover:border-[#81FE88]/30 hover:bg-zinc-900/60 overflow-hidden">
                    <div className="flex flex-col gap-1 items-start">
                        <span className="text-[#81FE88] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Curso Online</span>
                        <h3 className="text-white text-2xl md:text-3xl font-black italic uppercase tracking-tighter leading-none">{course.title}</h3>
                    </div>
                    <button onClick={() => handleOpenInfo(course.id)} className="z-10 mt-6 md:mt-0 px-10 py-5 bg-zinc-800 text-white font-[1000] uppercase italic rounded-2xl border border-zinc-700 hover:bg-[#81FE88] hover:text-black hover:border-[#81FE88] transition-all">
                        Informações sobre
                    </button>
                    <div className="absolute -z-10 -right-20 -top-20 w-64 h-64 bg-[#81FE88]/10 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            ))}

            {/* Modais */}
            <CourseInquiryModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} onAction={handleOpenLead} />

            <CourseRegistrationModal
                isOpen={isLeadOpen}
                onClose={() => setIsLeadOpen(false)}
                cursoId={selectedCourseId}
                cursoNome={selectedCourseNome}
                openFeedback={handleShowFeedback}
            />

            <StatusFeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
                type={feedbackType}
                message={feedbackMessage}
            />
        </div>
    );
}