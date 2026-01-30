import { auth } from "../../auth";
import CpfModal from "./CpfModal";

export default async function CpfGuard({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Se não houver sessão, não faz nada (o middleware ou login tratam)
  if (!session?.user) return <>{children}</>;

  // O Porteiro verifica se falta o CPF ou o Celular
  const precisaCompletarCadastro = !session.user.cpf || !session.user.phone;

  if (precisaCompletarCadastro) {
    // Passa o nome para o modal ser gentil
    return <CpfModal userName={session.user.name || "Usuário"} />;
  }

  // Se tiver tudo, libera o acesso aos filhos (o site)
  return <>{children}</>;
}