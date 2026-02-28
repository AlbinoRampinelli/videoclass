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
    format?: string;
  };
  jaComprou: boolean;
  buttonType: "saber-mais" | "matricula";
  onSaberMais: (openModal?: boolean) => void;
  estado_atual: boolean;
}

export function CourseCard({ course, jaComprou, buttonType, onSaberMais, estado_atual }: CourseCardProps) {
  const liberado = jaComprou;
  const isSaberMais = buttonType === "saber-mais";
  console.log(`Card ${course.title} está ativo?`, estado_atual);
  return (
    <div className={`
      /* 🟢 Lógica de Destaque sincronizada com a vitrine */
      ${estado_atual
        ? "bg-zinc-800 border-2 border-[#81FE88] shadow-[0_0_25px_rgba(129,254,136,0.15)] scale-[1.02] z-10"
        : "bg-zinc-950/90 border border-zinc-800 opacity-90 scale-100 z-0"
      }
      rounded-[2rem] p-5 md:p-6 flex flex-col transition-all duration-500 group relative overflow-hidden h-full mb-6
    `}>

      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl transition-all ${estado_atual ? "bg-[#81FE88]/15" : "bg-zinc-800/10"
        }`} />

      <div className="flex justify-between items-start mb-4 md:mb-6 relative z-10">
        {/* O ÍCONE AGORA RESPONDE AO estado_atual 🎨 */}

        <div className={`p-2 md:p-3 border rounded-xl transition-all flex items-center gap-2 ${estado_atual
          ? "bg-[#81FE88]/20 border-[#81FE88] text-[#81FE88]"
          : "bg-zinc-900 border-zinc-800 text-zinc-600"
          }`}>
          <PlayCircle
            size={20}
            className={estado_atual ? "animate-pulse" : ""} />

          {estado_atual && (
            <span className="text-[10px] font-black tracking-tighter leading-none">
              ASSISTINDO
            </span>
          )}
        </div>

        {!liberado && (
          <div className="flex flex-col items-end text-right">
            <span className="text-[9px] md:text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-0.5">
              {course.category === 'online' ? 'Valor Integral' : 'Investimento'}
            </span>
            <span className={`text-lg md:text-xl font-black italic transition-colors ${estado_atual ? "text-[#81FE88]" : "text-white"
              }`}>
              {course.price}
            </span>
          </div>
        )}
      </div>

      <h3 className={`font-bold text-base md:text-lg mb-2 transition-all uppercase tracking-tighter italic relative z-10 ${estado_atual ? "text-[#81FE88] translate-x-2" : "text-zinc-300 translate-x-0"
        }`}>
        {course.title}
      </h3>

      <p className={`text-[10px] md:text-[11px] mb-6 md:mb-8 flex-1 leading-relaxed transition-colors relative z-10 ${estado_atual ? "text-zinc-200" : "text-zinc-500"
        }`}>
        {course.category === 'online'
          ? "Formação completa com suporte Makershouse. Acesso imediato."
          : `Turmas presenciais na sua região. Clique para registrar interesse.`}
      </p>

      <div className="mt-auto relative z-10">
        {isSaberMais ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              console.log("Tentando acessar:", `/minha-classe/${course.slug}`);
              // Use window.location para um teste "bruto" se o router.push falhar
              window.location.href = `/minha-classe/${course.slug}`;
            }}
            className={`w-full py-4 md:py-5 rounded-2xl font-black text-center transition-all uppercase text-[10px] md:text-[12px] tracking-widest border cursor-pointer ${estado_atual
              ? "bg-[#81FE88] border-[#81FE88] text-black shadow-lg"
              : "bg-transparent border-zinc-700 text-zinc-500 hover:border-[#81FE88] hover:text-[#81FE88]"
              }`}
          >
            {estado_atual ? "REGISTRAR INTERESSE" : "CONHECER MAIS"}
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (liberado) {
                // O 'href' forçado limpa o erro de sessão no Chrome Mobile
                window.location.href = `/minha-classe/${course.slug.trim()}`;
              } else {
                window.location.href = `/checkout?id=${course.id}`;
              }
            }}
            className={`w-full block py-4 md:py-5 rounded-2xl font-black text-center transition-all uppercase text-[11px] tracking-widest ${liberado ? "bg-white text-black" : "bg-[#81FE88] text-black shadow-lg"
              }`}
          >
            {liberado ? "ACESSAR AGORA" : "COMPRAR AGORA"}
          </button>
        )}
      </div>
    </div>
  );
}