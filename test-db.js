// Test database connection directly
const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(process.cwd(), 'prisma/dev.db')
console.log('Connecting to:', dbPath)

try {
  const db = new Database(dbPath)
  
  // Check if tables exist
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
  console.log('Tables:', tables.map(t => t.name))
  
  // Count users
  const userCount = db.prepare('SELECT COUNT(*) as count FROM TbLogin').get()
  console.log('TbLogin count:', userCount)
  
  // Get sample users
  const users = db.prepare('SELECT email, password FROM TbLogin LIMIT 3').all()
  console.log('Sample TbLogin records:', users)
  
  db.close()
  console.log('✅ Database connection successful!')
} catch (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}
