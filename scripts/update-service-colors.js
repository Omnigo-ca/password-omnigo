const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateServiceColors() {
  try {
    console.log('Mise à jour des couleurs des services...')
    
    // Mettre à jour tous les services qui ont l'ancienne couleur par défaut
    const result = await prisma.service.updateMany({
      where: {
        color: '#7DF9FF' // Ancienne couleur par défaut
      },
      data: {
        color: '#4ECDC4' // Nouvelle couleur par défaut
      }
    })
    
    console.log(`${result.count} services mis à jour avec la nouvelle couleur par défaut.`)
    
    // Afficher tous les services pour vérification
    const allServices = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        color: true
      }
    })
    
    console.log('\nServices après mise à jour:')
    allServices.forEach(service => {
      console.log(`- ${service.name}: ${service.color}`)
    })
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateServiceColors() 