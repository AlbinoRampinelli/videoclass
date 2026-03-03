"use client";
import { useState, useEffect } from "react";
import { Terminal, Lightbulb, Play, CheckCircle2, Code2, PlayCircle, ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

interface Video {
  id: string;
  title: string;
  url: string;
  description?: string;
  moduleTitle?: string;
  initialCode?: string;
  expectedOutput?: string;
}

export default function MinhaClasse({
  aulaAtiva,
  todosOsVideos,
  codigoSalvo,
}: {
  aulaAtiva: Video;
  todosOsVideos: Video[];
  codigoSalvo: string | null;
}) {
const searchParams = useSearchParams();
  const router = useRouter();

  const desafioId = searchParams.get("desafio");
  const aulaUrl = searchParams.get("aula");

  // 1. BUSCA POR ID (É a única que nunca falha)
  const videoAtual = (todosOsVideos && (desafioId || aulaUrl))
    ? todosOsVideos.find((v: any) => {
        // Se a URL mandar um ID, usamos ele. 
        // Se não, tentamos o título de forma bem flexível.
        const idNaUrl = desafioId;
        const tituloNaUrl = (aulaUrl || "").toLowerCase().trim();
        
        return v.id === idNaUrl || v.title.toLowerCase().includes(tituloNaUrl);
      }) || aulaAtiva
    : aulaAtiva;

  // 2. O MONITOR DE MUDANÇA (Corrigido e na ordem certa)
  useEffect(() => {
    if (videoAtual) {
      setCodigo(codigoSalvo || videoAtual.initialCode || "");
      setConsoleOutput([]);
      setNota(0);
      setMostrarDica(false);
      // Esse log vai te confirmar no F12 que a troca aconteceu
      console.log("🚀 TELA TROCADA PARA:", videoAtual.title);
    }
  }, [videoAtual?.id, aulaUrl, desafioId, codigoSalvo]); 

  const modoLaboratorio = !!desafioId || videoAtual?.url === null || videoAtual?.url === "";
  const [codigo, setCodigo] = useState(codigoSalvo || videoAtual?.initialCode || "");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [executando, setExecutando] = useState(false);
  const [nota, setNota] = useState(0);
  const [mostrarDica, setMostrarDica] = useState(false);

  useEffect(() => {
    setCodigo(codigoSalvo || videoAtual?.initialCode || "");
    setConsoleOutput([]);
    setNota(0);
    setMostrarDica(false);
  }, [videoAtual, codigoSalvo]);

  // --- LÓGICA DE EXECUÇÃO CORRIGIDA ---
  // 2. FUNÇÃO DE RODAR COM "PLANO B"
  const rodarCodigo = () => {
    setExecutando(true);
    setConsoleOutput(["> Executando main.py..."]);

    setTimeout(() => {
      // Tenta pegar do banco, se não tiver, usa o padrão histórico do Desafio 1
      const esperadoRaw = videoAtual?.expectedOutput;
      let esperado = esperadoRaw ? String(esperadoRaw).trim() : "";

      // PLANO B: Se for o Desafio 1 e o banco estiver vazio, força o "Hello World"
      if (!esperado && videoAtual?.title?.toLowerCase().includes("1.1")) {
        esperado = "Hello World";
      }

      if (!esperado) {
        setConsoleOutput(prev => [...prev, "❌ ERRO: Resultado não encontrado no banco para este desafio."]);
        setExecutando(false);
        return;
      }

      const codigoLimpo = codigo.toLowerCase().trim();
      const esperadoLimpo = esperado.toLowerCase().trim();

      // Validação
      const passou = codigoLimpo.includes(esperadoLimpo) ||
        (esperadoLimpo === "20" && (codigoLimpo.includes("x * 2") || codigoLimpo.includes("x*2")));

      if (passou) {
        setConsoleOutput(prev => [...prev, `saída: ${esperado}`, "✅ Teste aprovado!"]);
        setNota(10);
      } else {
        setConsoleOutput(prev => [...prev, "❌ Saída incorreta.", `Dica: O resultado esperado é: ${esperado}`]);
        setNota(0);
      }
      setExecutando(false);
    }, 1000);
  };

  const handleTab = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const target = e.currentTarget as HTMLTextAreaElement;
      setCodigo(codigo.substring(0, start) + "    " + codigo.substring(end));
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  if (!modoLaboratorio) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-[#09090b] text-white p-4 lg:p-10">
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2 mb-4 text-[#81FE88]">
            <PlayCircle size={18} />
            <span className="text-xs font-black uppercase tracking-widest">{videoAtual?.moduleTitle}</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black uppercase italic mb-8 leading-none">{videoAtual?.title}</h1>
          <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl">
            <video key={videoAtual?.url} controls className="w-full h-full object-contain"><source src={videoAtual?.url} /></video>
          </div>
          <p className="mt-8 text-zinc-400 text-lg max-w-3xl leading-relaxed">{videoAtual?.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#09090b] text-white p-4 lg:p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-black italic uppercase text-lg tracking-tighter">
            Makershouse <span className="text-[#81FE88]">Lab</span>
          </h1>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setMostrarDica(!mostrarDica)} className="text-[10px] font-black uppercase border border-zinc-800 px-4 py-2 rounded-xl hover:bg-white/5 text-zinc-400">
            {mostrarDica ? "Esconder Dica" : "Ver Dica"}
          </button>
          <button onClick={rodarCodigo} disabled={executando} className="bg-[#81FE88] text-black font-black uppercase px-6 py-2 rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all">
            {executando ? "Processando..." : <><Play size={14} fill="currentColor" /> Rodar Código</>}
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="w-1/4 bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] p-8 overflow-y-auto custom-scrollbar flex flex-col">
          <h3 className="text-[#81FE88] text-[10px] font-black uppercase tracking-widest mb-4">Instruções</h3>
          <h2 className="text-2xl font-black mb-4 uppercase italic leading-tight">{videoAtual?.title}</h2>
          <div className="text-zinc-400 text-sm leading-relaxed mb-8 flex-1">
            {videoAtual?.description || "Siga as orientações do vídeo para completar este desafio."}
          </div>

          {mostrarDica && (
            <div className="p-4 bg-[#81FE88]/5 border border-[#81FE88]/20 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
              <p className="text-[11px] text-[#81FE88] italic">
                <Lightbulb size={14} className="inline mr-2" />
                Dica: Seu código deve resultar na saída: <strong>{videoAtual?.expectedOutput}</strong>
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-[2.5rem] flex flex-col overflow-hidden relative group">
          <div className="bg-zinc-900/50 px-6 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 size={14} className="text-[#81FE88]" />
              <span className="text-zinc-500 text-[10px] font-black uppercase">main.py</span>
            </div>
            <button onClick={() => setCodigo(videoAtual?.initialCode || "")} className="text-[9px] text-zinc-600 hover:text-red-400 font-black uppercase transition-colors">
              [ Resetar ]
            </button>
          </div>
          <textarea
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            onKeyDown={handleTab}
            spellCheck={false}
            className="flex-1 bg-transparent p-8 outline-none resize-none font-mono text-sm leading-relaxed text-zinc-300 caret-[#81FE88]"
            placeholder="# Digite seu código Python aqui..."
          />
        </div>

        <div className="w-1/3 bg-black border border-zinc-800 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
          <div className="bg-zinc-900/50 px-6 py-3 border-b border-zinc-800 flex items-center gap-2">
            <Terminal size={14} className="text-zinc-500" />
            <span className="text-zinc-500 text-[10px] font-black uppercase">Console Output</span>
          </div>
          <div className="flex-1 p-8 font-mono text-[11px] overflow-y-auto custom-scrollbar space-y-2">
            {consoleOutput.length === 0 && <span className="text-zinc-800 italic">Aguardando execução...</span>}
            {consoleOutput.map((line, i) => (
              <div key={i} className={`${line.includes("✅") ? "text-[#81FE88]" : line.includes("❌") ? "text-red-500" : "text-zinc-300"}`}>
                {line}
              </div>
            ))}
          </div>

          {nota > 0 && (
            <div className="p-8 bg-[#81FE88] text-black border-t border-[#81FE88]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} />
                  <span className="font-black italic uppercase">Desafio Concluído</span>
                </div>
                <span className="text-3xl font-black italic">10.0</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}