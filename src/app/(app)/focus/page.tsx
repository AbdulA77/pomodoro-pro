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
import { Target, Coffee, Clock, CheckSquare, Zap, Play, Pause, RotateCcw, SkipForward, Keyboard, Sparkles, RotateCcw as ResetIcon, Plus } from 'lucide-react'
import { TaskSelector } from '@/components/tasks/TaskSelector'
import { NotificationStatus } from '@/components/ui/notification-status'
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
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { AccessibilitySettings } from '@/components/ui/accessibility-settings'
import { Onboarding } from '@/components/ui/onboarding'

export default function FocusPage() {
  const router = useRouter()
  const { handleError, handleAsyncError } = useErrorHandler()
  const [totalSessions, setTotalSessions] = useState(0)
  const [isResetting, setIsResetting] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [isRecovering, setIsRecovering] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  
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
    recoverState,
    setCurrentTask,
  } = useTimerStore()

  const { playBell } = useSound({
    volume: 70,
    enabled: true,
  })

  const { sendTimerCompleteNotification } = useNotifications()

  // Fetch total sessions count
  const fetchTotalSessions = useCallback(async () => {
    const result = await handleAsyncError(async () => {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        return data.allTime?.focusSessions || 0
      } else if (response.status === 401) {
        // User not authenticated, set to 0
        return 0
      } else {
        throw new Error(`Failed to fetch stats: ${response.status}`)
      }
    }, 'fetchTotalSessions', { showToast: false })

    setTotalSessions(result || 0)
  }, [handleAsyncError])

  // Reset sessions functionality
  const handleResetSessions = async () => {
    setIsResetting(true)
    
    const result = await handleAsyncError(async () => {
      const response = await fetch('/api/stats/reset', {
        method: 'POST',
      })
      
      if (response.ok) {
        setTotalSessions(0)
        toast.success('Session count reset successfully!')
        setShowResetDialog(false)
        return true
      } else {
        throw new Error(`Failed to reset session count: ${response.status}`)
      }
    }, 'handleResetSessions')

    if (result) {
      // Success - already handled above
    }
    
    setIsResetting(false)
  }

  // Initialize timer on mount
  useEffect(() => {
    initialize(config)
    fetchTotalSessions()
    
    // Check if user needs onboarding
    const hasSeenOnboarding = localStorage.getItem('onboarding-completed')
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
    
    // Attempt to recover timer state after a short delay
    const recoveryTimeout = setTimeout(() => {
      setIsRecovering(true)
      recoverState()
      // Clear recovery indicator after a short delay
      setTimeout(() => setIsRecovering(false), 2000)
    }, 500)
    
    return () => clearTimeout(recoveryTimeout)
  }, [initialize, config, fetchTotalSessions, recoverState])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    localStorage.setItem('onboarding-completed', 'true')
    toast.success('Welcome to Flowdoro! You\'re all set to boost your productivity.')
  }

  // Handle timer completion
  useEffect(() => {
    if (remainingMs === 0 && isRunning) {
      playBell()
      sendTimerCompleteNotification(phase)
      toast.success(`${phase.replace('_', ' ')} session complete!`)
      
      // Refresh session count after completion
      setTimeout(() => {
        fetchTotalSessions()
        // Dispatch custom event to notify other components that data has changed
        window.dispatchEvent(new CustomEvent('sessionCompleted'))
      }, 1000) // Small delay to ensure session is saved
    }
  }, [remainingMs, isRunning, phase, playBell, sendTimerCompleteNotification, fetchTotalSessions])

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
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse" />
      
             {/* Floating particles */}
       <div className="absolute inset-0">
         {[...Array(25)].map((_, i) => {
           // Use a consistent seed based on index to prevent hydration mismatch
           const seed = i * 137.5 // Use golden angle approximation for better distribution
           const left = ((seed * 100) % 100).toFixed(2)
           const top = (((seed * 61.8) % 100) + 50) % 100 // Offset to avoid edges
           const duration = 10 + (seed % 10)
           const delay = (seed % 5)
           
           return (
             <motion.div
               key={i}
               className="absolute w-1 h-1 bg-white/20 rounded-full"
               animate={{
                 x: [0, 100, 0],
                 y: [0, -100, 0],
                 opacity: [0, 1, 0],
               }}
               transition={{
                 duration,
                 repeat: Infinity,
                 ease: "linear",
                 delay,
               }}
               style={{
                 left: `${left}%`,
                 top: `${top}%`,
               }}
             />
           )
         })}
       </div>

             <div className="relative z-10 container mx-auto px-4 py-4 sm:py-8">
         {/* Header */}

         <motion.div
           variants={containerVariants}
           initial="hidden"
           animate="visible"
           className="flex flex-col items-center justify-center space-y-4 sm:space-y-8"
         >
           {/* Main Timer Card */}
           <motion.div variants={cardVariants} className="w-full max-w-4xl">
             <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] shadow-2xl">
               <CardContent className="p-4 sm:p-6 lg:p-8">
                                 {/* Phase Header */}
                 <motion.div
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.6, delay: 0.3 }}
                   className="text-center mb-4 sm:mb-8"
                 >
                   <motion.div
                     whileHover={{ scale: 1.1, rotate: 5 }}
                     transition={{ duration: 0.3 }}
                     className="flex justify-center mb-3 sm:mb-4"
                   >
                     <div className={`p-3 sm:p-4 rounded-2xl bg-gradient-to-r ${phaseColors[phase]} shadow-lg`}>
                       <PhaseIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                     </div>
                   </motion.div>
                                      <div className="text-center mb-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{phaseNames[phase]}</h2>
                     <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                       <DialogTrigger asChild>
                         <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/20 cursor-pointer transition-colors">
                           #{totalSessions}
                         </Badge>
                       </DialogTrigger>
                                               <DialogContent className="bg-white/10 backdrop-blur-sm border-white/20" aria-describedby="reset-dialog-description">
                          <DialogHeader>
                            <DialogTitle className="text-white">Reset Session Count</DialogTitle>
                                                         <DialogDescription id="reset-dialog-description" className="text-gray-300">
                               This will reset your current session counter to 0, but keep your task completion data and overall analytics intact. Perfect for when you get distracted and want to start fresh with your focus sessions.
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
                    className="mb-3 sm:mb-4"
                  >
                    <TimerDisplay
                      remainingMs={remainingMs}
                      phase={phase}
                      isRunning={isRunning}
                      className="py-2 sm:py-4"
                    />
                    
                    {/* Recovery Indicator */}
                    {isRecovering && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="mt-2 text-center"
                      >
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2" />
                          Recovering timer state...
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                 {/* Timer Controls */}
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.6, delay: 0.5 }}
                   className="mb-4 sm:mb-8"
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
                    className="flex flex-col items-center mb-4 sm:mb-6 space-y-2"
                  >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <TaskSelector
                        currentTaskId={currentTaskId}
                        onTaskSelect={setCurrentTask}
                        className="w-full max-w-md"
                      />
                    </motion.div>
                    
                    {/* Quick Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/tasks')}
                        className="bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all duration-300 text-xs"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        New Task
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/tasks')}
                        className="bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all duration-300 text-xs"
                      >
                        <CheckSquare className="mr-1 h-3 w-3" />
                        Manage Tasks
                      </Button>
                      <NotificationStatus showDetails={true} />
                      <AccessibilitySettings showDetails={true} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowOnboarding(true)}
                        className="bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all duration-300 text-xs"
                      >
                        <Sparkles className="mr-1 h-3 w-3" />
                        Help
                      </Button>
                    </div>
                  </motion.div>

                                 {/* Phase Switcher */}
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.6, delay: 0.7 }}
                   className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3"
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
                         className={`transition-all duration-300 text-sm sm:text-base ${
                           phase === phaseKey
                             ? `bg-gradient-to-r ${phaseColors[phaseKey]} text-white shadow-lg`
                             : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                         }`}
                       >
                         <Icon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                         {phaseNames[phaseKey as keyof typeof phaseNames]}
                       </Button>
                     </motion.div>
                   ))}
                 </motion.div>
              </CardContent>
            </Card>
          </motion.div>

                     {/* Keyboard Shortcuts Card */}
           <motion.div variants={cardVariants} className="w-full max-w-2xl -mt-2 sm:-mt-4">
             <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] shadow-xl">
               <CardHeader className="text-center pb-3 sm:pb-4">
                 <motion.div
                   whileHover={{ scale: 1.1, rotate: 5 }}
                   transition={{ duration: 0.3 }}
                   className="flex justify-center mb-2 sm:mb-3"
                 >
                   <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500">
                     <Keyboard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                   </div>
                 </motion.div>
                 <CardTitle className="text-lg sm:text-xl font-semibold text-white">Keyboard Shortcuts</CardTitle>
                 <p className="text-gray-300 text-xs sm:text-sm">Master your productivity</p>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
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
                       className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300"
                     >
                       <div className="flex items-center space-x-2 sm:space-x-3">
                         <div className="p-1 sm:p-1.5 rounded-md bg-white/10">
                           <shortcut.icon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-300" />
                         </div>
                         <span className="text-gray-300 text-xs sm:text-sm">{shortcut.action}</span>
                       </div>
                       <span className="font-mono text-xs sm:text-sm font-bold text-purple-400 bg-white/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
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
    
    {/* Onboarding Modal */}
    <Onboarding
      isOpen={showOnboarding}
      onClose={() => setShowOnboarding(false)}
      onComplete={handleOnboardingComplete}
    />
    </ErrorBoundary>
  )
}