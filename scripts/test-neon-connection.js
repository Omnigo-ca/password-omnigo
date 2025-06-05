const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔄 Test de connexion à Neon Database...')
    
    // Test de connexion basique
    await prisma.$connect()
    console.log('✅ Connexion à Neon Database réussie!')
    
    // Test de requête simple
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('📊 Version PostgreSQL:', result[0].version)
    
    // Vérifier les tables existantes
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    if (tables.length > 0) {
      console.log('📋 Tables existantes:')
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`)
      })
    } else {
      console.log('📋 Aucune table trouvée. Vous devez exécuter les migrations.')
      console.log('💡 Exécutez: npx prisma db push')
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion à Neon Database:')
    console.error(error.message)
    
    if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n💡 Suggestions:')
      console.log('  - Vérifiez votre URL DATABASE_URL dans le fichier .env')
      console.log('  - Assurez-vous que votre base de données Neon est active')
      console.log('  - Vérifiez votre connexion internet')
    }
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Suggestions:')
      console.log('  - Vérifiez le nom d\'utilisateur et mot de passe dans DATABASE_URL')
      console.log('  - Régénérez le mot de passe dans votre dashboard Neon si nécessaire')
    }
    
  } finally {
    await prisma.$disconnect()
  }
}

testConnection() 