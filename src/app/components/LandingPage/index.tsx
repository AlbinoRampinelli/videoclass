// ... seus imports

export default async function LandingPage() {
  const courses = await db.course.findMany();

  return (
    <div className="w-full py-16 px-6">
      {/* Cabeçalho omitido para focar no map */}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {courses.map((course) => {
          // LÓGICA NOVA: 
          // Se o Admin salvou tópicos (features), usamos eles. 
          // Se o banco estiver vazio, usamos os tópicos padrão como "segurança".
          const featuresToShow = (course.features && course.features.length > 0) 
            ? course.features 
            : ["Material didático completo", "Projetos práticos", "Certificado incluso"];
          
          return (
            <div key={course.id} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col hover:border-[#81FE88]/30 transition-all group">
              
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-full text-[#81FE88] text-xs font-bold">
                  {/* Agora lê a duração REAL do banco */}
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
                {/* Renderiza os tópicos vindos direto do Banco de Dados */}
                {featuresToShow.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-zinc-300 text-sm">
                    <CheckCircle2 size={18} className="text-[#81FE88] shrink-0" />
                    {feature}
                  </li>
                ))}
                
                <li className="flex items-center gap-3 text-[#81FE88] text-sm font-bold bg-[#81FE88]/5 p-2 rounded-lg border border-[#81FE88]/10">
                  <Infinity size={18} className="shrink-0" />
                  Acesso Vitalício ao Conteúdo
                </li>
              </ul>

              <LandingClient courseId={course.id} />
            </div>
          );
        })}
      </div>
    </div>
  );
}