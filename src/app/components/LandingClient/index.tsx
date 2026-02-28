"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CourseRegistrationModal from "../CourseRegistrationModal";

export default function LandingClient({ 
    courseId, 
    courseTitle, // <--- Adicionamos o título aqui
    isOnlyButton
}: { 
    courseId?: string, 
    courseTitle?: string, // <--- E aqui na tipagem
    isOnlyButton?: boolean 
}) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isLeadOpen, setIsLeadOpen] = useState(false);

    // Lógica para saber se o curso é presencial (Lead) ou online (Venda)
    const titleLower = courseTitle?.toLowerCase() || "";
    const isPresencial = titleLower.includes("steam") || titleLower.includes("robótica") || titleLower.includes("robotica");

    const handleAction = () => {
        if (isPresencial) {
            // Abre o modal de lead para STEAM e Robótica
            setIsLeadOpen(true);
        } else {
            // Fluxo normal de matrícula para Python
            if (session) {
                router.push(`/checkout/${courseId}`);
            } else {
                router.push(`/api/auth/signin?callbackUrl=/checkout/${courseId}`);
            }
        }
    };

    return (
        <>
            <button 
                onClick={handleAction}
                className="w-full py-4 bg-[#81FE88] text-black font-[1000] uppercase italic rounded-2xl border border-[#81FE88] hover:bg-white hover:border-white transition-all shadow-lg active:scale-95"
            >
                {isPresencial ? "Tenho Interesse" : "Quero me Matricular"}
            </button>

            {/* Modal de Lead - Certifique-se que o caminho do import está correto */}
            <CourseRegistrationModal
                isOpen={isLeadOpen}
                onClose={() => setIsLeadOpen(false)}
                cursoId={courseId || ""}
                cursoNome={courseTitle || ""}
                openFeedback={(type, msg) => {
                    // Se você tiver um sistema de feedback, chame-o aqui
                    setIsLeadOpen(false);
                }}
            />
        </>
    );
}