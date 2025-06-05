import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createServiceSchema = z.object({
  name: z.string().min(1, 'Le nom du service est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  color: z.string().min(1, 'La couleur est requise'),
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createServiceSchema.parse(body)

    // Check if service name already exists for this user
    const existingService = await prisma.service.findFirst({
      where: {
        userId: userId,
        name: validatedData.name
      }
    })

    if (existingService) {
      return NextResponse.json(
        { error: 'Un service avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    // Create the service
    const service = await prisma.service.create({
      data: {
        name: validatedData.name,
        color: validatedData.color,
        isCustom: true, // User-created services are always custom
        userId: userId
      }
    })

    return NextResponse.json({ 
      success: true, 
      service 
    })

  } catch (error) {
    console.error('Error creating service:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création du service' },
      { status: 500 }
    )
  }
} 