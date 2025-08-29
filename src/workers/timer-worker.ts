// High-precision timer worker for Pomodoro app
// Uses performance.now() for accurate timing and postMessage for communication

interface TimerMessage {
  type: 'START' | 'PAUSE' | 'RESET' | 'SKIP' | 'SET_DURATION' | 'SYNC' | 'TEST'
  duration?: number
  remaining?: number
  timestamp?: number
}

interface TimerTick {
  type: 'TICK'
  remaining: number
  elapsed: number
  isComplete: boolean
}

let timerId: NodeJS.Timeout | null = null
let startTime: number = 0
let duration: number = 0
let remaining: number = 0
let isRunning: boolean = false

// High-precision timer using performance.now() with fallback
const startTimer = (targetDuration: number, initialRemaining?: number) => {
  if (timerId) {
    clearInterval(timerId)
  }
  
  duration = targetDuration
  remaining = initialRemaining ?? targetDuration
  
  // Use performance.now() if available, otherwise use Date.now()
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
  startTime = now - (duration - remaining)
  isRunning = true
  
  // Send ticks every 250ms for smooth UI updates
  timerId = setInterval(() => {
    if (!isRunning) return
    
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const elapsed = now - startTime
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
  const { type, duration: msgDuration, remaining: msgRemaining, timestamp } = event.data
  
  // Validate all incoming messages to prevent corruption
  if (msgDuration && (msgDuration <= 0 || msgDuration > 60 * 60 * 1000)) {
    console.log('Invalid duration received:', msgDuration)
    return
  }
  
  if (msgRemaining !== undefined && (msgRemaining < 0 || msgRemaining > 60 * 60 * 1000)) {
    console.log('Invalid remaining time received:', msgRemaining)
    return
  }
  
  switch (type) {
    case 'TEST':
      console.log('Worker received TEST message')
      self.postMessage({ type: 'TEST_RESPONSE', status: 'ok' })
      break
      
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
      
    case 'SYNC':
      // Synchronize timer state with main thread
      if (msgDuration && msgRemaining !== undefined && timestamp) {
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
        const timeDiff = now - timestamp
        
        // Validate inputs to prevent corruption
        if (msgDuration <= 0 || msgRemaining < 0 || timeDiff < 0) {
          console.log('Invalid SYNC parameters, resetting timer')
          resetTimer(msgDuration || 25 * 60 * 1000) // Default to 25 minutes
          return
        }
        
        // Limit timeDiff to prevent extreme values (max 1 hour)
        const maxTimeDiff = 60 * 60 * 1000 // 1 hour
        const clampedTimeDiff = Math.min(timeDiff, maxTimeDiff)
        
        // Adjust remaining time based on time passed
        const adjustedRemaining = Math.max(0, Math.min(msgRemaining - clampedTimeDiff, msgDuration))
        
        if (isRunning) {
          // Update timer with corrected values
          duration = msgDuration
          remaining = adjustedRemaining
          startTime = now - (duration - remaining)
        } else {
          // Just update the values without starting
          duration = msgDuration
          remaining = adjustedRemaining
        }
        
        // Send current state back
        const tick: TimerTick = {
          type: 'TICK',
          remaining: Math.round(remaining),
          elapsed: Math.round(duration - remaining),
          isComplete: remaining <= 0
        }
        self.postMessage(tick)
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
