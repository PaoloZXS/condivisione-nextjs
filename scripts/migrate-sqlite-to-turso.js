#!/usr/bin/env node
const Database = require('better-sqlite3');
const { createClient } = require('@libsql/client');

const tursoCondivisioneDati = createClient({
  url: 'libsql://condivisionedati-paolozxs.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzA5OTI3MTUsImlkIjoiMjg0NzliNzctNTMyYS00NzYyLTkyM2UtYjE4NTcwNzYyYTFjIiwicmlkIjoiYzVhZGIwYzEtNTE2ZC00ZjlhLWE2ZTctMDUyMTY2MGE3NWJkIn0.2BPtvp6SuJe3MHZF13u6RCz-3rYrQFWmBIgW2CC6ISn-ZnqVMtt-1_FJ9Egj4jJeFOVU28xmAyEZSwD5vOChCA'
});

async function migrateToTurso() {
  console.log('🔄 Migrando da SQLite locale a TURSO...\n');

  try {
    // Apri database locale
    const db = new Database('./prisma/dev.db');
    
    // Leggi utenti dal database locale
    const stmt = db.prepare('SELECT * FROM tblogin ORDER BY idLogin');
    const users = stmt.all();
    
    console.log(`✓ Trovati ${users.length} utenti nel database SQLite locale`);

    // Crea tabella su TURSO (o droppala se esiste)
    await tursoCondivisioneDati.execute(`DROP TABLE IF EXISTS tblogin`);
    
    await tursoCondivisioneDati.execute(`
      CREATE TABLE tblogin (
        idLogin INTEGER PRIMARY KEY,
        nome TEXT NOT NULL,
        cognome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        societa TEXT,
        tecnicocod TEXT,
        attivo CHAR(1),
        typeutente TEXT,
        colore TEXT
      )
    `);
    console.log('✓ Tabella tblogin creata su TURSO');

    // Inserisci dati dal SQLite a TURSO
    let insertedCount = 0;
    for (const user of users) {
      try {
        await tursoCondivisioneDati.execute(`
          INSERT INTO tblogin (idLogin, nome, cognome, email, password, societa, tecnicocod, attivo, typeutente, colore)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          user.idLogin,
          user.nome,
          user.cognome,
          user.email,
          user.password,
          user.societa,
          user.tecnicocod,
          user.attivo,
          user.typeutente,
          user.colore
        ]);
        insertedCount++;
      } catch (e) {
        console.error(`⚠️  Errore inserimento utente ${user.email}:`, e.message);
      }
    }

    console.log(`✓ Inseriti ${insertedCount}/${users.length} utenti in TURSO`);

    // Verifica che i dati siano stati inseriti
    const result = await tursoCondivisioneDati.execute('SELECT COUNT(*) as count FROM tblogin');
    const count = result.rows[0].count;
    console.log(`✓ Verifica: ${count} righe presenti su TURSO`);

    // Chiudi database locale
    db.close();

    console.log('\n✅ Migrazione completata con successo!');
    console.log('📊 I dati utenti sono ora su TURSO CondivisioneDati');

  } catch (error) {
    console.error('\n❌ Errore:', error.message);
    process.exit(1);
  }
}

migrateToTurso();
