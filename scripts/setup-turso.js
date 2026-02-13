const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");

// Token e database TURSO
const TOKEN =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiIxYWJlNDk4YS01ODg1LTQ4MTItOWFmMy1hZjU4ZTVkODU0ZDYiLCJpYXQiOjE3NzA5Mjg2NDYsInJpZCI6ImZmN2RhMGExLTRjOTAtNGU2Zi1hY2RlLWVlOWZjZWMxMTRjNCJ9.EKyHDAHLbKkXaR3R70-F6MW71x92G43mf1-tzccvoQ1WEc3KfKBWhMluFTZy0eW4YX_sMVn7SUTNJ-8ExvdhBA";

async function main() {
  try {
    console.log("🚀 Inizio migrazione a TURSO...\n");

    // Connessione a TURSO
    const client = createClient({
      url: "libsql://test.turso.io",
      authToken: TOKEN,
    });

    // 1. Leggi il file SQL di migrazione
    const migrationFile = path.join(
      __dirname,
      "../prisma/migrations/20260212200914_init/migration.sql"
    );
    const migrationSQL = fs.readFileSync(migrationFile, "utf-8");

    console.log("📝 Esecuzione dello schema SQL...");
    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      try {
        console.log(`  [SQL] ${statement.substring(0, 40)}...`);
        await client.execute(statement);
        console.log(`    ✓ OK`);
      } catch (error) {
        // Ignora errori di tabelle già esistenti
        const msg = error.message || error;
        console.log(`    ⚠ ${msg}`);
      }
    }

    // 2. Inserisci dati degli utenti
    console.log("\n📥 Inserimento dati utenti...");
    const users = [
      {
        idLogin: 37,
        nome: "Luciano",
        cognome: "Rabuffi",
        email: "luciano.rabuffi@codarini.com",
        password: "1234",
        societa: "CODARINI",
        tecnicocod: "LUCIANO",
        attivo: "S",
        typeutente: "AMMINISTRATORE",
        colore: "#1848a3",
      },
      {
        idLogin: 38,
        nome: "Paolo",
        cognome: "Giorsetti",
        email: "paolo.giorsetti@codarini.com",
        password: "zxs",
        societa: "Codarini",
        tecnicocod: "GIORSETTI",
        attivo: "S",
        typeutente: "AMMINISTRATORE",
        colore: "#408cff",
      },
      {
        idLogin: 99,
        nome: "Andrea",
        cognome: "Felicani",
        email: "andrea.felicani@codarini.com",
        password: "1",
        societa: "CODARINI",
        tecnicocod: "ANDREA",
        attivo: "S",
        typeutente: "OPERATORELIGTH",
        colore: null,
      },
      {
        idLogin: 93,
        nome: "Nicola",
        cognome: "Sollazzo",
        email: "nicola.sollazzo@codarini.com",
        password: "nicola",
        societa: "CODARINI",
        tecnicocod: "NICOLA",
        attivo: "S",
        typeutente: "OPERATORELIGTH",
        colore: null,
      },
      {
        idLogin: 84,
        nome: "Paolo",
        cognome: "Codarini",
        email: "paolo.codarini@codarini.com",
        password: "p.c$004",
        societa: "CODARINI",
        tecnicocod: "PAOLO C.",
        attivo: "S",
        typeutente: "OPERATORELIGTH",
        colore: null,
      },
      {
        idLogin: 85,
        nome: "Cettina",
        cognome: "Aleo",
        email: "cettina.aleo@codarini.com",
        password: "c.a$004",
        societa: "CODARINI",
        tecnicocod: "CETTINA",
        attivo: "S",
        typeutente: "OPERATORELIGTH",
        colore: "#e26de3",
      },
      {
        idLogin: 94,
        nome: "Mario",
        cognome: "Codarini",
        email: "mario.codarini@codarini.com",
        password: "mario",
        societa: "Tuega",
        tecnicocod: "MARIO",
        attivo: "S",
        typeutente: "OPERATORELIGTH",
        colore: null,
      },
      {
        idLogin: 98,
        nome: "Nicla",
        cognome: "Cianciaruso",
        email: "nicla.cianciaruso@codarini.com",
        password: "n.c$004",
        societa: "CODARINI",
        tecnicocod: "NICLA",
        attivo: "S",
        typeutente: "OPERATORELIGTH",
        colore: "#31c3f3",
      },
      {
        idLogin: 100,
        nome: "Alessio",
        cognome: "Codarini",
        email: "alessio.codarini@codarini.com",
        password: "alessio",
        societa: "Tuega",
        tecnicocod: "ALESSIO",
        attivo: "S",
        typeutente: "OPERATORELIGTH",
        colore: null,
      },
      {
        idLogin: 103,
        nome: "Martina",
        cognome: "Marongiu",
        email: "martina.marongiu@tuega.com",
        password: "tuega",
        societa: "Tuega",
        tecnicocod: "MARTINA",
        attivo: "S",
        typeutente: "AMMINISTRATORE",
        colore: "#ed116f",
      },
      {
        idLogin: 104,
        nome: "Fabio",
        cognome: "Magnaguagno",
        email: "info@tuega.com",
        password: "fabio",
        societa: "Codarini",
        tecnicocod: "FABIO",
        attivo: "S",
        typeutente: "AMMINISTRATORE",
        colore: "#9e4c03",
      },
      {
        idLogin: 107,
        nome: "Vittorio",
        cognome: "Marramalto",
        email: "info@codarini.com",
        password: "vittorio",
        societa: "Tuega",
        tecnicocod: "VITTORIO",
        attivo: "S",
        typeutente: "AMMINISTRATORE",
        colore: "#f05312",
      },
    ];

    for (const user of users) {
      try {
        await client.execute({
          sql: `INSERT INTO "tblogin" (idLogin, nome, cognome, email, password, societa, tecnicocod, attivo, typeutente, colore, createdAt, updatedAt) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          args: [
            user.idLogin,
            user.nome,
            user.cognome,
            user.email,
            user.password,
            user.societa,
            user.tecnicocod,
            user.attivo,
            user.typeutente,
            user.colore,
          ],
        });
        console.log(`  ✓ ${user.email}`);
      } catch (error) {
        console.log(`  ⚠ ${user.email}: ${error.message}`);
      }
    }

    console.log("\n✅ Migrazione completata con successo!");
    console.log("\n📌 Prossimi step:");
    console.log("   1. Testare il login con uno degli utenti:");
    console.log("      Email: luciano.rabuffi@codarini.com");
    console.log("      Password: 1234");
    console.log("   2. Avviare il server:  npm run dev");
  } catch (error) {
    console.error("\n❌ Errore durante la migrazione:", error.message);
    process.exit(1);
  }
}

main();
