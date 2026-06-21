import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crée les paramètres par défaut
  await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      initialCapital: 100000,
      currentCapital: 100000,
      riskPercent: 1.0,
    },
  })

  console.log('✅ Base de données initialisée avec succès')
  console.log('   Capital initial: $100,000')
  console.log('   Risque par trade: 1%')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
