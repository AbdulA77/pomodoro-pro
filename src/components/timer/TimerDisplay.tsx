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
  const formattedTime = formatTime(remainingMs)
  const [minutes, seconds] = formattedTime.split(':')

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
      <div className="inline-flex items-center px-4 py-2 rounded-full bg-muted/20 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {phase.replace('_', ' ')}
      </div>

      {/* Timer display with animation */}
      <div className="relative">
        <div
          key={`${phase}-${formattedTime}`}
          className={cn(
            'font-mono text-8xl font-bold tracking-tight md:text-9xl text-center transition-all duration-500 ease-out',
            phaseColor
          )}
        >
          <span className="inline-block min-w-[2ch] transition-transform duration-300 hover:scale-105">{minutes}</span>
          <span className="mx-2 text-muted-foreground">:</span>
          <span className="inline-block min-w-[2ch] transition-transform duration-300 hover:scale-105">{seconds}</span>
        </div>

        {/* Running indicator */}
        {isRunning && (
          <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-green-500 animate-pulse">
            <div className="h-full w-full rounded-full bg-green-500 opacity-50" />
          </div>
        )}
      </div>
    </div>
  )
}
