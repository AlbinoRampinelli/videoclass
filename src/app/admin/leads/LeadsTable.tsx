"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { Trash2, MessageCircle, School, BookOpen, Calendar, GripVertical } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface Lead {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  whatsapp: string;
  escola: string | null;
  cursoNome: string | null;
  status: string;
  createdAt: Date;
  userType: string | null;
}

// ── Config ───────────────────────────────────────────────────────────────────

const COLUMNS = [
  { id: "PENDENTE",    label: "Pendente",    color: "text-yellow-400", border: "border-yellow-500/30", bg: "bg-yellow-500/5",  dot: "bg-yellow-400" },
  { id: "CONTATADO",  label: "Contatado",   color: "text-blue-400",   border: "border-blue-500/30",   bg: "bg-blue-500/5",    dot: "bg-blue-400" },
  { id: "MATRICULADO",label: "Matriculado", color: "text-[#81FE88]",  border: "border-[#81FE88]/30",  bg: "bg-[#81FE88]/5",   dot: "bg-[#81FE88]" },
  { id: "DESISTIU",   label: "Desistiu",    color: "text-red-500",    border: "border-red-500/30",    bg: "bg-red-500/5",     dot: "bg-red-500" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatWhats(w: string) {
  const digits = w.replace(/\D/g, "");
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}

// ── Card ─────────────────────────────────────────────────────────────────────

function LeadCard({
  lead,
  onDelete,
  isDragOverlay = false,
}: {
  lead: Lead;
  onDelete: (id: string, nome: string) => void;
  isDragOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={isDragOverlay ? undefined : style}
      className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 transition-all ${
        isDragging ? "opacity-30 scale-95" : "hover:border-zinc-700"
      } ${isDragOverlay ? "shadow-2xl rotate-1 scale-105 cursor-grabbing" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-black italic uppercase text-white text-[11px] leading-tight truncate">{lead.nome}</p>
          <p className="text-zinc-500 text-[9px] font-mono mt-0.5 truncate">{lead.email}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            {...(isDragOverlay ? {} : { ...attributes, ...listeners })}
            className="cursor-grab active:cursor-grabbing text-zinc-700 hover:text-zinc-400 transition-colors p-0.5"
          >
            <GripVertical size={14} />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(lead.id, lead.nome)}
            className="text-zinc-700 hover:text-red-500 transition-colors p-0.5"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        onPointerDown={(e) => e.stopPropagation()}
        className="flex items-center gap-1.5 text-[#81FE88] text-[10px] font-black hover:underline w-fit"
      >
        <MessageCircle size={11} />
        {formatWhats(lead.whatsapp)}
      </a>

      {/* Info pills */}
      <div className="flex flex-wrap gap-1.5">
        {lead.escola && (
          <span className="flex items-center gap-1 bg-zinc-800 text-zinc-400 text-[9px] font-bold uppercase px-2 py-1 rounded-lg">
            <School size={9} /> {lead.escola}
          </span>
        )}
        {lead.cursoNome && (
          <span className="flex items-center gap-1 bg-zinc-800 text-zinc-400 text-[9px] font-bold uppercase px-2 py-1 rounded-lg">
            <BookOpen size={9} /> {lead.cursoNome}
          </span>
        )}
        <span className="flex items-center gap-1 bg-zinc-800/60 text-zinc-600 text-[9px] font-mono px-2 py-1 rounded-lg ml-auto">
          <Calendar size={9} /> {formatDate(lead.createdAt)}
        </span>
      </div>
    </div>
  );
}

// ── Column ───────────────────────────────────────────────────────────────────

function KanbanColumn({
  col,
  leads,
  onDelete,
  isOver,
}: {
  col: typeof COLUMNS[number];
  leads: Lead[];
  onDelete: (id: string, nome: string) => void;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: col.id });

  return (
    <div className="flex flex-col gap-3 min-w-0">
      {/* Column header */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${col.border} ${col.bg}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${col.dot}`} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${col.color}`}>{col.label}</span>
        </div>
        <span className={`text-[10px] font-black tabular-nums ${col.color}`}>{leads.length}</span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-3 min-h-[200px] rounded-2xl p-2 transition-colors ${
          isOver ? `${col.bg} border-2 border-dashed ${col.border}` : "border-2 border-transparent"
        }`}
      >
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onDelete={onDelete} />
        ))}

        {leads.length === 0 && (
          <div className="flex-1 flex items-center justify-center min-h-[120px]">
            <p className="text-zinc-700 text-[9px] uppercase font-black italic">Arraste aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function LeadsKanban({ leads: initialLeads }: { leads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeLead = leads.find((l) => l.id === activeId) ?? null;

  async function updateStatus(id: string, status: string) {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function deleteLead(id: string, nome: string) {
    if (!confirm(`Excluir o lead de "${nome}"?`)) return;
    setLeads((prev) => prev.filter((l) => l.id !== id));
    await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    setOverId(event.over ? String(event.over.id) : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over) return;

    const targetStatus = String(over.id);
    const lead = leads.find((l) => l.id === String(active.id));

    if (lead && COLUMNS.find((c) => c.id === targetStatus) && lead.status !== targetStatus) {
      updateStatus(lead.id, targetStatus);
    }
  }

  const q = search.toLowerCase();
  const filteredLeads = q
    ? leads.filter(
        (l) =>
          l.nome.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.cpf.includes(q)
      )
    : leads;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail ou CPF..."
          className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-[11px] outline-none focus:border-[#81FE88] transition-all w-72"
        />
        <p className="text-zinc-600 text-[10px] uppercase font-black">
          {leads.length} lead{leads.length !== 1 ? "s" : ""} no total
        </p>
      </div>

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              col={col}
              leads={filteredLeads.filter((l) => l.status === col.id)}
              onDelete={deleteLead}
              isOver={overId === col.id}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
          {activeLead ? (
            <LeadCard lead={activeLead} onDelete={() => {}} isDragOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
