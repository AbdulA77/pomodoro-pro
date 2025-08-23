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

    // Delete all timer sessions for this user
    await prisma.timerSession.deleteMany({
      where: { userId: user.id }
    })

    // Reset completed pomodoros for all tasks
    await prisma.task.updateMany({
      where: { userId: user.id },
      data: { completedPomodoros: 0 }
    })

    return NextResponse.json({ 
      message: 'Session count and streak reset successfully',
      stats: {
        today: {
          focusSessions: 0,
          totalFocusTime: 0,
          tasksCompleted: 0
        },
        streak: 0,
        recentActivity: []
      }
    })
  } catch (error) {
    console.error('Error resetting stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
