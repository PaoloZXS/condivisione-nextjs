const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Dati degli utenti estratti da SQL Server
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

const dbPath = path.join(__dirname, '../prisma/dev.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Errore connessione:', err);
    process.exit(1);
  }
  console.log('✓ Connesso a database SQLite');
});

async function seedUsers() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('\n📥 Inserimento utenti...');
      
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO "tblogin" 
        (idLogin, nome, cognome, email, password, societa, tecnicocod, attivo, typeutente, colore, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);

      let inserted = 0;
      let failed = 0;

      users.forEach((user, index) => {
        stmt.run(
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
          (err) => {
            if (err) {
              console.log(`  ⚠ ${user.email}: ${err.message}`);
              failed++;
            } else {
              console.log(`  ✓ ${user.email}`);
              inserted++;
            }

            // Se è l'ultimo user, finisci
            if (index === users.length - 1) {
              stmt.finalize(() => {
                console.log(`\n✅ Seed completato: ${inserted} utenti inseriti, ${failed} errori`);
                resolve();
              });
            }
          }
        );
      });
    });
  });
}

async function main() {
  try {
    await seedUsers();
    db.close();
    console.log('\n✅ Database aggiornato con successo!');
    console.log('\n📌 Puoi testare il login con:');
    console.log('   Email: luciano.rabuffi@codarini.com');
    console.log('   Password: 1234');
  } catch (error) {
    console.error('❌ Errore:', error);
    process.exit(1);
  }
}

main();
