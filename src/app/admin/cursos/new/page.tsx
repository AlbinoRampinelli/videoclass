"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const inputStyle =
  "bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none transition-all w-full";
const labelStyle = "text-[10px] uppercase font-black text-zinc-500 tracking-widest";

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [features, setFeatures] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toSlug(s: string) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("O título é obrigatório.");
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: toSlug(title.trim()),
          price: parseFloat(price) || 0,
          duration: duration.trim() || null,
          features: features.split(",").map((f) => f.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao criar curso.");
      }
      const course = await res.json();
      router.push(`/admin/cursos/${course.id}`);
    } catch (err: any) {
      setError(err.message || "Erro ao criar curso.");
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <Link
        href="/admin/cursos"
        className="flex items-center gap-2 text-zinc-500 hover:text-[#81FE88] transition-colors text-[10px] font-black uppercase"
      >
        <ArrowLeft size={14} /> Voltar aos Cursos
      </Link>

      <h1 className="text-2xl font-black italic uppercase text-white">
        Novo <span className="text-[#81FE88]">Curso</span>
      </h1>

      <form onSubmit={handleSubmit} className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl space-y-6">
        <div className="flex flex-col gap-2">
          <label className={labelStyle}>Nome da Oficina *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Oficina de Robótica" className={inputStyle} />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className={labelStyle}>Preço (R$)</label>
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00" className={inputStyle} />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelStyle}>Duração</label>
            <input value={duration} onChange={(e) => setDuration(e.target.value)}
              placeholder="Ex: 40h" className={inputStyle} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelStyle}>Tópicos (separados por vírgula)</label>
          <textarea value={features} onChange={(e) => setFeatures(e.target.value)}
            rows={3} placeholder="Certificado, Acesso Vitalício, Kit Incluso"
            className={`${inputStyle} resize-none`} />
        </div>

        {error && (
          <div className="text-red-400 text-[11px] font-bold uppercase bg-red-500/5 border border-red-500/20 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex gap-4 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 bg-[#81FE88] text-black font-black uppercase italic py-4 rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Criando..." : "Criar Curso"}
          </button>
          <button type="button" onClick={() => router.push("/admin/cursos")}
            className="px-8 border border-zinc-800 rounded-2xl font-black uppercase italic text-[10px]">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
