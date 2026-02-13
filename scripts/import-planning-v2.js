#!/usr/bin/env node

/**
 * Script di importazione V2 - Versione semplificata e robusta
 */

require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const { createClient } = require("@libsql/client");

async function importPlanning() {
  console.log("\n🚀 IMPORTAZIONE PLANNING V2\n");

  try {
    // Leggi JSON
    console.log("📄 Lettura planning_data.json...");
    const data = JSON.parse(fs.readFileSync("planning_data.json", "utf-8"));
    console.log(`✓ ${data.length} appuntamenti caricati\n`);

    // Connetti TURSO
    const client = createClient({ url: process.env.DATABASE_URL_ASSISTENZA });
    
    // Cancella tabella se esiste
    console.log("🔄 Ricreazione tabella...");
    try {
      await client.execute("DROP TABLE IF EXISTS PlanningInterventi");
    } catch (e) {}

    // Crea tabella
    await client.execute(`
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
    console.log("✓ Tabella ricreata\n");

    // Importa batch
    console.log("💾 Inserimento batch...");
    let inserted = 0;
    const batchSize = 500;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      // Costruisci query
      const placeholders = batch.map(() => 
        "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).join(", ");
      
      const values = [];
      batch.forEach((row) => {
        values.push(
          row.id,
          row.Proprietario || null,
          row.Data || null,
          row.Tecnico || null,
          row.CodCliente || null,
          row.Cliente || null,
          row.Oggetto || null,
          row.GiornataIntera || null,
          row.OraInizio || null,
          row.OraFine || null,
          row.Confermato || null,
          row.Varie || null,
          row.eseguito || null,
          row.Privato || null
        );
      });

      await client.execute(
        `INSERT INTO PlanningInterventi 
         (id, Proprietario, Data, Tecnico, CodCliente, Cliente, Oggetto, 
          GiornataIntera, OraInizio, OraFine, Confermato, Varie, eseguito, Privato)
         VALUES ${placeholders}`,
        values
      );

      inserted += batch.length;
      console.log(`  ✓ ${inserted}/${data.length}`);
    }

    // Verifica finale
    const result = await client.execute("SELECT COUNT(*) as cnt FROM PlanningInterventi");
    const count = result.rows[0].cnt;

    console.log(`\n✅ IMPORTAZIONE COMPLETATA`);
    console.log(`   Totale appuntamenti: ${count}`);
    console.log(`   Successo: ${count === data.length ? "✓" : "⚠️"}\n`);

  } catch (error) {
    console.error("\n❌ Errore:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

importPlanning();
