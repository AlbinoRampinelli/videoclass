"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, BookOpen, Terminal, Loader2 } from "lucide-react";

interface Module {
  id: string;
  title: string;
  order: number;
  _count: { videos: number; challenges: number };
}

function SortableModuleRow({ mod, courseId, onDelete }: {
  mod: Module;
  courseId: string;
  onDelete: (id: string, title: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: mod.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl px-4 py-3 hover:border-zinc-700 transition-colors"
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-zinc-700 hover:text-zinc-400 transition-colors shrink-0">
        <GripVertical size={16} />
      </button>

      <span className="font-mono text-[#81FE88] text-xs w-6 shrink-0">{mod.order}</span>

      <p className="font-black italic uppercase text-white text-[11px] flex-1 truncate">{mod.title}</p>

      <div className="flex items-center gap-3 shrink-0">
        <span className="flex items-center gap-1 text-zinc-500 text-[9px] font-black uppercase">
          <BookOpen size={10} /> {mod._count.videos}
        </span>
        {mod._count.challenges > 0 && (
          <span className="flex items-center gap-1 text-[#81FE88] text-[9px] font-black uppercase">
            <Terminal size={10} /> Desafio
          </span>
        )}

        <Link
          href={`/admin/cursos/${courseId}/modulos/${mod.id}`}
          className="flex items-center gap-1 text-[9px] font-black uppercase text-[#81FE88] border border-[#81FE88]/20 px-3 py-1.5 rounded-lg hover:bg-[#81FE88] hover:text-black transition-all"
        >
          <Pencil size={10} /> Gerenciar
        </Link>

        <button
          onClick={() => onDelete(mod.id, mod.title)}
          className="text-zinc-700 hover:text-red-500 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function SortableModulesList({ initialModules, courseId }: {
  initialModules: Module[];
  courseId: string;
}) {
  const [modules, setModules] = useState(initialModules);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = modules.findIndex((m) => m.id === active.id);
    const newIndex = modules.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(modules, oldIndex, newIndex).map((m, i) => ({ ...m, order: i + 1 }));

    setModules(reordered);
    setSaving(true); setSaved(false);

    await fetch("/api/admin/modules/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: reordered.map((m) => ({ id: m.id, order: m.order })) }),
    });

    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Excluir o módulo "${title}" e todas as suas aulas?`)) return;
    setModules((prev) => prev.filter((m) => m.id !== id));
    await fetch(`/api/admin/modules/${id}`, { method: "DELETE" });
  }

  return (
    <div className="space-y-3">
      {(saving || saved) && (
        <div className={`flex items-center gap-2 text-[10px] font-black uppercase px-4 py-2 rounded-xl w-fit ${saving ? "text-zinc-400 bg-zinc-800" : "text-[#81FE88] bg-[#81FE88]/10"}`}>
          {saving && <Loader2 size={12} className="animate-spin" />}
          {saving ? "Salvando ordem..." : "✓ Ordem salva!"}
        </div>
      )}

      {modules.length === 0 ? (
        <div className="border border-dashed border-zinc-700 rounded-2xl p-10 text-center">
          <p className="text-zinc-600 text-[10px] uppercase font-black italic">Nenhum módulo cadastrado.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            {modules.map((mod) => (
              <SortableModuleRow key={mod.id} mod={mod} courseId={courseId} onDelete={handleDelete} />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
