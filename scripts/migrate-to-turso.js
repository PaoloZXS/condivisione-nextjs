#!/usr/bin/env node
/**
 * Migration script: SQL Server → Turso
 * Estrae dati da db_CondivisioneDati202601241805 e li migra in Turso
 */

const sql = require('mssql');
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Configuration
const TURSO_TOKEN = process.env.TURSO_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiIxYWJlNDk4YS01ODg1LTQ4MTItOWFmMy1hZjU4ZTVkODU0ZDYiLCJpYXQiOjE3NzA5Mjg2NDYsInJpZCI6ImZmN2RhMGExLTRjOTAtNGU2Zi1hY2RlLWVlOWZjZWMxMTRjNCJ9.EKyHDAHLbKkXaR3R70-F6MW71x92G43mf1-tzccvoQ1WEc3KfKBWhMluFTZy0eW4YX_sMVn7SUTNJ-8ExvdhBA';
const TURSO_DB_URL = process.env.TURSO_DB_URL || 'libsql://condivisione-db-paolozxs.turso.io';

const MSSQL_CONFIG = {
  server: 'ALESSIA\\SQLEXPRESS',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.MSSQL_USER,
      password: process.env.MSSQL_PASSWORD
    }
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

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

// Connect to SQL Server with Windows Auth
async function connectToSqlServer() {
  const config = {
    server: 'ALESSIA\\SQLEXPRESS',
    database: 'db_CondivisioneDati202601241805',
    authentication: {
      type: 'ntlm',
      options: {
        userName: process.env.MSSQL_USER || undefined,
        password: process.env.MSSQL_PASSWORD || undefined
      }
    },
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
      instanceName: 'SQLEXPRESS'
    }
  };

  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  return pool;
}

// Export data from SQL Server
async function exportFromSqlServer(pool, tableName) {
  try {
    const request = pool.request();
    const result = await request.query(`SELECT * FROM [${tableName}]`);
    console.log(`✓ Esportati ${result.recordset.length} record da ${tableName}`);
    return result.recordset;
  } catch (error) {
    console.error(`✗ Errore nell'export da ${tableName}:`, error.message);
    return [];
  }
}

// Create tables in Turso
async function createTablesInTurso(client) {
  const schemas = {
    TbLogin: `
      CREATE TABLE IF NOT EXISTS "TbLogin" (
        idLogin INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        cognome TEXT,
        email TEXT UNIQUE,
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

  for (const [table, schema] of Object.entries(schemas)) {
    try {
      await client.execute(schema);
      console.log(`✓ Tabella creata: ${table}`);
    } catch (error) {
      console.error(`✗ Errore nel creare ${table}:`, error.message);
    }
  }
}

// Insert data into Turso
async function insertIntoTurso(client, tableName, records) {
  if (records.length === 0) return;

  // Get column names
  const columns = Object.keys(records[0]);
  const placeholders = columns.map(() => '?').join(',');
  const columnList = columns.map(c => `"${c}"`).join(',');

  const sql = `INSERT INTO "${tableName}" (${columnList}) VALUES (${placeholders})`;

  let inserted = 0;
  for (const record of records) {
    const values = columns.map(col => record[col] ?? null);
    try {
      await client.execute({
        sql: sql,
        args: values
      });
      inserted++;
    } catch (error) {
      console.error(`✗ Errore nell'inserimento in ${tableName}:`, error.message);
    }
  }

  console.log(`✓ Inseriti ${inserted}/${records.length} record in ${tableName}`);
}

// Main migration function
async function migrate() {
  console.log('🚀 Inizio migrazione da SQL Server a Turso...\n');

  let sqlPool;
  let tursoClient;

  try {
    // Connect to SQL Server (Windows Auth)
    console.log('📡 Connessione a SQL Server...');
    sqlPool = await connectToSqlServer();
    console.log('✓ Connesso a SQL Server (ALESSIA\\SQLEXPRESS)\n');

    // Connect to Turso
    console.log('☁️  Connessione a Turso...');
    tursoClient = createClient({
      url: TURSO_DB_URL,
      authToken: TURSO_TOKEN
    });
    console.log('✓ Connesso a Turso\n');

    // Create tables in Turso
    console.log('📋 Creazione tabelle in Turso...');
    await createTablesInTurso(tursoClient);
    console.log('');

    // Migration loop
    console.log('📤 Esportazione e import dei dati...\n');
    for (const tableName of TABLES) {
      const records = await exportFromSqlServer(sqlPool, tableName);
      if (records.length > 0) {
        await insertIntoTurso(tursoClient, tableName, records);
      }
    }

    console.log('\n✅ Migrazione completata con successo!');
    console.log(`Database Turso: ${TURSO_DB_URL}`);

  } catch (error) {
    console.error('\n❌ Errore durante la migrazione:', error.message);
    process.exit(1);
  } finally {
    if (sqlPool) {
      await sqlPool.close();
    }
  }
}

// Run migration
migrate();
