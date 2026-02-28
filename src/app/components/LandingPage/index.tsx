import CourseList from "../../cursos-online/CourseList"; // Verifique se o caminho está correto
import { prisma } from "@/lib/prisma"; // Ou onde estiver seu client do prisma

// Função para buscar os cursos do banco de dados
async function getCourses() {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        slug: true, // IMPORTANTE: O slug precisa vir do banco para a lógica funcionar
      },
      orderBy: {
        title: 'asc'
      }
    });
    return courses;
  } catch (error) {
    console.error("Erro ao buscar cursos:", error);
    return [];
  }
}

export default async function LandingPage() {
  const courses = await getCourses();

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4">
          Mude seu <span className="text-[#81FE88]">Futuro</span>
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
          Escolha o caminho da tecnologia. Do Python à Robótica, prepare-se para o mercado.
        </p>
      </section>

      {/* Lista de Cursos (O componente que ajustamos) */}
      <section className="pb-24">
        <div className="container mx-auto">
          <h2 className="text-center text-zinc-500 text-sm font-bold uppercase tracking-widest mb-12">
            Nossos Treinamentos
          </h2>
          
          <CourseList courses={courses} />
        </div>
      </section>

      {/* Rodapé ou outras seções podem vir aqui */}
    </main>
  );
}