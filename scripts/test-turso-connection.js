require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@libsql/client");

async function testTursoConnection() {
  console.log("🔍 Testing TURSO Connection...\n");

  const databases = [
    {
      name: "CondivisioneDati",
      url: process.env.DATABASE_URL_CONDIVISIONEDATI,
    },
    { name: "Assistenza", url: process.env.DATABASE_URL_ASSISTENZA },
  ];

  for (const db of databases) {
    try {
      console.log(`Testing ${db.name}...`);
      const client = createClient({ url: db.url });

      const result = await client.execute("SELECT 1 as test");
      console.log(`✅ ${db.name}: Connected!`);
      console.log(`   Result: ${JSON.stringify(result)}\n`);
    } catch (error) {
      console.log(`❌ ${db.name}: Failed!`);
      console.log(`   Error: ${error.message}\n`);
    }
  }
}

testTursoConnection().catch(console.error);
