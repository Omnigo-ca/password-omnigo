import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserKey } from '@/lib/key-management'
import { encrypt } from '@/lib/crypto'

// Request body validation schema
const createPasswordSchema = z.object({
  name: z.string().min(1, 'Password name is required').max(100, 'Password name is too long'),
  username: z.string().optional(),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  plaintext: z.string().min(1, 'Password is required'),
  clientId: z.string().min(1, 'Client is required'),
  serviceId: z.string().min(1, 'Service is required'),
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = createPasswordSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, username, url, plaintext, clientId, serviceId } = validation.data

    // Verify client exists (shared across company)
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Verify service exists (shared across company)
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
      },
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Get user's encryption key
    const userKey = await getUserKey(userId)

    // Encrypt the password
    const { ciphertext, iv } = await encrypt(plaintext, userKey)

    // Store the encrypted password
    const password = await prisma.password.create({
      data: {
        name,
        username: username || null,
        url: url || null,
        ciphertext,
        iv,
        userId,
        clientId,
        serviceId,
      },
      select: {
        id: true,
        name: true,
        username: true,
        url: true,
        clientId: true,
        serviceId: true,
        createdAt: true,
        updatedAt: true,
        client: {
          select: {
            id: true,
            name: true,
            website: true,
            color: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      }
    })

    return NextResponse.json({
      success: true,
      password,
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 