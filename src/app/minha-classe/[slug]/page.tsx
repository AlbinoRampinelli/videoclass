// app/minha-classe/[slug]/page.tsx (SEM "use client")
import { db } from "../../../../prisma/db";
import MinhaClasseClient from "./MinhaClasseClient";
import { redirect } from "next/navigation";

// No Next.js 15, o params PRECISA ser uma Promise
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  
  // 1. O PULO DO GATO: Desembrulhar o params com await
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) return redirect("/vitrine");

  try {
    // 2. Busca o módulo no banco
    const modulo = await db.module.findFirst({
      where: { 
        course: { 
          slug: slug 
        } 
      },
      include: { 
        videos: { 
          orderBy: { order: 'asc' } 
        } 
      }
    });

    // 3. Verificação de segurança para não quebrar o componente filho
    if (!modulo || !modulo.videos || modulo.videos.length === 0) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-center">
          <div>
            <h1 className="text-xl font-bold mb-2">Aula não encontrada</h1>
            <p className="text-zinc-500 mb-4">O conteúdo para "{slug}" não foi localizado.</p>
            <a href="/vitrine" className="text-[#81FE88] underline">Voltar para a vitrine</a>
          </div>
        </div>
      );
    }

    // 4. Prepara os dados para o MinhaClasseClient
    const aulaAtiva = {
      ...modulo.videos[0],
      moduleTitle: modulo.title
    };

    return <MinhaClasseClient aulaAtiva={aulaAtiva} />;

  } catch (error) {
    console.error("Erro no servidor:", error);
    return redirect("/vitrine?error=server_error");
  }
}