import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

// Em JS puro, usamos apenas a atribuição global
const db = global.prisma || prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') global.prisma = db

export { db }
export default db