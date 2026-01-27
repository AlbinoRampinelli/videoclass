import Link from "next/link";
import { PlayCircle } from "lucide-react";

interface CourseProps {
  course: { id: string; title: string; slug: string; price: number };
  jaComprou: boolean;
}

export function CourseCard({ course, jaComprou }: CourseProps) {
  // A lógica agora é real: só libera se ele comprou mesmo (jaComprou)
  const liberado = jaComprou;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col hover:border-[#81FE88]/30 transition-all group relative overflow-hidden">

      {/* Decoração sutil de fundo para o card brilhar quando hover */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#81FE88]/5 rounded-full blur-3xl group-hover:bg-[#81FE88]/10 transition-all" />

      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-[#81FE88] group-hover:scale-110 transition-transform">
          <PlayCircle size={24} />
        </div>

        {!liberado && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Valor Integral</span>
            <span className="text-xl font-black text-white italic">R$ {course.price}</span>
          </div>
        )}
      </div>

      <h3 className="font-bold text-lg text-white mb-2 group-hover:text-[#81FE88] transition-colors uppercase tracking-tighter italic">
        {course.title}
      </h3>

      <p className="text-zinc-500 text-[11px] mb-8 flex-1 leading-relaxed">
        Formação completa com suporte Makershouse. Acesso imediato após confirmação.
      </p>

      {/* AJUSTE DO BOTÃO: COMPRAR AGORA é VERDE NEON, ACESSAR é BRANCO PREMIUM */}
      <Link
        href={liberado ? `/cursos/${course.slug}` : `/checkout/${course.id}`}
        className={`w-full py-5 rounded-2xl font-black text-center transition-all uppercase shadow-xl ${liberado
            ? "bg-white text-black text-[11px] tracking-widest hover:bg-zinc-200" // Acessar (Menor e sóbrio)
            : "bg-[#81FE88] text-black text-[14px] tracking-[0.2em] hover:scale-[1.05] shadow-[#81FE88]/20 ring-2 ring-[#81FE88]/50" // Comprar (Grande, Neon e com Brilho)
          }`}
      >
        {liberado ? "ACESSAR AGORA" : "COMPRAR AGORA"}
      </Link>
    </div>
  );
}