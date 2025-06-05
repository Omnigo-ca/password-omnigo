const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkPasswords() {
  try {
    console.log('Vérification des mots de passe et leurs services...')
    
    // Trouver tous les mots de passe avec leurs services
    const passwords = await prisma.password.findMany({
      include: {
        service: true,
        client: true
      }
    })
    
    console.log('\nMots de passe et leurs services:')
    passwords.forEach(password => {
      console.log(`- ${password.name}:`)
      console.log(`  Service: ${password.service?.name || 'AUCUN'} (${password.service?.color || 'PAS DE COULEUR'})`)
      console.log(`  Client: ${password.client?.name || 'AUCUN'} (${password.client?.color || 'PAS DE COULEUR'})`)
      console.log('')
    })
    
  } catch (error) {
    console.error('Erreur lors de la vérification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPasswords() 