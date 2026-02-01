"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// 1. O Componente de Conteúdo (onde a lógica acontece)
function CheckoutContent() {
    const searchParams = useSearchParams();
    const courseId = searchParams.get("id");

    const dadosDosCursos: any = {
        "1": { nome: "Curso de Python", preco: "297,00", pixData: "pagamento-python" },
        "2": { nome: "Oficina de Robótica", preco: "197,00", pixData: "pagamento-robotica" },
        "3": { nome: "STEAM Especial", preco: "147,00", pixData: "pagamento-steam" },
    };

    const cursoAtual = courseId ? dadosDosCursos[courseId] : null;

    const finalizarPagamento = () => {
        if (courseId) {
            const cache = JSON.parse(localStorage.getItem("meus_cursos") || "[]");
            if (!cache.includes(courseId)) {
                cache.push(courseId);
                localStorage.setItem("meus_cursos", JSON.stringify(cache));
            }
        }
        window.location.href = "/";
    };

    if (!courseId || !cursoAtual) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <button onClick={() => window.location.href = "/"} className="bg-[#81FE88] text-black px-6 py-2 rounded-full font-bold">
                    Voltar para a Vitrine
                </button>
            </div>
        );
    }

    // Gerador de QR Code dinâmico para não precisar de arquivos de imagem
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${cursoAtual.pixData}`;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl">
                <h1 className="text-3xl font-black italic uppercase mb-2">{cursoAtual.nome}</h1>
                <p className="text-[#81FE88] text-2xl font-black mb-6">R$ {cursoAtual.preco}</p>

                <div className="bg-white p-4 rounded-3xl inline-block mb-8">
                    <img
                        src={qrCodeUrl}
                        alt="Pix"
                        className="w-48 h-48 cursor-pointer"
                        onClick={finalizarPagamento}
                    />
                </div>

                <button
                    onClick={finalizarPagamento}
                    className="w-full bg-[#81FE88] text-black font-black py-4 rounded-full uppercase italic"
                >
                    Confirmar Pagamento
                </button>
            </div>
        </div>
    );
}

// 2. O EXPORT DEFAULT (O Next.js exige que seja uma função válida)
export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <CheckoutContent />
        </Suspense>
    );
}