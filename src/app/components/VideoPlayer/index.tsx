interface VideoPlayerProps {
  src: string;
  title?: string;
}

export function VideoPlayer({ src, title = "Apresentação" }: VideoPlayerProps) {
  return (
    <section className="mb-10">
      <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-4">
        {title}
      </h2>
      <div className="max-w-xl bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl group hover:border-zinc-700 transition-all">
        <div className="aspect-video relative">
          <video 
            controls 
            className="w-full h-full object-cover"
            // Se quiser que o vídeo comece com uma imagem bonitinha antes do play:
            // poster="/caminho-da-imagem.jpg"
          >
            <source src={src} type="video/mp4" />
            Seu navegador não suporta vídeos.
          </video>
        </div>
      </div>
    </section>
  );
}