import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { taskSchema } from '@/lib/validators'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    // For partial updates, we need to be more flexible with validation
    const validatedData = taskSchema.partial().parse(body)

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
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.status && { status: validatedData.status }),
        ...(validatedData.priority && { priority: validatedData.priority }),
        ...(validatedData.estimatePomodoros && { estimatePomodoros: validatedData.estimatePomodoros }),
        ...(validatedData.dueAt !== undefined && { dueAt: validatedData.dueAt ? new Date(validatedData.dueAt) : null }),
        ...(validatedData.projectId !== undefined && { projectId: validatedData.projectId || null }),
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
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
