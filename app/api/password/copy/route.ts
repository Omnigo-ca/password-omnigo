import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserKey } from '@/lib/key-management'
import { decrypt } from '@/lib/crypto'

// Request body validation schema
const copyPasswordSchema = z.object({
  id: z.string().min(1, 'Password ID is required'),
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
    const validation = copyPasswordSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { id } = validation.data

    // Fetch password and ensure user owns it
    const password = await prisma.password.findFirst({
      where: {
        id,
        userId, // Ensure user owns this password
      },
      select: {
        id: true,
        name: true,
        ciphertext: true,
        iv: true,
        userId: true,
      }
    })

    if (!password) {
      return NextResponse.json(
        { error: 'Password not found or access denied' },
        { status: 404 }
      )
    }

    // Get user's encryption key
    const userKey = await getUserKey(userId)

    // Decrypt the password
    const plaintext = await decrypt(password.ciphertext, password.iv, userKey)

    return NextResponse.json({
      success: true,
      plaintext,
      name: password.name,
    })

  } catch (error) {
    console.error('Error copying password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 