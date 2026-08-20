import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL
// ponytail: tune max based on deployment target; 20 handles ~100 concurrent short DB ops
// with AI processed in the background. Increase if DB CPU/memory allows.
const pool = new Pool({
  connectionString,
  max: Number(process.env.PG_POOL_MAX || 20),
  idleTimeoutMillis: Number(process.env.PG_POOL_IDLE_TIMEOUT_MS || 30_000),
  connectionTimeoutMillis: Number(process.env.PG_POOL_CONNECTION_TIMEOUT_MS || 5_000),
})

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error', err)
})

const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as { prisma: InstanceType<typeof PrismaClient> }

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
