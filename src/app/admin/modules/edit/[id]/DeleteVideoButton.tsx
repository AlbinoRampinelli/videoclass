"use client";

import { Trash2 } from "lucide-react";

export default function DeleteVideoButton({ videoId, videoTitle, deleteAction }: {
  videoId: string;
  videoTitle: string;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={deleteAction}>
      <input type="hidden" name="videoId" value={videoId} />
      <button
        type="submit"
        className="text-[9px] font-black uppercase italic text-red-500/50 border border-red-500/10 px-3 py-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center gap-1"
        onClick={(e) => {
          if (!confirm(`Excluir a aula "${videoTitle}"?`)) e.preventDefault();
        }}
      >
        <Trash2 size={10} /> Excluir
      </button>
    </form>
  );
}
