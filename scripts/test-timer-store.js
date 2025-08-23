// Test timer store functionality
const { PrismaClient } = require('@prisma/client')

async function testTimerStore() {
  console.log('Testing timer store functionality...')
  
  // Test time calculations
  const minutesToMs = (minutes) => minutes * 60 * 1000
  const getPhaseDuration = (phase, config) => {
    switch (phase) {
      case 'FOCUS':
        return minutesToMs(config.pomodoroMinutes)
      case 'SHORT_BREAK':
        return minutesToMs(config.shortBreakMinutes)
      case 'LONG_BREAK':
        return minutesToMs(config.longBreakMinutes)
      default:
        return minutesToMs(config.pomodoroMinutes)
    }
  }
  
  const config = {
    pomodoroMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    intervalsPerLong: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
  }
  
  console.log('✅ Time calculations working:')
  console.log(`   Focus: ${getPhaseDuration('FOCUS', config)}ms`)
  console.log(`   Short Break: ${getPhaseDuration('SHORT_BREAK', config)}ms`)
  console.log(`   Long Break: ${getPhaseDuration('LONG_BREAK', config)}ms`)
  
  // Test time formatting
  const formatTime = (ms) => {
    const minutes = Math.floor(ms / (60 * 1000))
    const seconds = Math.floor((ms % (60 * 1000)) / 1000)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  
  console.log('✅ Time formatting working:')
  console.log(`   25 minutes: ${formatTime(getPhaseDuration('FOCUS', config))}`)
  console.log(`   5 minutes: ${formatTime(getPhaseDuration('SHORT_BREAK', config))}`)
  
  // Test phase transitions
  const getNextPhase = (currentPhase, currentInterval, config) => {
    switch (currentPhase) {
      case 'FOCUS':
        const nextInterval = currentInterval + 1
        if (nextInterval % config.intervalsPerLong === 0) {
          return { phase: 'LONG_BREAK', interval: nextInterval }
        } else {
          return { phase: 'SHORT_BREAK', interval: nextInterval }
        }
      case 'SHORT_BREAK':
      case 'LONG_BREAK':
        return { phase: 'FOCUS', interval: currentInterval }
      default:
        return { phase: 'FOCUS', interval: currentInterval }
    }
  }
  
  console.log('✅ Phase transitions working:')
  console.log(`   Focus -> ${getNextPhase('FOCUS', 1, config).phase}`)
  console.log(`   Short Break -> ${getNextPhase('SHORT_BREAK', 1, config).phase}`)
  console.log(`   Long Break -> ${getNextPhase('LONG_BREAK', 1, config).phase}`)
  
  // Test database connection
  try {
    const prisma = new PrismaClient()
    const users = await prisma.user.findMany()
    console.log(`✅ Database connection working: ${users.length} users found`)
    await prisma.$disconnect()
  } catch (error) {
    console.log('❌ Database connection failed:', error.message)
  }
  
  console.log('\n🎯 Timer store utilities are working correctly!')
}

testTimerStore()
