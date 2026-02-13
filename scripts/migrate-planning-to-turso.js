#!/usr/bin/env node

/**
 * Script per estrarre dati da SQL Server (Assistenza) 
 * e popolare TURSO Assistenza
 */

require("dotenv").config({ path: ".env.local" });
const sql = require('mssql');
const { createClient } = require('@libsql/client');

// SQL Server local config
const sqlConfig = {
  server: 'ALESSIA\\SQLEXPRESS',
  database: 'Assistenza',
  authentication: {
    type: 'default'
  },
  options: {
    trustServerCertificate: true,
    encrypt: false,
    connectionTimeout: 60000,
    requestTimeout: 60000
  }
};

async function main() {
  let pool;
  try {
    console.log('🚀 Migrazione PlanningInterventi da SQL Server → TURSO\n');

    // Connetti a SQL Server
    console.log('📡 Connessione a SQL Server (Assistenza)...');
    pool = new sql.ConnectionPool(sqlConfig);
    await pool.connect();
    console.log('✓ Connesso a SQL Server\n');

    // Connetti a TURSO
    console.log('☁️  Connessione a TURSO Assistenza...');
    const tursoClient = createClient({
      url: process.env.DATABASE_URL_ASSISTENZA,
    });
    console.log('✓ Connesso a TURSO\n');

    // Estrai dati da SQL Server
    console.log('📥 Estrazione dati da SQL Server...');
    const queryResult = await pool.request().query(`
      SELECT 
        Id,
        Proprietario,
        Data,
        Tecnico,
        Codcliente,
        Cliente,
        Oggetto,
        Giornataintera,
        OraInizio,
        OraFine,
        Confermato,
        Varie,
        eseguito,
        Privato,
        Colore
      FROM [Assistenza].dbo.PlanningInterventi
      ORDER BY Data DESC
    `);

    const events = queryResult.recordset;
    console.log(`✓ ${events.length} appuntamenti estratti\n`);

    if (events.length === 0) {
      console.log('⚠️  Nessun dato trovato in PlanningInterventi!\n');
      process.exit(0);
    }

    // Crea tabella in TURSO se non esiste
    console.log('📝 Creazione tabella in TURSO...');
    try {
      await tursoClient.execute({
        sql: `
          CREATE TABLE IF NOT EXISTS PlanningInterventi (
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
        `
      });
      console.log('✓ Tabella PlanningInterventi creata\n');
    } catch (err) {
      console.log('  (Tabella potrebbe già esistere)\n');
    }

    // Inserisci in TURSO
    console.log('💾 Inserimento in TURSO...');
    let inserted = 0;
    let failed = 0;

    for (const event of events) {
      try {
        // Format data if needed
        let dataStr = event.Data;
        if (event.Data instanceof Date) {
          dataStr = event.Data.toISOString().split('T')[0];
        } else if (typeof event.Data === 'string') {
          // Try to parse and reformat
          dataStr = event.Data;
        }

        await tursoClient.execute({
          sql: `
            INSERT OR REPLACE INTO PlanningInterventi 
            (id, Proprietario, Data, Tecnico, Codcliente, Cliente, Oggetto, 
             Giornataintera, OraInizio, OraFine, Confermato, Varie, eseguito, Privato, Colore)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            event.Id,
            event.Proprietario || null,
            dataStr,
            event.Tecnico || null,
            event.Codcliente || null,
            event.Cliente || null,
            event.Oggetto || null,
            event.Giornataintera || null,
            event.OraInizio || null,
            event.OraFine || null,
            event.Confermato || null,
            event.Varie || null,
            event.eseguito || null,
            event.Privato || null,
            event.Colore || null
          ]
        });

        console.log(`  ✓ ID ${event.Id}: ${event.Oggetto}`);
        inserted++;
      } catch (error) {
        console.log(`  ⚠ ID ${event.Id}: ${error.message}`);
        failed++;
      }
    }

    await pool.close();

    console.log(`\n✅ Migrazione completata!`);
    console.log(`   Appuntamenti inseriti: ${inserted}`);
    console.log(`   Errori: ${failed}`);
    console.log(`\n📌 Il Planning dovrebbe ora mostrare ${inserted} appuntamenti!`);
    
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
