// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

function getDatabaseUrlWithSafePool() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) return undefined

  const url = new URL(databaseUrl)
  // The hosted PostgreSQL plan has a small connection cap. Keep headroom for
  // migrations and administrative access while Prisma queues surplus queries.
  if (!url.searchParams.has('connection_limit')) url.searchParams.set('connection_limit', '1')
  if (!url.searchParams.has('pool_timeout')) url.searchParams.set('pool_timeout', '20')
  return url.toString()
}

const databaseUrl = getDatabaseUrlWithSafePool()

export const prisma =
  global.prisma ??
  new PrismaClient({
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
    log: ['error', 'warn'], // puedes agregar 'query' en dev si quieres ver todas las queries
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
