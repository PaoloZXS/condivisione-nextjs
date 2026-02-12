import { join } from 'path'
import { env } from 'process'

const databaseUrl = env.DATABASE_URL || 'file:./prisma/dev.db'

export default {
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
}
