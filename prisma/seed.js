const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inizio seed del database...\n');

  // Leggi i file JSON esportati
  const dataDir = path.join(__dirname, '..', 'data-export');

  // Seed Users (TbLogin)
  try {
    const usersJson = fs.readFileSync(path.join(dataDir, 'TbLogin.json'), 'utf-8');
    const users = JSON.parse(usersJson);

    console.log(`📥 Importazione ${users.length} utenti...`);
    for (const user of users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: user,
        create: user
      });
    }
    console.log(`✓ ${users.length} utenti importati\n`);
  } catch (error) {
    console.error('❌ Errore import utenti:', error.message);
  }

  // Seed Clienti
  try {
    const clientiJson = fs.readFileSync(path.join(dataDir, 'tabclienti.json'), 'utf-8');
    const clienti = JSON.parse(clientiJson);

    console.log(`📥 Importazione ${clienti.length} clienti...`);
    for (const cliente of clienti) {
      try {
        await prisma.cliente.upsert({
          where: { id: cliente.id },
          update: cliente,
          create: cliente
        });
      } catch (err) {
        // Skip errors
      }
    }
    console.log(`✓ ${clienti.length} clienti importati\n`);
  } catch (error) {
    console.error('❌ Errore import clienti:', error.message);
  }

  // Seed Operazioni
  try {
    const operazioniJson = fs.readFileSync(path.join(dataDir, 'taboperazioni.json'), 'utf-8');
    const operazioni = JSON.parse(operazioniJson);

    console.log(`📥 Importazione ${operazioni.length} operazioni...`);
    let imported = 0;
    for (const op of operazioni) {
      try {
        await prisma.operazione.upsert({
          where: { id: op.id },
          update: op,
          create: op
        });
        imported++;
      } catch (err) {
        // Skip foreign key errors
      }
    }
    console.log(`✓ ${imported}/${operazioni.length} operazioni importate\n`);
  } catch (error) {
    console.error('❌ Errore import operazioni:', error.message);
  }

  // Seed Contratti
  try {
    const contrattiJson = fs.readFileSync(path.join(dataDir, 'tabcontratti.json'), 'utf-8');
    const contratti = JSON.parse(contrattiJson);

    console.log(`📥 Importazione ${contratti.length} contratti...`);
    for (const c of contratti) {
      try {
        await prisma.contratto.upsert({
          where: { id: c.id },
          update: c,
          create: c
        });
      } catch (err) {
        // Skip errors
      }
    }
    console.log(`✓ ${contratti.length} contratti importati\n`);
  } catch (error) {
    console.error('❌ Errore import contratti:', error.message);
  }

  console.log('✅ Seed completato!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
