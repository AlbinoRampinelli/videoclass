"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ToggleOpenButton({ courseId, isOpen }: { courseId: string; isOpen: boolean }) {
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(isOpen);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen: !current }),
    });
    if (res.ok) {
      setCurrent((v) => !v);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase italic text-sm transition-all disabled:opacity-50 ${
        current
          ? "bg-[#81FE88] text-black hover:scale-[1.02]"
          : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-500"
      }`}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      <span className={`w-3 h-3 rounded-full ${current ? "bg-black" : "bg-zinc-600"}`} />
      {current ? "Aberto para Matrícula" : "Fechado para Matrícula"}
    </button>
  );
}
