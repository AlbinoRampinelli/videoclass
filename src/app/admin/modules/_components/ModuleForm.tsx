"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Link as LinkIcon, FileText, FileVideo, ArrowLeft, Loader2 } from "lucide-react";

interface Course {
  id: string;
  title: string;
}

interface ModuleFormProps {
  courses: Course[];
  /** Preenche os campos quando estiver editando */
  initial?: {
    id: string;
    title: string;
    courseId: string;
    order: number;
    videoUrl: string | null;
    pdfUrl: string | null;
  };
  /** Para pré-selecionar o curso ao criar a partir da página do curso */
  defaultCourseId?: string;
  /** Se true, redireciona de volta para o curso após salvar */
  backToCourseId?: string;
  isNew?: boolean;
}

const inputStyle =
  "bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none transition-all w-full";
const labelStyle = "text-[10px] uppercase font-black text-zinc-500 tracking-widest";

export default function ModuleForm({ courses, initial, defaultCourseId, backToCourseId, isNew }: ModuleFormProps) {
  const router = useRouter();
  const isEditing = !!initial && !isNew;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [courseId, setCourseId] = useState(initial?.courseId ?? defaultCourseId ?? "");
  const [order, setOrder] = useState(String(initial?.order ?? ""));
  const [videoMode, setVideoMode] = useState<"url" | "upload">(initial?.videoUrl ? "url" : "url");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState(initial?.pdfUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Falha no upload do arquivo.");
    return (await res.json()).url;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("O título é obrigatório.");
    if (!courseId) return setError("Selecione uma oficina.");
    setSaving(true);
    setError("");

    try {
      let finalVideoUrl = videoMode === "url" ? videoUrl.trim() : "";
      let finalPdfUrl = existingPdfUrl;

      if (videoMode === "upload" && videoFile) {
        finalVideoUrl = await uploadFile(videoFile);
      }
      if (pdfFile) {
        finalPdfUrl = await uploadFile(pdfFile);
      }

      const url = isEditing
        ? `/api/admin/modules/${initial!.id}`
        : "/api/admin/modules";

      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          courseId,
          order: Number(order) || 0,
          videoUrl: finalVideoUrl || null,
          pdfUrl: finalPdfUrl || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao salvar módulo.");
      }

      if (isEditing) {
        router.push(`/admin/modules/edit/${initial!.id}`);
        router.refresh();
      } else if (backToCourseId) {
        router.push(`/admin/cursos/${backToCourseId}`);
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao salvar módulo.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl space-y-6">

      {/* OFICINA */}
      <div className="flex flex-col gap-2">
        <label className={labelStyle}>Pertence à Oficina *</label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#81FE88] outline-none appearance-none cursor-pointer"
        >
          <option value="">Selecione a Oficina...</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* TÍTULO */}
      <div className="flex flex-col gap-2">
        <label className={labelStyle}>Nome do Módulo *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Introdução a Variáveis"
          className={inputStyle}
        />
      </div>

      {/* ORDEM */}
      <div className="flex flex-col gap-2">
        <label className={labelStyle}>Ordem de Exibição</label>
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          placeholder="Ex: 1"
          className={`${inputStyle} w-32`}
        />
      </div>

      {/* VÍDEO */}
      <div className="flex flex-col gap-3">
        <label className={`${labelStyle} text-[#81FE88]`}>Vídeo do Módulo</label>

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
            onChange={(e) => setVideoUrl(e.target.value)}
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
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            />
          </label>
        )}
      </div>

      {/* PDF */}
      <div className="flex flex-col gap-3">
        <label className={`${labelStyle} text-blue-400`}>Material de Apoio (PDF)</label>

        {existingPdfUrl && !pdfFile && (
          <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
            <span className="text-blue-400 text-[10px] font-black uppercase">PDF atual carregado</span>
            <button
              type="button"
              onClick={() => setExistingPdfUrl("")}
              className="text-red-500/60 hover:text-red-500 text-[9px] font-black uppercase transition-colors"
            >
              Remover
            </button>
          </div>
        )}

        <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-zinc-700 rounded-2xl p-8 cursor-pointer hover:border-blue-400/50 transition-colors">
          <FileText size={28} className={pdfFile ? "text-blue-400" : "text-zinc-600"} />
          <span className="text-[10px] font-black uppercase text-zinc-500">
            {pdfFile
              ? pdfFile.name
              : isEditing
              ? "Clique para substituir o PDF (opcional)"
              : "Clique para selecionar PDF (opcional)"}
          </span>
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
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
          {saving ? "Salvando..." : isEditing ? "Salvar Módulo" : "Registrar Módulo"}
        </button>
        <button
          type="button"
          onClick={() => router.push(isEditing ? `/admin/modules/edit/${initial!.id}` : "/admin")}
          className="px-8 border border-zinc-800 rounded-2xl font-black uppercase italic text-[10px]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
