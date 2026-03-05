"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Terminal, Lightbulb, Play, CheckCircle2, Code2, PlayCircle,
  ArrowLeft, Menu, X, ChevronRight, BookOpen, FileText, Lock,
  FlaskConical
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export interface NavItem {
  type: 'video' | 'challenge';
  id: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  url?: string | null;
  description?: string | null;
  initialCode?: string | null;
  expectedOutput?: string | null;
  pdfUrl?: string | null;
  challengeId?: string | null;
}

export interface SubmissionData {
  grade: number;
  completed: boolean;
  code: string;
}

type Aba = "instrucoes" | "codigo" | "console";

function getGoogleDriveEmbedUrl(url: string): string | null {
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
  return null;
}

export default function MinhaClasse({
  navItems,
  activeIndex,
  submissions: initialSubmissions,
  codigoSalvo,
  slug,
}: {
  navItems: NavItem[];
  activeIndex: number;
  submissions: Record<string, SubmissionData>;
  codigoSalvo: string | null;
  slug: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Local copy of submissions (updated after each submit without page reload)
  const [localSubmissions, setLocalSubmissions] = useState(initialSubmissions);

  // Videos watched 70%+ (persisted in localStorage per course)
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem(`watched_${slug}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const markVideoWatched = useCallback((videoId: string) => {
    setWatchedVideos(prev => {
      if (prev.has(videoId)) return prev;
      const next = new Set(prev);
      next.add(videoId);
      try { localStorage.setItem(`watched_${slug}`, JSON.stringify([...next])); } catch {}
      return next;
    });
  }, [slug]);

  const currentItem = navItems[activeIndex];
  const modoLaboratorio = currentItem?.type === 'challenge';
  const isLastItem = activeIndex >= navItems.length - 1;

  // Lab state
  const [abaAtiva, setAbaAtiva] = useState<Aba>("instrucoes");
  const [menuAberto, setMenuAberto] = useState(false);
  const [codigo, setCodigo] = useState(codigoSalvo || currentItem?.initialCode || "");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [executando, setExecutando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [nota, setNota] = useState(0);
  const [aprovado, setAprovado] = useState<boolean | null>(null);
  const [mostrarDica, setMostrarDica] = useState(false);
  const [modalDicaAberto, setModalDicaAberto] = useState(false);

  // Reset state when navigating to a different item
  useEffect(() => {
    setCodigo(codigoSalvo || currentItem?.initialCode || "");
    setConsoleOutput([]);
    setNota(0);
    setAprovado(null);
    setMostrarDica(false);
    setAbaAtiva("instrucoes");
  }, [activeIndex, codigoSalvo]);

  // Completion checks — vídeos são sempre "completos", só desafios bloqueiam
  const isCompleted = useCallback((item: NavItem): boolean => {
    if (item.type === 'video') return true;
    return !!(item.challengeId && localSubmissions[item.challengeId]);
  }, [localSubmissions]);

  const isLocked = useCallback((idx: number): boolean => {
    if (idx === 0) return false;
    return !isCompleted(navItems[idx - 1]);
  }, [navItems, isCompleted]);

  const goToItem = useCallback((idx: number) => {
    if (idx < 0 || idx >= navItems.length || isLocked(idx)) return;
    const item = navItems[idx];
    setMenuAberto(false);
    if (item.type === 'video') {
      router.push(`${pathname}?videoId=${item.id}`);
    } else {
      router.push(`${pathname}?challengeId=${item.challengeId}`);
    }
  }, [navItems, isLocked, pathname, router]);

  const proximaEtapa = () => goToItem(activeIndex + 1);

  // 70% video tracking
  const videoWatchedRef = useRef(watchedVideos.has(currentItem?.id || ''));
  useEffect(() => {
    videoWatchedRef.current = watchedVideos.has(currentItem?.id || '');
  }, [activeIndex, watchedVideos]);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (videoWatchedRef.current || !currentItem) return;
    const vid = e.currentTarget;
    if (vid.duration > 0 && vid.currentTime / vid.duration >= 0.7) {
      videoWatchedRef.current = true;
      markVideoWatched(currentItem.id);
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
          expectedOutput: currentItem?.expectedOutput || "",
          challengeTitle: currentItem?.title || "",
          challengeDescription: currentItem?.description || "",
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
      setAprovado(data.nota >= 7);

      // Save submission to DB
      if (currentItem?.challengeId) {
        setSalvando(true);
        const feedbackText = [
          data.feedback,
          data.motivo ? `Motivo: ${data.motivo}` : null,
          data.saida ? `Saída: ${data.saida}` : null,
        ].filter(Boolean).join('\n');
        try {
          await fetch('/api/challenges/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              challengeId: currentItem.challengeId,
              grade: data.nota,
              code: codigo,
              feedback: feedbackText || null,
            }),
          });
          setLocalSubmissions(prev => ({
            ...prev,
            [currentItem.challengeId!]: {
              grade: data.nota,
              completed: true,
              code: codigo,
            },
          }));
        } catch (e) {
          console.error('Erro ao salvar submissão:', e);
        }
        setSalvando(false);
      }
    } catch {
      setConsoleOutput(["❌ Erro de conexão. Verifique sua internet e tente novamente."]);
    }

    setExecutando(false);
  };

  const handleTab = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = (e.currentTarget as HTMLTextAreaElement).selectionStart;
      const end = (e.currentTarget as HTMLTextAreaElement).selectionEnd;
      const target = e.currentTarget as HTMLTextAreaElement;
      setCodigo(codigo.substring(0, start) + "    " + codigo.substring(end));
      setTimeout(() => { target.selectionStart = target.selectionEnd = start + 4; }, 0);
    }
  };

  // Group navItems by module for sidebar
  const moduleGroups: Array<{
    moduleId: string;
    moduleTitle: string;
    items: Array<NavItem & { idx: number }>;
  }> = [];
  for (let idx = 0; idx < navItems.length; idx++) {
    const item = navItems[idx];
    const group = moduleGroups.find(g => g.moduleId === item.moduleId);
    if (group) {
      group.items.push({ ...item, idx });
    } else {
      moduleGroups.push({ moduleId: item.moduleId, moduleTitle: item.moduleTitle, items: [{ ...item, idx }] });
    }
  }

  const currentVideoWatched = currentItem?.type === 'video'; // sem obrigatoriedade de 70%

  // ── SIDEBAR NAV ───────────────────────────────────────────────────────────────
  const renderSidebar = () => (
    <nav className="flex flex-col gap-6 flex-1 overflow-y-auto p-6">
      {moduleGroups.map((group) => (
        <div key={group.moduleId}>
          <p className="text-[9px] font-black text-[#81FE88] uppercase tracking-[0.2em] mb-3">
            {group.moduleTitle}
          </p>
          <div className="space-y-1 ml-2 border-l border-zinc-800 pl-4">
            {group.items.map(({ idx, ...item }) => {
              const locked = isLocked(idx);
              const completed = isCompleted(item);
              const isActive = idx === activeIndex;
              const subData = item.challengeId ? localSubmissions[item.challengeId] : null;

              return (
                <button
                  key={item.id}
                  onClick={() => goToItem(idx)}
                  disabled={locked}
                  className={`w-full flex items-center gap-2 text-left py-1.5 px-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#81FE88]/10 text-white'
                      : locked
                      ? 'text-zinc-700 cursor-not-allowed'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {locked ? (
                    <Lock size={10} className="shrink-0 text-zinc-700" />
                  ) : item.type === 'challenge' ? (
                    <FlaskConical size={10} className={`shrink-0 ${isActive || completed ? 'text-[#81FE88]' : 'text-zinc-500'}`} />
                  ) : (
                    <BookOpen size={10} className={`shrink-0 ${isActive || completed ? 'text-[#81FE88]' : 'text-zinc-500'}`} />
                  )}
                  <span className="text-[10px] font-bold uppercase italic flex-1 text-left truncate">
                    {item.title}
                  </span>
                  {/* Grade badge for challenges */}
                  {item.type === 'challenge' && subData && (
                    <span className={`text-[9px] font-black shrink-0 ${subData.completed ? 'text-[#81FE88]' : 'text-red-400'}`}>
                      {subData.grade}/10
                    </span>
                  )}
                  {/* Check mark for watched videos */}
                  {item.type === 'video' && completed && (
                    <CheckCircle2 size={10} className="text-[#81FE88] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  // ── DRAWER MENU MOBILE ───────────────────────────────────────────────────────
  const DrawerMenu = () => (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMenuAberto(false)} />
      <aside className="fixed left-0 top-0 h-full w-72 bg-[#09090b] border-r border-zinc-800 z-50 flex flex-col lg:hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-900">
          <span className="font-black italic text-lg text-white uppercase tracking-tighter">
            VIDEOCLASS<span className="text-[#81FE88]">.</span>
          </span>
          <button onClick={() => setMenuAberto(false)} className="text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>
        {renderSidebar()}
        <div className="p-6 border-t border-zinc-900">
          <Link href="/vitrine" className="flex items-center gap-2 text-zinc-500 hover:text-[#81FE88] transition-colors text-[10px] font-black uppercase">
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

        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-zinc-900 shrink-0">
          <button onClick={() => setMenuAberto(true)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white">
            <Menu size={20} />
          </button>
          <span className="font-black italic text-sm uppercase tracking-tighter">
            VIDEOCLASS<span className="text-[#81FE88]">.</span>
          </span>
        </div>

        <div className="flex flex-1">
          {/* Desktop sidebar */}
          <aside className="hidden lg:flex flex-col w-96 shrink-0 bg-[#09090b] border-r border-zinc-800">
            <div className="px-6 py-5 border-b border-zinc-900">
              <span className="font-black italic text-sm text-white uppercase tracking-tighter">
                VIDEOCLASS<span className="text-[#81FE88]">.</span>
              </span>
            </div>
            {renderSidebar()}
            <div className="p-6 border-t border-zinc-900">
              <Link href="/vitrine" className="flex items-center gap-2 text-zinc-500 hover:text-[#81FE88] transition-colors text-[10px] font-black uppercase">
                <ArrowLeft size={14} />
                Vitrine
              </Link>
            </div>
          </aside>

          <div className="p-4 lg:p-10 flex-1">
            <div className="max-w-4xl mx-auto w-full">
              <div className="flex items-center gap-2 mb-4 text-[#81FE88]">
                <PlayCircle size={18} />
                <span className="text-xs font-black uppercase tracking-widest">{currentItem?.moduleTitle}</span>
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black uppercase italic mb-6 leading-none">
                {currentItem?.title}
              </h1>
              <div className="aspect-video bg-black rounded-2xl lg:rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl">
                {currentItem?.url ? (
                  (() => {
                    const driveUrl = getGoogleDriveEmbedUrl(currentItem.url);
                    if (driveUrl) {
                      return (
                        <iframe
                          key={currentItem.url}
                          src={driveUrl}
                          className="w-full h-full"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                        />
                      );
                    }
                    return (
                      <video
                        key={currentItem.url}
                        controls
                        className="w-full h-full object-contain"
                        onTimeUpdate={handleTimeUpdate}
                      >
                        <source src={currentItem.url} type="video/mp4" />
                      </video>
                    );
                  })()
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700 text-sm font-bold uppercase italic">
                    Nenhum vídeo cadastrado para esta aula
                  </div>
                )}
              </div>
              <p className="mt-6 text-zinc-400 text-base max-w-3xl leading-relaxed">{currentItem?.description}</p>

              {currentItem?.pdfUrl && (
                <a
                  href={currentItem.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 border border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest"
                >
                  <FileText size={14} />
                  Visualizar Material de Apoio
                </a>
              )}

              {currentVideoWatched && !isLastItem && (
                <button
                  onClick={proximaEtapa}
                  className="mt-6 flex items-center gap-2 bg-[#81FE88] text-black font-black uppercase px-6 py-3 rounded-2xl hover:scale-105 transition-all text-sm"
                >
                  <ChevronRight size={16} />
                  Próxima Etapa
                </button>
              )}
            </div>
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
          <div className="w-full bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 pb-10" onClick={(e) => e.stopPropagation()}>
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
              <strong className="text-[#81FE88]">{currentItem?.expectedOutput}</strong>
            </p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center px-3 py-2 md:px-6 md:py-4 border-b border-zinc-900 shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => setMenuAberto(true)} className="lg:hidden p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white">
            <Menu size={20} />
          </button>
          <button onClick={() => router.push('/vitrine')} className="hidden lg:flex p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white">
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-black italic uppercase text-sm md:text-lg tracking-tighter">
            Makershouse <span className="text-[#81FE88]">Lab</span>
          </h1>
        </div>

        <div className="flex gap-2 md:gap-3 items-center">
          <button onClick={() => setModalDicaAberto(true)} className="lg:hidden text-[10px] font-black uppercase border border-zinc-800 px-3 py-2 rounded-xl hover:bg-white/5 text-zinc-400">
            Ver Dica
          </button>
          <button onClick={() => setMostrarDica(!mostrarDica)} className="hidden lg:block text-[10px] font-black uppercase border border-zinc-800 px-4 py-2 rounded-xl hover:bg-white/5 text-zinc-400">
            {mostrarDica ? "Esconder Dica" : "Ver Dica"}
          </button>
          <button onClick={rodarCodigo} disabled={executando} className="hidden lg:flex bg-[#81FE88] text-black font-black uppercase px-6 py-2 rounded-xl items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all text-sm">
            {executando ? "..." : <><Play size={12} fill="currentColor" /> Rodar Código</>}
          </button>

          {isCompleted(currentItem) && !isLastItem ? (
            <button onClick={proximaEtapa} disabled={salvando} className="lg:hidden bg-white text-black font-black uppercase px-3 py-2 rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-[10px]">
              <ChevronRight size={14} />
              {salvando ? "..." : "Próximo"}
            </button>
          ) : abaAtiva === "instrucoes" ? (
            <button onClick={() => setAbaAtiva("codigo")} className="lg:hidden bg-zinc-800 text-white font-black uppercase px-3 py-2 rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-[10px]">
              <Code2 size={12} />
              Código
            </button>
          ) : abaAtiva === "codigo" ? (
            <button onClick={rodarCodigo} disabled={executando} className="lg:hidden bg-[#81FE88] text-black font-black uppercase px-3 py-2 rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all text-[10px]">
              {executando ? "..." : <><Play size={12} fill="currentColor" /> Rodar Código</>}
            </button>
          ) : null}

          <button onClick={() => router.push('/vitrine')} className="lg:hidden p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white">
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>

      {/* CONTEÚDO — desktop: sidebar + 3 painéis | mobile: abas */}
      <div className="flex-1 overflow-hidden flex">

        {/* Sidebar desktop */}
        <aside className="hidden lg:flex flex-col w-96 shrink-0 bg-[#09090b] border-r border-zinc-800">
          {renderSidebar()}
          <div className="p-6 border-t border-zinc-900">
            <Link href="/vitrine" className="flex items-center gap-2 text-zinc-500 hover:text-[#81FE88] transition-colors text-[10px] font-black uppercase">
              <ArrowLeft size={14} />
              Vitrine
            </Link>
          </div>
        </aside>

        {/* 3 painéis */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row lg:gap-4 lg:p-4">

        {/* PAINEL: INSTRUÇÕES */}
        <div className={`${abaAtiva === "instrucoes" ? "flex" : "hidden"} lg:flex flex-col w-full lg:w-96 shrink-0 bg-zinc-900/30 border-b lg:border border-zinc-800 lg:rounded-[2.5rem] p-6 lg:p-8 overflow-y-auto`}>
          <h3 className="text-[#81FE88] text-[10px] font-black uppercase tracking-widest mb-1">Instruções</h3>
          <h2 className="text-xl lg:text-2xl font-black mb-4 uppercase italic leading-tight">
            {currentItem?.title || "Desafio"}
          </h2>
          <div className="text-zinc-400 text-sm leading-relaxed">
            {currentItem?.description || "Siga as orientações do vídeo para completar este desafio."}
          </div>

          {currentItem?.pdfUrl && (
            <a
              href={currentItem.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 border border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest"
            >
              <FileText size={12} />
              Material de Apoio
            </a>
          )}

          {mostrarDica && (
            <div className="mt-6 p-4 bg-[#81FE88]/5 border border-[#81FE88]/20 rounded-2xl">
              <p className="text-[11px] text-[#81FE88] italic">
                <Lightbulb size={14} className="inline mr-2" />
                Dica: Seu código deve resultar na saída: <strong>{currentItem?.expectedOutput}</strong>
              </p>
            </div>
          )}

          {isCompleted(currentItem) && !isLastItem && (
            <button
              onClick={proximaEtapa}
              disabled={salvando}
              className="mt-6 w-full bg-[#81FE88] text-black font-black uppercase py-3 rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition-all text-sm"
            >
              <ChevronRight size={16} />
              {salvando ? "Salvando..." : "Próxima Etapa"}
            </button>
          )}
        </div>

        {/* PAINEL: EDITOR */}
        <div className={`${abaAtiva === "codigo" ? "flex" : "hidden"} lg:flex lg:w-[380px] shrink-0 flex-col bg-zinc-950 border-b lg:border border-zinc-800 lg:rounded-[2.5rem] overflow-hidden`}>
          <div className="bg-zinc-900/50 px-4 lg:px-6 py-3 border-b border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Code2 size={14} className="text-[#81FE88]" />
              <span className="text-zinc-500 text-[10px] font-black uppercase">main.py</span>
            </div>
            <button onClick={() => setCodigo(currentItem?.initialCode || "")} className="text-[9px] text-zinc-600 hover:text-red-400 font-black uppercase transition-colors">
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
        <div className={`${abaAtiva === "console" ? "flex" : "hidden"} lg:flex flex-col w-full lg:flex-1 bg-black border-b lg:border border-zinc-800 lg:rounded-[2.5rem] overflow-hidden shadow-2xl`}>
          <div className="bg-zinc-900/50 px-4 lg:px-6 py-3 border-b border-zinc-800 flex items-center gap-2 shrink-0">
            <Terminal size={14} className="text-zinc-500" />
            <span className="text-zinc-500 text-[10px] font-black uppercase">Console Output</span>
          </div>
          <div className="flex-1 p-4 lg:p-8 font-mono text-[11px] overflow-y-auto space-y-2">
            {consoleOutput.length === 0 && (
              <span className="text-zinc-800 italic">Aguardando execução...</span>
            )}
            {consoleOutput.map((line, i) => (
              <div key={i} className={`${
                line.includes("✅") ? "text-[#81FE88]" :
                line.includes("❌") ? "text-red-500" :
                line.includes("⚠️") ? "text-yellow-400" :
                line.startsWith("Nota:") ? "text-zinc-100 font-bold" :
                "text-zinc-300"
              }`}>
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
        </div> {/* fecha: 3 painéis */}
      </div>   {/* fecha: sidebar + painéis */}

      {/* TABS MOBILE */}
      <div className="lg:hidden flex shrink-0 border-t border-zinc-900 bg-zinc-950">
        {(["instrucoes", "codigo", "console"] as Aba[]).map((aba) => (
          <button key={aba} onClick={() => setAbaAtiva(aba)} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${abaAtiva === aba ? "text-[#81FE88]" : "text-zinc-600"}`}>
            {aba === "instrucoes" ? <Lightbulb size={18} /> : aba === "codigo" ? <Code2 size={18} /> : <Terminal size={18} />}
            <span className="text-[9px] font-black uppercase">
              {aba === "instrucoes" ? "Instrução" : aba === "codigo" ? "Código" : "Console"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
