"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CpfModal({ userName }: { userName: string }) {
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<"PAI" | "ALUNO">("PAI"); // Novo
  const [schoolName, setSchoolName] = useState(""); // Novo
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        body: JSON.stringify({ 
          cpf, 
          phone, 
          userType, 
          schoolName 
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        // Recarrega a página para o `userDb` vir atualizado e o modal sumir
        window.location.reload(); 
      } else {
        alert("Erro ao salvar dados. Verifique o CPF.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-black text-white italic uppercase mb-2">Olá, {userName}!</h2>
        <p className="text-zinc-500 text-xs font-bold uppercase mb-8">Precisamos completar seu perfil para continuar.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Seleção de Quem é você */}
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

          <input
            required
            placeholder="Seu CPF"
            className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:border-[#81FE88]"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
          />

          <input
            required
            placeholder="WhatsApp (com DDD)"
            className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:border-[#81FE88]"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            required
            placeholder="Qual sua escola?"
            className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:border-[#81FE88]"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#81FE88] text-black font-black py-5 rounded-2xl uppercase italic hover:bg-[#6ee474] transition-all"
          >
            {loading ? "Salvando..." : "Acessar Vitrine"}
          </button>
        </form>
      </div>
    </div>
  );
}