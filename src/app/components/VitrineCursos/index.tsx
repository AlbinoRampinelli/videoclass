"use client"; // <--- ESSENCIAL

import { useEffect, useState } from "react";
import CpfModal from "../CpfModal";
import { CourseCard } from "../CourseCard";
import { VideoPlayer } from "../VideoPlayer";

export default function VitrineCursos({ userDb, session }: any) {
  const [comprasLocais, setComprasLocais] = useState<string[]>([]);

  // Só roda no navegador
  useEffect(() => {
    const cache = JSON.parse(localStorage.getItem("meus_cursos") || "[]");
    setComprasLocais(cache);
  }, []);

  const courses = [
    { id: '1', title: 'Python na Prática', price: 297 },
    { id: '2', title: 'STEAM', price: 197 },
    { id: '3', title: 'Robótica Educacional', price: 397 },
  ];

  const firstName = session?.user?.name?.split(' ')[0] || "Aluno";
  const mostrarModal = !userDb?.cpf;

  return (
    <div className="p-10">
      {mostrarModal && <CpfModal userName={firstName} />}

      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-white italic">
          OLÁ, {firstName.toUpperCase()}! 👋
        </h1>
      </header>

      <div className="rounded-3xl overflow-hidden border border-zinc-800">
        <VideoPlayer 
          src="https://nlzzion4sqcvrbfv.public.blob.vercel-storage.com/PYTON%20-%204K.mov" 
          title="Aula em destaque" 
        />
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-bold mb-6 text-white border-l-4 border-[#81FE88] pl-4 uppercase italic">
          Meus Cursos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            // Se estiver no banco OU no localStorage (para parceiros testarem)
            const jaComprou = 
              userDb?.enrollments?.some((e: any) => e.courseId === course.id) || 
              comprasLocais.includes(course.id);

            return (
              <CourseCard 
                key={course.id} 
                course={course} 
                jaComprou={jaComprou} 
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}