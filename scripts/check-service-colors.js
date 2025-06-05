const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAndUpdateServiceColors() {
  try {
    console.log('Vérification des couleurs des services...')
    
    // Trouver tous les services
    const allServices = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        color: true
      }
    })
    
    console.log('\nTous les services:')
    allServices.forEach(service => {
      console.log(`- ${service.name}: ${service.color || 'NULL'}`)
    })
    
    // Mettre à jour les services sans couleur
    const result = await prisma.service.updateMany({
      where: {
        OR: [
          { color: null },
          { color: '' }
        ]
      },
      data: {
        color: '#4ECDC4'
      }
    })
    
    console.log(`\n${result.count} services mis à jour avec la nouvelle couleur par défaut.`)
    
    // Afficher tous les services après mise à jour
    const updatedServices = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        color: true
      }
    })
    
    console.log('\nServices après mise à jour:')
    updatedServices.forEach(service => {
      console.log(`- ${service.name}: ${service.color}`)
    })
    
  } catch (error) {
    console.error('Erreur lors de la vérification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndUpdateServiceColors() 