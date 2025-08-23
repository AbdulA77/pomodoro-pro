'use client'

import { formatTime } from '@/lib/time'
import { cn } from '@/lib/utils'

interface TimerDisplayProps {
  remainingMs: number
  phase: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'
  isRunning: boolean
  className?: string
}

export function TimerDisplay({
  remainingMs,
  phase,
  isRunning,
  className,
}: TimerDisplayProps) {
  // Add error handling for invalid remainingMs
  const safeRemainingMs = Math.max(0, remainingMs || 0)
  
  let formattedTime = '00:00'
  let minutes = '00'
  let seconds = '00'
  
  try {
    formattedTime = formatTime(safeRemainingMs)
    ;[minutes, seconds] = formattedTime.split(':')
  } catch (error) {
    console.error('Error formatting time:', error)
    formattedTime = '00:00'
    minutes = '00'
    seconds = '00'
  }

  const phaseColors = {
    FOCUS: 'text-white',
    SHORT_BREAK: 'text-white',
    LONG_BREAK: 'text-white',
  }

  const phaseColor = phaseColors[phase]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-4',
        className
      )}
      role="timer"
      aria-live="polite"
      aria-label={`${phase.toLowerCase()} timer: ${formattedTime} remaining`}
    >
      {/* Phase indicator */}
      <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-muted/20 text-xs sm:text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {phase.replace('_', ' ')}
      </div>

      {/* Timer display with animation */}
      <div className="relative">
        <div
          key={`${phase}-${formattedTime}`}
          className={cn(
            'font-mono text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-center transition-all duration-500 ease-out',
            phaseColor
          )}
        >
          <span className="inline-block min-w-[2ch] transition-transform duration-300 hover:scale-105">{minutes}</span>
          <span className="mx-1 sm:mx-2 text-muted-foreground">:</span>
          <span className="inline-block min-w-[2ch] transition-transform duration-300 hover:scale-105">{seconds}</span>
        </div>

        {/* Running indicator */}
        {isRunning && (
          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-6 sm:w-6 rounded-full bg-green-500 animate-pulse">
            <div className="h-full w-full rounded-full bg-green-500 opacity-50" />
          </div>
        )}
      </div>
    </div>
  )
}
