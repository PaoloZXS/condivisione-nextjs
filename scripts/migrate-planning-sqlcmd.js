#!/usr/bin/env node

/**
 * Script per esportare dati da SQL Server via sqlcmd e importare in TURSO
 */

require("dotenv").config({ path: ".env.local" });
const { execSync } = require('child_process');
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log('🚀 Migrazione PlanningInterventi via sqlcmd → TURSO\n');

    // Estrai dati con sqlcmd in formato CSV
    console.log('📥 Estrazione dati da SQL Server (Assistenza) via sqlcmd...');
    const sqlQuery = `
      SET NOCOUNT ON;
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
    `;

    // Esegui query via sqlcmd
    const csvOutput = execSync(
      `sqlcmd -S "ALESSIA\\SQLEXPRESS" -E -Q "${sqlQuery.replace(/\n/g, ' ')}" -o "temp-planning.txt" -W`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );

    // Leggi il file di output
    let rawData = fs.readFileSync('temp-planning.txt', 'utf-8');
    console.log(`✓ Dati estratti\n`);

    // Parse dei dati (sqlcmd output è complesso, facciamo una query JSON)
    console.log('📊 Parsing dati...');
    
    // Prova con query JSON (SQL Server 2016+)
    let jsonQuery = `
      SET NOCOUNT ON;
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
      FOR JSON PATH
    `;

    const jsonOutput = execSync(
      `sqlcmd -S "ALESSIA\\SQLEXPRESS" -E -Q "${jsonQuery.replace(/\n/g, ' ')}" -h -1 -w 8000`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );

    let events = [];
    try {
      events = JSON.parse(jsonOutput);
      console.log(`✓ ${events.length} appuntamenti trovati\n`);
    } catch (e) {
      // Se JSON non funziona, usa il metodo manuale
      console.log('⚠️  JSON parsing fallito, uso metodo alternativo...\n');
      
      // Estrai con delimitatore
      const delimitedQuery = `
        SET NOCOUNT ON;
        SELECT 
          'RECORD_START' as marker,
          Id, Proprietario, Data, Tecnico, Codcliente, Cliente, Oggetto, 
          Giornataintera, OraInizio, OraFine, Confermato, Varie, eseguito, Privato, Colore
        FROM [Assistenza].dbo.PlanningInterventi
        ORDER BY Data DESC
      `;
      
      const delimitedOutput = execSync(
        `sqlcmd -S "ALESSIA\\SQLEXPRESS" -E -Q "${delimitedQuery.replace(/\n/g, ' ')}" -s "|||"`,
        { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
      );

      const lines = delimitedOutput.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('RECORD_START')) {
          const parts = line.split('|||');
          if (parts.length >= 16) {
            events.push({
              Id: parseInt(parts[1]),
              Proprietario: parts[2] || null,
              Data: parts[3] || null,
              Tecnico: parts[4] || null,
              Codcliente: parts[5] || null,
              Cliente: parts[6] || null,
              Oggetto: parts[7] || null,
              Giornataintera: parts[8] || null,
              OraInizio: parts[9] || null,
              OraFine: parts[10] || null,
              Confermato: parts[11] || null,
              Varie: parts[12] || null,
              eseguito: parts[13] || null,
              Privato: parts[14] || null,
              Colore: parts[15] || null
            });
          }
        }
      }
      console.log(`✓ ${events.length} appuntamenti estratti (metodo alternativo)\n`);
    }

    if (events.length === 0) {
      console.log('❌ Nessun dato trovato!\n');
      process.exit(1);
    }

    // Connetti a TURSO
    console.log('☁️  Connessione a TURSO Assistenza...');
    const tursoClient = createClient({
      url: process.env.DATABASE_URL_ASSISTENZA,
    });
    console.log('✓ Connesso a TURSO\n');

    // Crea tabella in TURSO
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
      console.log('✓ Tabella creata\n');
    } catch (err) {
      console.log('  (Tabella potrebbe già esistere)\n');
    }

    // Inserisci in TURSO
    console.log('💾 Inserimento in TURSO...');
    let inserted = 0;
    let failed = 0;

    for (const event of events) {
      try {
        // Formatta data se necessario
        let dataStr = event.Data;
        if (event.Data instanceof Date) {
          dataStr = event.Data.toISOString().split('T')[0];
        } else if (typeof event.Data === 'string') {
          // Estrai solo la data se c'è timestamp
          const match = event.Data.match(/\d{4}-\d{2}-\d{2}/);
          if (match) dataStr = match[0];
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

        console.log(`  ✓ ID ${event.Id}: ${event.Oggetto?.substring(0, 40)}`);
        inserted++;
      } catch (error) {
        console.log(`  ⚠ ID ${event.Id}: ${error.message.substring(0, 50)}`);
        failed++;
      }
    }

    // Cleanup
    try {
      fs.unlinkSync('temp-planning.txt');
    } catch (e) {}

    console.log(`\n✅ Migrazione completata!`);
    console.log(`   Appuntamenti inseriti: ${inserted}`);
    console.log(`   Errori: ${failed}`);
    console.log(`\n🎉 Il Planning dovrebbe ora mostrare ${inserted} appuntamenti!`);
    
  } catch (error) {
    console.error('\n❌ Errore durante la migrazione:');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

main();
