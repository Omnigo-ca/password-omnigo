import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import CryptoJS from 'crypto-js'

const prisma = new PrismaClient()

const updatePasswordSchema = z.object({
  id: z.string().min(1, 'ID requis'),
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  username: z.string().optional(),
  url: z.string().url('URL invalide').optional().or(z.literal('')),
  plaintext: z.string().optional(),
  clientId: z.string().optional().nullable(),
  serviceId: z.string().optional().nullable(),
})

export async function PUT(request: NextRequest) {
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
    const validationResult = updatePasswordSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { id, name, username, url, plaintext, clientId, serviceId } = validationResult.data

    // Check if password exists and belongs to user
    const existingPassword = await prisma.password.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    })

    if (!existingPassword) {
      return NextResponse.json(
        { error: 'Mot de passe non trouvé' },
        { status: 404 }
      )
    }

    // Check if client exists and belongs to user (if clientId is provided)
    if (clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          userId: userId,
        },
      })

      if (!client) {
        return NextResponse.json(
          { error: 'Client non trouvé' },
          { status: 404 }
        )
      }
    }

    // Check if service exists and belongs to user (if serviceId is provided)
    if (serviceId) {
      const service = await prisma.service.findFirst({
        where: {
          id: serviceId,
          userId: userId,
        },
      })

      if (!service) {
        return NextResponse.json(
          { error: 'Service non trouvé' },
          { status: 404 }
        )
      }
    }

    // Check if another password with the same name exists (excluding current password)
    const duplicatePassword = await prisma.password.findFirst({
      where: {
        name: name,
        userId: userId,
        id: {
          not: id
        }
      },
    })

    if (duplicatePassword) {
      return NextResponse.json(
        { error: 'Un mot de passe avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    // Encrypt the password only if a new one is provided
    let ciphertext: string | undefined = undefined
    let iv: string | undefined = undefined
    if (plaintext && plaintext.trim() !== '') {
      const encryptionKey = process.env.ENCRYPTION_KEY
      if (!encryptionKey) {
        return NextResponse.json(
          { error: 'Clé de chiffrement manquante' },
          { status: 500 }
        )
      }
      
      // Generate a random IV for this encryption
      const randomIv = CryptoJS.lib.WordArray.random(16)
      iv = randomIv.toString()
      ciphertext = CryptoJS.AES.encrypt(plaintext, encryptionKey, { iv: randomIv }).toString()
    }

    // Prepare update data
    const updateData: {
      name: string
      username: string | null
      url: string | null
      clientId: string | null
      serviceId: string | null
      updatedAt: Date
      ciphertext?: string
      iv?: string
    } = {
      name,
      username: username || null,
      url: url || null,
      clientId: clientId || null,
      serviceId: serviceId || null,
      updatedAt: new Date(),
    }

    // Only update password if a new one was provided
    if (ciphertext && iv) {
      updateData.ciphertext = ciphertext
      updateData.iv = iv
    }

    // Update the password
    const updatedPassword = await prisma.password.update({
      where: {
        id: id,
      },
      data: updateData,
      include: {
        client: true,
        service: true,
      }
    })

    return NextResponse.json(
      { 
        message: 'Mot de passe mis à jour avec succès',
        password: {
          id: updatedPassword.id,
          name: updatedPassword.name,
          username: updatedPassword.username,
          url: updatedPassword.url,
          createdAt: updatedPassword.createdAt,
          updatedAt: updatedPassword.updatedAt,
          client: updatedPassword.client,
          service: updatedPassword.service,
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Keep POST for backward compatibility
export async function POST(request: NextRequest) {
  return PUT(request)
} 