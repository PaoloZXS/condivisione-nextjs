require('dotenv').config({path:'.env.local'});
const {createClient}=require('@libsql/client');

(async ()=>{
  const client=createClient({url:process.env.DATABASE_URL_ASSISTENZA});
  const res=await client.execute('SELECT id, Data, Oggetto, Tecnico FROM PlanningInterventi WHERE Data >= ? AND Data <= ? LIMIT 5', ['2007-03-01', '2007-03-31']);
  console.log('Marzo 2007 - Record trovati:', res.rows.length);
  res.rows.forEach(r=>console.log('ID', r.id, ':', r.Data, r.Oggetto, r.Tecnico));
})();
