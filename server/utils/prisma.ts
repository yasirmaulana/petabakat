import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

// ponytail: serverless (Vercel) = pool max 1 agar koneksi tidak dibiarkan idle
// antar invocation. Lokal/long-running = pool lebih besar via PG_POOL_MAX.
const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined
const pool = new Pool({
  connectionString,
  max: isServerless ? 1 : Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: isServerless ? 1_000 : Number(process.env.PG_POOL_IDLE_TIMEOUT_MS || 30_000),
  connectionTimeoutMillis: Number(process.env.PG_POOL_CONNECTION_TIMEOUT_MS || 10_000),
  allowExitOnIdle: isServerless,
})

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error', err)
})

const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as { prisma: InstanceType<typeof PrismaClient> }

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (!isServerless) globalForPrisma.prisma = prisma
