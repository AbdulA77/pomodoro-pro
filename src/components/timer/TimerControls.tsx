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
        'flex items-center justify-center space-x-6',
        className
      )}
    >
      {/* Reset button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onReset}
        disabled={disabled}
        className="h-12 w-12 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 active:bg-primary active:text-primary-foreground active:shadow-md"
        aria-label="Reset timer"
      >
        <RotateCcw className="h-6 w-6" />
      </Button>

      {/* Start/Pause button */}
      <Button
        size="lg"
        onClick={handleStartPause}
        disabled={disabled}
        className="h-16 w-16 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 active:bg-primary/90 active:shadow-lg"
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
      >
        {isRunning ? (
          <Pause className="h-8 w-8" />
        ) : (
          <Play className="h-8 w-8" />
        )}
      </Button>

      {/* Skip button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onSkip}
        disabled={disabled}
        className="h-12 w-12 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 active:bg-primary active:text-primary-foreground active:shadow-md"
        aria-label="Skip to next phase"
      >
        <SkipForward className="h-6 w-6" />
      </Button>
    </div>
  )
}
