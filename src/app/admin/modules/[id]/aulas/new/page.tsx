"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Upload, Link as LinkIcon, FileText, FileVideo, ArrowLeft, Loader2 } from "lucide-react";

export default function NovaAulaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: moduleId } = use(params);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("");
  const [videoMode, setVideoMode] = useState<"url" | "upload">("url");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const inputStyle = "bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none transition-all w-full";
  const labelStyle = "text-[10px] uppercase font-black text-zinc-500 tracking-widest";

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Falha no upload do arquivo.");
    const data = await res.json();
    return data.url;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("O título é obrigatório.");
    setSaving(true);
    setError("");

    try {
      let finalVideoUrl = videoUrl.trim();
      let finalPdfUrl = "";

      if (videoMode === "upload" && videoFile) {
        finalVideoUrl = await uploadFile(videoFile);
      }

      if (pdfFile) {
        finalPdfUrl = await uploadFile(pdfFile);
      }

      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          moduleId,
          order: Number(order) || 0,
          url: finalVideoUrl || null,
          pdfUrl: finalPdfUrl || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao salvar aula.");
      }

      router.push(`/admin/modules/edit/${moduleId}`);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar aula.");
      setSaving(false);
    }
  }

  return (
    <div className="p-10 max-w-2xl mx-auto text-white">
      <button
        onClick={() => router.push(`/admin/modules/edit/${moduleId}`)}
        className="flex items-center gap-2 text-zinc-500 hover:text-[#81FE88] transition-colors mb-8 text-[10px] font-black uppercase"
      >
        <ArrowLeft size={14} /> Voltar ao Módulo
      </button>

      <h1 className="text-2xl font-black italic uppercase mb-8">
        Nova <span className="text-[#81FE88]">Aula</span>
      </h1>

      <form onSubmit={handleSave} className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl space-y-6">

        {/* TÍTULO */}
        <div className="flex flex-col gap-2">
          <label className={labelStyle}>Título da Aula *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex: 1.1 Instalação do Python"
            className={inputStyle}
          />
        </div>

        {/* DESCRIÇÃO */}
        <div className="flex flex-col gap-2">
          <label className={labelStyle}>Descrição (opcional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Breve descrição do conteúdo..."
            rows={3}
            className={`${inputStyle} resize-none`}
          />
        </div>

        {/* ORDEM */}
        <div className="flex flex-col gap-2">
          <label className={labelStyle}>Ordem de Exibição</label>
          <input
            type="number"
            value={order}
            onChange={e => setOrder(e.target.value)}
            placeholder="Ex: 1"
            className={`${inputStyle} w-32`}
          />
        </div>

        {/* VÍDEO */}
        <div className="flex flex-col gap-3">
          <label className={labelStyle + " text-[#81FE88]"}>Vídeo da Aula</label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setVideoMode("url")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                videoMode === "url"
                  ? "bg-[#81FE88]/10 border border-[#81FE88] text-[#81FE88]"
                  : "border border-zinc-800 text-zinc-500 hover:border-zinc-600"
              }`}
            >
              <LinkIcon size={12} /> URL
            </button>
            <button
              type="button"
              onClick={() => setVideoMode("upload")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                videoMode === "upload"
                  ? "bg-[#81FE88]/10 border border-[#81FE88] text-[#81FE88]"
                  : "border border-zinc-800 text-zinc-500 hover:border-zinc-600"
              }`}
            >
              <Upload size={12} /> Upload
            </button>
          </div>

          {videoMode === "url" ? (
            <input
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://..."
              className={inputStyle}
            />
          ) : (
            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-zinc-700 rounded-2xl p-8 cursor-pointer hover:border-[#81FE88]/50 transition-colors">
              <FileVideo size={28} className={videoFile ? "text-[#81FE88]" : "text-zinc-600"} />
              <span className="text-[10px] font-black uppercase text-zinc-500">
                {videoFile ? videoFile.name : "Clique para selecionar vídeo (MP4)"}
              </span>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={e => setVideoFile(e.target.files?.[0] || null)}
              />
            </label>
          )}
        </div>

        {/* PDF MATERIAL DE APOIO */}
        <div className="flex flex-col gap-3">
          <label className={labelStyle + " text-blue-400"}>Material de Apoio (PDF)</label>
          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-zinc-700 rounded-2xl p-8 cursor-pointer hover:border-blue-400/50 transition-colors">
            <FileText size={28} className={pdfFile ? "text-blue-400" : "text-zinc-600"} />
            <span className="text-[10px] font-black uppercase text-zinc-500">
              {pdfFile ? pdfFile.name : "Clique para selecionar PDF (opcional)"}
            </span>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={e => setPdfFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        {error && (
          <div className="text-red-400 text-[11px] font-bold uppercase bg-red-500/5 border border-red-500/20 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#81FE88] text-black font-black uppercase italic py-4 rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Salvando..." : "Salvar Aula"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/admin/modules/edit/${moduleId}`)}
            className="px-8 border border-zinc-800 rounded-2xl font-black uppercase italic text-[10px]"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
