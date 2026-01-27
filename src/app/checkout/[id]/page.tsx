'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Copy, Check, Loader2, Google } from "lucide-react"; // Se não tiver o ícone Google, pode remover
import Link from "next/link";
import { useSession } from "next-auth/react"; // Precisamos do hook para ver se está logado

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession(); // 'loading', 'authenticated' ou 'unauthenticated'
  
  const [loadingPix, setLoadingPix] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // 1. Função que gera o PIX (SÓ RODA SE ESTIVER LOGADO)
  const gerarPix = async () => {
    if (status !== "authenticated") return;
    
    setLoadingPix(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: id, paymentMethod: 'pix' }),
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPixData(data);
    } catch (err) {
      alert("Erro ao gerar Pix. Verifique seu cadastro.");
    } finally {
      setLoadingPix(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      gerarPix();
    }
  }, [status, id]);

  const copiarPix = () => {
    navigator.clipboard.writeText(pixData.point_of_interaction.transaction_data.qr_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // TELA A: Carregando Sessão
  if (status === "loading") {
    return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white italic">Verificando...</div>;
  }

  // TELA B: VISITANTE NÃO LOGADO (A EXPLICAÇÃO QUE FALTAVA)
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-10 rounded-[40px] text-center shadow-2xl">
          <h2 className="text-[#81FE88] font-black text-2xl mb-4 italic uppercase italic">Quase lá!</h2>
          <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
            Para realizar sua matrícula e liberar seu acesso, precisamos que você ou cadastre-se ou acesse logado.
          </p>
          <Link 
            href={`/api/auth/signin?callbackUrl=/checkout/${id}`}
            className="w-full py-5 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-[#81FE88] transition-all uppercase text-xs"
          >
            Basta pressionar aqui !!
          </Link>
        </div>
      </div>
    );
  }

  // TELA C: USUÁRIO LOGADO - MOSTRA O QR CODE
  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 flex flex-col items-center justify-center">
      {loadingPix ? (
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-[#81FE88]" size={40} />
            <p className="font-bold italic">GERANDO SEU PIX...</p>
        </div>
      ) : (
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 text-center shadow-2xl">
          <h1 className="text-xl font-black mb-8 uppercase italic">Pagamento Via Pix</h1>
          
          {pixData && (
            <div className="flex flex-col items-center gap-6">
              <div className="bg-white p-4 rounded-2xl">
                <img 
                  src={`data:image/jpeg;base64,${pixData.point_of_interaction.transaction_data.qr_code_base64}`} 
                  alt="QR Code Pix"
                  className="w-56 h-56"
                />
              </div>
              
              <div className="w-full">
                <button 
                  onClick={copiarPix}
                  className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-between hover:border-[#81FE88] transition-all"
                >
                  <span className="text-[10px] text-zinc-400 truncate pr-4">{pixData.point_of_interaction.transaction_data.qr_code}</span>
                  {copied ? <Check size={18} className="text-[#81FE88]" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}