import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateServiceSchema = z.object({
  id: z.string().min(1, 'ID du service requis'),
  name: z.string().min(1, 'Le nom du service est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  color: z.string().min(1, 'La couleur est requise'),
})

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateServiceSchema.parse(body)

    // Check if the service exists and belongs to the user
    const existingService = await prisma.service.findFirst({
      where: {
        id: validatedData.id,
        userId: userId
      }
    })

    if (!existingService) {
      return NextResponse.json(
        { error: 'Service non trouvé' },
        { status: 404 }
      )
    }

    // Check if another service with the same name already exists for this user
    const duplicateService = await prisma.service.findFirst({
      where: {
        userId: userId,
        name: validatedData.name,
        id: { not: validatedData.id }
      }
    })

    if (duplicateService) {
      return NextResponse.json(
        { error: 'Un service avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    // Update the service
    const service = await prisma.service.update({
      where: {
        id: validatedData.id
      },
      data: {
        name: validatedData.name,
        color: validatedData.color
      }
    })

    return NextResponse.json({ 
      success: true, 
      service 
    })

  } catch (error) {
    console.error('Error updating service:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du service' },
      { status: 500 }
    )
  }
} 