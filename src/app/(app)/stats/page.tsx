'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Target, 
  Clock, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  Play, 
  Coffee, 
  Loader2,
  Zap,
  Award,
  Activity,
  RefreshCw,
  Flame,
  Timer,
  Users,
  Star,
  Trophy,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus,
  PieChart,
  BarChart,
  LineChart,
  CalendarDays,
  Clock3,
  Target as TargetIcon,
  Brain,
  Heart,
  Eye,
  BrainCircuit,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

interface StatsData {
  today: {
    focusSessions: number
    totalFocusTime: number
    tasksCompleted: number
  }
  week: {
    focusSessions: number
    totalFocusTime: number
  }
  allTime: {
    focusSessions: number
    totalFocusTime: number
    tasksCompleted: number
    avgSessionDuration: number
  }
  distribution: {
    focus: number
    shortBreaks: number
    longBreaks: number
  }
  weeklyProgress: Array<{
    day: string
    sessions: number
    focusTime: number
  }>
  recentActivity: Array<{
    type: string
    duration: number
    completedAt: string
    id: string
  }>
  streak: number
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
      ease: "easeOut"
    }
  }
}

const chartVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
}

export default function StatsPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    }
    
    try {
      const response = await fetch('/api/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated' && session) {
      fetchStats()
    } else if (status === 'unauthenticated') {
      setIsLoading(false)
    }
  }, [status, session, fetchStats])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m`
  }

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'FOCUS':
        return <Target className="h-4 w-4 text-blue-400" />
      case 'SHORT_BREAK':
        return <Coffee className="h-4 w-4 text-green-400" />
      case 'LONG_BREAK':
        return <Play className="h-4 w-4 text-purple-400" />
      default:
        return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'FOCUS':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'SHORT_BREAK':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'LONG_BREAK':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'FOCUS':
        return 'Focus Session'
      case 'SHORT_BREAK':
        return 'Short Break'
      case 'LONG_BREAK':
        return 'Long Break'
      default:
        return phase
    }
  }

  const getProductivityScore = () => {
    if (!stats) return 0
    const { streak, allTime } = stats
    
    // Calculate score based on streak, total sessions, and consistency
    const streakScore = Math.min(streak * 10, 50) // Max 50 points for streak
    const sessionScore = Math.min(allTime.focusSessions * 2, 30) // Max 30 points for sessions
    const consistencyScore = Math.min((allTime.avgSessionDuration / 1500) * 20, 20) // Max 20 points for consistency
    
    return Math.round(streakScore + sessionScore + consistencyScore)
  }

  const getProductivityLevel = (score: number) => {
    if (score >= 80) return { level: 'Elite', color: 'text-purple-400', icon: Trophy }
    if (score >= 60) return { level: 'Pro', color: 'text-blue-400', icon: Star }
    if (score >= 40) return { level: 'Intermediate', color: 'text-green-400', icon: TrendingUp }
    if (score >= 20) return { level: 'Beginner', color: 'text-yellow-400', icon: Target }
    return { level: 'Getting Started', color: 'text-gray-400', icon: Brain }
  }

  const getWeeklyTrend = () => {
    if (!stats || stats.weeklyProgress.length < 2) return { trend: 'neutral', icon: Minus, color: 'text-gray-400' }
    
    const recentDays = stats.weeklyProgress.slice(-3)
    const earlierDays = stats.weeklyProgress.slice(-6, -3)
    
    const recentAvg = recentDays.reduce((sum, day) => sum + day.focusTime, 0) / recentDays.length
    const earlierAvg = earlierDays.reduce((sum, day) => sum + day.focusTime, 0) / earlierDays.length
    
    if (recentAvg > earlierAvg * 1.1) return { trend: 'up', icon: ArrowUp, color: 'text-green-400' }
    if (recentAvg < earlierAvg * 0.9) return { trend: 'down', icon: ArrowDown, color: 'text-red-400' }
    return { trend: 'neutral', icon: Minus, color: 'text-gray-400' }
  }

  if (status === 'loading' || isLoading) {
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

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse" />
        <div className="relative z-10 container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="mb-6"
            >
              <div className="p-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 inline-block">
                <BarChart3 className="h-12 w-12 text-blue-400" />
              </div>
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Start your first focus session to see your productivity analytics and insights
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  const productivityScore = getProductivityScore()
  const productivityLevel = getProductivityLevel(productivityScore)
  const weeklyTrend = getWeeklyTrend()
  const ProductivityIcon = productivityLevel.icon
  const TrendIcon = weeklyTrend.icon

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
                Analytics
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-gray-300 text-lg"
              >
                Track your productivity and focus patterns
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button
                onClick={() => fetchStats(true)}
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

        {/* Key Metrics Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* Today's Focus Time */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Today's Focus</p>
                    <p className="text-2xl font-bold text-white">{formatTime(stats.today.totalFocusTime)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {stats.today.focusSessions} sessions completed
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Focus Time */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Total Focus Time</p>
                    <p className="text-2xl font-bold text-white">{formatTime(stats.allTime.totalFocusTime)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {stats.allTime.focusSessions} total sessions
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Current Streak */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Current Streak</p>
                    <p className="text-2xl font-bold text-white">{stats.streak}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      consecutive days
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500">
                    <Flame className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Productivity Score */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Productivity Score</p>
                    <p className="text-2xl font-bold text-white">{productivityScore}</p>
                    <p className={`text-xs mt-1 ${productivityLevel.color}`}>
                      {productivityLevel.level}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                    <ProductivityIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Detailed Analytics Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 mb-8 lg:grid-cols-3"
        >
          {/* Weekly Progress Chart */}
          <motion.div variants={chartVariants} className="lg:col-span-2">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Weekly Progress</CardTitle>
                    <CardDescription className="text-gray-400">
                      Your focus time over the last 7 days
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendIcon className={`h-4 w-4 ${weeklyTrend.color}`} />
                    <span className={`text-sm ${weeklyTrend.color}`}>
                      {weeklyTrend.trend === 'up' ? 'Trending up' : 
                       weeklyTrend.trend === 'down' ? 'Trending down' : 'Stable'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.weeklyProgress.map((day, index) => (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-300 w-12">{day.day}</span>
                        <div className="flex items-center space-x-2">
                          <TargetIcon className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-gray-400">{day.sessions} sessions</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-white/10 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((day.focusTime / 7200) * 100, 100)}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                          />
                        </div>
                        <span className="text-sm font-medium text-white w-16 text-right">
                          {formatTime(day.focusTime)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Session Distribution */}
          <motion.div variants={chartVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 h-full">
              <CardHeader>
                <CardTitle className="text-white">Session Distribution</CardTitle>
                <CardDescription className="text-gray-400">
                  Breakdown of your session types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-gray-300">Focus Sessions</span>
                    </div>
                    <span className="text-sm font-medium text-white">{stats.distribution.focus}%</span>
                  </div>
                  <Progress value={stats.distribution.focus} className="h-2 bg-white/10" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Coffee className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">Short Breaks</span>
                    </div>
                    <span className="text-sm font-medium text-white">{stats.distribution.shortBreaks}%</span>
                  </div>
                  <Progress value={stats.distribution.shortBreaks} className="h-2 bg-white/10" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Play className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-gray-300">Long Breaks</span>
                    </div>
                    <span className="text-sm font-medium text-white">{stats.distribution.longBreaks}%</span>
                  </div>
                  <Progress value={stats.distribution.longBreaks} className="h-2 bg-white/10" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Additional Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* Average Session Duration */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Avg Session</p>
                    <p className="text-2xl font-bold text-white">{formatDuration(stats.allTime.avgSessionDuration)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      per session
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500">
                    <Timer className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tasks Completed */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Tasks Completed</p>
                    <p className="text-2xl font-bold text-white">{stats.allTime.tasksCompleted}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      all time
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* This Week's Focus */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">This Week</p>
                    <p className="text-2xl font-bold text-white">{formatTime(stats.week.totalFocusTime)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {stats.week.focusSessions} sessions
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500">
                    <CalendarDays className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Tasks */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Today's Tasks</p>
                    <p className="text-2xl font-bold text-white">{stats.today.tasksCompleted}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      completed today
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div variants={cardVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription className="text-gray-400">
                  Your latest focus sessions and breaks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AnimatePresence>
                    {stats.recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300"
                      >
                        <div className="flex items-center space-x-3">
                          {getPhaseIcon(activity.type)}
                          <div>
                            <p className="text-sm font-medium text-white">
                              {getPhaseLabel(activity.type)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(activity.completedAt).toLocaleDateString()} at{' '}
                              {new Date(activity.completedAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={`${getPhaseColor(activity.type)} border`}>
                            {formatDuration(activity.duration)}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {stats.recentActivity.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No recent activity</p>
                      <p className="text-sm text-gray-500">Start a focus session to see your activity here</p>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Productivity Insights */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border-blue-500/20">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                    <BrainCircuit className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Productivity Insights</CardTitle>
                    <CardDescription className="text-gray-300">
                      AI-powered recommendations to boost your focus
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-white">Consistency</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {stats.streak > 0 ? `Great job! You've maintained a ${stats.streak}-day streak. Keep it up!` : 'Start building your focus habit today.'}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-white">Session Length</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {stats.allTime.avgSessionDuration > 1200 ? 'Your sessions are well-balanced. Perfect!' : 'Try extending your focus sessions gradually.'}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <Heart className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-medium text-white">Well-being</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {stats.distribution.shortBreaks + stats.distribution.longBreaks > 20 ? 'Good balance of work and breaks!' : 'Remember to take regular breaks for better focus.'}
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
