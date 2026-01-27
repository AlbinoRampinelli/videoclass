// src/components/VitrineCursos.tsx
import CpfModal from "../CpfModal";
import { CourseCard } from "../CourseCard";
import { VideoPlayer } from "../VideoPlayer";

export default function VitrineCursos({ userDb, session }: any) {
  const courses = [
    { id: '1', title: 'Python na Prática', price: 297 },
    { id: '2', title: 'STEAM', price: 197 },
    { id: '3', title: 'Robótica Educacional', price: 397 },
  ];

  const firstName = session?.user?.name?.split(' ')[0] || "Aluno";
  const mostrarModal = !userDb?.cpf;

  return (
    /* Removi o <Aside /> e a div flex daqui. 
       O layout.tsx já cuida da barra lateral e do fundo. */
    <div className="p-10">
      {/* Modal de CPF aparece por cima se o usuário não tiver CPF no banco */}
      {mostrarModal && <CpfModal userName={firstName} />}

      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-white italic">
          OLÁ, {firstName.toUpperCase()}! 👋
        </h1>
      </header>

      {/* Player de vídeo em destaque */}
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
          {courses.map(course => (
            <CourseCard 
              key={course.id} 
              course={course} 
              // Verifica se a matrícula existe no banco de dados (Prisma)
              jaComprou={userDb?.enrollments?.some((e: any) => e.courseId === course.id)} 
            />
          ))}
        </div>
      </section>
    </div>
  );
}