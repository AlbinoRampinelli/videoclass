import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      cpf?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    cpf?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    cpf?: string | null
  }
}