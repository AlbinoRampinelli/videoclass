"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function CheckoutContent() {
    const searchParams = useSearchParams();
    const courseId = searchParams.get("id");
    const [cursoAtual, setCursoAtual] = useState<{ nome: string, preco: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [matriculando, setMatriculando] = useState(false);
    const dadosDosCursos: any = {
        "1": { nome: "Curso de Python", preco: "297,00", pixData: "pagamento-python" },
        "2": { nome: "Oficina de Robótica", preco: "197,00", pixData: "pagamento-robotica" },
        "3": { nome: "STEAM Especial", preco: "147,00", pixData: "pagamento-steam" },

        // ⬇️ ADICIONA O TEU NOVO CURSO AQUI EMBAIXO ⬇️
        "COLE_AQUI_O_ID_DO_PYTHON": {
            nome: "Oficina de Python",
            preco: "97,00",
            pixData: "pagamento-oficina-python"
        },
    };
    useEffect(() => {
        async function carregarCurso() {
            if (!courseId) return;

            try {
                // Buscamos os dados do curso que você cadastrou no Admin
                const response = await fetch(`/api/courses/${courseId}`);
                const data = await response.json();

                if (response.ok && data.title && data.price != null) {
                    setCursoAtual({
                        nome: data.title,
                        preco: data.price.toString()
                    });
                }
            } catch (error) {
                console.error("Erro ao buscar curso:", error);
            } finally {
                setLoading(false);
            }
        }
        carregarCurso();
    }, [courseId]);

    const finalizarPagamento = async () => {
        if (!courseId || matriculando) return;
        setMatriculando(true);
        try {
            await fetch("/api/enrollments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId }),
            });
        } catch (e) {
            console.error("Erro ao matricular:", e);
        }
        window.location.href = "/vitrine";
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-[#81FE88] animate-pulse">CARREGANDO...</div>;

    if (!courseId || !cursoAtual) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <button onClick={() => window.location.href = "/vitrine"} className="bg-[#81FE88] text-black px-6 py-2 rounded-full font-bold uppercase italic">
                    Curso não encontrado - Voltar
                </button>
            </div>
        );
    }

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pagamento-${courseId}`;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl">
                <h1 className="text-3xl font-black italic uppercase mb-2 leading-tight">{cursoAtual.nome}</h1>
                <p className="text-[#81FE88] text-2xl font-black mb-6 italic">R$ {cursoAtual.preco}</p>

                <div className="bg-white p-4 rounded-3xl inline-block mb-8 hover:scale-105 transition-transform duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    <img
                        src={qrCodeUrl}
                        alt="Pix"
                        className="w-48 h-48 cursor-pointer"
                        title="Clique no QR Code para simular o pagamento"
                        onClick={finalizarPagamento}
                    />
                </div>

                <p className="text-zinc-500 text-[10px] uppercase font-bold mb-6 tracking-widest">Clique no QR Code para confirmar</p>

                <button
                    onClick={finalizarPagamento}
                    disabled={matriculando}
                    className="w-full bg-[#81FE88] text-black font-black py-4 rounded-full uppercase italic hover:bg-white transition-colors disabled:opacity-60"
                >
                    {matriculando ? "Matriculando..." : "Confirmar Pagamento"}
                </button>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <CheckoutContent />
        </Suspense>
    );
}