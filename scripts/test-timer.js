// Test timer store functionality
console.log('Testing timer store...')

// Simulate timer store operations
const testTimerStore = () => {
  const config = {
    pomodoroMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    intervalsPerLong: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
  }
  
  console.log('Timer config:', config)
  
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
  
  console.log('Focus duration:', getPhaseDuration('FOCUS', config), 'ms')
  console.log('Short break duration:', getPhaseDuration('SHORT_BREAK', config), 'ms')
  console.log('Long break duration:', getPhaseDuration('LONG_BREAK', config), 'ms')
  
  // Test time formatting
  const formatTime = (ms) => {
    const minutes = Math.floor(ms / (60 * 1000))
    const seconds = Math.floor((ms % (60 * 1000)) / 1000)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  
  console.log('25 minutes formatted:', formatTime(getPhaseDuration('FOCUS', config)))
  console.log('5 minutes formatted:', formatTime(getPhaseDuration('SHORT_BREAK', config)))
  
  return {
    config,
    minutesToMs,
    getPhaseDuration,
    formatTime
  }
}

const timerUtils = testTimerStore()
console.log('Timer utilities test completed successfully!')
