#!/usr/bin/env node

/**
 * Script per popolare il database SQLite locale con gli utenti
 * Utilizza direttamente better-sqlite3
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../prisma/dev.db');

try {
  // Crea/apre database
  const db = new Database(dbPath);
  
  console.log('✓ Database aperto:', dbPath);
  console.log('');

  // Schema SQL
  const schema = `
    CREATE TABLE IF NOT EXISTS "tblogin" (
        "idLogin" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "nome" TEXT NOT NULL,
        "cognome" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "societa" TEXT NOT NULL,
        "tecnicocod" TEXT NOT NULL,
        "attivo" TEXT NOT NULL DEFAULT 'S',
        "typeutente" TEXT NOT NULL DEFAULT 'AMMINISTRATORE',
        "colore" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "tblogin_email_key" ON "tblogin"("email");
  `;

  // Esegui schema
  console.log('📝 Creazione tabelle...');
  db.exec(schema);
  console.log('✓ Schema creato\n');

  // Dati degli utenti
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

  // Inserisci utenti
  console.log('📥 Inserimento utenti...');
  const insert = db.prepare(`
    INSERT OR REPLACE INTO tblogin 
    (idLogin, nome, cognome, email, password, societa, tecnicocod, attivo, typeutente, colore, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  let inserted = 0;
  let failed = 0;

  for (const user of users) {
    try {
      insert.run(
        user.idLogin,
        user.nome,
        user.cognome,
        user.email,
        user.password,
        user.societa,
        user.tecnicocod,
        user.attivo,
        user.typeutente,
        user.colore
      );
      console.log(`  ✓ ${user.email}`);
      inserted++;
    } catch (error) {
      console.log(`  ⚠ ${user.email}: ${error.message}`);
      failed++;
    }
  }

  db.close();

  console.log(`\n✅ Database setup completato!`);
  console.log(`   Utenti inseriti: ${inserted}`);
  console.log(`   Errori: ${failed}`);
  console.log(`\n📌 Puoi testare il login con:`);
  console.log(`   Email: luciano.rabuffi@codarini.com`);
  console.log(`   Password: 1234`);

} catch (error) {
  console.error('❌ Errore:', error.message);
  process.exit(1);
}
