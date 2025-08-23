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
        'flex flex-col items-center justify-center space-y-2 sm:space-y-3 lg:space-y-4',
        className
      )}
      role="timer"
      aria-live="polite"
      aria-label={`${phase.toLowerCase()} timer: ${formattedTime} remaining`}
    >
      {/* Phase indicator */}
      <div className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-full bg-muted/20 text-xs sm:text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {phase.replace('_', ' ')}
      </div>

      {/* Timer display with animation */}
      <div className="relative">
        <div
          key={`${phase}-${formattedTime}`}
          className={cn(
            'font-mono text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-bold tracking-tight text-center transition-all duration-500 ease-out',
            phaseColor
          )}
        >
          <span className="inline-block min-w-[2ch] transition-transform duration-300 hover:scale-105">{minutes}</span>
          <span className="mx-0.5 sm:mx-1 lg:mx-2 text-muted-foreground">:</span>
          <span className="inline-block min-w-[2ch] transition-transform duration-300 hover:scale-105">{seconds}</span>
        </div>

        {/* Running indicator - removed to avoid distraction */}
        {/* {isRunning && (
          <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 lg:-top-2 lg:-right-2 h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 rounded-full bg-green-500 animate-pulse">
            <div className="h-full w-full rounded-full bg-green-500 opacity-50" />
          </div>
        )} */}
      </div>
    </div>
  )
}
