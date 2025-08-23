'use client'

import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimerControlsProps {
  isRunning: boolean
  isPaused: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
  disabled?: boolean
  className?: string
}

export function TimerControls({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onReset,
  onSkip,
  disabled = false,
  className,
}: TimerControlsProps) {
  const handleStartPause = () => {
    if (isRunning) {
      onPause()
    } else {
      onStart()
    }
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center space-x-3 sm:space-x-6',
        className
      )}
    >
      {/* Reset button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onReset}
        disabled={disabled}
        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 active:bg-primary active:text-primary-foreground active:shadow-md"
        aria-label="Reset timer"
      >
        <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>

      {/* Start/Pause button */}
      <Button
        size="lg"
        onClick={handleStartPause}
        disabled={disabled}
        className="h-14 w-14 sm:h-16 sm:w-16 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 active:bg-primary/90 active:shadow-lg"
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
      >
        {isRunning ? (
          <Pause className="h-7 w-7 sm:h-8 sm:w-8" />
        ) : (
          <Play className="h-7 w-7 sm:h-8 sm:w-8" />
        )}
      </Button>

      {/* Skip button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onSkip}
        disabled={disabled}
        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 active:bg-primary active:text-primary-foreground active:shadow-md"
        aria-label="Skip to next phase"
      >
        <SkipForward className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
    </div>
  )
}
