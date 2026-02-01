"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import CpfModal from "./CpfModal";

export default function CpfGuard() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // TRAVA DE OURO: Se a rota for admin, mata qualquer lógica do Guard
  if (pathname.startsWith('/admin')) return null;

  // Enquanto carrega a sessão, não mostra nada
  if (status === "loading") return null;

  const user = session?.user as any;

  // Só mostra o modal se: estiver logado, NÃO tiver CPF e NÃO estiver no admin
  if (user && !user.cpf) {
    return <CpfModal userName={user.name || "Usuário"} />;
  }

  return null;
}