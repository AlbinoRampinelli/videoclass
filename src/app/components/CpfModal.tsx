"use client";

import { useState, useEffect } from "react";
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
  
  // Se for Google, inicializamos como ALUNO e Visitante automaticamente
  const [userType, setUserType] = useState(isGoogleLogin ? "ALUNO" : ""); 
  const [schoolName, setSchoolName] = useState(isGoogleLogin ? "Visitante Digital" : "");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Máscaras de Input
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
    
    // Validação de segurança
    if (!userType) return setError("Por favor, selecione seu tipo de perfil.");
    if (cpf.length < 14) return setError("CPF incompleto.");
    if (phone.length < 14) return setError("Telefone incompleto.");

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        body: JSON.stringify({ 
          userId, 
          cpf, 
          phone,
          userType,
          schoolName 
        }), 
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        window.location.reload(); 
      } else {
        const data = await res.json();
        setError(data.error || "Ocorreu um erro ao salvar. Verifique se o CPF já está em uso.");
      }
    } catch (error) {
      setError("Falha na conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className={`bg-zinc-900 border ${error ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-zinc-800'} p-8 md:p-10 rounded-[3rem] max-w-md w-full transition-all duration-300 max-h-[90vh] overflow-y-auto`}>
        
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="text-[#81FE88]" size={16} />
          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
            {isGoogleLogin ? "Verificação de Segurança" : "Configuração de Perfil"}
          </span>
        </div>

        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-1">
          Olá{userName ? `, ${userName.split(' ')[0]}` : "!"}
        </h2>
        <p className="text-zinc-400 text-sm mb-6">
          {isGoogleLogin 
            ? "Para continuar sua compra, informe seu CPF e WhatsApp." 
            : "Complete seu perfil para acessar a plataforma."}
        </p>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase italic">
            <AlertTriangle size={20} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {/* CPF - SEMPRE VISÍVEL */}
            <label className="text-[10px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Documento (CPF)</label>
            <input
              required
              placeholder="000.000.000-00"
              className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:border-[#81FE88] transition-colors"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
            />

            {/* TELEFONE - SEMPRE VISÍVEL */}
            <label className="text-[10px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Whatsapp</label>
            <input
              required
              placeholder="(00) 00000-0000"
              className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:border-[#81FE88] transition-colors"
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
            />

            {/* CAMPOS CONDICIONAIS: SÓ APARECEM SE NÃO FOR GOOGLE */}
            {!isGoogleLogin && (
              <>
                <label className="text-[10px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Eu sou</label>
                <select 
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:border-[#81FE88] transition-colors appearance-none"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="ALUNO">Aluno</option>
                  <option value="PROFESSOR">Professor / Gestor</option>
                  <option value="PAI">Pai / Responsável</option>
                </select>

                <label className="text-[10px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Nome da Escola (Opcional)</label>
                <input
                  placeholder="Ex: Escola Estadual..."
                  className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:border-[#81FE88] transition-colors"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-[#81FE88] hover:bg-[#6ee474] text-black font-black py-5 rounded-2xl uppercase italic transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Finalizar e Acessar Vitrine"}
          </button>
        </form>
      </div>
    </div>
  );
}