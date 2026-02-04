"use client";

import { useRouter } from "next/navigation";
import { X, UserCircle2 } from "lucide-react";

interface ModalLoginProps {
    isOpen: boolean;
    onClose: () => void;
    callbackUrl?: string;
}

export default function ModalLogin({ isOpen, onClose, callbackUrl }: ModalLoginProps) {
    const router = useRouter();

    // 1. A FUNÇÃO DEVE FICAR AQUI (FORA DO RETURN)
    const handleLogin = () => {
        const targetPath = callbackUrl || "/vitrine";
        const destination = `/signin?callbackUrl=${encodeURIComponent(targetPath)}`;
        onClose();
        router.push(destination);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-[400px] rounded-[3rem] p-10 shadow-2xl text-center">
                {/* ... (restante do seu layout do modal) ... */}

                <div className="relative z-10">
                    {/* ... (ícone e textos) ... */}

                    <button
                        onClick={handleLogin} // 2. O BOTÃO APENAS CHAMA A FUNÇÃO
                        className="w-full bg-[#81FE88] hover:bg-[#6ee474] text-black font-black py-5 rounded-2xl transition-all"
                    >
                        FAZER LOGIN PARA CONTINUAR
                    </button>

                    <button onClick={onClose} className="mt-6 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                        Ainda não tenho interesse
                    </button>
                </div>
            </div>
        </div>
    );
}