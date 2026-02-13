const sql = require('mssql');
const Database = require('better-sqlite3');
const path = require('path');

const sqlConfig = {
  server: 'ALESSIA\\SQLEXPRESS',
  authentication: { type: 'default' },
  options: { trustServerCertificate: true, encrypt: false }
};

const dbPath = path.join(__dirname, '../prisma/dev.db');

async function main() {
  let pool;
  try {
    console.log('Start');
    pool = new sql.ConnectionPool(sqlConfig);
    await pool.connect();
    
    const result = await pool.request().query(`
      SELECT idLogin, nome, cognome, email, password, societa, tecnicocod, attivo, typeutente, colore
      FROM [CondivisioneDati].dbo.TbLogin WHERE attivo = 'S'
    `);
    
    const db = new Database(dbPath);
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS "tblogin" (
        "idLogin" INTEGER NOT NULL PRIMARY KEY,
        "nome" TEXT NOT NULL, "cognome" TEXT NOT NULL, "email" TEXT NOT NULL,
        "password" TEXT NOT NULL, "societa" TEXT NOT NULL, "tecnicocod" TEXT NOT NULL,
        "attivo" TEXT DEFAULT 'S', "typeutente" TEXT DEFAULT 'AMMINISTRATORE',
        "colore" TEXT, "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "tblogin_email_key" ON "tblogin"("email");
    `);
    
    const insert = db.prepare(`
      INSERT OR REPLACE INTO tblogin 
      (idLogin, nome, cognome, email, password, societa, tecnicocod, attivo, typeutente, colore, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    
    for (const user of result.recordset) {
      insert.run(user.idLogin, user.nome, user.cognome, user.email, user.password, 
                 user.societa, user.tecnicocod, user.attivo, user.typeutente, user.colore);
      console.log(`Done ${user.email}`);
    }
    
    db.close();
    await pool.close();
    console.log('SUCCESS');
  } catch (err) {
    console.error('ERROR', err.message);
    process.exit(1);
  }
}

main();
