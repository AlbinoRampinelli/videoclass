"use client";

import { X, Monitor, Cpu, Users, ArrowRight } from "lucide-react";

// 1. Ajustei a interface para aceitar o onAction
interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: () => void;
}

export default function InfoPythonModal({ isOpen, onClose, onAction }: InfoModalProps) {
  // 2. Trava de segurança: se não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-[2.5rem] overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,1)]">
        
        {/* Botão Fechar */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-zinc-500 hover:text-[#81FE88] z-50 transition-colors"
        >
          <X size={32} />
        </button>

        <div className="flex flex-col md:flex-row">
          
          {/* LADO ESQUERDO: IMPACTO */}
          <div className="md:w-5/12 p-10 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black flex flex-col justify-center border-b md:border-b-0 md:border-r border-zinc-800">
            <span className="text-[#81FE88] text-[10px] font-black uppercase tracking-[0.4em] mb-4">Metodologia Própria</span>
            <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-[0.85] mb-8">
              Python na <br />
              <span className="text-[#81FE88] drop-shadow-[0_0_15px_rgba(129,254,136,0.3)]">Prática.</span>
            </h2>
            
            <div className="bg-[#81FE88] p-7 rounded-[2rem] shadow-[0_10px_30px_rgba(129,254,136,0.2)] transform -rotate-1">
              <p className="text-black text-xl md:text-2xl font-black italic leading-none uppercase tracking-tighter">
                "O erro aqui não é castigado, é o combustível."
              </p>
            </div>
          </div>

          {/* LADO DIREITO: DIFERENCIAIS ATIVOS */}
          <div className="md:w-7/12 p-8 md:p-12 space-y-8 bg-zinc-900/50">
            <div className="space-y-6">
               <h3 className="text-[#81FE88] text-xs font-black uppercase tracking-[0.2em] opacity-80">
                 // Diferenciais Exclusivos
               </h3>
               
               <div className="grid grid-cols-1 gap-5">
                  <div className="group flex items-center gap-6 bg-white/5 p-6 rounded-[2rem] border border-white/10 hover:border-[#81FE88]/50 hover:bg-[#81FE88]/5 transition-all duration-300">
                    <div className="bg-zinc-800 p-4 rounded-2xl text-[#81FE88] group-hover:scale-110 group-hover:bg-[#81FE88] group-hover:text-black transition-all shadow-xl">
                      <Monitor size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-white text-xl font-black uppercase italic tracking-tighter group-hover:text-[#81FE88] transition-colors">1 Aluno : 1 Laptop</h4>
                      <p className="text-zinc-400 text-sm font-bold leading-tight">Foco absoluto. Máquina individual.</p>
                    </div>
                  </div>

                  <div className="group flex items-center gap-6 bg-white/5 p-6 rounded-[2rem] border border-white/10 hover:border-[#81FE88]/50 hover:bg-[#81FE88]/5 transition-all duration-300">
                    <div className="bg-zinc-800 p-4 rounded-2xl text-[#81FE88] group-hover:scale-110 group-hover:bg-[#81FE88] group-hover:text-black transition-all shadow-xl">
                      <Cpu size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-white text-xl font-black uppercase italic tracking-tighter group-hover:text-[#81FE88] transition-colors">Construção Real</h4>
                      <p className="text-zinc-400 text-sm font-bold leading-tight">Sistemas e IA do zero em todas as aulas.</p>
                    </div>
                  </div>

                  <div className="group flex items-center gap-6 bg-white/5 p-6 rounded-[2rem] border border-white/10 hover:border-[#81FE88]/50 hover:bg-[#81FE88]/5 transition-all duration-300">
                    <div className="bg-zinc-800 p-4 rounded-2xl text-[#81FE88] group-hover:scale-110 group-hover:bg-[#81FE88] group-hover:text-black transition-all shadow-xl">
                      <Users size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-white text-xl font-black uppercase italic tracking-tighter group-hover:text-[#81FE88] transition-colors">Mentoria Tech</h4>
                      <p className="text-zinc-400 text-sm font-bold leading-tight">Acesso direto a profissionais do mercado.</p>
                    </div>
                  </div>
               </div>
            </div>

            {/* CTA FINAL */}
            <div className="pt-4">
              <button 
                onClick={onAction} // 3. Agora chama a função correta que abre o Modal de Lead
                className="w-full bg-[#81FE88] hover:bg-white text-black font-[1000] py-6 rounded-2xl uppercase italic flex items-center justify-center gap-3 transition-all group active:scale-95 shadow-[0_20px_50px_rgba(129,254,136,0.3)]"
              >
                <span className="text-2xl tracking-tighter">Garantir minha vaga agora</span>
                <ArrowRight size={28} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}