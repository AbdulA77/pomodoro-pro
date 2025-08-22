import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { taskTemplateSchema } from '@/lib/validators'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templates = await prisma.taskTemplate.findMany({
      where: { 
        userId: session.user.id,
        isActive: true 
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = taskTemplateSchema.parse(body)

    const template = await prisma.taskTemplate.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        priority: validatedData.priority,
        estimatePomodoros: validatedData.estimatePomodoros,
        projectId: validatedData.projectId || null,
        tags: validatedData.tags || '',
        isActive: validatedData.isActive,
        userId: session.user.id,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
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
    const validatedData = taskTemplateSchema.parse(updateData)

    const existingTemplate = await prisma.taskTemplate.findFirst({
      where: { id: id, userId: session.user.id }
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const template = await prisma.taskTemplate.update({
      where: { id: id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        priority: validatedData.priority,
        estimatePomodoros: validatedData.estimatePomodoros,
        projectId: validatedData.projectId || null,
        tags: validatedData.tags || '',
        isActive: validatedData.isActive,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
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
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    const existingTemplate = await prisma.taskTemplate.findFirst({
      where: { id: id, userId: session.user.id }
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Soft delete by setting isActive to false
    await prisma.taskTemplate.update({
      where: { id: id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Template deleted successfully' })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}
