'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, Coffee, Clock, BarChart3, CheckSquare, Settings, Loader2, Zap, TrendingUp, Calendar, Star, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

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
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BACKLOG'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  estimatePomodoros: number
  completedPomodoros: number
  dueAt?: string
  project?: {
    id: string
    name: string
    color: string
  }
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
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    }
    
    try {
      // Fetch stats and tasks in parallel
      const [statsResponse, tasksResponse] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/tasks')
      ])

      // Handle stats
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      } else if (statsResponse.status === 401) {
        console.log('User not authenticated, showing default stats')
      } else {
        console.error('Failed to fetch stats:', statsResponse.status)
      }

      // Handle tasks
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        
        // Filter for today's tasks (due today, in progress, or high/critical priority)
        const today = new Date()
        const todayString = today.toISOString().split('T')[0]
        
        const filteredTasks = tasksData.filter((task: Task) => {
          // Include tasks that are:
          // 1. Due today
          // 2. Currently in progress
          // 3. High or critical priority and not done
          // 4. Recently created TODO tasks (last 3 days)
          const isDueToday = task.dueAt && task.dueAt.startsWith(todayString)
          const isInProgress = task.status === 'IN_PROGRESS'
          const isHighPriority = (task.priority === 'HIGH' || task.priority === 'CRITICAL') && task.status !== 'DONE'
          
          return isDueToday || isInProgress || isHighPriority
        }).slice(0, 5) // Limit to 5 tasks
        
        setTodaysTasks(filteredTasks)
      } else if (tasksResponse.status !== 401) {
        console.error('Failed to fetch tasks:', tasksResponse.status)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const handleRefresh = () => {
    fetchData(true)
  }

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/account/signin')
      return
    }

    fetchData()
  }, [status, router, fetchData])

  // Refresh data when page becomes visible (e.g., when returning from focus page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && status === 'authenticated') {
        fetchData(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [fetchData, status])

  // Show loading state while session is loading
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse" />
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-8 w-8 text-white" />
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500'
      case 'HIGH': return 'bg-orange-500'
      case 'MEDIUM': return 'bg-yellow-500'
      case 'LOW': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE': return '✓'
      case 'IN_PROGRESS': return '⏱'
      case 'TODO': return '○'
      case 'BACKLOG': return '⋯'
      default: return '○'
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2"
              >
                Flowdoro
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-gray-300 text-lg"
              >
                Welcome back! Here&apos;s Your Productivity Overview.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all duration-300"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-3 auto-rows-fr"
        >
          {/* Quick Start */}
          <motion.div variants={cardVariants} className="md:col-span-1 md:row-span-1">
            <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] h-full shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4"
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 w-fit">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-blue-300 transition-colors">
                    Quick Start
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Start a new Pomodoro session
                  </p>
                  <div className="mt-auto">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => {
                          setIsTransitioning(true)
                          setTimeout(() => {
                            router.push('/focus')
                          }, 300)
                        }}
                        disabled={isTransitioning}
                      >
                        {isTransitioning ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Starting Session...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4" />
                            <span>Start Focus Session</span>
                          </div>
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
            <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] h-full shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4"
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 w-fit">
                      <BarChart3 className="h-8 w-8 text-white" />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-green-300 transition-colors">
                    Today&apos;s Progress
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Your focus sessions today
                  </p>
                  <div className="space-y-4 flex-1">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                      <span className="text-gray-300">Focus Sessions</span>
                      <span className="font-bold text-white text-lg">{loading ? '...' : stats.today.focusSessions}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                      <span className="text-gray-300">Total Focus Time</span>
                      <span className="font-bold text-white text-lg">{loading ? '...' : formatTime(stats.today.totalFocusTime)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                      <span className="text-gray-300">Tasks Completed</span>
                      <span className="font-bold text-white text-lg">{loading ? '...' : stats.today.tasksCompleted}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Current Streak */}
          <motion.div variants={cardVariants} className="md:col-span-1 md:row-span-1">
            <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] h-full shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4"
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 w-fit">
                      <Coffee className="h-8 w-8 text-white" />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-orange-300 transition-colors">
                    Current Streak
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Days of consistent focus
                  </p>
                  <div className="text-center flex-1 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                        {loading ? '...' : stats.streak}
                      </div>
                      <div className="text-gray-300 text-sm">days</div>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

           {/* Quick Actions */}
           <motion.div variants={cardVariants} className="md:col-span-1 md:row-span-1">
            <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] h-full shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4"
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 w-fit">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-purple-300 transition-colors">
                    Quick Actions
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Common tasks and shortcuts
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
            <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] h-full shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4"
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 w-fit">
                      <CheckSquare className="h-8 w-8 text-white" />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-green-300 transition-colors">
                    Today&apos;s Tasks
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Priority tasks for today
                  </p>
                  <div className="flex-1">
                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="animate-pulse"
                          >
                            <div className="h-4 bg-white/10 rounded w-3/4"></div>
                          </motion.div>
                        ))}
                      </div>
                    ) : todaysTasks.length > 0 ? (
                      <div className="space-y-3">
                        {todaysTasks.map((task: Task, index: number) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start space-x-3 group/task p-3 rounded-lg hover:bg-white/5 transition-all duration-300"
                          >
                            <div className={`h-3 w-3 rounded-full mt-2 ${getPriorityColor(task.priority)}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs font-medium text-gray-300">
                                  {getStatusIcon(task.status)}
                                </span>
                                <div className="text-sm font-medium truncate text-white" title={task.title}>
                                  {task.title}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-400">
                                {task.project && (
                                  <span className="inline-flex items-center">
                                    <div 
                                      className="w-2 h-2 rounded-full mr-1" 
                                      style={{ backgroundColor: task.project.color }}
                                    />
                                    {task.project.name}
                                  </span>
                                )}
                                <span>{task.completedPomodoros}/{task.estimatePomodoros} 🍅</span>
                                {task.dueAt && (
                                  <span className="text-orange-400">Due today</span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                      >
                        <div className="text-4xl mb-2">🎉</div>
                        <div className="text-sm text-gray-300">
                          No priority tasks for today. You&apos;re all caught up!
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link href="/tasks">
                        <Button variant="outline" size="sm" className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10">
                          View All Tasks
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pro Tip */}
          <motion.div variants={cardVariants} className="md:col-span-1 md:row-span-1">
            <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] h-full shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4"
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 w-fit">
                      <Clock className="h-8 w-8 text-white" />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-purple-300 transition-colors">
                    Pro Tip
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Boost your productivity
                  </p>
                  <div className="flex-1">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                        <span className="font-mono text-purple-400 font-bold">Space</span>
                        <span className="text-gray-300">- Start/Pause</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                        <span className="font-mono text-purple-400 font-bold">S</span>
                        <span className="text-gray-300">- Skip</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                        <span className="font-mono text-purple-400 font-bold">R</span>
                        <span className="text-gray-300">- Reset</span>
                      </div>
                    </div>
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