'use client'

import { useEffect } from 'react'
import { TimerDisplay } from '@/components/timer/TimerDisplay'
import { TimerControls } from '@/components/timer/TimerControls'
import { useTimerStore } from '@/state/useTimerStore'
import { useHotkeys, createHotkeyConfig } from '@/hooks/useHotkeys'
import { useSound } from '@/hooks/useSound'
import { useNotifications } from '@/hooks/useNotifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, Target, Coffee, Clock, CheckSquare } from 'lucide-react'
import { toast } from 'sonner'

export default function FocusPage() {
  const {
    phase,
    remainingMs,
    isRunning,
    isPaused,
    currentInterval,
    config,
    currentTaskId,
    initialize,
    start,
    pause,
    reset,
    skip,
    setPhase,
  } = useTimerStore()

  const { playBell } = useSound({
    volume: 70,
    enabled: true,
  })

  const { sendTimerCompleteNotification } = useNotifications()

  // Initialize timer on mount
  useEffect(() => {
    initialize(config)
  }, [initialize, config])

  // Handle timer completion
  useEffect(() => {
    if (remainingMs === 0 && isRunning) {
      playBell()
      sendTimerCompleteNotification(phase)
      toast.success(`${phase.replace('_', ' ')} session complete!`)
    }
  }, [remainingMs, isRunning, phase, playBell, sendTimerCompleteNotification])

  // Keyboard shortcuts
  useHotkeys([
    createHotkeyConfig(' ', () => {
      if (isRunning) {
        pause()
      } else {
        start()
      }
    }),
    createHotkeyConfig('s', () => skip()),
    createHotkeyConfig('r', () => reset()),
    createHotkeyConfig('f', () => setPhase('FOCUS')),
    createHotkeyConfig('b', () => setPhase('SHORT_BREAK')),
    createHotkeyConfig('l', () => setPhase('LONG_BREAK')),
  ])

  const phaseIcons = {
    FOCUS: Target,
    SHORT_BREAK: Coffee,
    LONG_BREAK: Clock,
  }

  const PhaseIcon = phaseIcons[phase]

  return (
    <div className="container mx-auto max-w-4xl px-4 py-4">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] space-y-6">
        {/* Timer Card */}
        <Card className="group relative overflow-hidden rounded-xl border bg-background w-full max-w-2xl hover:shadow-lg transition-all duration-300">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <PhaseIcon className="h-6 w-6" />
              <span>{phase.replace('_', ' ')}</span>
              <Badge variant="secondary">#{currentInterval}</Badge>
            </CardTitle>

          </CardHeader>
          <CardContent className="space-y-4">
            {/* Timer Display */}
            <TimerDisplay
              remainingMs={remainingMs}
              phase={phase}
              isRunning={isRunning}
              className="py-4"
            />

            {/* Timer Controls */}
            <TimerControls
              isRunning={isRunning}
              isPaused={isPaused}
              onStart={start}
              onPause={pause}
              onReset={reset}
              onSkip={skip}
            />

                         {/* Task Selection */}
             <div className="flex justify-center mb-4">
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => window.open('/tasks', '_blank')}
                 className="transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 active:bg-primary active:text-primary-foreground"
               >
                 <CheckSquare className="mr-2 h-4 w-4" />
                 {currentTaskId ? 'Change Task' : 'Select Task'}
               </Button>
             </div>

             {/* Quick Phase Switcher */}
             <div className="flex justify-center space-x-2">
               <Button
                 variant={phase === 'FOCUS' ? 'default' : 'outline'}
                 size="sm"
                 onClick={() => setPhase('FOCUS')}
                 disabled={isRunning}
                 className="transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 active:bg-primary active:text-primary-foreground"
               >
                 <Target className="mr-2 h-4 w-4" />
                 Focus
               </Button>
               <Button
                 variant={phase === 'SHORT_BREAK' ? 'default' : 'outline'}
                 size="sm"
                 onClick={() => setPhase('SHORT_BREAK')}
                 disabled={isRunning}
                 className="transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 active:bg-primary active:text-primary-foreground"
               >
                 <Coffee className="mr-2 h-4 w-4" />
                 Short Break
               </Button>
               <Button
                 variant={phase === 'LONG_BREAK' ? 'default' : 'outline'}
                 size="sm"
                 onClick={() => setPhase('LONG_BREAK')}
                 disabled={isRunning}
                 className="transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 active:bg-primary active:text-primary-foreground"
               >
                 <Clock className="mr-2 h-4 w-4" />
                 Long Break
               </Button>
             </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Card>

        {/* Keyboard Shortcuts Help */}
        <Card className="group relative overflow-hidden rounded-xl border bg-background w-full max-w-2xl hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Space</span>
                <span className="text-muted-foreground">Start/Pause</span>
              </div>
              <div className="flex justify-between">
                <span>S</span>
                <span className="text-muted-foreground">Skip</span>
              </div>
              <div className="flex justify-between">
                <span>R</span>
                <span className="text-muted-foreground">Reset</span>
              </div>
              <div className="flex justify-between">
                <span>F</span>
                <span className="text-muted-foreground">Focus</span>
              </div>
              <div className="flex justify-between">
                <span>B</span>
                <span className="text-muted-foreground">Short Break</span>
              </div>
              <div className="flex justify-between">
                <span>L</span>
                <span className="text-muted-foreground">Long Break</span>
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Card>
      </div>
    </div>
  )
}
