import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getUserKey } from '@/lib/key-management'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Ensure user key exists (this will create it if it doesn't exist)
    await getUserKey(userId)

    // Get all services for this user
    const services = await prisma.service.findMany({
      where: {
        userId: userId,
      },
      orderBy: [
        { isCustom: 'asc' }, // Default services first
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ 
      success: true, 
      services 
    })

  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des services' },
      { status: 500 }
    )
  }
} 