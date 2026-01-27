import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function AuthButton() {
  const session = await auth();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm hidden sm:inline text-gray-600">
          Olá, <strong>{session.user?.name || "Aluno"}</strong>
        </span>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
            Sair
          </button>
        </form>
      </div>
    );
  }

  return (
    <Link
      href="/signin"
      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all"
    >
      Entrar
    </Link>
  );
}