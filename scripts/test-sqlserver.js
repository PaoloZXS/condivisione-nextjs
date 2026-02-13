const sql = require('mssql');

const sqlConfig = {
  server: 'ALESSIA\\SQLEXPRESS',
  authentication: {
    type: 'default'
  },
  options: {
    trustServerCertificate: true,
    encrypt: false
  }
};

async function test() {
  try {
    console.log('Tentativo di connessione a SQL Server...');
    const pool = new sql.ConnectionPool(sqlConfig);
    await pool.connect();
    
    console.log('✓ Connesso!');
    console.log('\nEsecuzione query...');
    
    const result = await pool.request().query(`
      SELECT COUNT(*) as cnt FROM [CondivisioneDati].dbo.TbLogin
    `);
    
    console.log(`✓ Utenti in database: ${result.recordset[0].cnt}`);
    
    await pool.close();
    console.log('✓ Done');
  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

test();
