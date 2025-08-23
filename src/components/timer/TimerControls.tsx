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
    console.log('Timer control clicked:', { isRunning, isPaused })
    if (isRunning) {
      onPause()
    } else {
      onStart()
    }
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center space-x-1.5 sm:space-x-3 lg:space-x-5',
        className
      )}
    >
      {/* Reset button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onReset}
        disabled={disabled}
        className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 active:bg-primary active:text-primary-foreground active:shadow-md"
        aria-label="Reset timer"
      >
        <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
      </Button>

      {/* Start/Pause button */}
      <Button
        size="lg"
        onClick={handleStartPause}
        disabled={disabled}
        className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 active:scale-95 active:shadow-lg"
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
      >
        {isRunning ? (
          <Pause className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
        ) : (
          <Play className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
        )}
      </Button>

      {/* Skip button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onSkip}
        disabled={disabled}
        className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 active:bg-primary active:text-primary-foreground active:shadow-md"
        aria-label="Skip to next phase"
      >
        <SkipForward className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
      </Button>
    </div>
  )
}
