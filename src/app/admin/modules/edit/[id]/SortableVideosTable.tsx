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
import { GripVertical, FileVideo, FileText, Pencil, Loader2 } from "lucide-react";
import DeleteVideoButton from "./DeleteVideoButton";

interface Video {
  id: string;
  title: string;
  description: string | null;
  order: number;
  url: string | null;
  pdfUrl: string | null;
}

function SortableRow({
  video,
  moduleId,
  deleteAction,
}: {
  video: Video;
  moduleId: string;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: video.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-zinc-800/50 hover:bg-white/[0.02] transition-colors"
    >
      <td className="p-4 text-center">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-zinc-700 hover:text-zinc-400 transition-colors"
        >
          <GripVertical size={16} />
        </button>
      </td>
      <td className="p-4 text-center font-mono text-[#81FE88] text-xs">{video.order}</td>
      <td className="p-4">
        <span className="font-bold italic uppercase text-white text-[11px]">{video.title}</span>
        {video.description && (
          <p className="text-zinc-600 text-[10px] mt-0.5 truncate max-w-xs">{video.description}</p>
        )}
      </td>
      <td className="p-4 text-center">
        {video.url ? (
          <span className="inline-flex items-center gap-1 text-[#81FE88] text-[9px] font-black uppercase">
            <FileVideo size={12} /> OK
          </span>
        ) : (
          <span className="text-zinc-600 text-[9px] font-black uppercase">—</span>
        )}
      </td>
      <td className="p-4 text-center">
        {video.pdfUrl ? (
          <span className="inline-flex items-center gap-1 text-blue-400 text-[9px] font-black uppercase">
            <FileText size={12} /> PDF
          </span>
        ) : (
          <span className="text-zinc-600 text-[9px] font-black uppercase">—</span>
        )}
      </td>
      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/modules/${moduleId}/aulas/${video.id}/edit`}
            className="text-[9px] font-black uppercase italic text-[#81FE88] border border-[#81FE88]/20 px-3 py-1.5 rounded-lg hover:bg-[#81FE88] hover:text-black transition-all flex items-center gap-1"
          >
            <Pencil size={10} /> Editar
          </Link>
          <DeleteVideoButton
            videoId={video.id}
            videoTitle={video.title}
            deleteAction={deleteAction}
          />
        </div>
      </td>
    </tr>
  );
}

export default function SortableVideosTable({
  initialVideos,
  moduleId,
  deleteAction,
}: {
  initialVideos: Video[];
  moduleId: string;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const [items, setItems] = useState(initialVideos);
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

    await fetch("/api/admin/videos/reorder", {
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
        <div
          className={`mb-4 flex items-center gap-2 text-[10px] font-black uppercase px-4 py-2 rounded-xl w-fit ${
            saving ? "text-zinc-400 bg-zinc-800" : "text-[#81FE88] bg-[#81FE88]/10"
          }`}
        >
          {saving && <Loader2 size={12} className="animate-spin" />}
          {saving ? "Salvando ordem..." : "✓ Ordem salva!"}
        </div>
      )}

      <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-800/50 text-zinc-400 text-[10px] uppercase font-black tracking-[0.2em]">
              <th className="p-4 w-10"></th>
              <th className="p-4 w-12 text-center">#</th>
              <th className="p-4">Título</th>
              <th className="p-4 text-center">Vídeo</th>
              <th className="p-4 text-center">Material de Apoio</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {items.map((video) => (
                  <SortableRow
                    key={video.id}
                    video={video}
                    moduleId={moduleId}
                    deleteAction={deleteAction}
                  />
                ))}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
    </div>
  );
}
