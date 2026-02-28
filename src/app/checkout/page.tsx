import { db } from "../../../prisma/db"; // Ajuste o caminho se necessário
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ id: string }> }) {
  const { id } = await searchParams;

  // 1. Busca o curso direto no banco usando o ID da URL
  const curso = await db.course.findUnique({
    where: { id: id }
  });

  // 2. Se o curso não existir, volta para a vitrine
  if (!curso) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <p className="mb-4 text-zinc-500 uppercase font-black italic">Curso não encontrado</p>
        <Link href="/vitrine" className="bg-[#81FE88] text-black px-8 py-4 rounded-full font-black uppercase italic">
          Voltar para Vitrine
        </Link>
      </div>
    );
  }

  // 3. Ação para simular o pagamento (Isso aqui é o que você faz ao clicar no QR Code)
  // No Server Component, usamos um formulário ou apenas o visual.
  // Para manter sua lógica de "clicar no centro", vamos usar o layout bonitão:

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pagamento-${curso.id}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl">
        <h1 className="text-3xl font-black italic uppercase mb-2 leading-tight">
          {curso.title}
        </h1>
        <p className="text-[#81FE88] text-2xl font-black mb-6 italic">
          R$ {curso.price}
        </p>

        <div className="bg-white p-4 rounded-3xl inline-block mb-8 hover:scale-105 transition-transform duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          {/* Link para simular a compra e voltar pra vitrine */}
          <Link href={`/vitrine?success=true&id=${curso.id}`}>
            <img
              src={qrCodeUrl}
              alt="Pix"
              className="w-48 h-48 cursor-pointer"
              title="Clique para confirmar pagamento"
            />
          </Link>
        </div>

        <p className="text-zinc-500 text-[10px] uppercase font-bold mb-6 tracking-widest">
          Clique no QR Code para simular o pagamento
        </p>

        <Link
          href={`/vitrine?success=true&id=${curso.id}`}
          className="w-full block bg-[#81FE88] text-black font-black py-4 rounded-full uppercase italic hover:bg-white transition-colors text-center"
        >
          Confirmar Pagamento
        </Link>
      </div>
    </div>
  );
}