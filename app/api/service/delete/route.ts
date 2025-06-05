import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const deleteServiceSchema = z.object({
  id: z.string().min(1, 'ID du service requis'),
})

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = deleteServiceSchema.parse(body)

    // Check if the service exists (any user can delete any service)
    const existingService = await prisma.service.findFirst({
      where: {
        id: validatedData.id,
      },
      include: {
        _count: {
          select: {
            passwords: true
          }
        }
      }
    })

    if (!existingService) {
      return NextResponse.json(
        { error: 'Service non trouvé' },
        { status: 404 }
      )
    }

    // Check if service is being used by passwords
    if (existingService._count.passwords > 0) {
      return NextResponse.json(
        { error: `Ce service est utilisé par ${existingService._count.passwords} mot(s) de passe. Supprimez d'abord ces mots de passe ou changez leur service.` },
        { status: 400 }
      )
    }

    // Delete the service
    await prisma.service.delete({
      where: {
        id: validatedData.id
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Service supprimé avec succès'
    })

  } catch (error) {
    console.error('Error deleting service:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la suppression du service' },
      { status: 500 }
    )
  }
} 