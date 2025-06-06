import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateClientSchema = z.object({
  id: z.string().min(1, 'ID requis'),
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide (format: #RRGGBB)'),
})

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
    
    // Validate input
    const validationResult = updateClientSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { id, name, website, color } = validationResult.data

    // Check if client exists (no user constraint)
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

    // Check if another client with the same name exists (excluding current client)
    const duplicateClient = await prisma.client.findFirst({
      where: {
        name: name,
        id: {
          not: id
        }
      },
    })

    if (duplicateClient) {
      return NextResponse.json(
        { error: 'Un client avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    // Update the client
    const updatedClient = await prisma.client.update({
      where: {
        id: id,
      },
      data: {
        name,
        website: website || null,
        color,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            passwords: true
          }
        }
      }
    })

    return NextResponse.json(
      { 
        message: 'Client mis à jour avec succès',
        client: updatedClient
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 