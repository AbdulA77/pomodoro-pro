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
    FOCUS: 'text-red-500',
    SHORT_BREAK: 'text-green-500',
    LONG_BREAK: 'text-blue-500',
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
      <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {phase.replace('_', ' ')}
      </div>

      {/* Circular progress ring with timer inside */}
      <div className="relative">
        <svg
          className="h-80 w-80 transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-muted opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            style={{ 
              color: phase === 'FOCUS' ? 'rgb(239 68 68)' : 
                     phase === 'SHORT_BREAK' ? 'rgb(34 197 94)' : 
                     'rgb(59 130 246)',
              strokeDasharray: '283',
              strokeDashoffset: `${283 - (283 * (remainingMs / (25 * 60 * 1000)))}`
            }}
          />
        </svg>
        
        {/* Timer display centered inside the circle */}
        <div className="absolute inset-0 flex items-center justify-center">
                  <div
          key={`${phase}-${formattedTime}`}
          className={cn(
            'font-mono text-6xl font-bold tracking-tight md:text-7xl text-center',
            phaseColor
          )}
        >
          <span className="inline-block min-w-[2ch]">{minutes}</span>
          <span className="mx-1 text-muted-foreground">:</span>
          <span className="inline-block min-w-[2ch]">{seconds}</span>
        </div>
        </div>

        {/* Running indicator */}
        {isRunning && (
          <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-green-500 animate-pulse">
            <div className="h-full w-full rounded-full bg-green-500 opacity-50" />
          </div>
        )}
      </div>
    </div>
  )
}
