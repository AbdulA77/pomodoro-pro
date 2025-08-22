'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, Coffee, Clock, BarChart3, CheckSquare, Settings, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    today: {
      focusSessions: 0,
      totalFocusTime: 0,
      tasksCompleted: 0
    },
    streak: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else if (response.status === 401) {
          // User not authenticated, this is expected for new users
          console.log('User not authenticated, showing default stats')
        } else {
          console.error('Failed to fetch stats:', response.status)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

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
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Flowdoro</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s Your Productivity Overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 auto-rows-fr">
        {/* Quick Start */}
        <div className="md:col-span-1 md:row-span-1">
          <Card className="group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                Quick Start
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Start a new Pomodoro session
              </p>
              <div className="mt-auto">
                <Button 
                  variant="outline" 
                  className="w-full transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer"
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
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>
        </div>

        {/* Today's Progress */}
        <div className="md:col-span-1 md:row-span-1">
          <Card className="group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                Today&apos;s Progress
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Your focus sessions today
              </p>
              <div className="space-y-2 flex-1">
                <div className="flex justify-between">
                  <span className="text-sm">Focus Sessions</span>
                  <span className="font-semibold">{loading ? '...' : stats.today.focusSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Focus Time</span>
                  <span className="font-semibold">{loading ? '...' : formatTime(stats.today.totalFocusTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tasks Completed</span>
                  <span className="font-semibold">{loading ? '...' : stats.today.tasksCompleted}</span>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>
        </div>

        {/* Current Streak */}
        <div className="md:col-span-1 md:row-span-1">
          <Card className="group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <Coffee className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                Current Streak
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Days of consistent focus
              </p>
              <div className="text-center flex-1 flex items-center justify-center">
                <div>
                  <div className="text-3xl font-bold text-primary">{loading ? '...' : stats.streak}</div>
                  <div className="text-sm text-muted-foreground">days</div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="md:col-span-1 md:row-span-1">
          <Card className="group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full">
            <div className="flex flex-col h-full">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                Quick Actions
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Common tasks and shortcuts
              </p>
              <div className="space-y-2 flex-1">
                <Button variant="outline" asChild className="w-full justify-start transition-all duration-200 hover:shadow-sm hover:scale-105 active:scale-95 cursor-pointer">
                  <Link href="/tasks">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    View Tasks
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start transition-all duration-200 hover:shadow-sm hover:scale-105 active:scale-95 cursor-pointer">
                  <Link href="/stats">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start transition-all duration-200 hover:shadow-sm hover:scale-105 active:scale-95 cursor-pointer">
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="md:col-span-1 md:row-span-1">
          <Card className="group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full">
            <div className="flex flex-col h-full">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                Recent Activity
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Your latest focus sessions
              </p>
              <div className="flex-1">
                {loading ? (
                  <div className="space-y-3">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                ) : stats.recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`h-2 w-2 rounded-full ${
                          activity.type === 'FOCUS' ? 'bg-green-500' : 
                          activity.type === 'SHORT_BREAK' ? 'bg-blue-500' : 'bg-purple-500'
                        }`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {activity.type === 'FOCUS' ? 'Focus Session' : 
                             activity.type === 'SHORT_BREAK' ? 'Short Break' : 'Long Break'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTimeAgo(activity.completedAt)}
                          </div>
                        </div>
                        <div className="text-sm font-medium">{formatTime(activity.duration)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-sm text-muted-foreground">
                      No activity yet. Start your first focus session!
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Card>
        </div>

        {/* Pro Tip */}
        <div className="md:col-span-1 md:row-span-1">
          <Card className="group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                Pro Tip
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Boost your productivity
              </p>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Use keyboard shortcuts to control your timer:
                  <br />
                  <span className="font-mono">Space</span> - Start/Pause
                  <br />
                  <span className="font-mono">S</span> - Skip
                  <br />
                  <span className="font-mono">R</span> - Reset
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Card>
        </div>
      </div>
    </div>
  )
}
