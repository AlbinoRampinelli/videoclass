"use client";
import { useState, useRef } from "react";
import { PlayCircle, Beaker, Terminal } from "lucide-react";
import { marcarVideoConcluidoAction } from "../../actions";


export default function MinhaClasse({ aulaAtiva }: { aulaAtiva: any }) {
  const [view, setView] = useState<"video" | "lab">("video");
  const [videoConcluido, setVideoConcluido] = useState(false);
  const [progressoEnviado, setProgressoEnviado] = useState(false);
  const [nota, setNota] = useState(0.0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  // Se a aulaAtiva não existir, ele não tenta ler o título e não dá erro!
  if (!aulaAtiva) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#09090b]">
        <span className="text-[#81FE88] font-black italic animate-pulse">
          CARREGANDO CONTEÚDO...
        </span>
      </div>
    );
  }
  // Lógica dos 70% de visualização
  const handleTimeUpdate = async () => {
    if (!videoRef.current || progressoEnviado) return;

    const video = videoRef.current;
    const percentual = (video.currentTime / video.duration) * 100;

    if (percentual >= 70) {
      setProgressoEnviado(true);
      setVideoConcluido(true);
      
      // SALVA NO BANCO DE DADOS
      await marcarVideoConcluidoAction(aulaAtiva.id);
      console.log("Check ✅: Aula concluída aos 70%");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#09090b]">
      <main className="p-4 lg:p-10 w-full max-w-7xl mx-auto">
        
        {/* CABEÇALHO */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <span className="text-[#81FE88] text-[10px] font-black uppercase tracking-[0.3em]">
              {/* O ?. garante que se moduleTitle não existir, ele não trava */}
              {aulaAtiva?.moduleTitle || "Módulo 1"} • {view === "video" ? "VIDEOAULA" : "LABORATÓRIO"}
            </span>
            <h1 className="text-4xl font-black italic uppercase text-white tracking-tighter mt-2">
            {aulaAtiva?.title || "Aula Carregando"}
            </h1>
          </div>

          {/* Alternância Aula/Lab */}
          <div className="flex gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800">
             <button onClick={() => setView("video")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'video' ? 'bg-[#81FE88] text-black' : 'text-zinc-500 hover:text-white'}`}>
              Aula
             </button>
             <button 
              disabled={!videoConcluido}
              onClick={() => setView("lab")}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${!videoConcluido ? 'opacity-20 cursor-not-allowed' : view === 'lab' ? 'bg-[#81FE88] text-black' : 'text-zinc-500 hover:text-white'}`}
             >
              Lab
             </button>
          </div>
        </div>

        {/* PLAYER COM LOGICA DE 70% */}
        {view === "video" ? (
          <div className="relative w-full aspect-video rounded-[40px] overflow-hidden border border-zinc-800 bg-black shadow-2xl shadow-[#81FE88]/5">
            <video
              ref={videoRef}
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-contain"
              src={aulaAtiva.url} // Agora dinâmico
              controls
            />
          </div>
        ) : (
          <div className="w-full aspect-video rounded-[40px] border border-dashed border-zinc-800 bg-zinc-900/10 flex flex-col items-center justify-center p-10 animate-in fade-in zoom-in">
             <Beaker size={48} className="text-[#81FE88] mb-6 opacity-50" />
             <h2 className="text-2xl font-black uppercase italic text-white mb-4">Desafio do Módulo</h2>
             <button onClick={() => setNota(10)} className="bg-[#81FE88] text-black px-10 py-4 rounded-full font-black uppercase italic hover:scale-105 transition-all">
               Enviar Desafio
             </button>
          </div>
        )}

        {/* ... Resto do seu código de nota e descrição ... */}
      </main>
    </div>
  );
}