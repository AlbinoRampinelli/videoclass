import type { NextAuthConfig } from "next-auth";

// Config edge-compatible: sem imports de Prisma ou Node.js exclusivo
// Usada apenas no middleware para decodificar o JWT sem tocar no banco
export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  // Deve usar o mesmo nome de cookie que auth.ts para encontrar a sessão
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [],
  callbacks: {
    session({ session, token }) {
      const t = token as any;
      if (t) {
        if (!session.user) (session as any).user = {};
        (session.user as any).userType = t.userType;
        (session.user as any).id = t.id ?? t.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
