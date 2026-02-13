#!/usr/bin/env node

/**
 * Importa dati da JSON file nel TURSO
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require('@libsql/client');
const fs = require('fs');

async function importJSONDataToTurso() {
  console.log('🚀 Importazione dati PlanningInterventi da JSON → TURSO\n');
  
  try {
    // Leggi il file JSON
    console.log('📥 Lettura dati da planning_data.json...');
    const jsonData = fs.readFileSync('planning_data.json', 'utf-8');
    const events = JSON.parse(jsonData);
    
    if (!Array.isArray(events)) {
      console.log('❌ File JSON non è un array!');
      process.exit(1);
    }
    
    console.log(`✓ Letti ${events.length} appuntamenti\n`);

    // Connetti a TURSO Assistenza
    console.log('☁️  Connessione a TURSO Assistenza...');
    const tursoClient = createClient({
      url: process.env.DATABASE_URL_ASSISTENZA,
    });
    console.log('✓ Connesso a TURSO\n');

    // Crea tabella
    console.log('📝 Creazione tabella PlanningInterventi...');
    try {
      await tursoClient.execute(`DROP TABLE IF EXISTS PlanningInterventi`);
      
      await tursoClient.execute(`
        CREATE TABLE PlanningInterventi (
          id INTEGER PRIMARY KEY,
          Proprietario TEXT,
          Data TEXT,
          Tecnico TEXT,
          CodCliente TEXT,
          Cliente TEXT,
          Oggetto TEXT,
          GiornataIntera TEXT,
          OraInizio TEXT,
          OraFine TEXT,
          Confermato TEXT,
          Varie TEXT,
          eseguito TEXT,
          Privato TEXT
        )
      `);
      console.log('✓ Tabella creata\n');
    } catch (err) {
      console.log('⚠️  Tabella potrebbe già esistere\n');
    }

    // Importa dati
    console.log('💾 Inserimento appuntamenti in TURSO...');
    let inserted = 0;
    let failed = 0;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      try {
        // Validazione
        if (!event.id) {
          failed++;
          continue;
        }

        // Formatta data
        let dataStr = event.Data || '';
        if (dataStr && dataStr.includes('T')) {
          dataStr = dataStr.split('T')[0];
        }

        await tursoClient.execute(`
          INSERT OR REPLACE INTO PlanningInterventi
          (id, Proprietario, Data, Tecnico, CodCliente, Cliente, Oggetto,
           GiornataIntera, OraInizio, OraFine, Confermato, Varie, eseguito, Privato)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          event.id,
          event.Proprietario || null,
          dataStr || null,
          event.Tecnico || null,
          event.CodCliente || null,
          event.Cliente || null,
          event.Oggetto || null,
          event.GiornataIntera || null,
          event.OraInizio || null,
          event.OraFine || null,
          event.Confermato || null,
          event.Varie || null,
          event.eseguito || null,
          event.Privato || null
        ]);

        inserted++;

        // Progress ogni 2000 righe
        if ((i + 1) % 2000 === 0) {
          console.log(`  Processati ${i + 1}/${events.length}... (${inserted} inseriti)`);
        }

      } catch (err) {
        failed++;
        if (failed <= 5) {
          console.log(`  ⚠️  ID ${event.id}: ${err.message.substring(0, 50)}`);
        }
      }
    }

    console.log(`\n✅ Importazione completata!`);
    console.log(`   Appuntamenti processati: ${events.length}`);
    console.log(`   Appuntamenti inseriti: ${inserted}`);
    console.log(`   Errori: ${failed}`);
    console.log(`\n🎉 Il Planning ora ha ${inserted} appuntamenti dal database reale!`);

  } catch (error) {
    console.error('\n❌ Errore:', error.message);
    process.exit(1);
  }
}

importJSONDataToTurso();
