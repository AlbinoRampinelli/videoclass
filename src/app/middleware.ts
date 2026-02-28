import { auth } from "@/auth" // ou de onde vem o seu 'auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth; // 1. Aqui ela se chama isLoggedIn
  const isPrivateRoute = req.nextUrl.pathname.startsWith("/minha-classe");

  // 2. Aqui embaixo, tire o "is" extra:
  if (isPrivateRoute && !isLoggedIn) { 
     // Se não estiver logado tentando entrar na classe, o Next resolve o que fazer
     return Response.redirect(new URL("/vitrine", req.nextUrl));
  }
})

export const config = {
  // Isso aqui diz para o Next não rodar o middleware em arquivos estáticos (evita lentidão)
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};