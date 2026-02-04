"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CourseRegistrationModal from "../../components/CourseRegistrationModal"

export default function SaberMaisBtn({ courseId, courseTitle }: { courseId: string, courseTitle: string }) {
    const { data: session } = useSession();
    const router = useRouter();
    
    // Controle do Modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAction = () => {
        if (!session) {
            // 1. Se não está logado, vai para a página de login
            router.push("/signin");
        } else {
            // 2. Se está logado, abre o modal de captura
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <button
                onClick={handleAction}
                className="w-full md:w-auto px-12 py-5 bg-[#81FE88] text-black font-black uppercase italic rounded-2xl hover:scale-105 hover:shadow-[0_0_30px_-5px_#81FE88] transition-all"
            >
                Saber mais
            </button>

            {/* Passamos os dados do usuário logado via props.
               Se o LeadModal for o que ajustamos com 'defaultValue', 
               os campos de Nome e Email já virão preenchidos.
            */}
            <CourseRegistrationModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                cursoId={courseId} 
                cursoNome={courseTitle}
                userDefaultData={{
                    nome: session?.user?.name || "",
                    email: session?.user?.email || ""
                }}
            />
        </>
    );
}