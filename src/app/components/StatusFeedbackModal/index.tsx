"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface StatusFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "conflict" | "error";
  message: string;
}

export default function StatusFeedbackModal({ isOpen, onClose, type, message }: StatusFeedbackModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Só renderiza se estiver aberto e montado no cliente
  if (!isOpen || !mounted) return null;

  const config = {
    success: { title: "TUDO CERTO!", color: "text-[#81FE88]", icon: "✅" },
    conflict: { title: "VAGA JÁ GARANTIDA!", color: "text-yellow-400", icon: "🚀" },
    error: { title: "OPS!", color: "text-red-500", icon: "⚠️" },
  };

  const current = config[type] || config.error;

  return createPortal(
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
        <span className="text-5xl mb-4 block">{current.icon}</span>
        <h3 className={`${current.color} text-2xl font-black italic uppercase mb-2`}>
          {current.title}
        </h3>
        <p className="text-zinc-400 font-bold mb-6 italic leading-tight">
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full py-4 bg-zinc-800 text-white font-black uppercase italic rounded-2xl border border-zinc-700 hover:bg-[#81FE88] hover:text-black hover:border-[#81FE88] transition-all"
        >
          Entendido
        </button>
      </div>
    </div>,
    document.body
  );
}