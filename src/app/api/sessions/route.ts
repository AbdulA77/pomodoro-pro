import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { timerSessionSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    console.log('Sessions API: Starting POST request')
    
    const session = await getServerSession(authOptions)
    console.log('Sessions API: Session check result:', !!session?.user?.email)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Sessions API: Request body:', body)
    
    const validatedData = timerSessionSchema.parse(body)
    console.log('Sessions API: Validated data:', validatedData)

    // Get user
    console.log('Sessions API: Looking up user with email:', session.user.email)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    console.log('Sessions API: User lookup result:', !!user)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create timer session
    console.log('Sessions API: Creating timer session with data:', {
      userId: user.id,
      taskId: validatedData.taskId || null,
      phase: validatedData.phase,
      startedAt: validatedData.startedAt,
      endedAt: validatedData.endedAt,
      durationSec: validatedData.durationSec,
      completed: validatedData.completed,
      interruptions: validatedData.interruptions || 0,
    })
    
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

    console.log('Sessions API: Timer session created successfully:', timerSession.id)
    return NextResponse.json(timerSession)
  } catch (error) {
    console.error('Error creating timer session:', error)
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    // If it's a validation error, return 400
    if (error instanceof Error && error.message.includes('Validation')) {
      return NextResponse.json(
        { error: 'Invalid session data', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create timer session', details: error instanceof Error ? error.message : 'Unknown error' },
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

