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

    // Check if client exists and belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id: id,
        userId: userId,
      },
      include: {
        _count: {
          select: {
            passwords: true
          }
        }
      }
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      )
    }

    // Check if client has passwords
    if (existingClient._count.passwords > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un client qui a des mots de passe associés' },
        { status: 400 }
      )
    }

    // Delete the client
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