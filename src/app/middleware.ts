// src/middleware.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const isLogged = !!req.auth; // Verifica se existe sessão
  const isLandingPage = req.nextUrl.pathname === "/";

  // Se o cara está logado e tenta entrar na Landing Page ("/")
  // Nós "jogamos" ele direto para a Vitrine
  if (isLogged && isLandingPage) {
    return NextResponse.redirect(new URL("/vitrine", req.url));
  }

  return NextResponse.next();
});

// Configuração para o Middleware não rodar em arquivos de imagem, css, etc.
export const config = {
  matcher: ["/"],
};