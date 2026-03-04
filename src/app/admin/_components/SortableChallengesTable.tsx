"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2 } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  slug: string;
  order: number;
  courseSlug: string;
  moduleId: string | null;
  module: { id: string; title: string } | null;
}

function SortableRow({ ch }: { ch: Challenge }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ch.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-zinc-800/50 hover:bg-white/[0.02] transition-colors group"
    >
      <td className="p-5 text-center">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-zinc-700 hover:text-zinc-400 transition-colors"
        >
          <GripVertical size={16} />
        </button>
      </td>
      <td className="p-5 text-center font-mono text-[#81FE88] text-xs">{ch.order}</td>
      <td className="p-5">
        <span className="font-bold italic uppercase text-white">{ch.title}</span>
      </td>
      <td className="p-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-zinc-300 text-[10px] font-bold uppercase">
              {ch.module?.title || "Sem Módulo"}
            </span>
            {ch.moduleId && (
              <Link
                href={`/admin/modules/edit/${ch.moduleId}`}
                className="opacity-0 group-hover:opacity-100 text-[#81FE88] text-[9px] font-black uppercase underline decoration-[#81FE88]/30 transition-all"
              >
                Editar Módulo
              </Link>
            )}
          </div>
          <span className="text-zinc-600 text-[9px] uppercase font-black tracking-tighter italic">
            {ch.courseSlug}
          </span>
        </div>
      </td>
      <td className="p-5 text-center text-zinc-500 font-mono text-[10px]">{ch.slug}</td>
      <td className="p-5 text-right flex justify-end gap-2">
        <Link
          href={`/admin/challenges/edit/${ch.id}`}
          className="text-[9px] font-black uppercase italic tracking-widest text-[#81FE88] border border-[#81FE88]/20 px-3 py-1.5 rounded-lg hover:bg-[#81FE88] hover:text-black transition-all"
        >
          Editar
        </Link>
      </td>
    </tr>
  );
}

export default function SortableChallengesTable({ initialChallenges }: { initialChallenges: Challenge[] }) {
  const [items, setItems] = useState(initialChallenges);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    setItems(reordered);
    setSaving(true);
    setSaved(false);

    await fetch("/api/admin/challenges/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: reordered.map((i) => ({ id: i.id, order: i.order })) }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      {(saving || saved) && (
        <div className={`mb-4 flex items-center gap-2 text-[10px] font-black uppercase px-4 py-2 rounded-xl w-fit ${
          saving ? "text-zinc-400 bg-zinc-800" : "text-[#81FE88] bg-[#81FE88]/10"
        }`}>
          {saving && <Loader2 size={12} className="animate-spin" />}
          {saving ? "Salvando ordem..." : "✓ Ordem salva!"}
        </div>
      )}

      <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-800/50 text-zinc-400 text-[10px] uppercase font-black tracking-[0.2em]">
              <th className="p-5 w-10"></th>
              <th className="p-5 text-center w-16">#</th>
              <th className="p-5">Desafio</th>
              <th className="p-5">Módulo / Curso</th>
              <th className="p-5 text-center">Slug</th>
              <th className="p-5 text-right">Ações</th>
            </tr>
          </thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                      <p className="text-zinc-500 italic uppercase font-black">Nenhum desafio encontrado.</p>
                    </td>
                  </tr>
                ) : (
                  items.map((ch) => <SortableRow key={ch.id} ch={ch} />)
                )}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
    </div>
  );
}
