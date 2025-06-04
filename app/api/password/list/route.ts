import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

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

    // Fetch all passwords for the user with client information
    const passwords = await prisma.password.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
        username: true,
        url: true,
        userId: true,
        clientId: true,
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
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      passwords,
    })

  } catch (error) {
    console.error('Error fetching passwords:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 