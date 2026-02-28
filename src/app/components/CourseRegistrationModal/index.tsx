"use client";

import { createPortal } from "react-dom";
import { X, User, Mail, Smartphone, Fingerprint, ArrowRight, School, BookOpen, Users } from "lucide-react";
import React, { useState, useEffect } from "react";

interface CourseRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cursoId: string | null;
  cursoNome?: string;
  openFeedback: (type: "success" | "conflict" | "error", msg: string) => void; // A CHAVE DO SUCESSO
  userDefaultData?: {
    nome: string;
    email: string;
  };
}

export default function CourseRegistrationModal({
  isOpen,
  onClose,
  cursoId,
  cursoNome,
  openFeedback,
  userDefaultData,
  onSuccess,
}: CourseRegistrationModalProps) { // Use o nome novo aqui
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Garante que o Portal não quebre no Next.js (SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  // ... (imports permanecem iguais)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      nome: formData.get("nome"),
      email: formData.get("email"),
      cpf: String(formData.get("cpf")).replace(/\D/g, ""),
      whatsapp: String(formData.get("whatsapp")).replace(/\D/g, ""),
      escola: formData.get("escola"),
      userType: formData.get("userType"),
      cursoId: cursoId,
    };

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onClose(); // Sai da frente primeiro!
        if (onSuccess && cursoId) {
          onSuccess(cursoId);
        }
        if (typeof openFeedback === 'function') {
          setTimeout(() => {
            openFeedback("success", "Sua reserva foi concluída!");
          }, 200);
        }
      }
    } catch (err) {
      console.error("Erro:", err);
      if (openFeedback) openFeedback("error", "Erro ao processar solicitação.");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // ... (resto do componente permanece igual)
  const inputStyle = "w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:border-[#81FE88] focus:outline-none transition-all font-bold italic";

  // O Portal joga o modal para fora do Aside/Card, direto no Body
  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/98 backdrop-blur-xl p-4 pointer-events-auto">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-[2.5rem] p-8 md:p-12 relative shadow-2xl overflow-y-auto max-h-[95vh]">

        <button type="button" onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-[#81FE88] transition-colors">
          <X size={28} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
            Quase lá! <br />
            <span className="text-[#81FE88]">Garanta sua vaga</span>
          </h2>
          {cursoNome && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#81FE88]/10 border border-[#81FE88]/20">
              <BookOpen size={14} className="text-[#81FE88]" />
              <p className="text-[#81FE88] text-[10px] font-black uppercase tracking-widest">Curso: {cursoNome}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* CAMPO NOVO: TIPO DE PERFIL */}
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81FE88]/50" size={20} />
            <select name="userType" required defaultValue="" className={`${inputStyle} appearance-none cursor-pointer`}>
              <option value="" disabled className="bg-zinc-900 text-zinc-500">
                QUEM É VOCÊ? (SELECIONE)
              </option>
              <option value="PAI" className="bg-zinc-900">
                SOU PAI / MÃE / RESPONSÁVEL
              </option>
              <option value="ALUNO" className="bg-zinc-900">
                SOU O ALUNO
              </option>
              <option value="PROFESSOR" className="bg-zinc-900">
                SOU PROFESSOR
              </option>
              <option value="OUTRO" className="bg-zinc-900">
                OUTRO
              </option>
            </select>
          </div>

          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81FE88]/50" size={20} />
            <input name="nome" required type="text" placeholder="NOME" defaultValue={userDefaultData?.nome} className={inputStyle} />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81FE88]/50" size={20} />
            <input name="email" required type="email" placeholder="E-MAIL" defaultValue={userDefaultData?.email} className={inputStyle} />
          </div>

          <div className="relative">
            <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81FE88]/50" size={20} />
            <input name="cpf" required type="text" maxLength={11} placeholder="CPF (APENAS NÚMEROS)" className={inputStyle} />
          </div>

          <div className="relative">
            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81FE88]/50" size={20} />
            <input name="whatsapp" required type="tel" placeholder="WHATSAPP" className={inputStyle} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#81FE88] hover:bg-white text-black font-[1000] py-5 rounded-2xl uppercase italic flex items-center justify-center gap-2 transition-all mt-4"
          >
            {loading ? "PROCESSANDO..." : "RESERVAR MINHA MATRÍCULA"}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}