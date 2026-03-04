import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Usa config sem Prisma para rodar no Edge Runtime
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const userType = (req.auth as any)?.user?.userType;

  // Guard: /minha-classe requer usuário autenticado
  if (pathname.startsWith("/minha-classe") && !isLoggedIn) {
    return Response.redirect(new URL("/", req.nextUrl));
  }

  // Guard: /vitrine requer usuário autenticado
  if (pathname.startsWith("/vitrine") && !isLoggedIn) {
    return Response.redirect(new URL("/", req.nextUrl));
  }

  // Guard: /admin/* requer usuário autenticado com papel ADMIN
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/", req.nextUrl));
    }
    if (userType !== "ADMIN") {
      return Response.redirect(new URL("/vitrine", req.nextUrl));
    }
  }

  // Auto-redirect: usuário logado em "/" vai para /vitrine
  if (pathname === "/" && isLoggedIn) {
    return Response.redirect(new URL("/vitrine", req.nextUrl));
  }


});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
