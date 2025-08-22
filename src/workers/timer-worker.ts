// High-precision timer worker for Pomodoro app
// Uses performance.now() for accurate timing and postMessage for communication

interface TimerMessage {
  type: 'START' | 'PAUSE' | 'RESET' | 'SKIP' | 'SET_DURATION'
  duration?: number
  remaining?: number
}

interface TimerTick {
  type: 'TICK'
  remaining: number
  elapsed: number
  isComplete: boolean
}

let timerId: number | null = null
let startTime: number = 0
let duration: number = 0
let remaining: number = 0
let isRunning: boolean = false

// High-precision timer using performance.now()
const startTimer = (targetDuration: number, initialRemaining?: number) => {
  if (timerId) {
    clearInterval(timerId)
  }
  
  duration = targetDuration
  remaining = initialRemaining ?? targetDuration
  startTime = performance.now() - (duration - remaining)
  isRunning = true
  
  // Send ticks every 250ms for smooth UI updates
  timerId = setInterval(() => {
    if (!isRunning) return
    
    const elapsed = performance.now() - startTime
    remaining = Math.max(0, duration - elapsed)
    const isComplete = remaining <= 0
    
    const tick: TimerTick = {
      type: 'TICK',
      remaining: Math.round(remaining),
      elapsed: Math.round(elapsed),
      isComplete
    }
    
    self.postMessage(tick)
    
    if (isComplete) {
      stopTimer()
    }
  }, 250)
}

const pauseTimer = () => {
  isRunning = false
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
}

const resumeTimer = () => {
  if (remaining > 0) {
    startTimer(duration, remaining)
  }
}

const stopTimer = () => {
  isRunning = false
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
  remaining = 0
}

const resetTimer = (targetDuration: number) => {
  stopTimer()
  duration = targetDuration
  remaining = targetDuration
  startTime = 0
}

const skipTimer = () => {
  stopTimer()
  const tick: TimerTick = {
    type: 'TICK',
    remaining: 0,
    elapsed: duration,
    isComplete: true
  }
  self.postMessage(tick)
}

// Handle messages from main thread
self.addEventListener('message', (event: MessageEvent<TimerMessage>) => {
  const { type, duration: msgDuration, remaining: msgRemaining } = event.data
  
  switch (type) {
    case 'START':
      if (msgDuration) {
        if (isRunning) {
          resumeTimer()
        } else {
          startTimer(msgDuration, msgRemaining)
        }
      }
      break
      
    case 'PAUSE':
      pauseTimer()
      break
      
    case 'RESET':
      if (msgDuration) {
        resetTimer(msgDuration)
      }
      break
      
    case 'SKIP':
      skipTimer()
      break
      
    case 'SET_DURATION':
      if (msgDuration) {
        resetTimer(msgDuration)
      }
      break
  }
})

// Clean up on worker termination
self.addEventListener('beforeunload', () => {
  if (timerId) {
    clearInterval(timerId)
  }
})
