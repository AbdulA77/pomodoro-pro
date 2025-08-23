'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Check, Play, Target, Coffee, Clock, CheckSquare, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  content: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

interface OnboardingProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const OnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Flowdoro!',
    description: 'Your high-precision focus timer for developers',
    icon: Play,
    content: (
      <div className="space-y-4">
        <p className="text-gray-300">
          Flowdoro is designed to help you maintain deep focus with precise timing, 
          task management, and productivity insights.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-white/5">
            <Target className="h-6 w-6 mx-auto mb-2 text-blue-400" />
            <p className="text-sm font-medium text-white">Focus Sessions</p>
            <p className="text-xs text-gray-400">25-minute deep work</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/5">
            <Coffee className="h-6 w-6 mx-auto mb-2 text-green-400" />
            <p className="text-sm font-medium text-white">Smart Breaks</p>
            <p className="text-xs text-gray-400">Rest and recharge</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/5">
            <CheckSquare className="h-6 w-6 mx-auto mb-2 text-purple-400" />
            <p className="text-sm font-medium text-white">Task Management</p>
            <p className="text-xs text-gray-400">Track your progress</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'timer-basics',
    title: 'Timer Basics',
    description: 'Learn the core timer functionality',
    icon: Clock,
    content: (
      <div className="space-y-4">
        <p className="text-gray-300">
          The timer is the heart of Flowdoro. Here's how to use it effectively:
        </p>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
            <Play className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-white">Start/Pause</p>
              <p className="text-xs text-gray-400">Press Space or click the play button</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
            <Zap className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-white">Skip Session</p>
              <p className="text-xs text-gray-400">Press 'S' or click skip to move to next phase</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
            <Target className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-white">Phase Switching</p>
              <p className="text-xs text-gray-400">Use F, B, L keys or click phase buttons</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Master keyboard-first workflow',
    icon: Zap,
    content: (
      <div className="space-y-4">
        <p className="text-gray-300">
          Flowdoro is designed for keyboard-first productivity. Here are the essential shortcuts:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: 'Space', action: 'Start/Pause Timer', icon: Play },
            { key: 'S', action: 'Skip Session', icon: Zap },
            { key: 'R', action: 'Reset Timer', icon: Clock },
            { key: 'F', action: 'Focus Mode', icon: Target },
            { key: 'B', action: 'Short Break', icon: Coffee },
            { key: 'L', action: 'Long Break', icon: Clock },
          ].map((shortcut) => (
            <div key={shortcut.key} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
              <shortcut.icon className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{shortcut.action}</p>
              </div>
              <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-gray-300">
                {shortcut.key}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'task-management',
    title: 'Task Management',
    description: 'Organize your work with tasks',
    icon: CheckSquare,
    content: (
      <div className="space-y-4">
        <p className="text-gray-300">
          Link your focus sessions to specific tasks for better productivity tracking:
        </p>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-sm font-medium text-white mb-2">Select Tasks</p>
            <p className="text-xs text-gray-400">
              Choose a task before starting your focus session to track progress and maintain context.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-sm font-medium text-white mb-2">Track Progress</p>
            <p className="text-xs text-gray-400">
              Monitor completed pomodoros and estimated vs actual time for each task.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-sm font-medium text-white mb-2">Analytics</p>
            <p className="text-xs text-gray-400">
              View detailed analytics on your dashboard to understand your productivity patterns.
            </p>
          </div>
        </div>
      </div>
    ),
    action: {
      label: 'Go to Tasks',
      onClick: () => {
        // This will be handled by the parent component
        toast.success('Navigate to tasks page to get started!')
      }
    }
  },
  {
    id: 'completion',
    title: "You're All Set!",
    description: 'Ready to boost your productivity',
    icon: Check,
    content: (
      <div className="space-y-4 text-center">
        <div className="p-4 rounded-full bg-green-500/20 border border-green-500/30 mx-auto w-16 h-16 flex items-center justify-center">
          <Check className="h-8 w-8 text-green-400" />
        </div>
        <div>
          <p className="text-gray-300 mb-4">
            You now have all the tools you need to maximize your focus and productivity. 
            Remember to take breaks and stay hydrated!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-sm font-medium text-white">Pro Tips</p>
              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                <li>• Start with 25-minute sessions</li>
                <li>• Take regular breaks</li>
                <li>• Track your tasks</li>
                <li>• Review your analytics</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-sm font-medium text-white">Keyboard First</p>
              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                <li>• Space to start/pause</li>
                <li>• S to skip</li>
                <li>• F/B/L for phases</li>
                <li>• R to reset</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }
]

export const Onboarding: React.FC<OnboardingProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const currentStepData = OnboardingSteps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === OnboardingSteps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  const handleComplete = () => {
    // Mark all steps as completed
    const allSteps = new Set(OnboardingSteps.map(step => step.id))
    setCompletedSteps(allSteps)
    onComplete()
  }

  const handleAction = () => {
    if (currentStepData.action) {
      currentStepData.action.onClick()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-white/10">
                  <currentStepData.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">{currentStepData.title}</CardTitle>
                  <CardDescription className="text-gray-300">{currentStepData.description}</CardDescription>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center space-x-2 mt-4">
                {OnboardingSteps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                      index <= currentStep 
                        ? 'bg-blue-500' 
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStepData.content}
              </motion.div>

              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isFirstStep}
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="flex items-center space-x-2">
                  {currentStepData.action && (
                    <Button
                      variant="outline"
                      onClick={handleAction}
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                    >
                      {currentStepData.action.label}
                    </Button>
                  )}
                  
                  <Button
                    onClick={isLastStep ? handleComplete : handleNext}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLastStep ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Get Started
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
