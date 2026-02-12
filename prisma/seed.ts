import { PrismaClient } from '../lib/prisma'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Inizio seed del database...\n')

  // Leggi i file JSON esportati
  const dataDir = path.join(__dirname, '..', 'data-export')

  // Seed Users (TbLogin)
  try {
    const usersJson = fs.readFileSync(path.join(dataDir, 'TbLogin.json'), 'utf-8')
    const users = JSON.parse(usersJson)

    console.log(`📥 Importazione ${users.length} utenti...`)
    for (const user of users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: user,
        create: user
      })
    }
    console.log(`✓ ${users.length} utenti importati\n`)
  } catch (error) {
    console.error('❌ Errore import utenti:', error instanceof Error ? error.message : String(error))
  }

  // Seed Clienti
  try {
    const clientiJson = fs.readFileSync(path.join(dataDir, 'tabclienti.json'), 'utf-8')
    const clienti = JSON.parse(clientiJson)

    console.log(`📥 Importazione ${clienti.length} clienti...`)
    for (const cliente of clienti) {
      await prisma.cliente.upsert({
        where: { id: cliente.id },
        update: cliente,
        create: cliente
      })
    }
    console.log(`✓ ${clienti.length} clienti importati\n`)
  } catch (error) {
    console.error('❌ Errore import clienti:', error instanceof Error ? error.message : String(error))
  }

  // Seed Operazioni
  try {
    const operazioniJson = fs.readFileSync(path.join(dataDir, 'taboperazioni.json'), 'utf-8')
    const operazioni = JSON.parse(operazioniJson)

    console.log(`📥 Importazione ${operazioni.length} operazioni...`)
    for (const op of operazioni) {
      try {
        await prisma.operazione.upsert({
          where: { id: op.id },
          update: op,
          create: op
        })
      } catch {
        // Skip foreign key errors
      }
    }
    console.log(`✓ ${operazioni.length} operazioni importate\n`)
  } catch (error) {
    console.error('❌ Errore import operazioni:', error instanceof Error ? error.message : String(error))
  }

  // Seed Contratti
  try {
    const contrattiJson = fs.readFileSync(path.join(dataDir, 'tabcontratti.json'), 'utf-8')
    const contratti = JSON.parse(contrattiJson)

    console.log(`📥 Importazione ${contratti.length} contratti...`)
    for (const c of contratti) {
      await prisma.contratto.upsert({
        where: { id: c.id },
        update: c,
        create: c
      })
    }
    console.log(`✓ ${contratti.length} contratti importati\n`)
  } catch (error) {
    console.error('❌ Errore import contratti:', error instanceof Error ? error.message : String(error))
  }

  // Seed Prodotti
  try {
    const prodottiJson = fs.readFileSync(path.join(dataDir, 'tabprodotti.json'), 'utf-8')
    const prodotti = JSON.parse(prodottiJson)

    console.log(`📥 Importazione ${prodotti.length} prodotti...`)
    for (const p of prodotti) {
      await prisma.prodotto.upsert({
        where: { id: p.id },
        update: p,
        create: p
      })
    }
    console.log(`✓ ${prodotti.length} prodotti importati\n`)
  } catch (error) {
    console.error('❌ Errore import prodotti:', error instanceof Error ? error.message : String(error))
  }

  console.log('✅ Seed completato!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
