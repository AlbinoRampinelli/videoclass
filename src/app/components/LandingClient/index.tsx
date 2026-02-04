// src/app/LandingClient.tsx
"use client"
import { useState } from "react";
import ModalLogin from '../../components/ModalLogin';

export default function LandingClient({ courseId, isOnlyButton }: { courseId?: string, isOnlyButton?: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isOnlyButton) {
    return (
      <>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#81FE88] text-black px-6 py-2 rounded-full font-bold text-sm">
          Entrar
        </button>
        <ModalLogin isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full py-4 bg-white text-black rounded-2xl font-black text-sm text-center hover:bg-[#81FE88] transition-colors uppercase"
      >
        Quero me matricular
      </button>

      <ModalLogin
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        callbackUrl={`/vitrine?courseId=${courseId}`}
      />
    </>
  );
}