#!/usr/bin/env node
const { createClient } = require('@libsql/client');
const sql = require('mssql');
require('dotenv').config();

// TURSO Clients
const tursoAssistenza = createClient({
  url: 'libsql://assistenza-paolozxs.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzA5OTI2NDksImlkIjoiNTEyNmNhZjktNWM5NC00NzkwLTk0ZjQtMmVlZTM0YWM3YmY0IiwicmlkIjoiNTVmZTJiMmUtZmMxYi00ZDJhLWE4NGMtMDY5ODhkMmZiYmFmIn0.SkSNw5DaJ-qClcVoYxNr-CFeGjRO3IPRtUKoLNxi7jdje_9-ubdh_kcM9BUySCFJGyU90lg7KXB23O1igESDBA'
});

const tursoDati = createClient({
  url: 'libsql://condivisionedati-paolozxs.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzA5OTI3MTUsImlkIjoiMjg0NzliNzctNTMyYS00NzYyLTkyM2UtYjE4NTcwNzYyYTFjIiwicmlkIjoiYzVhZGIwYzEtNTE2ZC00ZjlhLWE2ZTctMDUyMTY2MGE3NWJkIn0.2BPtvp6SuJe3MHZF13u6RCz-3rYrQFWmBIgW2CC6ISn-ZnqVMtt-1_FJ9Egj4jJeFOVU28xmAyEZSwD5vOChCA'
});

// SQL Server connection
const sqlConfig = {
  server: 'ALESSIA\\SQLEXPRESS',
  authentication: {
    type: 'default',
    options: {
      trustedConnection: true,
    },
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function migrateCondivisioneDati() {
  console.log('🚀 Migrando CondivisioneDati...');
  
  try {
    // Connessione a SQL Server
    const pool = new sql.ConnectionPool(sqlConfig);
    await pool.connect();

    // Query users da SQL Server
    const result = await pool.request()
      .input('attivo', sql.Char(1), 'S')
      .query(`SELECT * FROM CondivisioneDati.dbo.TbLogin WHERE attivo = @attivo ORDER BY idLogin`);

    const users = result.recordset;
    console.log(`✓ Trovati ${users.length} utenti su SQL Server`);

    // Crea tabella TbLogin su TURSO
    await tursoDati.execute(`
      DROP TABLE IF EXISTS tblogin
    `);

    await tursoDati.execute(`
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

    // Inserisci dati nel TURSO
    for (const user of users) {
      await tursoDati.execute(`
        INSERT INTO tblogin (idLogin, nome, cognome, email, password, societa, tecnicocod, attivo, typeutente, colore)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        user.idLogin,
        user.nome || '',
        user.cognome || '',
        user.email || '',
        user.password || '',
        user.societa || '',
        user.tecnicocod || '',
        user.attivo || 'S',
        user.typeutente || '',
        user.colore || ''
      ]);
    }
    console.log(`✓ Inseriti ${users.length} utenti in TURSO CondivisioneDati`);

    // Chiudi connessione SQL Server
    await pool.close();

  } catch (error) {
    console.error('❌ Errore durante migrazione CondivisioneDati:', error.message);
    throw error;
  }
}

async function testTursoConnection() {
  console.log('\n📡 Testing TURSO connections...');
  
  try {
    // Test Assistenza
    const result1 = await tursoAssistenza.execute('SELECT 1 as test');
    console.log('✓ TURSO Assistenza: OK');

    // Test CondivisioneDati
    const result2 = await tursoDati.execute('SELECT 1 as test');
    console.log('✓ TURSO CondivisioneDati: OK');

    console.log('\n✅ Entrambi i database TURSO sono raggiungibili!');
  } catch (error) {
    console.error('❌ Errore di connessione a TURSO:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🔄 Inizio migrazione da SQL Server a TURSO...\n');

  try {
    // Test connections prima di iniziare
    await testTursoConnection();

    // Migra CondivisioneDati
    await migrateCondivisioneDati();

    console.log('\n✅ Migrazione completata con successo!');
    console.log('📊 I dati sono ora su TURSO ed pronti per Vercel');

  } catch (error) {
    console.error('\n❌ Errore fatale durante la migrazione:', error.message);
    process.exit(1);
  }
}

main();
