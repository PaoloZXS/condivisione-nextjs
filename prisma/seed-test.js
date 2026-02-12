#!/usr/bin/env node

// Simple script to insert test users into SQLite database
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');

console.log('🌱 Inserting test users...\n');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database error:', err);
    process.exit(1);
  }

  // Test users from SQL Server
  const testUsers = [
    { idLogin: 37, nome: 'Luciano', cognome: 'Rabuffi', email: 'luciano.rabuffi@codarini.com', password: '1234', societa: 'CODARINI', tecnicocod: 'LUCIANO', attivo: 'S', typeutente: 'AMMINISTRATORE', colore: '#1848a3' },
    { idLogin: 38, nome: 'Paolo', cognome: 'Giorsetti', email: 'paolo.giorsetti@codarini.com', password: 'zxs', societa: 'Codarini', tecnicocod: 'GIORSETTI', attivo: 'S', typeutente: 'AMMINISTRATORE', colore: '#408cff' },
    { idLogin: 99, nome: 'Andrea', cognome: 'Felicani', email: 'andrea.felicani@codarini.com', password: '1', societa: 'CODARINI', tecnicocod: 'ANDREA', attivo: 'S', typeutente: 'OPERATORELIGTH', colore: null },
    { idLogin: 93, nome: 'Nicola', cognome: 'Sollazzo', email: 'nicola.sollazzo@codarini.com', password: 'nicola', societa: 'CODARINI', tecnicocod: 'NICOLA', attivo: 'S', typeutente: 'OPERATORELIGTH', colore: null }
  ];

  let inserted = 0;
  let errors = 0;

  testUsers.forEach((user, index) => {
    const sql = `INSERT OR REPLACE INTO "TbLogin" 
      (idLogin, nome, cognome, email, password, societa, tecnicocod, attivo, typeutente, colore) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [
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
    ], function(err) {
      if (err) {
        console.error(`❌ Error inserting user ${user.email}:`, err.message);
        errors++;
      } else {
        inserted++;
        console.log(`✓ ${user.email}`);
      }

      if (index === testUsers.length - 1) {
        console.log(`\n✅ Inserted ${inserted} users, ${errors} errors`);
        console.log('\nTest users ready for login:');
        console.log('- luciano.rabuffi@codarini.com / 1234');
        console.log('- paolo.giorsetti@codarini.com / zxs');
        console.log('- andrea.felicani@codarini.com / 1');
        console.log('- nicola.sollazzo@codarini.com / nicola\n');
        db.close();
        process.exit(0);
      }
    });
  });
});
