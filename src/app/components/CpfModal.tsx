"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react"; // Importe um ícone para dar peso visual

export default function CpfModal({ userName }: { userName: string }) {
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<"PAI" | "ALUNO">("PAI");
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Estado para o erro

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null); // Reseta o erro ao tentar novamente

    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        body: JSON.stringify({ cpf, phone, userType, schoolName }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        window.location.reload(); 
      } else {
        const data = await res.json();
        // Mensagem impactante
        setError(data.error || "Este CPF já está cadastrado em nossa base.");
      }
    } catch (error) {
      setError("Falha na conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className={`bg-zinc-900 border ${error ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-shake' : 'border-zinc-800'} p-10 rounded-[3rem] max-w-md w-full shadow-2xl transition-all duration-300`}>
        
        <h2 className="text-2xl font-black text-white italic uppercase mb-2">Olá, {userName}!</h2>
        <p className="text-zinc-500 text-xs font-bold uppercase mb-8">Precisamos completar seu perfil para continuar.</p>

        {/* MENSAGEM DE ERRO EM VERMELHO VIBRANTE */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center gap-3">
            <AlertTriangle className="text-red-500 shrink-0" size={20} />
            <p className="text-red-500 text-xs font-black uppercase leading-tight">
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUserType("PAI")}
              className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${userType === 'PAI' ? 'bg-[#81FE88] text-black' : 'bg-zinc-800 text-zinc-500'}`}
            >
              Sou Pai / Mãe
            </button>
            <button
              type="button"
              onClick={() => setUserType("ALUNO")}
              className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${userType === 'ALUNO' ? 'bg-[#81FE88] text-black' : 'bg-zinc-800 text-zinc-500'}`}
            >
              Sou Aluno
            </button>
          </div>

          <div className="space-y-4">
            <input
              required
              placeholder="Seu CPF"
              className={`w-full bg-zinc-800 border ${error ? 'border-red-500/50' : 'border-zinc-700'} p-4 rounded-2xl text-white outline-none focus:border-[#81FE88] transition-colors`}
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
            />

            <input
              required
              placeholder="WhatsApp (com DDD)"
              className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:border-[#81FE88] transition-colors"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              required
              placeholder="Qual sua escola?"
              className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:border-[#81FE88] transition-colors"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${error ? 'bg-red-500 hover:bg-red-600' : 'bg-[#81FE88] hover:bg-[#6ee474]'} text-black font-black py-5 rounded-2xl uppercase italic transition-all shadow-lg`}
          >
            {loading ? "Verificando..." : error ? "Tentar Novamente" : "Acessar Vitrine"}
          </button>
        </form>
      </div>

      {/* Estilo para a animação de tremor */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
}