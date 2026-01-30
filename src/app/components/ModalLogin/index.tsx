"use client";

import { useRouter } from "next/navigation";
import { X, UserCircle2 } from "lucide-react";

interface ModalLoginProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalLogin({ isOpen, onClose }: ModalLoginProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop com desfoque suave */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Card do Modal */}
      <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-[400px] rounded-[3rem] p-10 shadow-2xl text-center overflow-hidden">
        
        {/* Detalhe de luz decorativa (Makershouse Style) */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#81FE88]/10 rounded-full blur-3xl" />
        
        {/* Botão Fechar */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="relative z-10">
          {/* Ícone amigável de usuário */}
          <div className="w-20 h-20 bg-[#81FE88]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#81FE88]/20 text-[#81FE88]">
            <UserCircle2 size={40} strokeWidth={1.5} />
          </div>

          <h2 className="text-2xl font-black text-white italic uppercase mb-2 tracking-tighter">
            Sua jornada começa aqui
          </h2>
          
          <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-8 leading-relaxed px-2">
            Para garantir sua vaga e acessar o ambiente de aulas, precisamos que você se identifique.
          </p>

          {/* Botão que leva para o Signin Geral */}
          <button
            onClick={() => {
              onClose();
              router.push("/signin");
            }}
            className="w-full bg-[#81FE88] hover:bg-[#6ee474] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-[0_10px_20px_rgba(129,254,136,0.15)]"
          >
            FAZER LOGIN PARA CONTINUAR
          </button>

          <button 
            onClick={onClose}
            className="mt-6 text-[10px] text-zinc-500 uppercase font-bold tracking-widest hover:text-zinc-300 transition-colors"
          >
            Ainda não tenho interesse
          </button>
        </div>
      </div>
    </div>
  );
}