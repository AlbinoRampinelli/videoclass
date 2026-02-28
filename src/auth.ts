import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "../prisma/db"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
export const dynamic = "force-dynamic";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true, // Adicione isso para ele aceitar o localhost no build
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  // No seu arquivo de configuração do NextAuth
  cookies: {
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account", // 👈 MUDADO: Menos agressivo que "consent"
          access_type: "offline",
          response_type: "code"
        }
      }
    }), Credentials({
      id: "credentials",
      name: "CPF",
      async authorize(credentials) {
        const codigoDigitado = String(credentials?.code || "").trim();
        const emailAlvo = "arampinelli10@gmail.com"; // O email que está recebendo o código

        console.log("🚀 TENTANDO LOGIN FORÇADO PELO EMAIL:", emailAlvo);

        // Buscamos pelo email, ignorando o CPF problemático por enquanto
        const user = await db.user.findUnique({
          where: { email: emailAlvo }
        });

        if (!user) {
          console.log("❌ Nem pelo email achei o cara!");
          return null;
        }

        const codigoNoBanco = String(user.codigoVerificacao || "").trim();
        console.log("✅ Usuário Achado! Banco:", codigoNoBanco, "| Digitado:", codigoDigitado);

        if (codigoNoBanco === codigoDigitado && codigoDigitado !== "") {
          // Aproveitamos e limpamos o CPF do banco para o formato sem pontos para nunca mais dar erro
          const cpfLimpo = String(credentials?.cpf || "").replace(/\D/g, "");

          await db.user.update({
            where: { id: user.id },
            data: {
              codigoVerificacao: null,
              cpf: cpfLimpo // Atualiza para o formato limpo!
            }
          });

          return user;
        }

        console.log("❌ Código não bateu.");
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 1. No Login Inicial (Credentials ou Google)
      if (user) {
        token.id = user.id;
        token.cpf = (user as any).cpf;
        token.phone = (user as any).phone;
        token.userType = (user as any).userType; // Adicionado conforme seu Schema
      }

      // 2. RECUPERAÇÃO: Se entrar pelo Google e o CPF não estiver no token, busca no banco
      if (token.email && !token.cpf) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email as string },
          select: { id: true, cpf: true, phone: true, userType: true }
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.cpf = dbUser.cpf;
          token.phone = dbUser.phone;
          token.userType = dbUser.userType;
        }
      }

      // 3. ATUALIZAÇÃO: Reflete as mudanças do Modal de CPF na sessão
      if (trigger === "update" && session) {
        token.cpf = session.cpf || token.cpf;
        token.phone = session.phone || token.phone;
        token.userType = session.userType || token.userType;
      }
      return token;
    },

    async session({ session, token }) {
      // Transfere tudo do Token para a Sessão que os componentes lêem
      if (session.user && token) {
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.cpf = token.cpf as string;
        // @ts-ignore
        session.user.phone = token.phone as string;
        // @ts-ignore
        session.user.userType = token.userType as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Se o usuário acabou de logar e o destino é a home ou o signin,
      // mandamos ele direto para a vitrine.
      if (url === baseUrl || url.includes("/signin") || url === `${baseUrl}/`) {
        return `${baseUrl}/vitrine`;
      }

      // Se houver um callbackUrl específico (ex: link de um curso), respeita ele
      if (url.startsWith(baseUrl)) return url;

      return baseUrl;
    },
  },
  basePath: "/api/auth",
})