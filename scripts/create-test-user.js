const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  try {
    // Check if any users exist
    const users = await prisma.user.findMany()
    console.log(`Found ${users.length} users in database`)
    
    if (users.length === 0) {
      // Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10)
      
      const testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          passwordHash: hashedPassword,
        }
      })
      
      console.log('Created test user:', testUser.email)
      console.log('Password: password123')
    } else {
      console.log('Existing users:')
      users.forEach(user => {
        console.log(`- ${user.email} (${user.name})`)
      })
    }
    
    // Check if any tasks exist
    const tasks = await prisma.task.findMany()
    console.log(`Found ${tasks.length} tasks in database`)
    
    // Check if any sessions exist
    const sessions = await prisma.timerSession.findMany()
    console.log(`Found ${sessions.length} timer sessions in database`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
