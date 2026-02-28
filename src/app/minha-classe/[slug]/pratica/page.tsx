"use client";
import Editor from "@monaco-editor/react";
import { useState, useEffect, use } from "react";
import Script from "next/script";

export default function LabPython({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const slug = resolvedParams?.slug;

    const [code, setCode] = useState("");
    const [challenge, setChallenge] = useState<any>(null);
    const [output, setOutput] = useState("Aguardando execução...");
    const [status, setStatus] = useState("loading");
    const [concluido, setConcluido] = useState(false);

    useEffect(() => {
        if (!slug || slug === "undefined" || slug === "") return;

        const carregarDesafio = async () => {
            try {
                setStatus("loading");
                const res = await fetch(`/api/challenges?courseSlug=${slug}`);

                if (res.ok) {
                    const data = await res.json();

                    // --- AJUSTE: A API retorna um ARRAY, pegamos o primeiro item ---
                    if (Array.isArray(data) && data.length > 0) {
                        const desafioEncontrado = data[0];
                        setChallenge(desafioEncontrado);

                        const saved = localStorage.getItem(`code-${slug}`);
                        // Usamos o código do banco caso não tenha nada salvo
                        setCode(saved || desafioEncontrado.initialCode || "");
                        setStatus("ready");
                    } else {
                        console.error("Nenhum desafio encontrado para este curso.");
                        setStatus("error");
                    }
                } else {
                    setStatus("error");
                }
            } catch (error) {
                console.error("Erro ao carregar:", error);
                setStatus("error");
            }
        };

        carregarDesafio();
    }, [slug]);

    const runPython = async () => {
        setOutput("⌛ Carregando o motor Python");
        setConcluido(false);

        try {
            // Verifica se o script já foi carregado no window
            if (!(window as any).loadPyodide) {
                throw new Error("O motor Python ainda está carregando. Aguarde um segundo.");
            }
            // @ts-ignore
            const pyodide = await window.loadPyodide();

            let buffer = "";
            pyodide.setStdout({
                batched: (text: string) => {
                    buffer += text; // Removi o \n extra para evitar quebras fantasmas
                    setOutput(buffer);
                }
            });

            await pyodide.runPythonAsync(code);

            // --- LÓGICA DE VALIDAÇÃO ---
            const resultadoFinal = buffer.trim();
            const esperado = challenge?.expected?.toString().trim();

            // Se o resultado contiver o esperado (ex: "resposta: 5" contém "5")
            const sucesso = esperado && (resultadoFinal === esperado || resultadoFinal.endsWith(esperado));

            if (sucesso) {
                setOutput(buffer + "\n\n✅ EXCELENTE! Resultado correto.");
                setConcluido(true);
            } else {
                const debugInfo = `\n\n--- DEBUG DE COMPARAÇÃO ---` +
                    `\nRecebido: |${resultadoFinal}|` +
                    `\nEsperado: |${esperado}|` +
                    `\nStatus: DIFERENTE`;

                setOutput(buffer + debugInfo);
                setConcluido(false);
            }

            if (!buffer) setOutput("✅ Código executado (sem saída de texto).");

        } catch (err: any) {
            setOutput(`❌ Erro de Execução:\n${err.message}`);
        }
    };

    const resetarCodigo = () => {
        if (confirm("Deseja descartar suas alterações e voltar ao código inicial?")) {
            const codigoInicial = challenge?.initialCode || "";
            setCode(codigoInicial);
            setOutput("Aguardando execução...");
            localStorage.removeItem(`code-${slug}`);
        }
    };

    useEffect(() => {
        if (slug && code && status === "ready") {
            localStorage.setItem(`code-${slug}`, code);
        }
    }, [code, slug, status]);

    if (status === "error") {
        return (
            <div className="h-screen bg-black flex items-center justify-center text-red-500 font-bold uppercase tracking-tighter">
                ❌ Erro: Desafio não encontrado no banco de dados.
            </div>
        );
    }

    if (status === "loading" || !challenge) {
        return (
            <div className="h-screen bg-[#09090b] flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#81FE88]/20 border-t-[#81FE88] rounded-full animate-spin mb-4"></div>
                <span className="text-[#81FE88] font-black italic uppercase tracking-widest text-[10px]">
                    Preparando Ambiente...
                </span>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-[#09090b] text-white overflow-hidden">
            <Script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js" strategy="lazyOnload" />

            {/* COLUNA 1: DESCRIÇÃO */}
            <div className="w-[30%] border-r border-zinc-800 p-8 overflow-y-auto bg-zinc-950/50">
                <h2 className="text-[#81FE88] font-black italic uppercase text-2xl mb-6 tracking-tighter leading-none">
                    {challenge.title}
                </h2>
                <div className="prose prose-invert text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
                    {challenge.description}
                </div>
            </div>

            {/* COLUNA 2: EDITOR */}
            <div className="w-[45%] border-r border-zinc-800 flex flex-col bg-zinc-900/10">
                <div className="p-4 bg-black/40 flex justify-between items-center border-b border-zinc-800">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#81FE88]/20"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">main.py</span>
                        </div>
                        <button onClick={resetarCodigo} className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-red-500/40 hover:bg-red-500/5 transition-all">
                            <span className="text-[10px] font-black uppercase italic text-zinc-400 group-hover:text-red-400 transition-colors">Resetar</span>
                        </button>
                    </div>
                    <button onClick={runPython} className="bg-[#81FE88] text-black px-8 py-2.5 rounded-xl font-black italic text-xs uppercase hover:scale-105 transition-all active:scale-95 shadow-[0_0_20px_rgba(129,254,136,0.15)]">
                        Executar Código
                    </button>
                </div>
                <div className="flex-1 overflow-hidden">
                    <Editor
                        height="100%"
                        theme="vs-dark"
                        defaultLanguage="python"
                        value={code}
                        onChange={(val) => setCode(val || "")}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: "JetBrains Mono, monospace",
                            automaticLayout: true,
                            wordWrap: "on"
                        }}
                    />
                </div>
            </div>

            {/* COLUNA 3: CONSOLE */}
            <div className="w-[25%] bg-black p-8 font-mono text-sm border-l border-zinc-800/50 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-6 h-10 min-h-[40px]">
                    <h3 className="text-zinc-600 font-bold uppercase text-[10px] tracking-[0.3em]">Console Output</h3>
                    {concluido && (
                        <button className="bg-[#81FE88] text-black px-4 py-1.5 rounded-lg font-black italic text-[10px] uppercase shadow-[0_0_20px_rgba(129,254,136,0.3)]">
                            Próximo ➔
                        </button>
                    )}
                </div>
                <div className={`flex-1 overflow-y-auto leading-relaxed whitespace-pre-wrap italic ${concluido ? "text-[#81FE88] font-bold" : "text-zinc-300"}`}>
                    {output}
                </div>
            </div>
        </div>
    );
}