import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { timerSessionSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = timerSessionSchema.parse(body)

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create timer session
    const timerSession = await prisma.timerSession.create({
      data: {
        userId: user.id,
        taskId: validatedData.taskId || null,
        phase: validatedData.phase,
        startedAt: new Date(validatedData.startedAt),
        endedAt: validatedData.endedAt ? new Date(validatedData.endedAt) : null,
        durationSec: validatedData.durationSec,
        completed: validatedData.completed,
        interruptions: validatedData.interruptions || 0,
      }
    })

    // If this is a completed focus session and has a task, increment completedPomodoros
    if (validatedData.completed && validatedData.phase === 'FOCUS' && validatedData.taskId) {
      await prisma.task.update({
        where: { id: validatedData.taskId },
        data: {
          completedPomodoros: {
            increment: 1
          }
        }
      })
    }

    return NextResponse.json(timerSession)
  } catch (error) {
    console.error('Error creating timer session:', error)
    return NextResponse.json(
      { error: 'Failed to create timer session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const phase = searchParams.get('phase')
    const taskId = searchParams.get('taskId')

    // Build where clause
    const where: any = { userId: user.id }
    if (phase) where.phase = phase
    if (taskId) where.taskId = taskId

    // Get sessions
    const sessions = await prisma.timerSession.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching timer sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timer sessions' },
      { status: 500 }
    )
  }
}
