#!/usr/bin/env node

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@libsql/client");

async function convertDates() {
  console.log("\n🔄 Conversione formato date DD/MM/YYYY → YYYY-MM-DD\n");

  try {
    const client = createClient({ url: process.env.DATABASE_URL_ASSISTENZA });

    // Leggi tutti i record
    const result = await client.execute("SELECT id, Data FROM PlanningInterventi");
    console.log(`Processando ${result.rows.length} record...\n`);

    let converted = 0;
    let errors = 0;

    for (const row of result.rows) {
      try {
        if (!row.Data) {
          errors++;
          continue;
        }

        // Converti DD/MM/YYYY → YYYY-MM-DD
        const parts = row.Data.split("/");
        if (parts.length === 3) {
          const day = parts[0];
          const month = parts[1];
          const year = parts[2];
          const newDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

          await client.execute(
            "UPDATE PlanningInterventi SET Data = ? WHERE id = ?",
            [newDate, row.id]
          );

          converted++;
          if (converted % 2000 === 0) {
            console.log(`  ✓ ${converted} date convertite...`);
          }
        } else {
          // Se il formato è già YYYY-MM-DD, non fare nulla
          converted++;
        }
      } catch (err) {
        errors++;
      }
    }

    console.log(
      `\n✅ Conversione completata!\n   Date convertite: ${converted}\n   Errori: ${errors}\n`
    );
  } catch (error) {
    console.error("\n❌ Errore:", error.message);
    process.exit(1);
  }
}

convertDates();
