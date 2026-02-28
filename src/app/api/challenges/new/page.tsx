"use client";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import { useRouter } from "next/navigation";
export const dynamic = 'force-dynamic';


export default function NewChallenge() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    expected: "",
    courseSlug: "python-do-zero",
    order: 0,
    initialCode: "# Escreva sua solução aqui\ndef solucao():\n    pass",
    testCode: "print(solucao())" // CAMPO QUE ESTAVA FALTANDO
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Desafio criado com sucesso!");
        router.push("/admin");
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao salvar");
      }
    } catch (err) {
      setError("Falha na conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black italic uppercase mb-8 text-[#81FE88]">
          Novo Desafio Prático
        </h1>

        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-8">
          {/* COLUNA ESQUERDA */}
          <div className="col-span-5 space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Título</label>
              <input 
                className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg focus:border-[#81FE88] outline-none"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Slug do Desafio</label>
              <input 
                className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg focus:border-[#81FE88] outline-none"
                value={formData.slug}
                onChange={e => setFormData({...formData, slug: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Slug do Curso (ID)</label>
              <input 
                className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg focus:border-[#81FE88] outline-none"
                value={formData.courseSlug}
                onChange={e => setFormData({...formData, courseSlug: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Expectativa</label>
                <input 
                  className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg focus:border-[#81FE88] outline-none"
                  value={formData.expected}
                  onChange={e => setFormData({...formData, expected: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Ordem</label>
                <input 
                  type="number"
                  className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg focus:border-[#81FE88] outline-none"
                  value={formData.order}
                  onChange={e => setFormData({...formData, order: Number(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Descrição</label>
              <textarea 
                className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg h-32 outline-none focus:border-[#81FE88]"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
          </div>

          {/* COLUNA DIREITA (EDITORES) */}
          <div className="col-span-7 space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Código Inicial</label>
              <div className="h-48 border border-zinc-800 rounded-lg overflow-hidden">
                <Editor
                  theme="vs-dark"
                  defaultLanguage="python"
                  value={formData.initialCode}
                  onChange={(v) => setFormData({...formData, initialCode: v || ""})}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Código de Teste (Runner)</label>
              <div className="h-32 border border-zinc-800 rounded-lg overflow-hidden">
                <Editor
                  theme="vs-dark"
                  defaultLanguage="python"
                  value={formData.testCode}
                  onChange={(v) => setFormData({...formData, testCode: v || ""})}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#81FE88] text-black font-black uppercase italic p-4 rounded-xl hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              {loading ? "Gravando..." : "Salvar Desafio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}