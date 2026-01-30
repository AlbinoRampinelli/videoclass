"use client";
import { useState, use, useEffect } from "react";

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params);
  const [loading, setLoading] = useState(false);
  const [dadosPix, setDadosPix] = useState<any>(null);
  const [metodo, setMetodo] = useState<"pix" | "card">("pix");
  const [statusPagamento, setStatusPagamento] = useState<"pendente" | "aprovado">("pendente");

  // Simulação para seus parceiros: Se eles clicarem no QR Code, o sistema "aprova"
  // Na vida real, isso será substituído por um useEffect que checa a API
  const simularAprovacao = () => {
  // Pega o que já tem, adiciona o novo curso e salva
  const compras = JSON.parse(localStorage.getItem("meus_cursos") || "[]");
  if (!compras.includes(courseId)) {
    compras.push(courseId);
    localStorage.setItem("meus_cursos", JSON.stringify(compras));
  }
  
  // Manda para a vitrine para o parceiro ver o botão mudado
  window.location.href = "/vitrine"; 
};

  const gerarPagamento = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId })
      });
      const data = await res.json();
      
      if (data?.point_of_interaction?.transaction_data) {
        setDadosPix(data.point_of_interaction.transaction_data);
        setStatusPagamento("pendente");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto min-h-screen bg-white text-black font-sans">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">Checkout</h1>
        <div className="h-1.5 w-12 bg-yellow-400 mx-auto rounded-full"></div>
      </div>

      {statusPagamento === "aprovado" ? (
        /* --- TELA DE SUCESSO (O QUE VOCÊ QUERIA) --- */
        <div className="text-center animate-in zoom-in-95 duration-500 py-10">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-black uppercase mb-2">Pagamento Confirmado!</h2>
          <p className="text-zinc-500 text-sm font-bold mb-10 uppercase tracking-widest">O curso já está disponível na sua área de membros.</p>
          
          <button
            onClick={() => window.location.href = "/dashboard"} // Ajuste para sua rota de membros
            className="w-full p-6 bg-black text-white font-black rounded-[2rem] hover:scale-105 transition-all uppercase italic shadow-2xl"
          >
            ACESSAR CURSO AGORA
          </button>
        </div>
      ) : (
        /* --- FLUXO DE PAGAMENTO --- */
        <>
          {!dadosPix && (
            <div className="flex bg-zinc-100 p-1.5 rounded-[1.5rem] mb-10 border border-zinc-200">
              <button onClick={() => setMetodo("pix")} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${metodo === "pix" ? "bg-white shadow-md text-black" : "text-zinc-400"}`}>Pix</button>
              <button onClick={() => setMetodo("card")} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${metodo === "card" ? "bg-white shadow-md text-black" : "text-zinc-400"}`}>Cartão</button>
            </div>
          )}

          <div className="min-h-[350px]">
            {!dadosPix ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {metodo === "pix" ? (
                  <div className="text-center">
                    <p className="text-[11px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-8">Aprovação Instantânea</p>
                    <button
                      onClick={gerarPagamento}
                      disabled={loading}
                      className="w-full p-6 bg-yellow-400 text-black font-black rounded-[2rem] hover:bg-yellow-300 active:scale-95 disabled:opacity-50 shadow-xl uppercase italic"
                    >
                      {loading ? "PROCESSANDO..." : "GERAR PIX AGORA"}
                    </button>
                  </div>
                ) : (
                  <div className="text-center opacity-40">
                    <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[2.5rem] p-16 mb-4">Módulo Cartão</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center animate-in zoom-in-95 duration-500">
                 <div className="bg-white p-6 rounded-[3rem] shadow-sm inline-block mb-8 border border-zinc-100 cursor-pointer" onClick={simularAprovacao} title="Clique aqui para simular a aprovação">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(dadosPix.qr_code)}`}
                      alt="QR Code"
                      className="w-44 h-44"
                    />
                 </div>
                 
                 <div className="space-y-4">
                   <button
                      onClick={() => {
                        navigator.clipboard.writeText(dadosPix.qr_code);
                        alert("Código Copiado!");
                      }}
                      className="w-full bg-black text-white py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-widest shadow-xl"
                    >
                      Copiar Código Pix
                    </button>
                    <button onClick={() => setDadosPix(null)} className="text-[10px] font-bold text-zinc-300 uppercase underline block mx-auto">Voltar</button>
                 </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="mt-12 text-center text-[9px] font-bold text-zinc-300 uppercase tracking-[0.3em]">
        Pagamento Seguro Mercado Pago
      </div>
    </div>
  );
}