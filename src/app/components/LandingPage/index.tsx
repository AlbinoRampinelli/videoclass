// src/app/page.tsx
"use client"
import Link from "next/link";
import { Clock, CheckCircle2 } from "lucide-react";
import ModalLogin from '../../components/ModalLogin'
import { useState } from "react";

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const courses = [
    {
      id: '1',
      title: 'Python na Prática',
      price: 297,
      duration: '40h',
      features: ['Certificado incluso', 'Suporte especializado', 'Acesso vitalício']
    },
    {
      id: '2',
      title: 'STEAM',
      price: 197,
      duration: '20h',
      features: ['Certificado incluso', 'Suporte especializado', 'Acesso vitalício']
    },
    {
      id: '3',
      title: 'Robótica Educacional',
      price: 397,
      duration: '60h',
      features: ['Certificado incluso', 'Suporte especializado', 'Acesso vitalício']
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header Centralizado */}
      <nav className="p-6 border-b border-zinc-800 flex justify-between items-center max-w-7xl mx-auto w-full">
        {/*<div className="text-[#81FE88] font-bold text-2xl tracking-tighter">\\ VIDEOCLASS</div>}
        <Link href="/api/auth/signin?callbackUrl=/vitrine" className="bg-[#81FE88] text-black px-6 py-2 rounded-full font-bold text-sm">
          Entrar
        </Link> */}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black mb-4">Domine a tecnologia do futuro.</h1>
          <p className="text-zinc-400">Escolha seu caminho e comece a estudar agora mesmo.</p>
        </div>

        {/* Grid de Cards com o conteúdo da Foto 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map(course => (
            <div key={course.id} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-full text-[#81FE88] text-xs font-bold">
                  <Clock size={14} /> {course.duration}
                </div>
                <span className="text-2xl font-black">R$ {course.price}</span>
              </div>

              <h3 className="text-2xl font-bold mb-8">{course.title}</h3>

              {/* Lista de Benefícios (As bolinhas da Foto 2) */}
              <ul className="flex flex-col gap-4 mb-10">
                {course.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-zinc-300 text-sm">
                    <CheckCircle2 size={18} className="text-[#81FE88]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setIsModalOpen(true)} // Abre o modal ao clicar
                className="w-full py-4 bg-white text-black rounded-2xl font-black text-sm text-center hover:bg-[#81FE88] transition-colors uppercase"
              >
                Quero me matricular
              </button>

              {/* O componente fica "escondido" aqui, esperando o estado ser true */}
              <ModalLogin
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}