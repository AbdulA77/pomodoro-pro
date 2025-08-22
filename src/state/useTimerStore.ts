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
      
      // Initialize timer with config
      initialize: (config: TimeConfig) => {
        const { cleanup } = get()
        cleanup()
        
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
            const { phase, currentInterval, config } = get()
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
      },
      
      // Start timer
      start: () => {
        const { worker, remainingMs, isPaused, config, phase } = get()
        
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
        }
        
        set({ isRunning: true, isPaused: false })
      },
      
      // Pause timer
      pause: () => {
        const { worker } = get()
        
        if (!worker) return
        
        worker.postMessage({ type: 'PAUSE' })
        set({ isRunning: false, isPaused: true })
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
        })
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
      }),
    }
  )
)


