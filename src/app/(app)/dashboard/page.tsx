'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, Coffee, Clock, BarChart3, CheckSquare, Settings, Loader2, Zap, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'

interface Stats {
  today: {
    focusSessions: number
    totalFocusTime: number
    tasksCompleted: number
  }
  streak: number
  recentActivity: Array<{
    type: string
    duration: number
    completedAt: string
  }>
}

interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<Stats>({
    today: {
      focusSessions: 0,
      totalFocusTime: 0,
      tasksCompleted: 0
    },
    streak: 0,
    recentActivity: []
  })
  const [todaysTasks, setTodaysTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/account/signin')
      return
    }

    const fetchData = async () => {
      try {
        // Fetch stats and tasks in parallel
        const [statsResponse, tasksResponse] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/tasks')
        ])

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        } else if (statsResponse.status === 401) {
          console.log('User not authenticated, showing default stats')
        } else {
          console.error('Failed to fetch stats:', statsResponse.status)
        }

        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json()
          // Filter for today's tasks
          const today = new Date()
          const todayTasks = tasksData.filter((task: Task) => {
            const taskDate = new Date(task.createdAt)
            return taskDate.toDateString() === today.toDateString()
          })
          setTodaysTasks(todayTasks)
        } else if (tasksResponse.status === 401) {
          console.log('User not authenticated, showing default tasks')
        } else {
          console.error('Failed to fetch tasks:', tasksResponse.status)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [status, router])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} day${days > 1 ? 's' : ''} ago`
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

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
        {[...Array(20)].map((_, i) => (
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-300 text-lg">
            Here's your productivity overview for today.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-3 auto-rows-fr"
        >
          {/* Quick Start */}
          <motion.div variants={cardVariants} className="md:col-span-1 md:row-span-1">
            <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] shadow-2xl h-full">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <motion.div 
                    className="mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg w-fit">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-blue-300 transition-colors">
                    Quick Start
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Start a new Pomodoro session and boost your productivity
                  </p>
                  <div className="mt-auto">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="outline" 
                        className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all duration-300"
                        onClick={() => {
                          setIsTransitioning(true)
                          setTimeout(() => {
                            router.push('/focus')
                          }, 300)
                        }}
                        disabled={isTransitioning}
                      >
                        {isTransitioning ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Starting Session...
                          </>
                        ) : (
                          'Start Focus Session'
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Progress */}
          <motion.div variants={cardVariants} className="md:col-span-1 md:row-span-1">
            <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] shadow-2xl h-full">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <motion.div 
                    className="mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg w-fit">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-green-300 transition-colors">
                    Today's Progress
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Your focus sessions and achievements today
                  </p>
                  <div className="space-y-3 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Focus Sessions</span>
                      <span className="font-semibold text-white">{loading ? '...' : stats.today.focusSessions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Focus Time</span>
                      <span className="font-semibold text-white">{loading ? '...' : formatTime(stats.today.totalFocusTime)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Tasks Completed</span>
                      <span className="font-semibold text-white">{loading ? '...' : stats.today.tasksCompleted}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Current Streak */}
          <motion.div variants={cardVariants} className="md:col-span-1 md:row-span-1">
            <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] shadow-2xl h-full">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <motion.div 
                    className="mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 shadow-lg w-fit">
                      <Coffee className="h-6 w-6 text-white" />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-orange-300 transition-colors">
                    Current Streak
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Days of consistent focus and productivity
                  </p>
                  <div className="text-center flex-1 flex items-center justify-center">
                    <div>
                      <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                        {loading ? '...' : stats.streak}
                      </div>
                      <div className="text-sm text-gray-300">days</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={cardVariants} className="md:col-span-1 md:row-span-1">
            <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] shadow-2xl h-full">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <motion.div 
                    className="mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg w-fit">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-purple-300 transition-colors">
                    Quick Actions
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Common tasks and shortcuts for quick access
                  </p>
                  <div className="space-y-3 flex-1">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" asChild className="w-full justify-start bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all duration-300">
                        <Link href="/tasks">
                          <CheckSquare className="mr-2 h-4 w-4" />
                          View Tasks
                        </Link>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" asChild className="w-full justify-start bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all duration-300">
                        <Link href="/stats">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          View Analytics
                        </Link>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" asChild className="w-full justify-start bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all duration-300">
                        <Link href="/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Tasks */}
          <motion.div variants={cardVariants} className="md:col-span-1 md:row-span-1">
            <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] shadow-2xl h-full">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <motion.div 
                    className="mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 shadow-lg w-fit">
                      <CheckSquare className="h-6 w-6 text-white" />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-indigo-300 transition-colors">
                    Today's Tasks
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Your tasks for today
                  </p>
                  <div className="flex-1">
                    {loading ? (
                      <div className="space-y-3">
                        <div className="animate-pulse">
                          <div className="h-4 bg-white/10 rounded w-3/4"></div>
                        </div>
                        <div className="animate-pulse">
                          <div className="h-4 bg-white/10 rounded w-1/2"></div>
                        </div>
                        <div className="animate-pulse">
                          <div className="h-4 bg-white/10 rounded w-2/3"></div>
                        </div>
                      </div>
                    ) : todaysTasks.length > 0 ? (
                      <div className="space-y-3">
                        {todaysTasks.slice(0, 5).map((task, index) => (
                          <motion.div 
                            key={task.id} 
                            className="flex items-center space-x-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className={`h-2 w-2 rounded-full ${
                              task.completed ? 'bg-green-500' : 'bg-blue-500'
                            }`} />
                            <div className="flex-1">
                              <div className={`text-sm font-medium ${
                                task.completed ? 'text-gray-400 line-through' : 'text-white'
                              }`}>
                                {task.title}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-sm text-gray-300">
                          No tasks for today. Create your first task!
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pro Tip */}
          <motion.div variants={cardVariants} className="md:col-span-1 md:row-span-1">
            <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] shadow-2xl h-full">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <motion.div 
                    className="mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg w-fit">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-yellow-300 transition-colors">
                    Pro Tip
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Boost your productivity with these shortcuts
                  </p>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Use keyboard shortcuts to control your timer:
                      <br />
                      <span className="font-mono text-blue-300">Space</span> - Start/Pause
                      <br />
                      <span className="font-mono text-blue-300">S</span> - Skip
                      <br />
                      <span className="font-mono text-blue-300">R</span> - Reset
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
