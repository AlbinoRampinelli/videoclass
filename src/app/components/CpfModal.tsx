"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function CpfModal({ userName }: { userName: string }) {
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState(""); // Novo estado para celular
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { update } = useSession();

  // Máscara de CPF: 000.000.000-00
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(value);
  };

  // Máscara de Celular: (00) 00000-0000
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    setPhone(value);
  };

  const handleSubmit = async () => {
    if (cpf.length < 14) {
      setError("CPF incompleto.");
      return;
    }
    if (phone.length < 14) {
      setError("Celular incompleto.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cpf: cpf.replace(/\D/g, ""), 
          phone: phone.replace(/\D/g, "") 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao salvar os dados.");
        setLoading(false);
        return;
      }

      // O SEGREDO: Atualiza a sessão e espera um pouco antes do reload
      await update(); // Força o NextAuth a buscar os dados novos do banco
      
      // Pequeno delay para o servidor processar o novo cookie
      setTimeout(() => {
        window.location.reload(); 
      }, 500);
      
    } catch (err) {
      setError("Erro de conexão com o servidor.");
      setLoading(false); // Destrava o botão se der erro de rede
    }
  };
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">Olá, {userName}!</h2>
        <p className="text-zinc-400 mb-6 text-sm">
          Complete seu cadastro para acessar a plataforma.
        </p>
        
        <div className="space-y-4 text-left">
          {/* Campo CPF */}
          <div>
            <label className="text-xs text-zinc-500 ml-1">CPF</label>
            <input 
              type="text" 
              placeholder="000.000.000-00"
              disabled={loading}
              className={`w-full bg-black border ${error?.includes('CPF') ? 'border-red-500' : 'border-zinc-700'} rounded-xl p-4 text-white text-center focus:border-[#81FE88] outline-none transition-all`}
              value={cpf}
              onChange={handleCpfChange}
              maxLength={14}
            />
          </div>

          {/* Campo Celular */}
          <div>
            <label className="text-xs text-zinc-500 ml-1">CELULAR</label>
            <input 
              type="text" 
              placeholder="(00) 00000-0000"
              disabled={loading}
              className={`w-full bg-black border ${error?.includes('Celular') ? 'border-red-500' : 'border-zinc-700'} rounded-xl p-4 text-white text-center focus:border-[#81FE88] outline-none transition-all`}
              value={phone}
              onChange={handlePhoneChange}
              maxLength={15}
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-xs mt-4 text-center">{error}</p>}
        
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 bg-[#81FE88] text-black font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? "SALVANDO..." : "CONFIRMAR E ACESSAR"}
        </button>
      </div>
    </div>
  );
}