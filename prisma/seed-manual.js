#!/usr/bin/env node

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const dataDir = path.join(__dirname, '..', 'data-export');

console.log('🌱 Seed database manuale via better-sqlite3\n');

// Apri database
const db = new Database(dbPath);
const queries = [];

// 1. Seed TbLogin
try {
  const usersFile = path.join(dataDir, 'TbLogin.json');
  const usersData = fs.readFileSync(usersFile, 'utf-8');
  const users = JSON.parse(usersData);

  console.log(`📥 ${users.length} utenti trovati`);

  for (const user of users) {
    const sql = `INSERT OR REPLACE INTO "TbLogin" (idLogin, nome, cognome, email, password, societa, tecnicocod, attivo, typeutente, colore) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.prepare(sql).run(
      user.idLogin,
      user.nome || null,
      user.cognome || null,
      user.email,
      user.password,
      user.societa || null,
      user.tecnicocod || null,
      user.attivo || 'S',
      user.typeutente || 'AMMINISTRATORE',
      user.colore || null
    );
  }
  console.log('✓ Utenti caricati\n');
} catch (error) {
  console.error('❌ Errore caricamento utenti:', error.message, '\n');
}

// 2. Seed tabclienti
try {
  const clientiFile = path.join(dataDir, 'tabclienti.json');
  const clientiData = fs.readFileSync(clientiFile, 'utf-8');
  const clienti = JSON.parse(clientiData);

  console.log(`📥 ${clienti.length} clienti trovati`);

  for (const cliente of clienti) {
    const sql = `INSERT OR REPLACE INTO "tabclienti" (id, codicecliente, idazienda) VALUES (?, ?, ?)`;
    db.prepare(sql).run(
      cliente.id,
      cliente.codicecliente || null,
      cliente.idazienda || null
    );
  }
  console.log('✓ Clienti caricati\n');
} catch (error) {
  console.error('❌ Errore caricamento clienti:', error.message, '\n');
}

// 3. Seed taboperazioni
try {
  const operazioniFile = path.join(dataDir, 'taboperazioni.json');
  const operazioniData = fs.readFileSync(operazioniFile, 'utf-8');
  const operazioni = JSON.parse(operazioniData);

  console.log(`📥 ${operazioni.length} operazioni trovate`);

  for (const op of operazioni) {
    const sql = `INSERT OR REPLACE INTO "taboperazioni" 
      (id, datacreazione, tipo, codice, anno, idazienda, idcliente, idintervento, operatore, idprodotto, 
       dataesecuzione, orainizio, orafine, totaleore, osservazioni, codicecliente, stato, eliminato, 
       idprodottocliente, faseoperazione) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.prepare(sql).run(
      op.id,
      op.datacreazione || null,
      op.tipo || null,
      op.codice || null,
      op.anno || null,
      op.idazienda || null,
      op.idcliente || null,
      op.idintervento || null,
      op.operatore || null,
      op.idprodotto || null,
      op.dataesecuzione || null,
      op.orainizio || null,
      op.orafine || null,
      op.totaleore || null,
      op.osservazioni || null,
      op.codicecliente || null,
      op.stato || null,
      op.eliminato || null,
      op.idprodottocliente || null,
      op.faseoperazione || null
    );
  }
  console.log('✓ Operazioni caricate\n');
} catch (error) {
  console.error('❌ Errore caricamento operazioni:', error.message, '\n');
}

// 4. Seed tabcontratti
try {
  const contrattiFile = path.join(dataDir, 'tabcontratti.json');
  const contrattiData = fs.readFileSync(contrattiFile, 'utf-8');
  const contratti = JSON.parse(contrattiData);

  console.log(`📥 ${contratti.length} contratti trovati`);

  for (const c of contratti) {
    const sql = `INSERT OR REPLACE INTO "tabcontratti" 
      (id, tipo, denominazione, tipodurata, durata, avvprima, avvdopo, cancellato) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.prepare(sql).run(
      c.id,
      c.tipo || null,
      c.denominazione || null,
      c.tipodurata || null,
      c.durata || null,
      c.avvprima || null,
      c.avvdopo || null,
      c.cancellato || null
    );
  }
  console.log('✓ Contratti caricati\n');
} catch (error) {
  console.error('❌ Errore caricamento contratti:', error.message, '\n');
}

db.close();
console.log('✅ Seed completato!');
process.exit(0);
