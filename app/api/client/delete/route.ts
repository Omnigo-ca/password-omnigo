import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID du client requis' },
        { status: 400 }
      )
    }

    // Check if client exists (any user can delete any client)
    const existingClient = await prisma.client.findFirst({
      where: {
        id: id,
      },
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      )
    }

    // Delete the client (this will also handle passwords via cascade or set null)
    await prisma.client.delete({
      where: {
        id: id,
      },
    })

    return NextResponse.json(
      { message: 'Client supprimé avec succès' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 