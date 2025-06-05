import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Request body validation schema
const deletePasswordSchema = z.object({
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
    const validation = deletePasswordSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { id } = validation.data

    // Verify password exists (any user can delete any password)
    const password = await prisma.password.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
      }
    })

    if (!password) {
      return NextResponse.json(
        { error: 'Password not found' },
        { status: 404 }
      )
    }

    // Delete the password
    await prisma.password.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Password deleted successfully',
    })

  } catch (error) {
    console.error('Error deleting password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 