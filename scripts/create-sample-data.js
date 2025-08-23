const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createSampleData() {
  try {
    console.log('Creating sample data...')
    
    // Find a user to associate data with
    const user = await prisma.user.findFirst()
    if (!user) {
      console.log('No users found. Please create a user first.')
      return
    }
    
    console.log(`Creating sample data for user: ${user.email}`)
    
    // Create sample tasks
    const sampleTasks = [
      {
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the new feature',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        estimatePomodoros: 4,
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        userId: user.id
      },
      {
        title: 'Review code changes',
        description: 'Review pull requests and provide feedback',
        priority: 'MEDIUM',
        status: 'TODO',
        estimatePomodoros: 2,
        dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        userId: user.id
      },
      {
        title: 'Plan weekly goals',
        description: 'Set objectives and priorities for the week',
        priority: 'HIGH',
        status: 'TODO',
        estimatePomodoros: 1,
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        userId: user.id
      },
      {
        title: 'Team meeting preparation',
        description: 'Prepare agenda and materials for team meeting',
        priority: 'MEDIUM',
        status: 'DONE',
        estimatePomodoros: 2,
        dueAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        userId: user.id
      }
    ]
    
    // Create tasks
    for (const taskData of sampleTasks) {
      const task = await prisma.task.create({
        data: taskData
      })
      console.log(`✅ Created task: ${task.title}`)
    }
    
    // Create sample timer sessions
    const sampleSessions = [
      {
        phase: 'FOCUS',
        durationSec: 25 * 60, // 25 minutes
        completed: true,
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
        userId: user.id
      },
      {
        phase: 'FOCUS',
        durationSec: 25 * 60, // 25 minutes
        completed: true,
        startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        endedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
        userId: user.id
      },
      {
        phase: 'SHORT_BREAK',
        durationSec: 5 * 60, // 5 minutes
        completed: true,
        startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
        endedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        userId: user.id
      },
      {
        phase: 'FOCUS',
        durationSec: 15 * 60, // 15 minutes (partial session)
        completed: false,
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endedAt: null,
        userId: user.id
      }
    ]
    
    // Create sessions
    for (const sessionData of sampleSessions) {
      const session = await prisma.timerSession.create({
        data: sessionData
      })
      console.log(`✅ Created session: ${session.phase} (${session.durationSec}s)`)
    }
    
    console.log('\n🎉 Sample data created successfully!')
    console.log('The app should now have:')
    console.log('- 4 sample tasks (1 completed, 2 in progress, 1 todo)')
    console.log('- 4 timer sessions (3 completed, 1 partial)')
    
  } catch (error) {
    console.error('Error creating sample data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleData()
