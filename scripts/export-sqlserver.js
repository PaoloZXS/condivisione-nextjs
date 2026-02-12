#!/usr/bin/env node
/**
 * Script di migrazione: lettura di JSON esportati + import in SQLite+Prisma
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'prisma', 'dev.db');
const EXPORT_DIR = path.join(process.cwd(), 'data-export');

async function migrate() {
  console.log('🚀 Preparazione per migrazione via Prisma\n');

  // Creazione directory di export
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
    console.log(`✓ Directory creata: ${EXPORT_DIR}\n`);
  }

  // Export via sqlcmd
  console.log('📤 Esportazione dati da SQL Server...\n');

  const tables = [
    'TbLogin',
    'tabclienti',
    'taboperazioni',
    'tabcontratti',
    'tabprodotti'
  ];

  const { execSync } = require('child_process');

  for (const table of tables) {
    const outputFile = path.join(EXPORT_DIR, `${table}.json`);
    const query = `USE [db_CondivisioneDati202601241805]; SELECT * FROM [${table}] FOR JSON PATH`;
    
    try {
      const result = execSync(`sqlcmd -S "ALESSIA\\\\SQLEXPRESS" -E -Q "${query}" -h -1 -w 4000`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      fs.writeFileSync(outputFile, result);
      console.log(`  ✓ ${table}: ${outputFile}`);
    } catch (error) {
      console.error(`  ✗ ${table}: ${error.message}`);
    }
  }

  console.log('\n✅ Export completato!');
  console.log('\nNextStep: Eseguire "npx prisma db push" per creare il database con schema');
  console.log('Poi eseguire "npx prisma migrate dev" per il seed dei dati');
}

migrate().catch(err => {
  console.error('❌ Errore:', err.message);
  process.exit(1);
});
