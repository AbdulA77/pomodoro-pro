'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TimerDisplay } from '@/components/timer/TimerDisplay'
import { TimerControls } from '@/components/timer/TimerControls'
import { useTimerStore } from '@/state/useTimerStore'
import { useHotkeys, createHotkeyConfig } from '@/hooks/useHotkeys'
import { useSound } from '@/hooks/useSound'
import { useNotifications } from '@/hooks/useNotifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Target, Coffee, Clock, CheckSquare, Zap, Play, Pause, RotateCcw, SkipForward, Keyboard, Sparkles, RotateCcw as ResetIcon } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function FocusPage() {
  const router = useRouter()
  const [totalSessions, setTotalSessions] = useState(0)
  const [isResetting, setIsResetting] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  
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

  // Fetch total sessions count
  const fetchTotalSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setTotalSessions(data.allTime?.focusSessions || 0)
      } else if (response.status === 401) {
        // User not authenticated, set to 0
        setTotalSessions(0)
      }
    } catch (error) {
      console.error('Error fetching total sessions:', error)
      // Set to 0 on error to avoid showing undefined
      setTotalSessions(0)
    }
  }, [])

  // Reset sessions functionality
  const handleResetSessions = async () => {
    setIsResetting(true)
    try {
      const response = await fetch('/api/stats/reset', {
        method: 'POST',
      })
      
      if (response.ok) {
        setTotalSessions(0)
        toast.success('Session count reset successfully!')
        setShowResetDialog(false)
      } else {
        toast.error('Failed to reset session count')
      }
    } catch (error) {
      console.error('Error resetting sessions:', error)
      toast.error('Failed to reset session count')
    } finally {
      setIsResetting(false)
    }
  }

  // Initialize timer on mount
  useEffect(() => {
    initialize(config)
    fetchTotalSessions()
  }, [initialize, config, fetchTotalSessions])

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
        toast.success('Timer paused')
      } else {
        start()
        toast.success('Timer started')
      }
    }),
    createHotkeyConfig('s', () => {
      skip()
      toast.success('Skipped to next phase')
    }),
    createHotkeyConfig('S', () => {
      skip()
      toast.success('Skipped to next phase')
    }),
    createHotkeyConfig('r', () => {
      reset()
      toast.success('Timer reset')
    }),
    createHotkeyConfig('R', () => {
      reset()
      toast.success('Timer reset')
    }),
    createHotkeyConfig('f', () => {
      setPhase('FOCUS')
      toast.success('Switched to Focus mode')
    }),
    createHotkeyConfig('F', () => {
      setPhase('FOCUS')
      toast.success('Switched to Focus mode')
    }),
    createHotkeyConfig('b', () => {
      setPhase('SHORT_BREAK')
      toast.success('Switched to Short Break')
    }),
    createHotkeyConfig('B', () => {
      setPhase('SHORT_BREAK')
      toast.success('Switched to Short Break')
    }),
    createHotkeyConfig('l', () => {
      setPhase('LONG_BREAK')
      toast.success('Switched to Long Break')
    }),
    createHotkeyConfig('L', () => {
      setPhase('LONG_BREAK')
      toast.success('Switched to Long Break')
    }),
  ])

  const phaseIcons = {
    FOCUS: Target,
    SHORT_BREAK: Coffee,
    LONG_BREAK: Clock,
  }

  const phaseColors = {
    FOCUS: 'from-blue-500 to-purple-500',
    SHORT_BREAK: 'from-green-500 to-emerald-500',
    LONG_BREAK: 'from-orange-500 to-red-500',
  }

  const phaseNames = {
    FOCUS: 'Focus Session',
    SHORT_BREAK: 'Short Break',
    LONG_BREAK: 'Long Break',
  }

  const PhaseIcon = phaseIcons[phase]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse" />
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center space-y-8"
        >
          {/* Main Timer Card */}
          <motion.div variants={cardVariants} className="w-full max-w-4xl">
            <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] shadow-2xl">
              <CardContent className="p-8">
                {/* Phase Header */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-center mb-8"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-center mb-4"
                  >
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${phaseColors[phase]} shadow-lg`}>
                      <PhaseIcon className="h-8 w-8 text-white" />
                    </div>
                  </motion.div>
                                     <div className="text-center mb-2">
                     <h2 className="text-2xl font-bold text-white mb-2">{phaseNames[phase]}</h2>
                     <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                       <DialogTrigger asChild>
                         <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/20 cursor-pointer transition-colors">
                           #{totalSessions}
                         </Badge>
                       </DialogTrigger>
                       <DialogContent className="bg-white/10 backdrop-blur-sm border-white/20">
                         <DialogHeader>
                           <DialogTitle className="text-white">Reset Session Count</DialogTitle>
                           <DialogDescription className="text-gray-300">
                             Are you sure you want to reset your session count and streak back to 0? This action cannot be undone.
                           </DialogDescription>
                         </DialogHeader>
                         <DialogFooter>
                           <Button
                             variant="outline"
                             onClick={() => setShowResetDialog(false)}
                             className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                           >
                             Cancel
                           </Button>
                           <Button
                             onClick={handleResetSessions}
                             disabled={isResetting}
                             className="bg-red-600 hover:bg-red-700 text-white"
                           >
                             {isResetting ? (
                               <>
                                 <ResetIcon className="mr-2 h-4 w-4 animate-spin" />
                                 Resetting...
                               </>
                             ) : (
                               'Reset Sessions'
                             )}
                           </Button>
                         </DialogFooter>
                       </DialogContent>
                     </Dialog>
                   </div>
                  
                </motion.div>

                {/* Timer Display */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mb-4"
                >
                  <TimerDisplay
                    remainingMs={remainingMs}
                    phase={phase}
                    isRunning={isRunning}
                    className="py-4"
                  />
                </motion.div>

                {/* Timer Controls */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mb-8"
                >
                  <TimerControls
                    isRunning={isRunning}
                    isPaused={isPaused}
                    onStart={start}
                    onPause={pause}
                    onReset={reset}
                    onSkip={skip}
                  />
                </motion.div>

                {/* Task Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex flex-col items-center mb-6 space-y-2"
                >
                                     <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                     <Button
                       variant="outline"
                       size="lg"
                       onClick={() => router.push('/tasks')}
                       className="bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all duration-300"
                     >
                       <CheckSquare className="mr-2 h-5 w-5" />
                       {currentTaskId ? 'Change Task' : 'Select Task'}
                     </Button>
                   </motion.div>
                  {currentTaskId && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-sm text-gray-300 bg-white/5 px-3 py-1 rounded-full"
                    >
                      Task selected ✓
                    </motion.div>
                  )}
                </motion.div>

                {/* Phase Switcher */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="flex justify-center space-x-3"
                >
                  {Object.entries(phaseIcons).map(([phaseKey, Icon]) => (
                    <motion.div
                      key={phaseKey}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={phase === phaseKey ? 'default' : 'outline'}
                        size="lg"
                        onClick={() => setPhase(phaseKey as keyof typeof phaseIcons)}
                        disabled={isRunning}
                        className={`transition-all duration-300 ${
                          phase === phaseKey
                            ? `bg-gradient-to-r ${phaseColors[phaseKey]} text-white shadow-lg`
                            : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="mr-2 h-5 w-5" />
                        {phaseNames[phaseKey as keyof typeof phaseNames]}
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Keyboard Shortcuts Card */}
          <motion.div variants={cardVariants} className="w-full max-w-2xl -mt-4">
            <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] shadow-xl">
              <CardHeader className="text-center pb-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center mb-3"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500">
                    <Keyboard className="h-6 w-6 text-white" />
                  </div>
                </motion.div>
                <CardTitle className="text-xl font-semibold text-white">Keyboard Shortcuts</CardTitle>
                <p className="text-gray-300 text-sm">Master your productivity</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'Space', action: 'Start/Pause', icon: isRunning ? Pause : Play },
                    { key: 'S', action: 'Skip', icon: SkipForward },
                    { key: 'R', action: 'Reset', icon: RotateCcw },
                    { key: 'F', action: 'Focus', icon: Target },
                    { key: 'B', action: 'Short Break', icon: Coffee },
                    { key: 'L', action: 'Long Break', icon: Clock },
                  ].map((shortcut, index) => (
                    <motion.div
                      key={shortcut.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-1.5 rounded-md bg-white/10">
                          <shortcut.icon className="h-4 w-4 text-gray-300" />
                        </div>
                        <span className="text-gray-300">{shortcut.action}</span>
                      </div>
                      <span className="font-mono text-sm font-bold text-purple-400 bg-white/10 px-2 py-1 rounded">
                        {shortcut.key}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}