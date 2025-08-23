import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { taskSchema } from '@/lib/validators'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('Tasks API: No session or user ID found, returning empty array')
      return NextResponse.json([])
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
        }
      },
      orderBy: [
        { priority: 'desc' }
      ]
    })

    // Transform the data to include tag names directly
    const transformedTasks = tasks.map(task => ({
      ...task,
      tags: task.tags.map(tagRelation => tagRelation.tag.name),
      completedPomodoros: task.completedPomodoros,
    }))

    return NextResponse.json(transformedTasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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
        dueAt: validatedData.dueAt ? new Date(validatedData.dueAt) : null,
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
        }
      }
    })

    // Transform the response to match frontend expectations
    const transformedTask = {
      ...task,
      tags: task.tags.map(tagRelation => tagRelation.tag.name),
      completedPomodoros: task.completedPomodoros,
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

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body
    const validatedData = taskSchema.parse(updateData)

    // Verify the task belongs to the user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const task = await prisma.task.update({
      where: { id: id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status,
        priority: validatedData.priority,
        estimatePomodoros: validatedData.estimatePomodoros,
        dueAt: validatedData.dueAt ? new Date(validatedData.dueAt) : null,
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
        }
      }
    })

    // Transform the response to match frontend expectations
    const transformedTask = {
      ...task,
      tags: task.tags.map(tagRelation => tagRelation.tag.name),
      completedPomodoros: task.completedPomodoros,
    }

    return NextResponse.json(transformedTask)
  } catch (error) {
    console.error('Error updating task:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Verify the task belongs to the user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
