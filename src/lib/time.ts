// Time utility functions for Pomodoro timer

export const MINUTE_MS = 60 * 1000
export const SECOND_MS = 1000

export interface TimeConfig {
  pomodoroMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  intervalsPerLong: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
}

export type Phase = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'

export interface TimerState {
  phase: Phase
  remainingMs: number
  isRunning: boolean
  isPaused: boolean
  currentInterval: number
  totalIntervals: number
}

// Convert minutes to milliseconds
export const minutesToMs = (minutes: number): number => minutes * MINUTE_MS

// Convert milliseconds to minutes
export const msToMinutes = (ms: number): number => Math.floor(ms / MINUTE_MS)

// Convert milliseconds to seconds
export const msToSeconds = (ms: number): number => Math.floor(ms / SECOND_MS)

// Format milliseconds to MM:SS
export const formatTime = (ms: number): string => {
  const minutes = Math.floor(ms / MINUTE_MS)
  const seconds = Math.floor((ms % MINUTE_MS) / SECOND_MS)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// Format milliseconds to human readable
export const formatTimeHuman = (ms: number): string => {
  const minutes = Math.floor(ms / MINUTE_MS)
  const seconds = Math.floor((ms % MINUTE_MS) / SECOND_MS)
  
  if (minutes === 0) {
    return `${seconds}s`
  }
  
  if (seconds === 0) {
    return `${minutes}m`
  }
  
  return `${minutes}m ${seconds}s`
}

// Get phase duration in milliseconds
export const getPhaseDuration = (phase: Phase, config: TimeConfig): number => {
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

// Get next phase
export const getNextPhase = (
  currentPhase: Phase,
  currentInterval: number,
  config: TimeConfig
): { phase: Phase; interval: number } => {
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

// Calculate timer drift (for testing)
export const calculateDrift = (
  expectedDuration: number,
  actualDuration: number
): number => {
  return Math.abs(actualDuration - expectedDuration)
}

// Check if drift is acceptable (within 100ms)
export const isDriftAcceptable = (drift: number): boolean => {
  return drift < 100
}

// Get today's date range for queries
export const getTodayRange = () => {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)
  
  return { startOfDay, endOfDay }
}

// Get this week's date range
export const getThisWeekRange = () => {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  return { startOfWeek, endOfWeek }
}

// Get this month's date range
export const getThisMonthRange = () => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  
  return { startOfMonth, endOfMonth }
}

// Calculate streak
export const calculateStreak = (completedDates: Date[]): number => {
  if (completedDates.length === 0) return 0
  
  const sortedDates = completedDates
    .map(d => new Date(d.getFullYear(), d.getMonth(), d.getDate()))
    .sort((a, b) => b.getTime() - a.getTime())
  
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < sortedDates.length; i++) {
    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)
    
    if (sortedDates[i].getTime() === expectedDate.getTime()) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}
