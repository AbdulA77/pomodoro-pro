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
  
  // Session tracking
  sessionStartTime: Date | null
  sessionInterruptions: number
  
  // Recovery state
  lastActiveTime: number | null
  recoveryAttempted: boolean
  
  // Fallback timer
  fallbackTimerId: number | null
  
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
  syncTimer: () => void
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
      sessionStartTime: null,
      sessionInterruptions: 0,
      lastActiveTime: null,
      recoveryAttempted: false,
      fallbackTimerId: null,
      
      // Initialize timer with config
      initialize: (config: TimeConfig) => {
        const { cleanup } = get()
        cleanup()
        
        console.log('Initializing timer with config:', config)
        
        // Update config and preserve current state
        set({
          config,
          // Don't reset phase or remaining time - preserve current state
        })
        
        console.log('Timer initialized successfully with fallback system')
      },
      
      // Start timer
      start: () => {
        const { remainingMs, isPaused, config, phase, sessionStartTime, fallbackTimerId } = get()
        
        console.log('Starting timer:', { remainingMs, isPaused, phase })
        
        // Clear any existing fallback timer
        if (fallbackTimerId) {
          clearInterval(fallbackTimerId)
        }
        
        // Use fallback timer (more reliable)
        console.log('Using reliable fallback timer')
        const timerId = setInterval(() => {
          const { remainingMs: currentRemaining, isRunning } = get()
          console.log('Timer tick:', { currentRemaining, isRunning })
          
          if (isRunning && currentRemaining > 0) {
            const newRemaining = Math.max(0, currentRemaining - 1000)
            set({ remainingMs: newRemaining })
            console.log('Updated remaining time:', newRemaining)
            
            if (newRemaining <= 0) {
              clearInterval(timerId)
              
              // Handle timer completion
              const { phase, currentInterval, config, sessionStartTime, sessionInterruptions, currentTaskId } = get()
              
              // Save the completed session (don't await to prevent blocking timer)
              if (sessionStartTime) {
                get().saveSession().catch(error => {
                  console.error('Session save failed, but timer continues:', error)
                })
              }
              
              // Transition to next phase
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
                fallbackTimerId: null
              })
              
              console.log('Timer completed! Transitioning to:', nextPhase)
              
              // Auto-start next phase if configured
              if (
                (nextPhase === 'SHORT_BREAK' && config.autoStartBreaks) ||
                (nextPhase === 'LONG_BREAK' && config.autoStartBreaks) ||
                (nextPhase === 'FOCUS' && config.autoStartPomodoros)
              ) {
                setTimeout(() => get().start(), 1000)
              }
            }
          } else if (currentRemaining <= 0) {
            clearInterval(timerId)
            
            // Handle timer completion (same logic as above)
            const { phase, currentInterval, config, sessionStartTime, sessionInterruptions, currentTaskId } = get()
            
            // Save the completed session (don't await to prevent blocking timer)
            if (sessionStartTime) {
              get().saveSession().catch(error => {
                console.error('Session save failed, but timer continues:', error)
              })
            }
            
            // Transition to next phase
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
              fallbackTimerId: null
            })
            
            console.log('Timer completed! Transitioning to:', nextPhase)
            
            // Auto-start next phase if configured
            if (
              (nextPhase === 'SHORT_BREAK' && config.autoStartBreaks) ||
              (nextPhase === 'LONG_BREAK' && config.autoStartBreaks) ||
              (nextPhase === 'FOCUS' && config.autoStartPomodoros)
            ) {
              setTimeout(() => get().start(), 1000)
            }
          }
        }, 1000)
        
        set({ 
          isRunning: true, 
          isPaused: false,
          lastActiveTime: Date.now(),
          fallbackTimerId: timerId
        })
        
        // Track session start time for new sessions
        if (!sessionStartTime) {
          set({ sessionStartTime: new Date(), sessionInterruptions: 0 })
        } else {
          // Reset interruptions for continuing sessions
          set({ sessionInterruptions: 0 })
        }
        
        console.log('Timer started successfully with fallback system')
      },
      
      // Pause timer
      pause: () => {
        const { sessionInterruptions, fallbackTimerId } = get()
        
        console.log('Pausing timer:', { fallbackTimerId: !!fallbackTimerId })
        
        if (!fallbackTimerId) {
          console.error('Timer not initialized')
          return
        }
        
        try {
          if (fallbackTimerId) {
            clearInterval(fallbackTimerId)
            set({ fallbackTimerId: null })
          }
          
          set({ 
            isRunning: false, 
            isPaused: true,
            sessionInterruptions: sessionInterruptions + 1,
            lastActiveTime: Date.now()
          })
          
          console.log('Timer paused successfully')
        } catch (error) {
          console.error('Error pausing timer:', error)
        }
      },
      
      // Reset timer
      reset: () => {
        const { config, phase, fallbackTimerId } = get()
        
        // Clear fallback timer if it exists
        if (fallbackTimerId) {
          clearInterval(fallbackTimerId)
        }
        
        try {
          set({
            remainingMs: getPhaseDuration(phase, config),
            isRunning: false,
            isPaused: false,
            // Don't clear sessionStartTime - this affects dashboard/analytics
            // Only clear interruptions for current session
            sessionInterruptions: 0,
            lastActiveTime: null,
            fallbackTimerId: null,
          })
          
          console.log('Timer reset successfully')
        } catch (error) {
          console.error('Error resetting timer:', error)
        }
      },
      
      // Skip to next phase
      skip: () => {
        const { phase, currentInterval, config, fallbackTimerId } = get()
        
        // Clear any existing fallback timer
        if (fallbackTimerId) {
          clearInterval(fallbackTimerId)
        }
        
        try {
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
            fallbackTimerId: null,
          })
          
          console.log('Skipped to next phase:', nextPhase)
        } catch (error) {
          console.error('Error skipping timer:', error)
        }
      },
      
      // Set specific phase
      setPhase: (phase: Phase) => {
        const { config, fallbackTimerId } = get()
        
        // Clear any existing fallback timer
        if (fallbackTimerId) {
          clearInterval(fallbackTimerId)
        }
        
        try {
          set({
            phase,
            remainingMs: getPhaseDuration(phase, config),
            isRunning: false,
            isPaused: false,
            sessionStartTime: null, // Reset session tracking when manually changing phases
            sessionInterruptions: 0,
            fallbackTimerId: null,
          })
          
          console.log('Phase set to:', phase, 'Duration:', getPhaseDuration(phase, config))
        } catch (error) {
          console.error('Error setting phase:', error)
        }
      },
      
      // Set current task
      setCurrentTask: (taskId: string | null) => {
        set({ currentTaskId: taskId })
      },
      
      // Update configuration
      updateConfig: (newConfig: Partial<TimeConfig>) => {
        const { config, phase, remainingMs, fallbackTimerId } = get()
        const updatedConfig = { ...config, ...newConfig }
        
        // Clear any existing fallback timer
        if (fallbackTimerId) {
          clearInterval(fallbackTimerId)
        }
        
        // Only update remaining time if the current phase's duration is being changed
        let newRemainingMs = remainingMs
        
        if (
          (phase === 'FOCUS' && 'pomodoroMinutes' in newConfig) ||
          (phase === 'SHORT_BREAK' && 'shortBreakMinutes' in newConfig) ||
          (phase === 'LONG_BREAK' && 'longBreakMinutes' in newConfig)
        ) {
          newRemainingMs = getPhaseDuration(phase, updatedConfig)
        }
        
        set({
          config: updatedConfig,
          remainingMs: newRemainingMs,
          // Reset session tracking when config changes to prevent inconsistent state
          sessionStartTime: null,
          sessionInterruptions: 0,
          isRunning: false,
          isPaused: false,
          fallbackTimerId: null,
        })
        
        console.log('Config updated:', updatedConfig)
      },
      
      // Save session to database
      saveSession: async () => {
        const { phase, sessionStartTime, sessionInterruptions, currentTaskId, config } = get()
        
        if (!sessionStartTime) {
          console.log('No session start time, skipping session save')
          return
        }
        
        // Handle both Date objects and date strings (from persistence)
        const startTime = sessionStartTime instanceof Date ? sessionStartTime : new Date(sessionStartTime)
        const sessionEndTime = new Date()
        const durationSec = Math.floor((sessionEndTime.getTime() - startTime.getTime()) / 1000)
        
        // Validate duration before saving
        if (durationSec <= 0 || durationSec > 24 * 60 * 60) { // Max 24 hours
          console.log('Invalid session duration, skipping save:', durationSec)
          return
        }
        
        // Add timeout to prevent hanging
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
        
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
              taskId: currentTaskId || null,
              startedAt: startTime.toISOString(),
              endedAt: sessionEndTime.toISOString(),
              durationSec,
              completed: true,
              interruptions: sessionInterruptions,
            }),
            signal: controller.signal,
          })
          
          clearTimeout(timeoutId)
          
          if (response.ok) {
            console.log('Session saved successfully')
          } else if (response.status === 401) {
            console.log('User not authenticated, skipping session save')
          } else {
            const errorData = await response.text()
            console.error('Failed to save session:', response.status, errorData)
          }
        } catch (error) {
          clearTimeout(timeoutId)
          console.error('Error saving session:', error)
          
          // Log more details about the error
          if (error instanceof Error) {
            console.error('Session save error message:', error.message)
            console.error('Session save error stack:', error.stack)
          }
          
          // Don't throw error to prevent timer from breaking
          // Just log and continue
        }
      },
      
      // Validate persisted state
      validatePersistedState: () => {
        const { sessionStartTime, lastActiveTime, isRunning, remainingMs, phase, config } = get()
        
        // Check if remaining time is reasonable for the current phase
        const maxTimeForPhase = (() => {
          switch (phase) {
            case 'FOCUS': return minutesToMs(config.pomodoroMinutes)
            case 'SHORT_BREAK': return minutesToMs(config.shortBreakMinutes)
            case 'LONG_BREAK': return minutesToMs(config.longBreakMinutes)
            default: return minutesToMs(config.pomodoroMinutes)
          }
        })()
        
        // Validate remaining time is within reasonable bounds
        if (remainingMs < 0 || remainingMs > maxTimeForPhase * 1.1 || remainingMs > 60 * 60 * 1000) { // Allow 10% buffer, max 1 hour
          console.log('Invalid remaining time for phase:', { remainingMs, phase, maxTimeForPhase })
          return false
        }
        
        // If timer was running, check if session is still valid (within 24 hours)
        if (isRunning && sessionStartTime && lastActiveTime) {
          const now = Date.now()
          const timeSinceLastActive = now - lastActiveTime
          const maxRecoveryTime = 24 * 60 * 60 * 1000 // 24 hours
          
          if (timeSinceLastActive > maxRecoveryTime) {
            console.log('Session expired, resetting timer state')
            return false
          }
        }
        
        return true
      },
      
      // Recover timer state after page refresh
      recoverState: () => {
        const { isRunning, isPaused, sessionStartTime, validatePersistedState, recoveryAttempted, remainingMs, phase } = get()
        
        if (recoveryAttempted) return // Prevent multiple recovery attempts
        
        set({ recoveryAttempted: true })
        
        // Always validate the persisted state
        if (!validatePersistedState()) {
          console.log('Invalid persisted state, resetting timer')
          // Reset to safe state if validation fails
          set({
            isRunning: false,
            isPaused: false,
            sessionStartTime: null,
            sessionInterruptions: 0,
            lastActiveTime: null,
            remainingMs: minutesToMs(get().config.pomodoroMinutes), // Reset to default focus time
            phase: 'FOCUS',
          })
          return
        }
        
        // If timer was running, try to recover
        if (isRunning && sessionStartTime) {
          console.log('Recovering timer state...', { remainingMs, phase, isPaused })
          
          // Update last active time
          set({ lastActiveTime: Date.now() })
          
          // Resume timer if it was running and not paused
          if (!isPaused) {
            setTimeout(() => {
              get().start()
            }, 100)
          }
        } else {
          console.log('Timer state recovered but not running', { remainingMs, phase, isRunning, isPaused })
        }
      },
      
      // Sync timer state (no longer needed with fallback system)
      syncTimer: () => {
        console.log('Sync timer called - not needed with fallback system')
      },
      
      // Cleanup timer
      cleanup: () => {
        const { fallbackTimerId } = get()
        
        if (fallbackTimerId) {
          clearInterval(fallbackTimerId)
        }
        
        set({ fallbackTimerId: null })
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
        phase: state.phase,
        remainingMs: state.remainingMs,
        isRunning: state.isRunning,
        isPaused: state.isPaused,
      }),
    }
  )
)


