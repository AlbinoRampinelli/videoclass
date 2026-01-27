import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin", // Isso diz ao NextAuth: "Não use sua página padrão, use a minha em /signin"
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
        try {
          const creds = credentials as any;
          // 1. Limpa o CPF digitado (deixa só números)
          const cpfDigitadoLimpo = String(creds?.cpf).replace(/\D/g, "");
          const codigoDigitado = String(creds?.code || creds?.password).trim();

          console.log("=== VERIFICAÇÃO INTELIGENTE ===");
          console.log("CPF digitado (limpo):", cpfDigitadoLimpo);

          // 2. Busca todos os usuários (ou os que têm CPF) para comparar sem formatação
          const users = await prisma.user.findMany({
            where: { cpf: { not: null } }
          });

          // 3. Procura o usuário comparando apenas os números do CPF
          const user = users.find(u => {
            const cpfBancoLimpo = u.cpf?.replace(/\D/g, "");
            return cpfBancoLimpo === cpfDigitadoLimpo;
          });

          if (!user) {
            console.log("❌ ERRO: CPF não encontrado mesmo limpando os pontos.");
            return null;
          }

          console.log("✅ Usuário encontrado:", user.email);
          console.log("Código no Banco:", user.codigoVerificacao);
          console.log("Código digitado:", codigoDigitado);

          // 4. Compara o código de verificação
          if (String(user.codigoVerificacao) === codigoDigitado) {
            console.log("✅✅✅ LOGIN AUTORIZADO!");
            return user;
          }

          console.log("❌ ERRO: Código incorreto.");
          return null;

        } catch (error) {
          console.log("💥 ERRO NO LOGIN:", error);
          return null;
        }
      }
    })
  ],
  basePath: "/api/auth",
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
})