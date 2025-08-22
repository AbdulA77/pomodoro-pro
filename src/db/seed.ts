import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@pomodoro-pro.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@pomodoro-pro.com',
      passwordHash: hashedPassword,
      settings: {
        create: {
          pomodoroMinutes: 25,
          shortBreakMinutes: 5,
          longBreakMinutes: 15,
          intervalsPerLong: 4,
          autoStartBreaks: true,
          autoStartPomodoros: false,
          strictFocusMode: false,
          alarmSound: 'bell.mp3',
          alarmVolume: 70,
          theme: 'system',
        }
      }
    }
  })

  // Create projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        userId: user.id,
        name: 'Work',
        color: 'blue',
      }
    }),
    prisma.project.create({
      data: {
        userId: user.id,
        name: 'Personal',
        color: 'green',
      }
    }),
    prisma.project.create({
      data: {
        userId: user.id,
        name: 'Learning',
        color: 'purple',
      }
    })
  ])

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { userId_name: { userId: user.id, name: 'urgent' } },
      update: {},
      create: {
        userId: user.id,
        name: 'urgent',
      }
    }),
    prisma.tag.upsert({
      where: { userId_name: { userId: user.id, name: 'bugfix' } },
      update: {},
      create: {
        userId: user.id,
        name: 'bugfix',
      }
    }),
    prisma.tag.upsert({
      where: { userId_name: { userId: user.id, name: 'feature' } },
      update: {},
      create: {
        userId: user.id,
        name: 'feature',
      }
    }),
    prisma.tag.upsert({
      where: { userId_name: { userId: user.id, name: 'research' } },
      update: {},
      create: {
        userId: user.id,
        name: 'research',
      }
    }),
    prisma.tag.upsert({
      where: { userId_name: { userId: user.id, name: 'refactor' } },
      update: {},
      create: {
        userId: user.id,
        name: 'refactor',
      }
    }),
    prisma.tag.upsert({
      where: { userId_name: { userId: user.id, name: 'documentation' } },
      update: {},
      create: {
        userId: user.id,
        name: 'documentation',
      }
    })
  ])

  // Create tasks
  const tasks = await Promise.all([
    prisma.task.upsert({
      where: { id: 'task-1' },
      update: {},
      create: {
        id: 'task-1',
        userId: user.id,
        projectId: projects[0].id, // Work
        title: 'Fix authentication bug',
        description: 'Users are getting logged out unexpectedly',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        estimatePomodoros: 4,
        completedPomodoros: 2,
        dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        tags: {
          create: [
            { tagId: tags[1].id }, // bugfix
            { tagId: tags[0].id }, // urgent
          ]
        }
      }
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        projectId: projects[0].id, // Work
        title: 'Implement user dashboard',
        description: 'Create a comprehensive dashboard for user analytics',
        status: 'TODO',
        priority: 'MEDIUM',
        estimatePomodoros: 8,
        completedPomodoros: 0,
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        tags: {
          create: [
            { tagId: tags[2].id }, // feature
          ]
        }
      }
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        projectId: projects[1].id, // Personal
        title: 'Learn React Server Components',
        description: 'Study the new React Server Components architecture',
        status: 'TODO',
        priority: 'LOW',
        estimatePomodoros: 6,
        completedPomodoros: 0,
        tags: {
          create: [
            { tagId: tags[3].id }, // research
          ]
        }
      }
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        projectId: projects[2].id, // Learning
        title: 'Refactor timer logic',
        description: 'Improve the timer precision and add better error handling',
        status: 'DONE',
        priority: 'MEDIUM',
        estimatePomodoros: 3,
        completedPomodoros: 3,
        tags: {
          create: [
            { tagId: tags[4].id }, // refactor
          ]
        }
      }
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        projectId: projects[0].id, // Work
        title: 'Update API documentation',
        description: 'Write comprehensive documentation for the new API endpoints',
        status: 'BACKLOG',
        priority: 'LOW',
        estimatePomodoros: 2,
        completedPomodoros: 0,
        tags: {
          create: [
            { tagId: tags[5].id }, // documentation
          ]
        }
      }
    })
  ])

  // Create some timer sessions for analytics
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  await Promise.all([
    // Today's sessions
    prisma.timerSession.create({
      data: {
        userId: user.id,
        taskId: tasks[0].id,
        phase: 'FOCUS',
        startedAt: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM
        endedAt: new Date(today.getTime() + 9 * 60 * 60 * 1000 + 25 * 60 * 1000), // 9:25 AM
        durationSec: 25 * 60,
        completed: true,
        interruptions: 0,
      }
    }),
    prisma.timerSession.create({
      data: {
        userId: user.id,
        taskId: tasks[0].id,
        phase: 'SHORT_BREAK',
        startedAt: new Date(today.getTime() + 9 * 60 * 60 * 1000 + 25 * 60 * 1000), // 9:25 AM
        endedAt: new Date(today.getTime() + 9 * 60 * 60 * 1000 + 30 * 60 * 1000), // 9:30 AM
        durationSec: 5 * 60,
        completed: true,
        interruptions: 0,
      }
    }),
    prisma.timerSession.create({
      data: {
        userId: user.id,
        taskId: tasks[0].id,
        phase: 'FOCUS',
        startedAt: new Date(today.getTime() + 9 * 60 * 60 * 1000 + 30 * 60 * 1000), // 9:30 AM
        endedAt: new Date(today.getTime() + 9 * 60 * 60 * 1000 + 55 * 60 * 1000), // 9:55 AM
        durationSec: 25 * 60,
        completed: true,
        interruptions: 1,
      }
    }),
    // Yesterday's sessions
    prisma.timerSession.create({
      data: {
        userId: user.id,
        taskId: tasks[3].id,
        phase: 'FOCUS',
        startedAt: new Date(today.getTime() - 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // Yesterday 2 PM
        endedAt: new Date(today.getTime() - 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000 + 25 * 60 * 1000),
        durationSec: 25 * 60,
        completed: true,
        interruptions: 0,
      }
    }),
    prisma.timerSession.create({
      data: {
        userId: user.id,
        taskId: tasks[3].id,
        phase: 'FOCUS',
        startedAt: new Date(today.getTime() - 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), // Yesterday 3 PM
        endedAt: new Date(today.getTime() - 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000 + 25 * 60 * 1000),
        durationSec: 25 * 60,
        completed: true,
        interruptions: 0,
      }
    }),
    prisma.timerSession.create({
      data: {
        userId: user.id,
        taskId: tasks[3].id,
        phase: 'FOCUS',
        startedAt: new Date(today.getTime() - 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // Yesterday 4 PM
        endedAt: new Date(today.getTime() - 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000 + 25 * 60 * 1000),
        durationSec: 25 * 60,
        completed: true,
        interruptions: 0,
      }
    })
  ])

  // Create sample task templates
  const templates = await Promise.all([
    prisma.taskTemplate.create({
      data: {
        userId: user.id,
        name: 'Code Review',
        description: 'Review pull requests and provide feedback',
        priority: 'MEDIUM',
        estimatePomodoros: 2,
        projectId: projects[0].id, // Work
        tags: 'review,code,feedback',
      }
    }),
    prisma.taskTemplate.create({
      data: {
        userId: user.id,
        name: 'Daily Standup',
        description: 'Prepare for and attend daily team standup meeting',
        priority: 'HIGH',
        estimatePomodoros: 1,
        projectId: projects[0].id, // Work
        tags: 'meeting,standup,daily',
      }
    }),
    prisma.taskTemplate.create({
      data: {
        userId: user.id,
        name: 'Documentation Update',
        description: 'Update project documentation and README files',
        priority: 'LOW',
        estimatePomodoros: 3,
        projectId: projects[0].id, // Work
        tags: 'documentation,writing,maintenance',
      }
    }),
    prisma.taskTemplate.create({
      data: {
        userId: user.id,
        name: 'Study Session',
        description: 'Dedicated time for learning new technologies or concepts',
        priority: 'MEDIUM',
        estimatePomodoros: 4,
        projectId: projects[1].id, // Learning
        tags: 'learning,study,research',
      }
    }),
    prisma.taskTemplate.create({
      data: {
        userId: user.id,
        name: 'Exercise',
        description: 'Physical workout or exercise routine',
        priority: 'HIGH',
        estimatePomodoros: 2,
        projectId: projects[2].id, // Personal
        tags: 'health,fitness,exercise',
      }
    })
  ])

  console.log('✅ Database seeded successfully!')
  console.log('📧 Demo user: demo@pomodoro-pro.com')
  console.log('🔑 Password: demo123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
