export default function CoursePage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* CABEÇALHO DA AULA */}
        <header className="mb-6">
          <div className="flex items-center gap-2 text-[#81FE88] text-sm font-bold mb-2 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-[#81FE88] animate-pulse" />
            Módulo 01 - Aula 1.1
          </div>
          <h1 className="text-3xl font-bold text-white">Configuração do Ambiente (VS Code e Python)</h1>
        </header>

        {/* PLAYER DE VÍDEO NATIVO (OPÇÃO 2) */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-[0_0_50px_-12px_rgba(129,254,136,0.15)] mb-10">
          <video 
            controls 
            className="w-full h-full object-contain"
            controlsList="nodownload" // Evita botão de baixar fácil
            poster="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070" // Uma thumb de Python
          >
            {/* Atenção: O Google Drive limita acessos diretos. 
               Se o vídeo for pequeno, o link abaixo funciona. 
               Se for pesado, recomendo o iframe da Opção 1 ou hospedar no Vercel Blob.
            */}
            <source src="https://nlzzion4sqcvrbfv.public.blob.vercel-storage.com/PYTON%20-%204K.mov" type="video/mp4" />
            Seu navegador não suporta o player de vídeo.
          </video>
        </div>

        {/* ÁREA DE DESCRIÇÃO E MÓDULOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Sobre esta aula</h2>
            <p className="text-zinc-400 leading-relaxed">
              Nesta aula vamos preparar o seu computador para programar em Python. 
              Instalaremos o VS Code, as extensões essenciais e o interpretador oficial.
            </p>
          </div>

          <div className="lg:col-span-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <span className="text-[#81FE88]">|</span> Módulos do Curso
            </h3>
            {/* Aqui você repete aquela lista de módulos que já criamos */}
            <div className="text-sm text-zinc-500 italic">
              Selecione uma aula abaixo...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}