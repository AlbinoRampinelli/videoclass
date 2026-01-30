import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "../prisma/db"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      id: "credentials",
      name: "CPF",
      async authorize(credentials) {
        const creds = credentials as any;
        const cpfLimpo = String(creds?.cpf).replace(/\D/g, "");
        const codigoDigitado = String(creds?.code).trim();

        // Busca o usuário apenas pelo CPF (A nossa chave mestre)
        const user = await db.user.findUnique({
          where: { cpf: cpfLimpo }
        });

        // Valida o código que você já gera no banco
        if (user && String(user.codigoVerificacao) === codigoDigitado) {
          // Limpa o código para ele não ser usado de novo (Segurança OTP)
          await db.user.update({
            where: { id: user.id },
            data: { codigoVerificacao: null }
          });
          return user;
        }

        // Se o código estiver errado ou CPF não existir
        return null;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        console.log("🚀 LOGIN GOOGLE DETECTADO:", user.email);
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // 1. No momento do Login inicial
      if (user) {
        token.id = user.id;
        token.cpf = (user as any).cpf;
        token.phone = (user as any).phone; // Captura o celular do banco
        token.name = user.name;
        token.picture = user.image;
      }

      // 2. RECUPERAÇÃO: Se o token perder os dados, busca no banco via email
      if ((!token.cpf || !token.phone) && token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email as string },
          select: { id: true, cpf: true, phone: true, name: true, image: true }
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.cpf = dbUser.cpf;
          token.phone = dbUser.phone;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }

      // 3. ATUALIZAÇÃO: Quando o Modal chama o update()
      if (trigger === "update" && session) {
        if (session.cpf) token.cpf = session.cpf;
        if (session.phone) token.phone = session.phone;
        if (session.name) token.name = session.name;
      }
      return token;
    },

    async session({ session, token }) {
      // Transfere os dados do Token para a Sessão (que o CpfGuard lê)
      if (session.user && token) {
        session.user.id = token.id as string;
        // @ts-ignore - Evita erro de tipagem se não houver o .d.ts
        session.user.cpf = token.cpf as string;
        // @ts-ignore
        session.user.phone = token.phone as string;
        session.user.name = token.name;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  basePath: "/api/auth",
})