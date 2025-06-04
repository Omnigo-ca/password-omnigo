import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserKey } from '@/lib/key-management'
import { encrypt } from '@/lib/crypto'

// Request body validation schema
const updatePasswordSchema = z.object({
  id: z.string().min(1, 'Password ID is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  plaintext: z.string().min(1, 'Password is required').optional(),
}).refine(data => data.name || data.plaintext, {
  message: 'At least one field (name or plaintext) must be provided',
})

export async function PUT(request: NextRequest) {
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
    const validation = updatePasswordSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { id, name, plaintext } = validation.data

    // Check if password exists and user owns it
    const existingPassword = await prisma.password.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!existingPassword) {
      return NextResponse.json(
        { error: 'Password not found or access denied' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: {
      name?: string;
      ciphertext?: string;
      iv?: string;
    } = {}
    
    if (name) {
      updateData.name = name
    }

    if (plaintext) {
      // Get user's encryption key and encrypt new password
      const userKey = await getUserKey(userId)
      const { ciphertext, iv } = await encrypt(plaintext, userKey)
      updateData.ciphertext = ciphertext
      updateData.iv = iv
    }

    // Update the password
    const updatedPassword = await prisma.password.update({
      where: {
        id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      password: updatedPassword,
    })

  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 