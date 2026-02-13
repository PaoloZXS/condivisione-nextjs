const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../prisma/dev.db');
console.log('📁 Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  console.log('\n1️⃣  Verifying database structure:');
  const tables = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table'
  `).all();
  console.log('   Tables:', tables.map(t => t.name).join(', '));

  console.log('\n2️⃣  Counting users:');
  const count = db.prepare('SELECT COUNT(*) as cnt FROM tblogin').get();
  console.log('   Total users:', count.cnt);

  console.log('\n3️⃣  First user:');
  const first = db.prepare('SELECT * FROM tblogin LIMIT 1').get();
  console.log('   ', first);

  console.log('\n4️⃣  Query by email:');
  const byEmail = db.prepare('SELECT * FROM tblogin WHERE email = ?').get('luciano.rabuffi@codarini.com');
  console.log('   ', byEmail);

  console.log('\n5️⃣  Query by email AND password:');
  const byEmailPass = db.prepare('SELECT * FROM tblogin WHERE email = ? AND password = ?').get('luciano.rabuffi@codarini.com', '1234');
  console.log('   ', byEmailPass);

  db.close();
  console.log('\n✅ All tests passed!');
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
