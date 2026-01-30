"use client";

import { useEffect, useState } from "react";
import CpfModal from "../CpfModal";
import { CourseCard } from "../CourseCard";
import { VideoPlayer } from "../VideoPlayer";
import ModalInteresse from "../ModalInteresse"; // <--- Vamos precisar desse novo modal

export default function VitrineCursos({ userDb, session }: any) {
  const [comprasLocais, setComprasLocais] = useState<string[]>([]);
  const [cursoInteresse, setCursoInteresse] = useState<any>(null);

  useEffect(() => {
    const cache = JSON.parse(localStorage.getItem("meus_cursos") || "[]");
    setComprasLocais(cache);
  }, []);

  const courses = [
    {
      id: '1',
      title: 'Python na Prática',
      price: 'R$ 297,00',
      duration: '40 horas',
      category: 'online'
    },
    {
      id: '2',
      title: 'STEAM',
      price: '12x R$ 197,00',
      duration: '12 meses',
      category: 'presencial'
    },
    {
      id: '3',
      title: 'Robótica Educacional',
      price: '12x R$ 397,00',
      duration: '12 meses',
      category: 'presencial'
    },
  ];

  const firstName = session?.user?.name?.split(' ')[0] || "Aluno";

  // O Modal de CPF aparece se não tiver CPF OU se não tiver preenchido o perfil (UserType)
  const mostrarModalCpf = !userDb?.cpf || !userDb?.userType;

  // Lógica para definir se o aluno é da sua escola atual ou da "internet"
  const isEscolaParceira = userDb?.schoolName === "MINHA_ESCOLA_ATUAL";

  return (
    <div className="p-10 max-w-7xl mx-auto">
      {/* Modal de Primeiro Acesso (CPF + Perfil + Escola) */}
      {mostrarModalCpf && <CpfModal userName={firstName} />}

      {/* NOVO: Modal de Registro de Interesse */}
      {cursoInteresse && (
        <ModalInteresse
          course={cursoInteresse}
          onClose={() => setCursoInteresse(null)}
          userDb={userDb}
        />
      )}

      <header className="mb-10 flex justify-between items-end">
        <div>
          <p className="text-[#81FE88] font-bold text-xs uppercase tracking-widest mb-2">Ambiente de Aprendizado</p>
          <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">
            OLÁ, {firstName}!
          </h1>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Status da Conta</p>
          <p className="text-white text-xs font-bold">{userDb?.schoolName || "Visitante Digital"}</p>
        </div>
      </header>

      <div className="rounded-[3rem] overflow-hidden border border-zinc-800 shadow-2xl">
        <VideoPlayer
          src="https://nlzzion4sqcvrbfv.public.blob.vercel-storage.com/PYTON%20-%204K.mov"
          title="Aula em destaque"
        />
      </div>

      <section className="mt-16">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
            Nossos Treinamentos
          </h2>
          <div className="h-[2px] flex-1 bg-zinc-800"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => {
            const jaComprou =
              userDb?.enrollments?.some((e: any) => e.courseId === course.id) ||
              comprasLocais.includes(course.id);

            // Se for presencial e NÃO for da escola parceira, o botão vira "Saber Mais"
            const precisaSaberMais = course.category === 'presencial' && !isEscolaParceira;

            return (
              <CourseCard
                key={course.id}
                course={course}
                jaComprou={jaComprou}
                buttonType={precisaSaberMais ? "saber-mais" : "matricula"}
                onSaberMais={() => {
                  console.log("Abrindo modal para:", course.title); // <--- COLOQUE ESSE LOG PARA TESTAR
                  setCursoInteresse(course);
                }}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}