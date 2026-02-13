#!/usr/bin/env node

/**
 * Script per estrarre dati da SQL Server e popolare SQLite locale
 */

const sql = require('mssql');
const Database = require('better-sqlite3');
const path = require('path');

// SQL Server config
const sqlConfig = {
  server: 'ALESSIA\\SQLEXPRESS',
  authentication: {
    type: 'default'
  },
  options: {
    trustServerCertificate: true,
    encrypt: false
  }
};

const dbPath = path.join(__dirname, '../prisma/dev.db');

async function main() {
  let pool;
  try {
    console.log('🚀 Inizio migrazione da SQL Server a SQLite locale\n');

    // Connetti a SQL Server
    console.log('📡 Connessione a SQL Server...');
    pool = new sql.ConnectionPool(sqlConfig);
    await pool.connect();
    console.log('✓ Connesso a SQL Server\n');

    // Apri database SQLite
    console.log('💾 Apertura database SQLite...');
    const db = new Database(dbPath);
    console.log('✓ Database SQLite aperto\n');

    // Crea schema
    console.log('📝 Creazione schema...');
    const schema = `
      CREATE TABLE IF NOT EXISTS "tblogin" (
          "idLogin" INTEGER NOT NULL PRIMARY KEY,
          "nome" TEXT NOT NULL,
          "cognome" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "societa" TEXT NOT NULL,
          "tecnicocod" TEXT NOT NULL,
          "attivo" TEXT NOT NULL DEFAULT 'S',
          "typeutente" TEXT NOT NULL DEFAULT 'AMMINISTRATORE',
          "colore" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "tblogin_email_key" ON "tblogin"("email");

      CREATE TABLE IF NOT EXISTS "taboperazioni" (
          "id" INTEGER NOT NULL PRIMARY KEY,
          "proprietario" TEXT NOT NULL,
          "tipo" INTEGER NOT NULL,
          "stato" INTEGER NOT NULL,
          "descrizione" TEXT,
          "dataCreazione" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "dataMofifica" DATETIME NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "tabclienti" (
          "codice" TEXT NOT NULL PRIMARY KEY,
          "denominazione" TEXT NOT NULL,
          "indirizzo" TEXT,
          "citta" TEXT,
          "provincia" TEXT,
          "cap" TEXT,
          "attivo" TEXT NOT NULL DEFAULT 'S',
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "tabclienti_codice_key" ON "tabclienti"("codice");
    `;
    
    db.exec(schema);
    console.log('✓ Schema creato\n');

    // Estrai dati da SQL Server
    console.log('📥 Estrazione dati da SQL Server...');
    const queryResult = await pool.request().query(`
      SELECT 
        idLogin, nome, cognome, email, password, 
        societa, tecnicocod, attivo, typeutente, colore
      FROM [CondivisioneDati].dbo.TbLogin
      WHERE attivo = 'S'
      ORDER BY idLogin
    `);

    const users = queryResult.recordset;
    console.log(`✓ ${users.length} utenti estratti\n`);

    // Inserisci in SQLite
    console.log('💾 Inserimento in SQLite...');
    const insert = db.prepare(`
      INSERT OR REPLACE INTO tblogin 
      (idLogin, nome, cognome, email, password, societa, tecnicocod, attivo, typeutente, colore, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    let inserted = 0;
    let failed = 0;

    for (const user of users) {
      try {
        insert.run(
          user.idLogin,
          user.nome,
          user.cognome,
          user.email,
          user.password,
          user.societa,
          user.tecnicocod,
          user.attivo,
          user.typeutente,
          user.colore || null
        );
        console.log(`  ✓ ${user.email}`);
        inserted++;
      } catch (error) {
        console.log(`  ⚠ ${user.email}: ${error.message}`);
        failed++;
      }
    }

    db.close();
    await pool.close();

    console.log(`\n✅ Migrazione completata!`);
    console.log(`   Utenti inseriti: ${inserted}`);
    console.log(`   Errori: ${failed}`);
    console.log(`\n📌 Puoi testare il login con:`);
    console.log(`   Nome utente (email): ${users[0]?.email}`);
    console.log(`   Password: ${users[0]?.password}`);
    
  } catch (error) {
    console.error('\n❌ Errore durante la migrazione:');
    console.error(`   ${error.message}`);
    if (error.originalError) {
      console.error(`   Dettagli: ${error.originalError.message}`);
    }
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

main();
