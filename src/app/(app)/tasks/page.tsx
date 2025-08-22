'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, CheckSquare, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { TaskForm } from '@/components/tasks/TaskForm'
import { toast } from 'sonner'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  estimatePomodoros: number
  completedPomodoros: number
  project: {
    id: string
    name: string
    color: string
  } | null
  tags: string[]
}

export default function TasksPage() {
  const { data: session, status } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (!response.ok) {
        if (response.status === 401) {
          // User is not authenticated, redirect will be handled by middleware
          return
        }
        throw new Error('Failed to fetch tasks')
      }
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch tasks if user is authenticated
    if (status === 'authenticated' && session) {
      fetchTasks()
    } else if (status === 'unauthenticated') {
      setIsLoading(false)
    }
  }, [status, session])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'TODO':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Show loading while checking authentication
  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  // Show message if not authenticated (though middleware should handle this)
  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Please sign in to view your tasks.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your tasks and track progress
          </p>
        </div>
        <TaskForm onTaskCreated={fetchTasks} />
      </div>

      <div className="grid gap-6">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center space-x-2">
                    <CheckSquare className="h-5 w-5" />
                    <span>{task.title}</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {task.description}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {task.completedPomodoros}/{task.estimatePomodoros} pomodoros
                    </span>
                  </div>
                  {task.project && (
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {task.project.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first task to get started with Pomodoro Pro
            </p>
            <TaskForm 
              onTaskCreated={fetchTasks}
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
