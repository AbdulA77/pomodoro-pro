'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Activity
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

export default function StatsPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated' && session) {
      fetchStats()
    } else if (status === 'unauthenticated') {
      setIsLoading(false)
    }
  }, [status, session])

  const fetchStats = async () => {
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
    }
  }

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
        return <Target className="h-4 w-4 text-blue-500" />
      case 'SHORT_BREAK':
        return <Coffee className="h-4 w-4 text-green-500" />
      case 'LONG_BREAK':
        return <Play className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'FOCUS':
        return 'bg-blue-500'
      case 'SHORT_BREAK':
        return 'bg-green-500'
      case 'LONG_BREAK':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
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

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No data available</h3>
          <p className="text-muted-foreground">
            Start your first focus session to see your analytics
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track your productivity and focus patterns
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Today's Focus Time */}
        <Card className="group relative overflow-hidden rounded-xl border bg-background hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Focus</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.today.totalFocusTime)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.today.focusSessions} sessions completed
            </p>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Card>

        {/* Total Focus Time */}
        <Card className="group relative overflow-hidden rounded-xl border bg-background hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.allTime.totalFocusTime)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.allTime.focusSessions} total sessions
            </p>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Card>

        {/* Current Streak */}
        <Card className="group relative overflow-hidden rounded-xl border bg-background hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streak} days</div>
            <p className="text-xs text-muted-foreground">
              Keep it going! 🔥
            </p>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Card>

        {/* Average Session */}
        <Card className="group relative overflow-hidden rounded-xl border bg-background hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.allTime.avgSessionDuration)}</div>
            <p className="text-xs text-muted-foreground">
              Target: 25m
            </p>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Card>
      </div>

      {/* Weekly Progress and Distribution */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Weekly Overview */}
        <Card className="group relative overflow-hidden rounded-xl border bg-background hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>
              Your focus sessions this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.weeklyProgress.map((day) => (
                <div key={day.day} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{day.day}</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-20 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-primary rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${day.sessions > 0 ? Math.min(100, (day.sessions / 8) * 100) : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {day.sessions} sessions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Card>

        {/* Session Distribution */}
        <Card className="group relative overflow-hidden rounded-xl border bg-background hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle>Session Distribution</CardTitle>
            <CardDescription>
              How you spend your focus time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-blue-500 rounded-full" />
                  <span className="text-sm">Focus Sessions</span>
                </div>
                <span className="text-sm font-medium">{stats.distribution.focus}%</span>
              </div>
              <Progress value={stats.distribution.focus} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Short Breaks</span>
                </div>
                <span className="text-sm font-medium">{stats.distribution.shortBreaks}%</span>
              </div>
              <Progress value={stats.distribution.shortBreaks} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-purple-500 rounded-full" />
                  <span className="text-sm">Long Breaks</span>
                </div>
                <span className="text-sm font-medium">{stats.distribution.longBreaks}%</span>
              </div>
              <Progress value={stats.distribution.longBreaks} className="h-2" />
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {/* This Week */}
        <Card className="group relative overflow-hidden rounded-xl border bg-background hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Focus Time</span>
                <span className="text-sm font-medium">{formatTime(stats.week.totalFocusTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Sessions</span>
                <span className="text-sm font-medium">{stats.week.focusSessions}</span>
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Card>

        {/* All Time */}
        <Card className="group relative overflow-hidden rounded-xl border bg-background hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">All Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tasks Completed</span>
                <span className="text-sm font-medium">{stats.allTime.tasksCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Sessions</span>
                <span className="text-sm font-medium">{stats.allTime.focusSessions}</span>
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Card>

        {/* Today's Tasks */}
        <Card className="group relative overflow-hidden rounded-xl border bg-background hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="text-sm font-medium">{stats.today.tasksCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Focus Sessions</span>
                <span className="text-sm font-medium">{stats.today.focusSessions}</span>
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="group relative overflow-hidden rounded-xl border bg-background hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>
            Your latest focus sessions and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                  <div className={`h-2 w-2 rounded-full ${getPhaseColor(activity.type)}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {getPhaseLabel(activity.type)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(activity.completedAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {formatDuration(activity.duration || 0)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          )}
        </CardContent>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>
    </div>
  )
}
