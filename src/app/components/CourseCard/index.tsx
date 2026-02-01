"use client";

import Link from "next/link";
import { PlayCircle, Info } from "lucide-react";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    price: string | number;
    duration?: string;
    category?: string;
    format?: string; // Adicionei para evitar erro na lógica do Saber Mais
  };
  jaComprou: boolean;
  buttonType: "saber-mais" | "matricula";
  onSaberMais: () => void; // A função deve ser definida aqui
}

export function CourseCard({ course, jaComprou, buttonType, onSaberMais }: CourseCardProps) {
  const liberado = jaComprou;
  
  // MUDANÇA: O tipo do botão é soberano. Se é saber-mais, é saber-mais.
  const isSaberMais = buttonType === "saber-mais";
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col hover:border-[#81FE88]/30 transition-all group relative overflow-hidden">

      {/* Decoração de fundo - só brilha forte se não for saber-mais */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl transition-all ${isSaberMais ? "bg-zinc-800/20" : "bg-[#81FE88]/5 group-hover:bg-[#81FE88]/10"
        }`} />

      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 border rounded-xl transition-transform group-hover:scale-110 ${isSaberMais ? "bg-zinc-800/50 border-zinc-700 text-zinc-400" : "bg-zinc-800/50 border-zinc-700 text-[#81FE88]"
          }`}>
          {isSaberMais ? <Info size={24} /> : <PlayCircle size={24} />}
        </div>

        {!liberado && (
          <div className="flex flex-col items-end text-right">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">
              {course.category === 'online' ? 'Valor Integral' : 'Investimento'}
            </span>
            <span className="text-xl font-black text-white italic">
              {course.price}
            </span>
            {course.duration && (
              <span className="text-[9px] text-[#81FE88] font-bold uppercase mt-1 tracking-tighter">
                {course.duration}
              </span>
            )}
          </div>
        )}
      </div>

      <h3 className="font-bold text-lg text-white mb-2 group-hover:text-[#81FE88] transition-colors uppercase tracking-tighter italic">
        {course.title}
      </h3>

      <p className="text-zinc-500 text-[11px] mb-8 flex-1 leading-relaxed">
        {course.category === 'online'
          ? "Formação completa com suporte Makershouse. Acesso imediato."
          : `Turmas presenciais na sua região. Clique para registrar interesse.`}
      </p>

      {/* RENDERIZAÇÃO CONDICIONAL DO BOTÃO */}
      {isSaberMais ? (
        <button
          type="button" // Essencial para não submeter formulários
          onClick={(e) => {
            e.preventDefault();
            if (onSaberMais) onSaberMais();
          }}
          className="w-full py-5 rounded-2xl font-black text-center transition-all uppercase text-[12px] tracking-widest bg-transparent border border-zinc-700 text-zinc-400 hover:border-[#81FE88] hover:text-[#81FE88] hover:bg-zinc-800/50"
        >
          QUERO SABER MAIS
        </button>
      ) : (
        <Link
          href={
            liberado
              ? `/cursos/${course.slug}`
              : (buttonType === "saber-mais" ? "#" : `/checkout?id=${course.id}`)
          }
          onClick={(e) => {
            // Se for 'saber-mais', a gente impede a navegação e abre o modal de interesse
            if (!liberado && buttonType === "saber-mais") {
              e.preventDefault();
              onSaberMais();
            }
          }}
          className={`w-full py-5 rounded-2xl font-black text-center transition-all uppercase shadow-xl ${liberado
              ? "bg-white text-black text-[11px] tracking-widest hover:bg-zinc-200"
              : "bg-[#81FE88] text-black text-[14px] tracking-[0.2em] hover:scale-[1.02] shadow-[#81FE88]/20 ring-2 ring-[#81FE88]/50"
            }`}
        >
          {liberado
            ? "ACESSAR AGORA"
            : (buttonType === "saber-mais" ? "SABER MAIS" : "COMPRAR AGORA")}
        </Link>
      )}
    </div>
  );
}