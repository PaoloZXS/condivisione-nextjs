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

async function migratePlanningInterventi() {
  console.log('🚀 Migrando PlanningInterventi da Assistenza...');
  
  try {
    // Connessione a SQL Server
    const pool = new sql.ConnectionPool(sqlConfig);
    await pool.connect();

    // Query planning events da SQL Server Assistenza
    const result = await pool.request()
      .query(`
        SELECT 
          Id, Proprietario, Data, Tecnico, Codcliente, Cliente, Oggetto,
          Giornataintera, OraInizio, OraFine, Confermato, Varie, 
          eseguito, Privato, Colore
        FROM [Assistenza].dbo.PlanningInterventi 
        ORDER BY Data DESC
      `);

    const events = result.recordset;
    console.log(`✓ Trovati ${events.length} appuntamenti su SQL Server`);

    if (events.length === 0) {
      console.log('⚠️  Nessun appuntamento trovato nella tabella PlanningInterventi');
      await pool.close();
      return;
    }

    // Crea tabella PlanningInterventi su TURSO Assistenza
    await tursoAssistenza.execute(`
      DROP TABLE IF EXISTS PlanningInterventi
    `);

    await tursoAssistenza.execute(`
      CREATE TABLE PlanningInterventi (
        id INTEGER PRIMARY KEY,
        Proprietario TEXT,
        Data TEXT NOT NULL,
        Tecnico TEXT,
        Codcliente TEXT,
        Cliente TEXT,
        Oggetto TEXT,
        Giornataintera TEXT,
        OraInizio TEXT,
        OraFine TEXT,
        Confermato TEXT,
        Varie TEXT,
        eseguito TEXT,
        Privato TEXT,
        Colore TEXT
      )
    `);
    console.log('✓ Tabella PlanningInterventi creata su TURSO');

    // Inserisci dati nel TURSO
    let inserted = 0;
    for (const event of events) {
      // Formatta data
      let dataStr = '';
      if (event.Data) {
        if (event.Data instanceof Date) {
          dataStr = event.Data.toISOString().split('T')[0];
        } else {
          dataStr = event.Data.toString();
        }
      }

      try {
        await tursoAssistenza.execute(`
          INSERT INTO PlanningInterventi 
          (id, Proprietario, Data, Tecnico, Codcliente, Cliente, Oggetto,
           Giornataintera, OraInizio, OraFine, Confermato, Varie, eseguito, Privato, Colore)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          event.Id,
          event.Proprietario || '',
          dataStr || '',
          event.Tecnico || '',
          event.Codcliente || '',
          event.Cliente || '',
          event.Oggetto || '',
          event.Giornataintera || '',
          event.OraInizio || '',
          event.OraFine || '',
          event.Confermato || '',
          event.Varie || '',
          event.eseguito || '',
          event.Privato || '',
          event.Colore || ''
        ]);
        inserted++;
      } catch (err) {
        console.log(`  ⚠ ID ${event.Id}: ${err.message.substring(0, 50)}`);
      }
    }
    
    console.log(`✓ Inseriti ${inserted} appuntamenti in TURSO Assistenza`);

    // Chiudi connessione SQL Server
    await pool.close();

  } catch (error) {
    console.error('❌ Errore durante migrazione PlanningInterventi:', error.message);
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

    // Migra PlanningInterventi da Assistenza
    await migratePlanningInterventi();

    console.log('\n✅ Migrazione completata con successo!');
    console.log('📊 I dati di Planning sono ora su TURSO ed pronti per il calendario');

  } catch (error) {
    console.error('\n❌ Errore fatale durante la migrazione:', error.message);
    process.exit(1);
  }
}

main();
