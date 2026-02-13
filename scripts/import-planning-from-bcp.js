#!/usr/bin/env node

/**
 * Importa dati da BCP file nel TURSO
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require('@libsql/client');
const fs = require('fs');
const readline = require('readline');

async function importBCPDataToTurso() {
  console.log('🚀 Importazione dati PlanningInterventi da BCP file → TURSO\n');
  
  try {
    // Connetti a TURSO Assistenza
    console.log('☁️  Connessione a TURSO Assistenza...');
    const tursoClient = createClient({
      url: process.env.DATABASE_URL_ASSISTENZA,
    });
    console.log('✓ Connesso a TURSO\n');

    // Crea tabella se non esiste
    console.log('📝 Creazione tabella PlanningInterventi...');
    try {
      await tursoClient.execute(`
        DROP TABLE IF EXISTS PlanningInterventi
      `);
      
      await tursoClient.execute(`
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
      console.log('✓ Tabella creata\n');
    } catch (err) {
      console.log('⚠️  Errore creazione tabella:', err.message, '\n');
    }

    // Leggi file BCP
    console.log('📥 Lettura dati da planning_data.txt...');
    const fileStream = fs.createReadStream('planning_data.txt', { encoding: 'utf-8' });
    
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lineCount = 0;
    let inserted = 0;
    let failed = 0;
    let buffer = [];
    const BATCH_SIZE = 50; // Inserisci 50 righe alla volta

    for await (const line of rl) {
      lineCount++;
      
      // Skip empty lines
      if (!line.trim()) continue;

      // Parse BCP line (campi separati da tab)
      const fields = line.split('\t');
      
      if (fields.length < 15) {
        console.log(`⚠️ Linha ${lineCount}: formato non valido (${fields.length} campi)`);
        failed++;
        continue;
      }

      try {
        // Parse campi (gestisci i tipi di dato correttamente)
        const id = parseInt(fields[0]);
        const proprietario = fields[1] || null;
        
        // Data: se è NULL in SQL Server, sarà stringa vuota
        let data = fields[2] || null;
        if (data) {
          // Se è formato SQL Server datetime, estrai solo la data
          if (data.includes('-')) {
            data = data.split(' ')[0]; // Prendi solo YYYY-MM-DD
          }
        }

        const tecnico = fields[3] || null;
        const codcliente = fields[4] || null;
        const cliente = fields[5] || null;
        const oggetto = fields[6] || null;
        const giornataintera = fields[7] || null;
        const orainizio = fields[8] || null;
        const orafine = fields[9] || null;
        const confermato = fields[10] || null;
        const varie = fields[11] || null;
        const eseguito = fields[12] || null;
        const privato = fields[13] || null;
        const colore = fields[14] || null;

        buffer.push({
          id, proprietario, data, tecnico, codcliente, cliente, oggetto,
          giornataintera, orainizio, orafine, confermato, varie,
          eseguito, privato, colore
        });

        // Se il buffer raggiunge dimensione, inserisci
        if (buffer.length >= BATCH_SIZE) {
          for (const record of buffer) {
            try {
              await tursoClient.execute(`
                INSERT OR REPLACE INTO PlanningInterventi
                (id, Proprietario, Data, Tecnico, Codcliente, Cliente, Oggetto,
                 Giornataintera, OraInizio, OraFine, Confermato, Varie, eseguito, Privato, Colore)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                record.id,
                record.proprietario,
                record.data,
                record.tecnico,
                record.codcliente,
                record.cliente,
                record.oggetto,
                record.giornataintera,
                record.orainizio,
                record.orafine,
                record.confermato,
                record.varie,
                record.eseguito,
                record.privato,
                record.colore
              ]);
              inserted++;
            } catch (err) {
              failed++;
            }
          }
          buffer = [];

          // Progress
          if (lineCount % 1000 === 0) {
            console.log(`  Processati ${lineCount} righe... (${inserted} inseriti)`);
          }
        }

      } catch (err) {
        console.log(`⚠️  Linha ${lineCount}: ${err.message}`);
        failed++;
      }
    }

    // Inserisci le righe rimaste nel buffer
    console.log(`\n💾 Inserimento ultime righe nel buffer...`);
    for (const record of buffer) {
      try {
        await tursoClient.execute(`
          INSERT OR REPLACE INTO PlanningInterventi
          (id, Proprietario, Data, Tecnico, Codcliente, Cliente, Oggetto,
           Giornataintera, OraInizio, OraFine, Confermato, Varie, eseguito, Privato, Colore)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          record.id,
          record.proprietario,
          record.data,
          record.tecnico,
          record.codcliente,
          record.cliente,
          record.oggetto,
          record.giornataintera,
          record.orainizio,
          record.orafine,
          record.confermato,
          record.varie,
          record.eseguito,
          record.privato,
          record.colore
        ]);
        inserted++;
      } catch (err) {
        console.log(`⚠️  Buffer: ${err.message}`);
        failed++;
      }
    }

    console.log(`\n✅ Importazione completata!`);
    console.log(`   Righe lette dal file: ${lineCount}`);
    console.log(`   Appuntamenti inseriti: ${inserted}`);
    console.log(`   Errori: ${failed}`);
    console.log(`\n🎉 Il Planning ora ha ${inserted} appuntamenti dal database reale!`);

  } catch (error) {
    console.error('\n❌ Errore:', error.message);
    process.exit(1);
  }
}

importBCPDataToTurso();
