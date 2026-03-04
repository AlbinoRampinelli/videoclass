"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ShieldCheck, ShieldOff, Search, UserCheck } from "lucide-react";

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  cpf: string | null;
  createdAt: string;
};

export default function AdminsPage() {
  const { data: session } = useSession();

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [promoteMessage, setPromoteMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const [demotingId, setDemotingId] = useState<string | null>(null);

  const currentUserId = session?.user?.id;

  async function fetchAdmins() {
    setLoadingList(true);
    try {
      const res = await fetch("/api/admin/admins");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAdmins(data);
    } catch {
      setAdmins([]);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function handlePromote(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setPromoting(true);
    setPromoteMessage(null);

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPromoteMessage({ text: data.message || "Erro desconhecido.", ok: false });
      } else {
        setPromoteMessage({
          text: `${data.name || data.email} foi promovido a ADMIN com sucesso.`,
          ok: true,
        });
        setSearchQuery("");
        fetchAdmins();
      }
    } catch {
      setPromoteMessage({ text: "Erro de conexão.", ok: false });
    } finally {
      setPromoting(false);
    }
  }

  async function handleDemote(id: string, name: string | null) {
    const confirmed = window.confirm(
      `Remover ADMIN de ${name || "este usuário"}? Ele perderá acesso ao painel.`
    );
    if (!confirmed) return;

    setDemotingId(id);
    try {
      const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Erro ao remover admin.");
      } else {
        fetchAdmins();
      }
    } catch {
      alert("Erro de conexão.");
    } finally {
      setDemotingId(null);
    }
  }

  return (
    <div className="p-8 w-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black italic uppercase text-white tracking-tighter">
            Gestão de <span className="text-[#81FE88]">Admins</span>
          </h1>
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
            Controle de Acesso ao Painel
          </p>
        </div>
      </div>

      {/* Formulário de promoção */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 mb-8">
        <p className="text-[10px] font-black text-[#81FE88] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <UserCheck size={14} />
          Promover Usuário a Admin
        </p>
        <form onSubmit={handlePromote} className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="E-mail ou CPF do usuário..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[#81FE88] outline-none transition-all"
          />
          <button
            type="submit"
            disabled={promoting || !searchQuery.trim()}
            className="bg-[#81FE88] text-black font-black italic uppercase text-[10px] px-6 py-3 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
          >
            <Search size={14} />
            {promoting ? "Buscando..." : "Promover"}
          </button>
        </form>

        {promoteMessage && (
          <div
            className={`mt-4 text-[11px] font-bold uppercase px-4 py-3 rounded-xl border ${
              promoteMessage.ok
                ? "text-[#81FE88] bg-[#81FE88]/5 border-[#81FE88]/20"
                : "text-red-400 bg-red-500/5 border-red-500/20"
            }`}
          >
            {promoteMessage.text}
          </div>
        )}
      </div>

      {/* Tabela de admins */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-800/50 text-zinc-400 text-[10px] uppercase font-black tracking-[0.2em]">
              <th className="p-5">Nome</th>
              <th className="p-5">E-mail</th>
              <th className="p-5">CPF</th>
              <th className="p-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loadingList ? (
              <tr>
                <td colSpan={4} className="p-20 text-center">
                  <p className="text-zinc-500 italic uppercase font-black text-[10px]">
                    Carregando...
                  </p>
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-20 text-center">
                  <p className="text-zinc-500 italic uppercase font-black text-[10px]">
                    Nenhum admin encontrado.
                  </p>
                </td>
              </tr>
            ) : (
              admins.map((admin) => {
                const isSelf = admin.id === currentUserId;
                return (
                  <tr
                    key={admin.id}
                    className="border-b border-zinc-800/50 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-[#81FE88]" />
                        <span className="font-bold italic uppercase text-white text-[11px]">
                          {admin.name || "—"}
                        </span>
                        {isSelf && (
                          <span className="text-[8px] font-black uppercase bg-[#81FE88]/10 text-[#81FE88] border border-[#81FE88]/20 px-2 py-0.5 rounded-md">
                            Você
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-zinc-400 text-[11px] font-mono">
                      {admin.email || "—"}
                    </td>
                    <td className="p-5 text-zinc-500 text-[11px] font-mono">
                      {admin.cpf || "—"}
                    </td>
                    <td className="p-5 text-right">
                      {isSelf ? (
                        <span className="text-[9px] font-black uppercase text-zinc-600 italic">
                          Conta atual
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDemote(admin.id, admin.name)}
                          disabled={demotingId === admin.id}
                          className="text-[9px] font-black uppercase italic tracking-widest text-red-500/50 border border-red-500/10 px-3 py-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all disabled:opacity-40 flex items-center gap-1.5 ml-auto"
                        >
                          <ShieldOff size={12} />
                          {demotingId === admin.id ? "Removendo..." : "Remover Admin"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
