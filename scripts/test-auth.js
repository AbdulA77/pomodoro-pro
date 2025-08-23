const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function testAuth() {
  try {
    // Test user credentials
    const email = 'test@example.com'
    const password = 'password123'
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log('User not found, creating test user...')
      const hashedPassword = await bcrypt.hash(password, 10)
      
      await prisma.user.create({
        data: {
          email,
          name: 'Test User',
          passwordHash: hashedPassword,
        }
      })
      console.log('Test user created successfully')
    } else {
      console.log('Test user exists:', user.email)
    }
    
    // Test password verification
    const testUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (testUser && testUser.passwordHash) {
      const isValid = await bcrypt.compare(password, testUser.passwordHash)
      console.log('Password verification:', isValid ? '✅ PASS' : '❌ FAIL')
    }
    
    // Test API endpoints (without auth for now)
    console.log('\nTesting API endpoints...')
    
    const endpoints = [
      '/api/stats',
      '/api/tasks',
      '/api/sessions'
    ]
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:3001${endpoint}`)
        console.log(`${endpoint}: ${response.status} ${response.statusText}`)
      } catch (error) {
        console.log(`${endpoint}: ❌ ERROR - ${error.message}`)
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuth()
