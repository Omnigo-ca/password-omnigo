import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserKey } from '@/lib/key-management'

// Request body validation schema
const createClientSchema = z.object({
  name: z.string().min(1, 'Client name is required').max(100, 'Client name is too long'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
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
    const validation = createClientSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, website, color } = validation.data

    // Ensure user key exists (this will create it if it doesn't exist)
    await getUserKey(userId)

    // Create the client
    const client = await prisma.client.create({
      data: {
        name,
        website: website || null,
        color: color || '#7DF9FF', // Default to brand electric blue
        userId,
      },
      select: {
        id: true,
        name: true,
        website: true,
        color: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      client,
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 