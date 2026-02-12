import { PrismaClient } from './prisma'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'
import { join } from 'path'

declare global {
  var prisma: PrismaClient | undefined
}

const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
const dbPath = dbUrl.replace('file:', '').split('?')[0]

const resolvedPath = !dbPath.startsWith('/')
  ? join(process.cwd(), dbPath)
  : dbPath

console.error(`[Prisma] Connecting to: ${resolvedPath}`)

const db = new Database(resolvedPath)
const adapter = new PrismaBetterSqlite3(db)

const createPrismaClient = () => {
  const config: any = {
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  }

  return new PrismaClient(config)
}

export const prisma = global.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  ;(global as any).prisma = prisma
}

export default prisma
