"use client";
import { useState } from "react";

export default function CpfModal({ userName }: { userName: string }) {
  const [cpf, setCpf] = useState("");

  // Função que aplica a máscara visual
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é número
    
    // Aplica a formatação 000.000.000-00
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    setCpf(value);
  };

  const handleSubmit = async () => {
    // Agora verificamos 14 caracteres (incluindo pontos e traço)
    if (cpf.length < 14) return alert("CPF incompleto. Digite os 11 números.");
    
    await fetch("/api/user/update-cpf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf }), // A API já limpa os pontos lá, então pode enviar assim
    });
    
    window.location.reload(); 
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Olá, {userName}!</h2>
        <p className="text-zinc-400 mb-6 text-sm">Para continuar, precisamos do seu CPF para validar sua matrícula.</p>
        
        <input 
          type="text" 
          placeholder="000.000.000-00"
          className="w-full bg-black border border-zinc-700 rounded-xl p-4 text-white mb-4 text-center focus:border-[#81FE88] outline-none transition-all"
          value={cpf}
          onChange={handleCpfChange}
          maxLength={14} // Limite máximo de caracteres com a máscara
        />
        
        <button 
          onClick={handleSubmit}
          className="w-full bg-[#81FE88] text-black font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform"
        >
          CONFIRMAR E ACESSAR
        </button>
      </div>
    </div>
  );
}