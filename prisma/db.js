import { PrismaClient } from '@prisma/client'

const globalForPrisma = global;

// Evita criar múltiplas instâncias do Prisma em desenvolvimento
export const db = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export default db;