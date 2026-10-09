import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crée les paramètres par défaut
  await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      initialCapital: 0,
      currentCapital: 0,
      riskPercent: 1.0,
    },
  })

  console.log('✅ Base de données initialisée avec succès')
  console.log('   Vérifier le capital réel dans Paramètres avant utilisation.')
  console.log('   Risque par trade: 1%')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
