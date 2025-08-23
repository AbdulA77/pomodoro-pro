import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create a session counter reset record
    await prisma.sessionCounterReset.create({
      data: {
        userId: user.id,
        resetAt: new Date(),
        // Store the current session count before reset for reference
        sessionsBeforeReset: await prisma.timerSession.count({
          where: {
            userId: user.id,
            phase: 'FOCUS',
            completed: true,
            taskId: { not: 'RESET_MARKER' } // Exclude old reset markers
          }
        })
      }
    })

    return NextResponse.json({ 
      message: 'Session counter reset successfully',
      resetAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error resetting session counter:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
