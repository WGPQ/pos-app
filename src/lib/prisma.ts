// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ['error', 'warn'], // puedes agregar 'query' en dev si quieres ver todas las queries
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
