#!/usr/bin/env node

const { PrismaClient } = require('../lib/prisma');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../prisma/dev.db');
console.log('Testing database at:', dbPath);

try {
  const db = new Database(dbPath);
  const adapter = new PrismaBetterSqlite3(db);
  const prisma = new PrismaClient({ 
    adapter,
    datasourceUrl: `file:${dbPath}`
  });

  (async () => {
    try {
      console.log('\n1. Conteggio utenti nel database:');
      const count = await prisma.user.count();
      console.log('   Total users:', count);

      console.log('\n2. Primo utente nel database:');
      const firstUser = await prisma.user.findFirst();
      console.log('   ', firstUser);

      console.log('\n3. Ricerca utente con email:');
      const user = await prisma.user.findFirst({
        where: { email: 'luciano.rabuffi@codarini.com' }
      });
      console.log('   ', user);

      console.log('\n4. Ricerca con email e password:');
      const userWithPassword = await prisma.user.findFirst({
        where: {
          email: 'luciano.rabuffi@codarini.com',
          password: '1234'
        }
      });
      console.log('   ', userWithPassword);

      console.log('\n✅ All tests passed!');
      process.exit(0);
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      console.error('Stack:', error.stack);
      process.exit(1);
    }
  })();
} catch (error) {
  console.error('❌ Setup error:', error.message);
  process.exit(1);
}
