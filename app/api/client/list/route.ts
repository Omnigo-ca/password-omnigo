import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getUserKey } from '@/lib/key-management'

export async function GET() {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Ensure user key exists (this will create it if it doesn't exist)
    await getUserKey(userId)

    // Fetch all clients for this user
    const clients = await prisma.client.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        name: true,
        website: true,
        color: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            passwords: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      clients,
    })

  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 