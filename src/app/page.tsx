export const dynamic = 'force-dynamic';
import { db } from "../../prisma/db";
import { Clock, CheckCircle2, Infinity } from "lucide-react"; // Importei Infinity para o vitalício
import LandingClient from "./components/LandingClient";

export default async function LandingPage() {
  const courses = await db.course.findMany();
  const vitrineVideos = [
    {
      id: 'python',
      title: 'Python na Prática',
      videoUrl: '/videos/python-promo.mp4', // Substitua pelos seus links reais
      thumbnail: '/thumbs/python.jpg'
    },
    {
      id: 'robotica',
      title: 'Robótica Competitiva',
      videoUrl: '/videos/robotica-promo.mp4',
      thumbnail: '/thumbs/robotica.jpg'
    },
    {
      id: 'steam',
      title: 'STEAM',
      videoUrl: '/videos/steam-promo.mp4',
      thumbnail: '/thumbs/steam.jpg'
    }
  ];
  // Função para retornar os tópicos comerciais baseados no título do curso
  const getCourseFeatures = (title: string) => {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes("python")) {
      return [
        "Domine a lógica com projetos reais",
        "Comunidade ativa para trocar experiências",
        "Mentoria direta com o professor"
      ];
    }
    if (lowerTitle.includes("steam")) {
      return [
        "Foco no ENEM e base de exatas",
        "Aprendizado prático para fixar conceitos",
        "Kit de experimentos incluso"
      ];
    }
    if (lowerTitle.includes("robótica") || lowerTitle.includes("robotica")) {
      return [
        "Kit de robótica profissional incluso",
        "Oficinas 'mão na massa' do zero",
        "Preparação para torneios e disputas"
      ];
    }
    // Caso padrão se o título for diferente
    return ["Material didático completo", "Projetos práticos", "Certificado incluso"];
  };

  return (
    <div className="w-full py-16 px-6">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4 tracking-tighter text-white">
          Domine a tecnologia do futuro.
        </h1>
        <p className="text-zinc-400">Escolha seu caminho e comece a estudar agora mesmo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {courses.map((course) => {
          const features = getCourseFeatures(course.title);

          return (
            <div key={course.id} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col hover:border-[#81FE88]/30 transition-all group">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-full text-[#81FE88] text-xs font-bold">
                  <Clock size={14} /> {course.duration || "40h"}
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-black text-white">R$ {course.price}</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Preço Único</span>
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-8 text-white group-hover:text-[#81FE88] transition-colors">
                {course.title}
              </h3>

              <ul className="flex flex-col gap-4 mb-10 flex-grow">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-zinc-300 text-sm">
                    <CheckCircle2 size={18} className="text-[#81FE88] shrink-0" />
                    {feature}
                  </li>
                ))}

                {/* O ITEM VITALÍCIO QUE TINHA SUMIDO */}
                <li className="flex items-center gap-3 text-[#81FE88] text-sm font-bold bg-[#81FE88]/5 p-2 rounded-lg border border-[#81FE88]/10">
                  <Infinity size={18} className="shrink-0" />
                  Acesso Vitalício ao Conteúdo
                </li>
              </ul>

              {/* Este componente cuida do botão e do ModalLogin */}
              <LandingClient
                courseId={course.id}
                courseTitle={course.title} // Passando o título para o componente decidir a ação
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}