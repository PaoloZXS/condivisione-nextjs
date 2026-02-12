#!/usr/bin/env node
/**
 * Script di export: SQL Server → SQLite locale
 * Usa per testare localmente prima della migrazione a Turso
 */

const sql = require('mssql');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'prisma', 'migration.db');
const MSSQL_DATABASE = 'db_CondivisioneDati202601241805';

const TABLES = [
  'TbLogin',
  'tabclienti',
  'taboperazioni',
  'tabcontratti',
  'tabprodotti',
  'tabclientiprodotti',
  'tabclienticontatti',
  'tabclienticontratti',
  'tabclientinote'
];

// Funzione per connettersi a SQL Server
async function connectToSqlServer() {
  const config = {
    server: 'ALESSIA',
    instanceName: 'SQLEXPRESS',
    database: MSSQL_DATABASE,
    authentication: {
      type: 'default'
    },
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
      trustedConnection: true // Windows Auth
    }
  };

  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  return pool;
}

// Schema per SQLite (mapper da SQL Server)
const SCHEMAS = {
  TbLogin: `
    CREATE TABLE IF NOT EXISTS "TbLogin" (
      idLogin INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      cognome TEXT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      societa TEXT,
      tecnicocod TEXT,
      attivo TEXT DEFAULT 'S',
      typeutente TEXT DEFAULT 'AMMINISTRATORE',
      colore TEXT
    )
  `,
  tabclienti: `
    CREATE TABLE IF NOT EXISTS "tabclienti" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codicecliente TEXT,
      idazienda INTEGER
    )
  `,
  taboperazioni: `
    CREATE TABLE IF NOT EXISTS "taboperazioni" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datacreazione DATETIME,
      tipo TEXT,
      codice TEXT,
      anno INTEGER,
      idazienda INTEGER,
      idcliente INTEGER,
      idintervento INTEGER,
      operatore TEXT,
      idprodotto INTEGER,
      dataesecuzione DATETIME,
      orainizio INTEGER,
      orafine INTEGER,
      totaleore INTEGER,
      osservazioni TEXT,
      codicecliente TEXT,
      stato INTEGER,
      eliminato TEXT,
      idprodottocliente INTEGER,
      faseoperazione INTEGER
    )
  `,
  tabcontratti: `
    CREATE TABLE IF NOT EXISTS "tabcontratti" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo INTEGER,
      denominazione TEXT,
      tipodurata TEXT,
      durata INTEGER,
      avvprima INTEGER,
      avvdopo INTEGER,
      cancellato TEXT
    )
  `,
  tabprodotti: `
    CREATE TABLE IF NOT EXISTS "tabprodotti" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT
    )
  `,
  tabclientiprodotti: `
    CREATE TABLE IF NOT EXISTS "tabclientiprodotti" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idcliente INTEGER,
      idprodotto INTEGER
    )
  `,
  tabclienticontatti: `
    CREATE TABLE IF NOT EXISTS "tabclienticontatti" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idcliente INTEGER
    )
  `,
  tabclienticontratti: `
    CREATE TABLE IF NOT EXISTS "tabclienticontratti" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idcliente INTEGER
    )
  `,
  tabclientinote: `
    CREATE TABLE IF NOT EXISTS "tabclientinote" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idcliente INTEGER
    )
  `
};

// Main migration
async function migrate() {
  console.log('🚀 Inizio migrazione: SQL Server → SQLite locale\n');

  let sqlPool;

  try {
    // Eliminare DB precedente se esiste
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
      console.log(`♻️  Database precedente eliminato: ${DB_PATH}\n`);
    }

    // Connessione SQL Server
    console.log('📡 Connessione a SQL Server...');
    sqlPool = await connectToSqlServer();
    console.log('✓ Connesso a SQL Server (ALESSIA\\SQLEXPRESS)\n');

    // Creazione database SQLite
    console.log('💾 Creazione database SQLite...');
    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    console.log(`✓ Database creato: ${DB_PATH}\n`);

    // Create tables in SQLite
    console.log('📋 Creazione tabelle...');
    for (const [tableName, schema] of Object.entries(SCHEMAS)) {
      try {
        db.exec(schema);
        console.log(`  ✓ ${tableName}`);
      } catch (error) {
        console.error(`  ✗ ${tableName}: ${error.message}`);
      }
    }
    console.log('');

    // Migration data
    console.log('📤 Migrazione dei dati...\n');
    for (const tableName of TABLES) {
      try {
        // Estrazione da SQL Server
        const request = sqlPool.request();
        const result = await request.query(`SELECT * FROM [${tableName}]`);
        const records = result.recordset;

        if (records.length === 0) {
          console.log(`  - ${tableName}: nessun dato`);
          continue;
        }

        // Inserimento in SQLite
        const columns = Object.keys(records[0]);
        const placeholders = columns.map(() => '?').join(',');
        const columnList = columns.map(c => `"${c}"`).join(',');
        const insertSql = `INSERT INTO "${tableName}" (${columnList}) VALUES (${placeholders})`;

        const insertStmt = db.prepare(insertSql);
        
        let inserted = 0;
        for (const record of records) {
          const values = columns.map(col => record[col] ?? null);
          try {
            insertStmt.run(...values);
            inserted++;
          } catch (err) {
            console.error(`    Errore: ${err.message}`);
          }
        }

        console.log(`  ✓ ${tableName}: ${inserted}/${records.length} record`);
      } catch (error) {
        console.error(`  ✗ ${tableName}: ${error.message}`);
      }
    }

    console.log('\n✅ Migrazione locale completata!');
    console.log(`Database: ${DB_PATH}`);
    console.log('\nProssimi step:');
    console.log('1. npx prisma migrate dev --name initial');
    console.log('2. npm run dev');
    console.log('3. Testare login con credenziali di SQL Server');

    db.close();

  } catch (error) {
    console.error('\n❌ Errore durante la migrazione:', error.message);
    process.exit(1);
  } finally {
    if (sqlPool) {
      await sqlPool.close();
    }
  }
}

migrate();
