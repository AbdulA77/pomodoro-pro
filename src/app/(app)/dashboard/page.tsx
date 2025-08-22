'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, Coffee, Clock, BarChart3, CheckSquare, Settings } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your productivity overview.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Start Timer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Quick Start</span>
            </CardTitle>
            <CardDescription>
              Start a new Pomodoro session
            </CardDescription>
          </CardHeader>
          <CardContent>
                         <Button asChild className="w-full transition-all duration-200 hover:shadow-md hover:scale-102 active:scale-98">
               <Link href="/focus">
                 Start Focus Session
               </Link>
             </Button>
          </CardContent>
        </Card>

        {/* Today's Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Today's Progress</span>
            </CardTitle>
            <CardDescription>
              Your focus sessions today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Focus Sessions</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex justify-between">
                <span>Total Focus Time</span>
                <span className="font-semibold">1h 15m</span>
              </div>
              <div className="flex justify-between">
                <span>Tasks Completed</span>
                <span className="font-semibold">2</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coffee className="h-5 w-5" />
              <span>Current Streak</span>
            </CardTitle>
            <CardDescription>
              Days of consistent focus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">5</div>
              <div className="text-sm text-muted-foreground">days</div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
                         <Button variant="outline" asChild className="w-full justify-start transition-all duration-200 hover:shadow-sm hover:scale-102 active:scale-98">
               <Link href="/tasks">
                 <CheckSquare className="mr-2 h-4 w-4" />
                 View Tasks
               </Link>
             </Button>
             <Button variant="outline" asChild className="w-full justify-start transition-all duration-200 hover:shadow-sm hover:scale-102 active:scale-98">
               <Link href="/stats">
                 <BarChart3 className="mr-2 h-4 w-4" />
                 View Analytics
               </Link>
             </Button>
             <Button variant="outline" asChild className="w-full justify-start transition-all duration-200 hover:shadow-sm hover:scale-102 active:scale-98">
               <Link href="/settings">
                 <Settings className="mr-2 h-4 w-4" />
                 Settings
               </Link>
             </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest focus sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Focus Session</div>
                  <div className="text-xs text-muted-foreground">25 minutes ago</div>
                </div>
                <div className="text-sm font-medium">25m</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Short Break</div>
                  <div className="text-xs text-muted-foreground">1 hour ago</div>
                </div>
                <div className="text-sm font-medium">5m</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Focus Session</div>
                  <div className="text-xs text-muted-foreground">2 hours ago</div>
                </div>
                <div className="text-sm font-medium">25m</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pro Tip</span>
            </CardTitle>
            <CardDescription>
              Boost your productivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use keyboard shortcuts to control your timer:
              <br />
              <span className="font-mono">Space</span> - Start/Pause
              <br />
              <span className="font-mono">S</span> - Skip
              <br />
              <span className="font-mono">R</span> - Reset
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
