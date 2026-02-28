"use client";

import { useState, useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function CpfModal({ 
  userName, 
  userId, 
  isGoogleLogin = false 
}: { 
  userName: string, 
  userId?: string, 
  isGoogleLogin: boolean 
}) {
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState(isGoogleLogin ? "ALUNO" : ""); 
  const [schoolName, setSchoolName] = useState(isGoogleLogin ? "Visitante Digital" : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Referência para o primeiro input
  const inputRef = useRef<HTMLInputElement>(null);

  // Forçar foco ao abrir (crucial para Mobile/Chrome)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userType) return setError("Por favor, selecione seu tipo de perfil.");
    if (cpf.length < 14) return setError("CPF incompleto.");
    if (phone.length < 14) return setError("Telefone incompleto.");

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        body: JSON.stringify({ userId, cpf, phone, userType, schoolName }), 
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        window.location.reload(); 
      } else {
        const data = await res.json();
        setError(data.error || "Ocorreu um erro ao salvar.");
      }
    } catch (error) {
      setError("Falha na conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    // z-index altíssimo e pointer-events-auto para garantir o toque
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 pointer-events-auto">
      
      <div className={`relative z-[10000] bg-zinc-900 border ${error ? 'border-red-500' : 'border-zinc-800'} p-8 md:p-10 rounded-[3rem] max-w-md w-full transition-all duration-300 max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl`}>
        
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="text-[#81FE88]" size={16} />
          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
            Verificação de Segurança
          </span>
        </div>

        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-1">
          Olá{userName ? `, ${userName.split(' ')[0]}` : "!"}
        </h2>
        <p className="text-zinc-400 text-sm mb-6">
          Preencha para liberar seu acesso.
        </p>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase italic">
            <AlertTriangle size={20} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-[10001] space-y-4">
          <div className="space-y-3">
            
            <label className="text-[10px] font-black text-zinc-600 uppercase ml-2 tracking-widest italic">Documento (CPF)</label>
            <input
              ref={inputRef}
              required
              autoFocus
              type="text"
              inputMode="numeric" // Melhora o teclado no Phone
              placeholder="000.000.000-00"
              className="relative z-[10002] w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:border-[#81FE88] focus:ring-1 focus:ring-[#81FE88] transition-all"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
            />

            <label className="text-[10px] font-black text-zinc-600 uppercase ml-2 tracking-widest italic">Whatsapp</label>
            <input
              required
              type="text"
              inputMode="tel" // Teclado numérico no Phone
              placeholder="(00) 00000-0000"
              className="relative z-[10002] w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:border-[#81FE88] focus:ring-1 focus:ring-[#81FE88] transition-all"
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
            />

            {!isGoogleLogin && (
              <>
                <label className="text-[10px] font-black text-zinc-600 uppercase ml-2 tracking-widest italic">Eu sou</label>
                <select 
                  required
                  className="relative z-[10002] w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:border-[#81FE88] appearance-none"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="ALUNO">Aluno</option>
                  <option value="PROFESSOR">Professor / Gestor</option>
                  <option value="PAI">Pai / Responsável</option>
                </select>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative z-[10002] w-full mt-4 bg-[#81FE88] hover:bg-[#6ee474] text-black font-black py-5 rounded-2xl uppercase italic transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? "Gravando..." : "Finalizar e Acessar"}
          </button>
        </form>
      </div>
    </div>
  );
}