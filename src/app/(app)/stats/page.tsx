import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Target, Clock, TrendingUp, Calendar } from 'lucide-react'

export default function StatsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track your productivity and focus patterns
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Focus Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12h 30m</div>
            <p className="text-xs text-muted-foreground">
              +2h 15m from last week
            </p>
          </CardContent>
        </Card>

        {/* Completed Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30</div>
            <p className="text-xs text-muted-foreground">
              +5 from last week
            </p>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 days</div>
            <p className="text-xs text-muted-foreground">
              Personal best: 12 days
            </p>
          </CardContent>
        </Card>

        {/* Average Session */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25m</div>
            <p className="text-xs text-muted-foreground">
              Target: 25m
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Overview</CardTitle>
            <CardDescription>
              Your focus sessions this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{day}</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-20 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-primary rounded-full" 
                        style={{ width: `${Math.min(100, (index + 1) * 15)}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.min(4, (index + 1))} sessions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Session Distribution */}
        <Card>
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
                <span className="text-sm font-medium">70%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Short Breaks</span>
                </div>
                <span className="text-sm font-medium">20%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-purple-500 rounded-full" />
                  <span className="text-sm">Long Breaks</span>
                </div>
                <span className="text-sm font-medium">10%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
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
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <div className="flex-1">
                <div className="text-sm font-medium">Completed 4 focus sessions</div>
                <div className="text-xs text-muted-foreground">Today at 3:45 PM</div>
              </div>
              <div className="text-sm font-medium">2h 0m</div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
              <div className="h-2 w-2 bg-blue-500 rounded-full" />
              <div className="flex-1">
                <div className="text-sm font-medium">Started new streak</div>
                <div className="text-xs text-muted-foreground">Yesterday at 9:30 AM</div>
              </div>
              <div className="text-sm font-medium">Day 1</div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
              <div className="h-2 w-2 bg-purple-500 rounded-full" />
              <div className="flex-1">
                <div className="text-sm font-medium">Completed task: "Fix authentication bug"</div>
                <div className="text-xs text-muted-foreground">2 days ago at 2:15 PM</div>
              </div>
              <div className="text-sm font-medium">4 pomodoros</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
