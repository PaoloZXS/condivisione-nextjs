#!/usr/bin/env node

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const dataDir = path.normalize('C:\\Users\\Alessia\\Desktop\\CoPilot\\data-export');

console.log('🌱 Caricamento dati CSV nel database\n');

const db = new Database(dbPath);

// Funzione per parsare linee di testo con spazi
function parseCSVLine(line) {
  const parts = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === '\t' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

// Funzione per convertire NULL
function normalizeValue(val) {
  if (!val || val.toUpperCase() === 'NULL') {
    return null;
  }
  const trimmed = val.trim();
  return trimmed === '' ? null : trimmed;
}

// 1. Carica TbLogin
try {
  const csvFile = path.join(dataDir, 'TbLogin.csv');
  const csvContent = fs.readFileSync(csvFile, 'utf-8');
  const lines = csvContent.split('\n').filter(l => l.trim());
  
  // Skip first 2 lines (SQL Server header)
  const dataLines = lines.slice(2);
  
  console.log(`📥 ${dataLines.length} utenti trovati`);

  let loaded = 0;
  for (const line of dataLines) {
    const values = parseCSVLine(line);
    if (values.length < 10) continue;

    try {
      const sql = `INSERT OR REPLACE INTO "TbLogin" 
        (idLogin, nome, cognome, email, password, societa, tecnicocod, attivo, typeutente, colore) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      db.prepare(sql).run(
        parseInt(values[0]) || 0,
        normalizeValue(values[1]),
        normalizeValue(values[2]),
        normalizeValue(values[3]),
        normalizeValue(values[4]),
        normalizeValue(values[5]),
        normalizeValue(values[6]),
        normalizeValue(values[7]) || 'S',
        normalizeValue(values[8]) || 'AMMINISTRATORE',
        normalizeValue(values[9])
      );
      loaded++;
    } catch (e) {
      // Skip errors
    }
  }
  console.log(`✓ ${loaded} utenti caricati\n`);
} catch (error) {
  console.error('❌ Errore TbLogin:', error.message, '\n');
}

// 2. Carica tabclienti
try {
  const csvFile = path.join(dataDir, 'tabclienti.csv');
  const csvContent = fs.readFileSync(csvFile, 'utf-8');
  const lines = csvContent.split('\n').filter(l => l.trim());
  
  const dataLines = lines.slice(2);
  
  console.log(`📥 ${dataLines.length} clienti trovati`);

  let loaded = 0;
  for (const line of dataLines) {
    const values = parseCSVLine(line);
    if (values.length < 3) continue;

    try {
      const sql = `INSERT OR REPLACE INTO "tabclienti" (id, codicecliente, idazienda) VALUES (?, ?, ?)`;
      db.prepare(sql).run(
        parseInt(values[0]) || 0,
        normalizeValue(values[1]),
        parseInt(values[2]) || null
      );
      loaded++;
    } catch (e) {
      // Skip errors
    }
  }
  console.log(`✓ ${loaded} clienti caricati\n`);
} catch (error) {
  console.error('❌ Errore tabclienti:', error.message, '\n');
}

// 3. Carica taboperazioni
try {
  const csvFile = path.join(dataDir, 'taboperazioni.csv');
  const csvContent = fs.readFileSync(csvFile, 'utf-8');
  const lines = csvContent.split('\n').filter(l => l.trim());
  
  const dataLines = lines.slice(2);
  
  console.log(`📥 ${dataLines.length} operazioni trovate`);

  let loaded = 0;
  for (const line of dataLines) {
    const values = parseCSVLine(line);
    if (values.length < 20) continue;

    try {
      const sql = `INSERT OR REPLACE INTO "taboperazioni" 
        (id, datacreazione, tipo, codice, anno, idazienda, idcliente, idintervento, operatore, idprodotto, 
         dataesecuzione, orainizio, orafine, totaleore, osservazioni, codicecliente, stato, eliminato, 
         idprodottocliente, faseoperazione) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      db.prepare(sql).run(
        parseInt(values[0]) || 0,
        normalizeValue(values[1]),
        normalizeValue(values[2]),
        normalizeValue(values[3]),
        parseInt(values[4]) || null,
        parseInt(values[5]) || null,
        parseInt(values[6]) || null,
        parseInt(values[7]) || null,
        normalizeValue(values[8]),
        parseInt(values[9]) || null,
        normalizeValue(values[10]),
        parseInt(values[11]) || null,
        parseInt(values[12]) || null,
        parseInt(values[13]) || null,
        normalizeValue(values[14]),
        normalizeValue(values[15]),
        parseInt(values[16]) || null,
        normalizeValue(values[17]),
        parseInt(values[18]) || null,
        parseInt(values[19]) || null
      );
      loaded++;
    } catch (e) {
      // Skip errors
    }
  }
  console.log(`✓ ${loaded} operazioni caricate\n`);
} catch (error) {
  console.error('❌ Errore taboperazioni:', error.message, '\n');
}

db.close();
console.log('✅ Caricamento completato!');
console.log('\nPer avviare il server: npm run dev');
process.exit(0);
