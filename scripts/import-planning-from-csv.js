#!/usr/bin/env node

/**
 * Importa dati da CSV file nel TURSO usando csv-parser
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require('@libsql/client');
const fs = require('fs');
const csv = require('csv-parser');

async function importCSVDataToTurso() {
  console.log('🚀 Importazione dati PlanningInterventi da CSV → TURSO\n');
  
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
      await tursoClient.execute(`DROP TABLE IF EXISTS PlanningInterventi`);
      
      await tursoClient.execute(`
        CREATE TABLE PlanningInterventi (
          id INTEGER PRIMARY KEY,
          Proprietario TEXT,
          Data TEXT,
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

    // Leggi ed importa CSV
    console.log('📥 Lettura e importazione dati da planning_data.csv...');
    let inserted = 0;
    let failed = 0;
    let processed = 0;

    await new Promise((resolve, reject) => {
      fs.createReadStream('planning_data.csv')
        .pipe(csv())
        .on('data', async (row) => {
          processed++;

          try {
            // Mappe colonne da CSV al database
            const data = {
              id: parseInt(row.Id) || row['ID'] || null,
              proprietario: row.Proprietario || row.PROPRIETARIO || null,
              data: row.Data || row.DATA || null,
              tecnico: row.Tecnico || row.TECNICO || null,
              codcliente: row.Codcliente || row.CODCLIENTE || null,
              cliente: row.Cliente || row.CLIENTE || null,
              oggetto: row.Oggetto || row.OGGETTO || null,
              giornataintera: row.Giornataintera || row.GIORNATAINTERA || null,
              orainizio: row.OraInizio || row.ORAINIZIO || null,
              orafine: row.OraFine || row.ORAFINE || null,
              confermato: row.Confermato || row.CONFERMATO || null,
              varie: row.Varie || row.VARIE || null,
              eseguito: row.eseguito || row.ESEGUITO || null,
              privato: row.Privato || row.PRIVATO || null,
              colore: row.Colore || row.COLORE || null
            };

            // Valida ID
            if (!data.id) {
              failed++;
              return;  
            }

            // Formatta data se necessario
            if (data.data && data.data.includes('T')) {
              data.data = data.data.split('T')[0];
            }

            await tursoClient.execute(`
              INSERT OR REPLACE INTO PlanningInterventi
              (id, Proprietario, Data, Tecnico, Codcliente, Cliente, Oggetto,
               Giornataintera, OraInizio, OraFine, Confermato, Varie, eseguito, Privato, Colore)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              data.id,
              data.proprietario,
              data.data,
              data.tecnico,
              data.codcliente,
              data.cliente,
              data.oggetto,
              data.giornataintera,
              data.orainizio,
              data.orafine,
              data.confermato,
              data.varie,
              data.eseguito,
              data.privato,
              data.colore
            ]);

            inserted++;

            // Progress ogni 1000 righe
            if (processed % 1000 === 0) {
              console.log(`  Processati ${processed} righe... (${inserted} inseriti)`);
            }

          } catch (err) {
            console.log(` ⚠️  Riga ${processed}: ${err.message.substring(0, 50)}`);
            failed++;
          }
        })
        .on('end', () => {
          console.log(`\n✅ Importazione completata!`);
          console.log(`   Righe processate: ${processed}`);
          console.log(`   Appuntamenti inseriti: ${inserted}`);
          console.log(`   Errori: ${failed}`);
          console.log(`\n🎉 Il Planning ora ha ${inserted} appuntamenti dal database reale!`);
          resolve();
        })
        .on('error', (err) => {
          console.error('\n❌ Errore parsing CSV:', err.message);
          reject(err);
        });
    });

  } catch (error) {
    console.error('\n❌ Errore:', error.message);
    process.exit(1);
  }
}

importCSVDataToTurso();
