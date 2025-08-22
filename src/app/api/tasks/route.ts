import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { taskSchema } from '@/lib/validators'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        _count: {
          select: {
            sessions: {
              where: {
                completed: true,
              }
            }
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Transform the data to include tag names directly
    const transformedTasks = tasks.map(task => ({
      ...task,
      tags: task.tags.map(tagRelation => tagRelation.tag.name),
      completedPomodoros: task._count.sessions,
    }))

    return NextResponse.json(transformedTasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = taskSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status,
        priority: validatedData.priority,
        estimatePomodoros: validatedData.estimatePomodoros,
        userId: session.user.id,
        projectId: validatedData.projectId || null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        _count: {
          select: {
            sessions: {
              where: {
                completed: true,
              }
            }
          }
        }
      }
    })

    // Transform the response to match frontend expectations
    const transformedTask = {
      ...task,
      tags: task.tags.map(tagRelation => tagRelation.tag.name),
      completedPomodoros: task._count.sessions,
    }

    return NextResponse.json(transformedTask, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
