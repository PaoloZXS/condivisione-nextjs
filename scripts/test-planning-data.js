require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@libsql/client");

async function testPlanningData() {
  try {
    console.log("🔍 Testing PlanningInterventi table...\n");

    // Connect to Assistenza database
    const client = createClient({
      url: process.env.DATABASE_URL_ASSISTENZA,
    });

    // First, check if table exists and show structure
    console.log("1️⃣ Checking table structure...");
    try {
      const result = await client.execute({
        sql: "PRAGMA table_info(PlanningInterventi)",
      });
      console.log("✅ Table exists!");
      console.log("Columns:", result.rows);
    } catch (err) {
      console.log("❌ Error checking table structure:", err.message);
    }

    // Count total records
    console.log("\n2️⃣ Counting total records...");
    const countResult = await client.execute({
      sql: "SELECT COUNT(*) as count FROM PlanningInterventi",
    });
    console.log("Total records:", countResult.rows[0]);

    // Show first 5 records with all details
    console.log("\n3️⃣ First 5 records (sample data)...");
    const sampleResult = await client.execute({
      sql: `SELECT 
        id, 
        Proprietario, 
        Data, 
        Tecnico, 
        Cliente, 
        Oggetto, 
        OraInizio, 
        OraFine, 
        Confermato,
        eseguito,
        Colore
      FROM PlanningInterventi 
      LIMIT 5`,
    });

    if (sampleResult.rows.length === 0) {
      console.log("❌ NO DATA FOUND in PlanningInterventi table!");
    } else {
      console.log("✅ Found data!");
      sampleResult.rows.forEach((row, idx) => {
        console.log(`\nRecord ${idx + 1}:`);
        console.log(JSON.stringify(row, null, 2));
      });
    }

    // Check date range for february 2026
    console.log("\n4️⃣ Checking for data in February 2026...");
    const febResult = await client.execute({
      sql: `SELECT COUNT(*) as count FROM PlanningInterventi 
            WHERE Data >= '2026-02-01' AND Data <= '2026-02-28'`,
    });
    console.log("Records in Feb 2026:", febResult.rows[0]);

    // Show records in Feb 2026
    if (febResult.rows[0][0] > 0) {
      const febDataResult = await client.execute({
        sql: `SELECT 
          id, 
          Data, 
          Tecnico, 
          Cliente, 
          Oggetto,
          OraInizio,
          OraFine
        FROM PlanningInterventi 
        WHERE Data >= '2026-02-01' AND Data <= '2026-02-28'
        LIMIT 10`,
      });
      console.log("Sample Feb 2026 data:");
      febDataResult.rows.forEach((row) => {
        console.log(JSON.stringify(row, null, 2));
      });
    }

    // Check available date ranges
    console.log("\n5️⃣ Checking available date ranges...");
    const dateRangeResult = await client.execute({
      sql: `SELECT 
        MIN(Data) as earliest, 
        MAX(Data) as latest,
        COUNT(*) as total
      FROM PlanningInterventi`,
    });
    console.log("Date range:", dateRangeResult.rows[0]);

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testPlanningData();
