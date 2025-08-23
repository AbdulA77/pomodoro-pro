import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Phase, TimeConfig, getPhaseDuration, getNextPhase, minutesToMs } from '@/lib/time'

interface TimerState {
  // Timer state
  phase: Phase
  remainingMs: number
  isRunning: boolean
  isPaused: boolean
  currentInterval: number
  totalIntervals: number
  
  // Settings
  config: TimeConfig
  
  // Current task
  currentTaskId: string | null
  
  // Worker reference
  worker: Worker | null
  
  // Session tracking
  sessionStartTime: Date | null
  sessionInterruptions: number
  
  // Recovery state
  lastActiveTime: number | null
  recoveryAttempted: boolean
  
  // Actions
  initialize: (config: TimeConfig) => void
  start: () => void
  pause: () => void
  reset: () => void
  skip: () => void
  setPhase: (phase: Phase) => void
  setCurrentTask: (taskId: string | null) => void
  updateConfig: (config: Partial<TimeConfig>) => void
  cleanup: () => void
  saveSession: () => Promise<void>
  recoverState: () => void
  validatePersistedState: () => boolean
}

const defaultConfig: TimeConfig = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  intervalsPerLong: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      // Initial state
      phase: 'FOCUS',
      remainingMs: minutesToMs(defaultConfig.pomodoroMinutes),
      isRunning: false,
      isPaused: false,
      currentInterval: 1,
      totalIntervals: 0,
      config: defaultConfig,
      currentTaskId: null,
      worker: null,
      sessionStartTime: null,
      sessionInterruptions: 0,
      lastActiveTime: null,
      recoveryAttempted: false,
      
      // Initialize timer with config
      initialize: (config: TimeConfig) => {
        const { cleanup } = get()
        cleanup()
        
        try {
          // Create Web Worker
          const worker = new Worker(
            new URL('../workers/timer-worker.ts', import.meta.url),
            { type: 'module' }
          )
        
        // Handle worker messages
        worker.onmessage = (event) => {
          const { remaining, isComplete } = event.data
          
          set({ remainingMs: remaining })
          
          if (isComplete) {
            const { phase, currentInterval, config, sessionStartTime, sessionInterruptions, currentTaskId } = get()
            
            // Save the completed session
            if (sessionStartTime) {
              get().saveSession()
            }
            
            const { phase: nextPhase, interval: nextInterval } = getNextPhase(
              phase,
              currentInterval,
              config
            )
            
            set({
              phase: nextPhase,
              currentInterval: nextInterval,
              remainingMs: getPhaseDuration(nextPhase, config),
              isRunning: false,
              isPaused: false,
              sessionStartTime: null,
              sessionInterruptions: 0,
            })
            
            // Auto-start next phase if configured
            if (
              (nextPhase === 'SHORT_BREAK' && config.autoStartBreaks) ||
              (nextPhase === 'LONG_BREAK' && config.autoStartBreaks) ||
              (nextPhase === 'FOCUS' && config.autoStartPomodoros)
            ) {
              setTimeout(() => get().start(), 1000)
            }
          }
        }
        
        set({
          worker,
          config,
          remainingMs: getPhaseDuration('FOCUS', config),
        })
      } catch (error) {
        console.error('Failed to create timer worker:', error)
        // Fallback: continue without worker, timer won't work but app won't crash
        set({
          worker: null,
          config,
          remainingMs: getPhaseDuration('FOCUS', config),
        })
      }
      },
      
      // Start timer
      start: () => {
        const { worker, remainingMs, isPaused, config, phase, sessionStartTime } = get()
        
        if (!worker) return
        
        if (isPaused) {
          // Resume from pause
          worker.postMessage({
            type: 'START',
            duration: getPhaseDuration(phase, config),
            remaining: remainingMs,
          })
        } else {
          // Start fresh
          worker.postMessage({
            type: 'START',
            duration: getPhaseDuration(phase, config),
          })
          // Track session start time for new sessions (only if not already tracking)
          if (!sessionStartTime) {
            set({ sessionStartTime: new Date(), sessionInterruptions: 0 })
          }
        }
        
        set({ 
          isRunning: true, 
          isPaused: false,
          lastActiveTime: Date.now()
        })
      },
      
      // Pause timer
      pause: () => {
        const { worker, sessionInterruptions } = get()
        
        if (!worker) return
        
        worker.postMessage({ type: 'PAUSE' })
        set({ 
          isRunning: false, 
          isPaused: true,
          sessionInterruptions: sessionInterruptions + 1,
          lastActiveTime: Date.now()
        })
      },
      
      // Reset timer
      reset: () => {
        const { worker, config, phase } = get()
        
        if (!worker) return
        
        worker.postMessage({
          type: 'RESET',
          duration: getPhaseDuration(phase, config),
        })
        
        set({
          remainingMs: getPhaseDuration(phase, config),
          isRunning: false,
          isPaused: false,
          sessionStartTime: null,
          sessionInterruptions: 0,
        })
      },
      
      // Skip to next phase
      skip: () => {
        const { worker, phase, currentInterval, config } = get()
        
        if (!worker) return
        
        worker.postMessage({ type: 'SKIP' })
        
        const { phase: nextPhase, interval: nextInterval } = getNextPhase(
          phase,
          currentInterval,
          config
        )
        
        set({
          phase: nextPhase,
          currentInterval: nextInterval,
          remainingMs: getPhaseDuration(nextPhase, config),
          isRunning: false,
          isPaused: false,
          sessionStartTime: null,
          sessionInterruptions: 0,
        })
      },
      
      // Set specific phase
      setPhase: (phase: Phase) => {
        const { worker, config } = get()
        
        if (!worker) return
        
        worker.postMessage({
          type: 'SET_DURATION',
          duration: getPhaseDuration(phase, config),
        })
        
        set({
          phase,
          remainingMs: getPhaseDuration(phase, config),
          isRunning: false,
          isPaused: false,
          sessionStartTime: null, // Reset session tracking when manually changing phases
          sessionInterruptions: 0,
        })
      },
      
      // Set current task
      setCurrentTask: (taskId: string | null) => {
        set({ currentTaskId: taskId })
      },
      
      // Update configuration
      updateConfig: (newConfig: Partial<TimeConfig>) => {
        const { config, phase, worker } = get()
        const updatedConfig = { ...config, ...newConfig }
        
        if (worker) {
          worker.postMessage({
            type: 'SET_DURATION',
            duration: getPhaseDuration(phase, updatedConfig),
          })
        }
        
        set({
          config: updatedConfig,
          remainingMs: getPhaseDuration(phase, updatedConfig),
          // Reset session tracking when config changes to prevent inconsistent state
          sessionStartTime: null,
          sessionInterruptions: 0,
          isRunning: false,
          isPaused: false,
        })
      },
      
      // Save session to database
      saveSession: async () => {
        const { phase, sessionStartTime, sessionInterruptions, currentTaskId, config } = get()
        
        if (!sessionStartTime) return
        
        // Handle both Date objects and date strings (from persistence)
        const startTime = sessionStartTime instanceof Date ? sessionStartTime : new Date(sessionStartTime)
        const sessionEndTime = new Date()
        const durationSec = Math.floor((sessionEndTime.getTime() - startTime.getTime()) / 1000)
        
        try {
          console.log('Saving session:', {
            phase,
            taskId: currentTaskId,
            startedAt: startTime.toISOString(),
            endedAt: sessionEndTime.toISOString(),
            durationSec,
            completed: true,
            interruptions: sessionInterruptions,
          })
          
          const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phase,
              taskId: currentTaskId,
              startedAt: startTime.toISOString(),
              endedAt: sessionEndTime.toISOString(),
              durationSec,
              completed: true,
              interruptions: sessionInterruptions,
            }),
          })
          
          if (response.ok) {
            console.log('Session saved successfully')
          } else if (response.status === 401) {
            console.log('User not authenticated, skipping session save')
          } else {
            console.error('Failed to save session:', response.status)
          }
                 } catch (error) {
           console.error('Error saving session:', error)
           
           // Log more details about the error
           if (error instanceof Error) {
             console.error('Session save error message:', error.message)
             console.error('Session save error stack:', error.stack)
           }
           
           // Don't throw error to prevent timer from breaking
         }
      },
      
      // Validate persisted state
      validatePersistedState: () => {
        const { sessionStartTime, lastActiveTime, isRunning, remainingMs } = get()
        
        // If timer was running, check if session is still valid (within 24 hours)
        if (isRunning && sessionStartTime && lastActiveTime) {
          const now = Date.now()
          const timeSinceLastActive = now - lastActiveTime
          const maxRecoveryTime = 24 * 60 * 60 * 1000 // 24 hours
          
          if (timeSinceLastActive > maxRecoveryTime) {
            console.log('Session expired, resetting timer state')
            return false
          }
          
          // Check if remaining time is reasonable
          if (remainingMs < 0 || remainingMs > 60 * 60 * 1000) { // More than 1 hour
            console.log('Invalid remaining time, resetting timer state')
            return false
          }
        }
        
        return true
      },
      
      // Recover timer state after page refresh
      recoverState: () => {
        const { isRunning, isPaused, sessionStartTime, validatePersistedState, worker, recoveryAttempted } = get()
        
        if (recoveryAttempted) return // Prevent multiple recovery attempts
        
        set({ recoveryAttempted: true })
        
        if (!validatePersistedState()) {
          // Reset to safe state if validation fails
          set({
            isRunning: false,
            isPaused: false,
            sessionStartTime: null,
            sessionInterruptions: 0,
            lastActiveTime: null,
          })
          return
        }
        
        // If timer was running, try to recover
        if (isRunning && worker && sessionStartTime) {
          console.log('Recovering timer state...')
          
          // Update last active time
          set({ lastActiveTime: Date.now() })
          
          // Resume timer if it was running
          if (!isPaused) {
            setTimeout(() => {
              get().start()
            }, 100)
          }
        }
      },
      
      // Cleanup worker
      cleanup: () => {
        const { worker } = get()
        
        if (worker) {
          worker.terminate()
        }
        
        set({ worker: null })
      },
    }),
    {
      name: 'pomodoro-timer',
      partialize: (state) => ({
        config: state.config,
        currentTaskId: state.currentTaskId,
        currentInterval: state.currentInterval,
        totalIntervals: state.totalIntervals,
        sessionStartTime: state.sessionStartTime,
        sessionInterruptions: state.sessionInterruptions,
        lastActiveTime: state.lastActiveTime,
        recoveryAttempted: state.recoveryAttempted,
      }),
    }
  )
)


