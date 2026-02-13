#!/usr/bin/env node
const { createClient } = require('@libsql/client');

async function testTursoConnection() {
  console.log('📡 Testing TURSO connections...\n');

  // Assistenza
  const tursoAssistenza = createClient({
    url: 'libsql://assistenza-paolozxs.aws-eu-west-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzA5OTI2NDksImlkIjoiNTEyNmNhZjktNWM5NC00NzkwLTk0ZjQtMmVlZTM0YWM3YmY0IiwicmlkIjoiNTVmZTJiMmUtZmMxYi00ZDJhLWE4NGMtMDY5ODhkMmZiYmFmIn0.SkSNw5DaJ-qClcVoYxNr-CFeGjRO3IPRtUKoLNxi7jdje_9-ubdh_kcM9BUySCFJGyU90lg7KXB23O1igESDBA'
  });

  // CondivisioneDati
  const tursoDati = createClient({
    url: 'libsql://condivisionedati-paolozxs.aws-eu-west-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzA5OTI3MTUsImlkIjoiMjg0NzliNzctNTMyYS00NzYyLTkyM2UtYjE4NTcwNzYyYTFjIiwicmlkIjoiYzVhZGIwYzEtNTE2ZC00ZjlhLWE2ZTctMDUyMTY2MGE3NWJkIn0.2BPtvp6SuJe3MHZF13u6RCz-3rYrQFWmBIgW2CC6ISn-ZnqVMtt-1_FJ9Egj4jJeFOVU28xmAyEZSwD5vOChCA'
  });

  try {
    console.log('🔗 Testing Assistenza...');
    const result1 = await tursoAssistenza.execute('SELECT 1 as test');
    console.log('✅ Assistenza CONNECTED');

    console.log('\n🔗 Testing CondivisioneDati...');
    const result2 = await tursoDati.execute('SELECT 1 as test');
    console.log('✅ CondivisioneDati CONNECTED');

    console.log('\n✨ Entrambi i database TURSO sono raggiungibili!');

  } catch (error) {
    console.error('❌ Errore di connessione:', error.message);
    process.exit(1);
  }
}

testTursoConnection();
