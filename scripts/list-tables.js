require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@libsql/client");

async function listAllTables() {
  try {
    console.log("📋 Listing all tables in both TURSO databases...\n");

    // Test Assistenza
    console.log("🔍 TURSO Assistenza:");
    try {
      const assistenzaClient = createClient({
        url: process.env.DATABASE_URL_ASSISTENZA,
      });

      const assistenzaTables = await assistenzaClient.execute({
        sql: `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`,
      });

      console.log(`Found ${assistenzaTables.rows.length} tables:`);
      assistenzaTables.rows.forEach((row) => {
        console.log(`  - ${row[0]}`);
      });
    } catch (err) {
      console.log("❌ Error querying Assistenza:", err.message);
    }

    // Test CondivisioneDati
    console.log("\n🔍 TURSO CondivisioneDati:");
    try {
      const condivisioneClient = createClient({
        url: process.env.DATABASE_URL_CONDIVISIONEDATI,
      });

      const condivisioneTables = await condivisioneClient.execute({
        sql: `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`,
      });

      console.log(`Found ${condivisioneTables.rows.length} tables:`);
      condivisioneTables.rows.forEach((row) => {
        console.log(`  - ${row[0]}`);
      });
    } catch (err) {
      console.log("❌ Error querying CondivisioneDati:", err.message);
    }

    // Search for planning-related tables
    console.log("\n🔎 Searching for planning-related tables...");
    try {
      const assistenzaClient = createClient({
        url: process.env.DATABASE_URL_ASSISTENZA,
      });

      const planningTables = await assistenzaClient.execute({
        sql: `SELECT name FROM sqlite_master 
              WHERE type='table' AND name LIKE '%plan%' OR name LIKE '%interv%'
              ORDER BY name`,
      });

      if (planningTables.rows.length === 0) {
        console.log("❌ No planning/intervention related tables found in Assistenza");
      } else {
        console.log("✅ Found planning/intervention tables:");
        planningTables.rows.forEach((row) => {
          console.log(`  - ${row[0]}`);
        });
      }
    } catch (err) {
      console.log("Error searching:", err.message);
    }

  } catch (error) {
    console.error("Fatal error:", error.message);
  }
}

listAllTables();
