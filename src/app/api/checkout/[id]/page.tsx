"use client";

import { useState, use } from "react";

export default function CheckoutNovo({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [loading, setLoading] = useState(false);
    // Use any por enquanto para evitar erros de tipagem no teste
    const [dadosPix, setDadosPix] = useState<any>(null);
    const [valor, setValor] = useState<number>(0);

    const gerarPix = async () => {
    setLoading(true);
    console.log("Iniciando gerarPix...");
    try {
        const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courseId: id })
        });
        const data = await res.json();

        // Se o log diz que esse campo existe, o React VAI atualizar:
        if (data?.point_of_interaction?.transaction_data) {
            setValor(Number(data.transaction_amount));
            setDadosPix({ ...data.point_of_interaction.transaction_data });
            console.log("ESTADO ATUALIZADO!"); 
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
};
    };
    console.log("RENDERIZANDO COMPONENTE - dadosPix atual:", dadosPix);
    return (
        <div className="p-6 max-w-md mx-auto min-h-screen bg-white text-zinc-900 font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-black italic uppercase text-zinc-900">Checkout</h1>
                <div className="bg-red-500 text-white p-2 text-xs">
                    DADO NO HTML: {dadosPix ? "CHEGOU!" : "ESTÁ NULO"}
                </div>
                <div className="h-2 w-20 bg-yellow-400 mt-2"></div>
            </div>

            {/* LOG DE TESTE DIRETO NA TELA */}
            {/* <p className="text-[8px]">Status: {dadosPix ? "Pix Gerado" : "Aguardando"}</p> */}

            {!dadosPix ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                        <p className="text-xs font-bold text-zinc-400 uppercase">Produto:</p>
                        <p className="text-xl font-black uppercase tracking-tighter">Curso ID: {id}</p>
                    </div>

                    <button
                        onClick={gerarPix}
                        disabled={loading}
                        className="w-full bg-yellow-400 p-6 rounded-[2rem] font-black text-xl shadow-lg hover:bg-yellow-300 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? "PROCESSANDO..." : "GERAR PIX AGORA"}
                    </button>
                </div>
            ) : (
                <div className="animate-in zoom-in duration-300">
                    <div className="bg-zinc-900 text-white p-6 rounded-t-[2.5rem] text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Valor a pagar</p>
                        <p className="text-4xl font-black italic">R$ {valor.toFixed(2)}</p>
                    </div>

                    <div className="bg-zinc-50 p-8 rounded-b-[2.5rem] border-2 border-t-0 border-zinc-100 flex flex-col items-center">
                        {dadosPix.qr_code_base64 && (
                            <img
                                src={`data:image/png;base64,${dadosPix.qr_code_base64}`}
                                className="w-56 h-56 rounded-xl mb-6 shadow-sm bg-white p-2 border border-zinc-200"
                                alt="QR Code Pix"
                            />
                        )}

                        <p className="text-[10px] text-zinc-400 font-bold mb-4 uppercase text-center">
                            Escaneie o QR Code ou copie o código abaixo
                        </p>

                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(dadosPix.qr_code);
                                alert("Código Pix copiado!");
                            }}
                            className="w-full bg-yellow-400 text-black p-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-yellow-300 transition-colors"
                        >
                            Copiar Código Copia e Cola
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}