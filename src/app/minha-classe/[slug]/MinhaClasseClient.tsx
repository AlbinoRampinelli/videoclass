"use client";
import { useState, useEffect } from "react";
import {
  Terminal, Lightbulb, Play, CheckCircle2, Code2, PlayCircle,
  ArrowLeft, Menu, X, ChevronRight, BookOpen
} from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface Video {
  id: string;
  title: string;
  url: string;
  description?: string;
  moduleTitle?: string;
  initialCode?: string;
  expectedOutput?: string;
}

type Aba = "instrucoes" | "codigo" | "console";

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
  const pathname = usePathname();

  const desafioId = searchParams.get("desafio");
  const aulaUrl = searchParams.get("aula");

  const [abaAtiva, setAbaAtiva] = useState<Aba>("instrucoes");
  const [menuAberto, setMenuAberto] = useState(false);

  const videoAtual = (todosOsVideos && aulaUrl && !desafioId)
    ? todosOsVideos.find((v: any) => {
        const tituloNaUrl = aulaUrl.toLowerCase().trim();
        return tituloNaUrl && v.title.toLowerCase().includes(tituloNaUrl);
      }) || aulaAtiva
    : aulaAtiva;

  useEffect(() => {
    if (videoAtual) {
      setCodigo(codigoSalvo || videoAtual.initialCode || "");
      setConsoleOutput([]);
      setNota(0);
      setAprovado(null);
      setMostrarDica(false);
      setAbaAtiva("instrucoes");
    }
  }, [videoAtual?.id, aulaUrl, desafioId, codigoSalvo]);

  const modoLaboratorio = !!desafioId || videoAtual?.url === null || videoAtual?.url === "";
  const [codigo, setCodigo] = useState(codigoSalvo || videoAtual?.initialCode || "");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [executando, setExecutando] = useState(false);
  const [nota, setNota] = useState(0);
  const [aprovado, setAprovado] = useState<boolean | null>(null);
  const [mostrarDica, setMostrarDica] = useState(false);
  const [modalDicaAberto, setModalDicaAberto] = useState(false);

  useEffect(() => {
    setCodigo(codigoSalvo || videoAtual?.initialCode || "");
    setConsoleOutput([]);
    setNota(0);
    setAprovado(null);
    setMostrarDica(false);
  }, [videoAtual, codigoSalvo]);

  const proximaEtapa = () => {
    const proximo = Number(desafioId || 0) + 1;
    router.push(`${pathname}?desafio=${proximo}`);
  };

  const voltarEtapa = () => {
    if (abaAtiva === "console") {
      setAbaAtiva("codigo");
    } else if (abaAtiva === "codigo") {
      setAbaAtiva("instrucoes");
    } else {
      // instrucoes → volta para o desafio anterior (ou para o vídeo)
      const atual = Number(desafioId || 0);
      if (atual <= 1) {
        router.push(pathname);
      } else {
        router.push(`${pathname}?desafio=${atual - 1}`);
      }
    }
  };

  const rodarCodigo = async () => {
    setExecutando(true);
    setNota(0);
    setAprovado(null);
    setConsoleOutput(["> Executando main.py...", "> Aguardando avaliação do professor IA..."]);
    setAbaAtiva("console");

    try {
      const res = await fetch("/api/evaluate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userCode: codigo,
          expectedOutput: videoAtual?.expectedOutput || "",
          challengeTitle: videoAtual?.title || "",
          challengeDescription: videoAtual?.description || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setConsoleOutput(["❌ Erro ao conectar com o professor IA. Tente novamente."]);
        setExecutando(false);
        return;
      }

      const linhas: string[] = [];
      if (data.saida) linhas.push(`> saída: ${data.saida}`);
      linhas.push("");
      linhas.push(`Nota: ${data.nota}/10`);
      linhas.push(data.aprovado ? "✅ Aprovado!" : "❌ Reprovado");
      linhas.push(`📝 ${data.feedback}`);
      if (!data.aprovado && data.motivo) {
        linhas.push("");
        linhas.push(`⚠️ ${data.motivo}`);
      }

      setConsoleOutput(linhas);
      setNota(data.nota);
      setAprovado(data.aprovado);
    } catch {
      setConsoleOutput(["❌ Erro de conexão. Verifique sua internet e tente novamente."]);
    }

    setExecutando(false);
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

  // ── DRAWER MENU MOBILE ───────────────────────────────────────────────────────
  const DrawerMenu = () => (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        onClick={() => setMenuAberto(false)}
      />
      {/* Drawer */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-[#09090b] border-r border-zinc-800 z-50 flex flex-col lg:hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-900">
          <span className="font-black italic text-lg text-white uppercase tracking-tighter">
            VIDEOCLASS<span className="text-[#81FE88]">.</span>
          </span>
          <button onClick={() => setMenuAberto(false)} className="text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-6 flex-1 overflow-y-auto p-6">
          {/* Conteúdo em Vídeo */}
          <div>
            <p className="text-[9px] font-black text-[#81FE88] uppercase tracking-[0.2em] mb-3">
              Conteúdo em Vídeo
            </p>
            <div className="space-y-1 ml-2 border-l border-zinc-800 pl-4">
              <button
                onClick={() => { router.push(`${pathname}?aula=1.1`); setMenuAberto(false); }}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors py-1"
              >
                <BookOpen size={12} className="text-[#81FE88]" />
                <span className="text-[10px] font-bold uppercase italic">1.1 Instalação do Python</span>
              </button>
              <button
                onClick={() => { router.push(`${pathname}?aula=1.2`); setMenuAberto(false); }}
                className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors py-1"
              >
                <BookOpen size={12} />
                <span className="text-[10px] font-bold uppercase italic">1.2 Instalação do VS Code</span>
              </button>
            </div>
          </div>

          {/* Laboratório */}
          <div>
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">
              Laboratório Prático
            </p>
            <div className="space-y-2">
              {[1, 2].map((n) => (
                <button
                  key={n}
                  onClick={() => { router.push(`${pathname}?desafio=${n}`); setMenuAberto(false); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    desafioId === String(n)
                      ? "bg-[#81FE88]/10 border-[#81FE88]/50 text-white"
                      : "bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-[#81FE88]/30"
                  }`}
                >
                  <Terminal size={14} className={desafioId === String(n) ? "text-[#81FE88]" : "text-zinc-500"} />
                  <span className="text-[10px] font-black uppercase italic">
                    Desafio {n}: {n === 1 ? "Hello World" : "Configuração"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-zinc-900">
          <Link
            href="/vitrine"
            className="flex items-center gap-2 text-zinc-500 hover:text-[#81FE88] transition-colors text-[10px] font-black uppercase"
          >
            <ArrowLeft size={14} />
            Voltar para a Vitrine
          </Link>
        </div>
      </aside>
    </>
  );

  // ── MODO VÍDEO ───────────────────────────────────────────────────────────────
  if (!modoLaboratorio) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-[#09090b] text-white">
        {menuAberto && <DrawerMenu />}

        {/* Header mobile com hambúrguer */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-zinc-900 shrink-0">
          <button
            onClick={() => setMenuAberto(true)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <span className="font-black italic text-sm uppercase tracking-tighter">
            VIDEOCLASS<span className="text-[#81FE88]">.</span>
          </span>
        </div>

        <div className="p-4 lg:p-10 flex-1">
          <div className="max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-2 mb-4 text-[#81FE88]">
              <PlayCircle size={18} />
              <span className="text-xs font-black uppercase tracking-widest">{videoAtual?.moduleTitle}</span>
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-black uppercase italic mb-6 leading-none">
              {videoAtual?.title}
            </h1>
            <div className="aspect-video bg-black rounded-2xl lg:rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl">
              <video key={videoAtual?.url} controls className="w-full h-full object-contain">
                <source src={videoAtual?.url} />
              </video>
            </div>
            <p className="mt-6 text-zinc-400 text-base max-w-3xl leading-relaxed">{videoAtual?.description}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── MODO LABORATÓRIO ─────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col h-[100dvh] bg-[#09090b] text-white overflow-hidden">

      {menuAberto && <DrawerMenu />}

      {/* MODAL DICA — mobile */}
      {modalDicaAberto && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden" onClick={() => setModalDicaAberto(false)}>
          <div
            className="w-full bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[#81FE88]">
                <Lightbulb size={16} />
                <span className="text-xs font-black uppercase tracking-widest">Dica</span>
              </div>
              <button onClick={() => setModalDicaAberto(false)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Seu código deve resultar na saída:{" "}
              <strong className="text-[#81FE88]">{videoAtual?.expectedOutput}</strong>
            </p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center px-3 py-2 md:px-6 md:py-4 border-b border-zinc-900 shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Hamburger — só no mobile */}
          <button
            onClick={() => setMenuAberto(true)}
            className="lg:hidden p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
          >
            <Menu size={20} />
          </button>
          {/* Voltar — só no desktop */}
          <button
            onClick={() => router.push('/vitrine')}
            className="hidden lg:flex p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-black italic uppercase text-sm md:text-lg tracking-tighter">
            Makershouse <span className="text-[#81FE88]">Lab</span>
          </h1>
        </div>

        <div className="flex gap-2 md:gap-3 items-center">
          {/* Mobile: abre modal */}
          <button
            onClick={() => setModalDicaAberto(true)}
            className="lg:hidden text-[10px] font-black uppercase border border-zinc-800 px-3 py-2 rounded-xl hover:bg-white/5 text-zinc-400"
          >
            Ver Dica
          </button>
          {/* Desktop: toggle inline */}
          <button
            onClick={() => setMostrarDica(!mostrarDica)}
            className="hidden lg:block text-[10px] font-black uppercase border border-zinc-800 px-4 py-2 rounded-xl hover:bg-white/5 text-zinc-400"
          >
            {mostrarDica ? "Esconder Dica" : "Ver Dica"}
          </button>

          {/* Desktop: sempre "Rodar Código" */}
          <button
            onClick={rodarCodigo}
            disabled={executando}
            className="hidden lg:flex bg-[#81FE88] text-black font-black uppercase px-6 py-2 rounded-xl items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all text-sm"
          >
            {executando ? "..." : <><Play size={12} fill="currentColor" /> Rodar Código</>}
          </button>

          {/* Mobile: botão contextual por aba */}
          {aprovado === true ? (
            <button
              onClick={proximaEtapa}
              className="lg:hidden bg-white text-black font-black uppercase px-3 py-2 rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-[10px]"
            >
              <ChevronRight size={14} />
              Próximo
            </button>
          ) : abaAtiva === "instrucoes" ? (
            <button
              onClick={() => setAbaAtiva("codigo")}
              className="lg:hidden bg-zinc-800 text-white font-black uppercase px-3 py-2 rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-[10px]"
            >
              <Code2 size={12} />
              Código
            </button>
          ) : abaAtiva === "codigo" ? (
            <button
              onClick={rodarCodigo}
              disabled={executando}
              className="lg:hidden bg-[#81FE88] text-black font-black uppercase px-3 py-2 rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all text-[10px]"
            >
              {executando ? "..." : <><Play size={12} fill="currentColor" /> Rodar Código</>}
            </button>
          ) : null}

          {/* Mobile: botão Voltar etapa */}
          <button
            onClick={voltarEtapa}
            className="lg:hidden p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>

      {/* CONTEÚDO — desktop: 3 colunas | mobile: painel único */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row lg:gap-4 lg:p-4">

        {/* PAINEL: INSTRUÇÕES */}
        <div className={`
          ${abaAtiva === "instrucoes" ? "flex" : "hidden"} lg:flex
          flex-col w-full lg:w-1/4 bg-zinc-900/30 border-b lg:border border-zinc-800 lg:rounded-[2.5rem] p-6 lg:p-8 overflow-y-auto
        `}>
          <h3 className="text-[#81FE88] text-[10px] font-black uppercase tracking-widest mb-1">Instruções</h3>
          <h2 className="text-xl lg:text-2xl font-black mb-4 uppercase italic leading-tight">
            {videoAtual?.moduleTitle || "Desafio"}
          </h2>
          <div className="text-zinc-400 text-sm leading-relaxed flex-1">
            {videoAtual?.description || "Siga as orientações do vídeo para completar este desafio."}
          </div>

          {mostrarDica && (
            <div className="mt-6 p-4 bg-[#81FE88]/5 border border-[#81FE88]/20 rounded-2xl">
              <p className="text-[11px] text-[#81FE88] italic">
                <Lightbulb size={14} className="inline mr-2" />
                Dica: Seu código deve resultar na saída: <strong>{videoAtual?.expectedOutput}</strong>
              </p>
            </div>
          )}
        </div>

        {/* PAINEL: EDITOR */}
        <div className={`
          ${abaAtiva === "codigo" ? "flex" : "hidden"} lg:flex
          flex-1 flex-col bg-zinc-950 border-b lg:border border-zinc-800 lg:rounded-[2.5rem] overflow-hidden
        `}>
          <div className="bg-zinc-900/50 px-4 lg:px-6 py-3 border-b border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Code2 size={14} className="text-[#81FE88]" />
              <span className="text-zinc-500 text-[10px] font-black uppercase">main.py</span>
            </div>
            <button
              onClick={() => setCodigo(videoAtual?.initialCode || "")}
              className="text-[9px] text-zinc-600 hover:text-red-400 font-black uppercase transition-colors"
            >
              [ Resetar ]
            </button>
          </div>
          <textarea
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            onKeyDown={handleTab}
            spellCheck={false}
            className="flex-1 bg-transparent p-4 lg:p-8 outline-none resize-none font-mono text-sm leading-relaxed text-zinc-300 caret-[#81FE88]"
            placeholder="# Digite seu código Python aqui..."
          />
        </div>

        {/* PAINEL: CONSOLE */}
        <div className={`
          ${abaAtiva === "console" ? "flex" : "hidden"} lg:flex
          flex-col w-full lg:w-1/3 bg-black border-b lg:border border-zinc-800 lg:rounded-[2.5rem] overflow-hidden shadow-2xl
        `}>
          <div className="bg-zinc-900/50 px-4 lg:px-6 py-3 border-b border-zinc-800 flex items-center gap-2 shrink-0">
            <Terminal size={14} className="text-zinc-500" />
            <span className="text-zinc-500 text-[10px] font-black uppercase">Console Output</span>
          </div>
          <div className="flex-1 p-4 lg:p-8 font-mono text-[11px] overflow-y-auto space-y-2">
            {consoleOutput.length === 0 && (
              <span className="text-zinc-800 italic">Aguardando execução...</span>
            )}
            {consoleOutput.map((line, i) => (
              <div
                key={i}
                className={`${
                  line.includes("✅") ? "text-[#81FE88]" :
                  line.includes("❌") ? "text-red-500" :
                  line.includes("⚠️") ? "text-yellow-400" :
                  line.startsWith("Nota:") ? "text-zinc-100 font-bold" :
                  "text-zinc-300"
                }`}
              >
                {line}
              </div>
            ))}
          </div>

          {nota > 0 && aprovado !== null && (
            <div className={`p-4 lg:p-6 border-t shrink-0 ${aprovado ? "bg-[#81FE88] text-black border-[#81FE88]" : "bg-zinc-900 text-white border-zinc-700"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className={aprovado ? "text-black" : "text-red-400"} />
                  <span className="font-black italic uppercase text-sm">
                    {aprovado ? "Desafio Concluído" : "Tente Novamente"}
                  </span>
                </div>
                <span className={`text-2xl lg:text-3xl font-black italic ${aprovado ? "" : "text-red-400"}`}>
                  {nota}/10
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TABS MOBILE */}
      <div className="lg:hidden flex shrink-0 border-t border-zinc-900 bg-zinc-950">
        <button
          onClick={() => setAbaAtiva("instrucoes")}
          className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${abaAtiva === "instrucoes" ? "text-[#81FE88]" : "text-zinc-600"}`}
        >
          <Lightbulb size={18} />
          <span className="text-[9px] font-black uppercase">Instrução</span>
        </button>
        <button
          onClick={() => setAbaAtiva("codigo")}
          className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${abaAtiva === "codigo" ? "text-[#81FE88]" : "text-zinc-600"}`}
        >
          <Code2 size={18} />
          <span className="text-[9px] font-black uppercase">Código</span>
        </button>
        <button
          onClick={() => setAbaAtiva("console")}
          className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${abaAtiva === "console" ? "text-[#81FE88]" : "text-zinc-600"}`}
        >
          <Terminal size={18} />
          <span className="text-[9px] font-black uppercase">Console</span>
        </button>
      </div>
    </div>
  );
}
