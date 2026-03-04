"use client";

import { useState } from "react";
import { Terminal, Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  slug: string;
  description: string;
  initialCode: string;
  expected: string;
  order: number;
}

interface ChallengeSectionProps {
  courseSlug: string;
  moduleId?: string;
  videoId?: string;
  initialChallenges: Challenge[];
}

function toSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const inputStyle =
  "bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-[#81FE88] outline-none transition-all w-full text-sm";
const labelStyle = "text-[10px] uppercase font-black text-zinc-500 tracking-widest";
const emptyForm = { title: "", slug: "", description: "", initialCode: "", expected: "" };

function ChallengeForm({
  form,
  editingId,
  saving,
  error,
  onChange,
  onSave,
  onCancel,
}: {
  form: typeof emptyForm;
  editingId: string;
  saving: boolean;
  error: string;
  onChange: (f: typeof emptyForm) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelStyle}>Título *</label>
          <input
            value={form.title}
            onChange={(e) => {
              const t = e.target.value;
              onChange({ ...form, title: t, slug: editingId === "new" ? toSlug(t) : form.slug });
            }}
            placeholder="Ex: Hello World"
            className={inputStyle}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelStyle}>Slug (URL) *</label>
          <input
            value={form.slug}
            onChange={(e) => onChange({ ...form, slug: e.target.value })}
            placeholder="hello-world"
            className={`${inputStyle} font-mono text-xs`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelStyle}>Instruções</label>
        <textarea
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          rows={3}
          placeholder="Explique o que o aluno deve fazer..."
          className={`${inputStyle} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelStyle}>Código Inicial (Python)</label>
          <textarea
            value={form.initialCode}
            onChange={(e) => onChange({ ...form, initialCode: e.target.value })}
            rows={6}
            placeholder="# Escreva seu código aqui"
            className={`${inputStyle} font-mono text-xs resize-none`}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={`${labelStyle} text-[#81FE88]`}>Saída Esperada *</label>
          <textarea
            value={form.expected}
            onChange={(e) => onChange({ ...form, expected: e.target.value })}
            rows={6}
            placeholder="O que o terminal deve mostrar..."
            className={`${inputStyle} font-mono text-xs text-[#81FE88] resize-none`}
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-[11px] font-bold uppercase">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#81FE88] text-black text-[10px] font-black uppercase px-5 py-2.5 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50"
        >
          {saving && <Loader2 size={12} className="animate-spin" />}
          {saving ? "Salvando..." : editingId === "new" ? "Criar Desafio" : "Salvar Alterações"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-[10px] font-black uppercase text-zinc-500 border border-zinc-800 px-5 py-2.5 rounded-xl hover:border-zinc-600 transition-all"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default function ChallengeSection({
  courseSlug,
  moduleId,
  videoId,
  initialChallenges,
}: ChallengeSectionProps) {
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
  const [editingId, setEditingId] = useState<string | null>(null); // 'new' | challenge.id | null
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startAdd() {
    setForm(emptyForm);
    setEditingId("new");
    setError("");
  }

  function startEdit(ch: Challenge) {
    setForm({
      title: ch.title,
      slug: ch.slug,
      description: ch.description,
      initialCode: ch.initialCode,
      expected: ch.expected,
    });
    setEditingId(ch.id);
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setError("");
  }

  async function handleSave() {
    if (!form.title.trim()) return setError("Título é obrigatório.");
    if (!form.slug.trim()) return setError("Slug é obrigatório.");
    setSaving(true);
    setError("");

    try {
      const isNew = editingId === "new";
      const url = isNew ? "/api/admin/challenges" : `/api/admin/challenges/${editingId}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          slug: form.slug.trim(),
          description: form.description.trim(),
          initialCode: form.initialCode.trim(),
          expected: form.expected.trim(),
          courseSlug,
          moduleId: moduleId ?? null,
          videoId: videoId ?? null,
          order: isNew ? challenges.length : undefined,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Erro ao salvar desafio.");
      }

      const saved = await res.json();
      if (isNew) {
        setChallenges((prev) => [...prev, saved]);
      } else {
        setChallenges((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
      }
      setEditingId(null);
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  }

  async function handleDelete(ch: Challenge) {
    if (!confirm(`Excluir o desafio "${ch.title}"?`)) return;
    await fetch(`/api/admin/challenges/${ch.id}`, { method: "DELETE" });
    setChallenges((prev) => prev.filter((c) => c.id !== ch.id));
    if (editingId === ch.id) setEditingId(null);
  }

  return (
    <div className="space-y-3">
      {/* Existing challenges */}
      {challenges.map((ch) => (
        <div key={ch.id} className="border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-zinc-900/60">
            <div className="flex items-center gap-3">
              <Terminal size={12} className="text-[#81FE88]" />
              <span className="text-[10px] font-black uppercase text-white">{ch.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => (editingId === ch.id ? cancelEdit() : startEdit(ch))}
                className="text-[9px] font-black uppercase text-[#81FE88] border border-[#81FE88]/20 px-3 py-1.5 rounded-lg hover:bg-[#81FE88] hover:text-black transition-all flex items-center gap-1"
              >
                <Pencil size={10} /> {editingId === ch.id ? "Fechar" : "Editar"}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(ch)}
                className="text-[9px] font-black uppercase text-red-500/50 border border-red-500/10 px-3 py-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center gap-1"
              >
                <Trash2 size={10} /> Remover
              </button>
            </div>
          </div>

          {editingId === ch.id && (
            <div className="p-5 bg-zinc-950/40 border-t border-zinc-800">
              <ChallengeForm
                form={form}
                editingId={editingId}
                saving={saving}
                error={error}
                onChange={setForm}
                onSave={handleSave}
                onCancel={cancelEdit}
              />
            </div>
          )}
        </div>
      ))}

      {/* Add form */}
      {editingId === "new" && (
        <div className="border border-[#81FE88]/20 rounded-2xl p-5 bg-zinc-950/40">
          <p className="text-[10px] font-black uppercase text-[#81FE88] mb-4">Novo Desafio</p>
          <ChallengeForm
            form={form}
            editingId="new"
            saving={saving}
            error={error}
            onChange={setForm}
            onSave={handleSave}
            onCancel={cancelEdit}
          />
        </div>
      )}

      {/* Add button */}
      {editingId !== "new" && (
        <button
          type="button"
          onClick={startAdd}
          className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 border border-zinc-700 border-dashed px-4 py-3 rounded-2xl hover:border-[#81FE88] hover:text-[#81FE88] transition-all w-full justify-center"
        >
          <Plus size={12} /> Adicionar Desafio
        </button>
      )}
    </div>
  );
}
