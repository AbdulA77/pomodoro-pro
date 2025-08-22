'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, CheckSquare, Clock, AlertCircle, Loader2, Edit2, Trash2, Calendar, FileText } from 'lucide-react'
import { TaskForm } from '@/components/tasks/TaskForm'
import { EditTaskForm } from '@/components/tasks/EditTaskForm'
import { DeleteTaskButton } from '@/components/tasks/DeleteTaskButton'
import { QuickStatusUpdate } from '@/components/tasks/QuickStatusUpdate'
import { TaskFilters } from '@/components/tasks/TaskFilters'
import { TaskTemplateForm } from '@/components/templates/TaskTemplateForm'
import { toast } from 'sonner'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  estimatePomodoros: number
  completedPomodoros: number
  dueAt: string | null
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
  const [projects, setProjects] = useState<Array<{ id: string; name: string; color: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [dueDateFilter, setDueDateFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [sortBy, setSortBy] = useState('priority')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      
      if (!response.ok) {
        if (response.status === 401) {
          // User is not authenticated, redirect will be handled by middleware
          return
        }
        throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error(`Failed to load tasks: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  useEffect(() => {
    // Only fetch tasks if user is authenticated
    if (status === 'authenticated' && session) {
      fetchTasks()
      fetchProjects()
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

  const getDueDateColor = (dueAt: string | null) => {
    if (!dueAt) return 'text-muted-foreground'
    
    const dueDate = new Date(dueAt)
    const today = new Date()
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    
    if (dueDate < today) return 'text-red-600 font-medium'
    if (dueDate.toDateString() === today.toDateString()) return 'text-orange-600 font-medium'
    if (dueDate.toDateString() === tomorrow.toDateString()) return 'text-yellow-600 font-medium'
    
    return 'text-muted-foreground'
  }

  const formatDueDate = (dueAt: string | null) => {
    if (!dueAt) return null
    
    const dueDate = new Date(dueAt)
    const today = new Date()
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    
    if (dueDate < today) return 'Overdue'
    if (dueDate.toDateString() === today.toDateString()) return 'Due Today'
    if (dueDate.toDateString() === tomorrow.toDateString()) return 'Due Tomorrow'
    
    return dueDate.toLocaleDateString()
  }

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter((task) => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || statusFilter === '' || task.status === statusFilter
      
      // Priority filter
      const matchesPriority = priorityFilter === 'all' || priorityFilter === '' || task.priority === priorityFilter
      
      // Due date filter
      let matchesDueDate = true
      if (dueDateFilter === 'all' || dueDateFilter === '') {
        matchesDueDate = true
      } else if (dueDateFilter === 'overdue') {
        matchesDueDate = task.dueAt ? new Date(task.dueAt) < new Date() : false
      } else if (dueDateFilter === 'today') {
        const today = new Date()
        const taskDate = task.dueAt ? new Date(task.dueAt) : null
        matchesDueDate = taskDate ? 
          taskDate.toDateString() === today.toDateString() : false
      } else if (dueDateFilter === 'this_week') {
        const today = new Date()
        const endOfWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        const taskDate = task.dueAt ? new Date(task.dueAt) : null
        matchesDueDate = taskDate ? 
          taskDate >= today && taskDate <= endOfWeek : false
      }
      
      // Project filter
      let matchesProject = true
      // if (projectFilter === 'all' || projectFilter === '') {
      //   matchesProject = true
      // } else if (projectFilter === 'no-project') {
      //   matchesProject = !task.project
      // } else {
      //   matchesProject = task.project?.id === projectFilter
      // }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesDueDate && matchesProject
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
          comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                      (priorityOrder[b.priority as keyof typeof priorityOrder] || 0)
          break
        case 'status':
          const statusOrder = { 'TODO': 1, 'IN_PROGRESS': 2, 'DONE': 3, 'BACKLOG': 0 }
          comparison = (statusOrder[a.status as keyof typeof statusOrder] || 0) - 
                      (statusOrder[b.status as keyof typeof statusOrder] || 0)
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'estimatePomodoros':
          comparison = a.estimatePomodoros - b.estimatePomodoros
          break
        case 'dueAt':
          if (!a.dueAt && !b.dueAt) comparison = 0
          else if (!a.dueAt) comparison = 1
          else if (!b.dueAt) comparison = -1
          else comparison = new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
          break
        case 'project':
          const aProjectName = a.project?.name || 'No Project'
          const bProjectName = b.project?.name || 'No Project'
          comparison = aProjectName.localeCompare(bProjectName)
          break
        default:
          comparison = 0
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const hasActiveFilters = searchQuery !== '' || (statusFilter !== '' && statusFilter !== 'all') || (priorityFilter !== '' && priorityFilter !== 'all') || (dueDateFilter !== '' && dueDateFilter !== 'all') // || (projectFilter !== '' && projectFilter !== 'all')

  const clearAllFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setDueDateFilter('all')
    // setProjectFilter('all')
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
        <div className="flex items-center space-x-2">
          {/* <TaskTemplateForm 
            onTemplateCreated={() => {
              toast.success('Template created! You can now use it to create tasks quickly.')
            }}
            projects={projects}
            trigger={
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                New Template
              </Button>
            }
          /> */}
          <TaskForm 
            onTaskCreated={fetchTasks} 
            projects={[]}
            trigger={
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            }
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <TaskFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          dueDateFilter={dueDateFilter}
          onDueDateFilterChange={setDueDateFilter}
          // projectFilter={projectFilter}
          // onProjectFilterChange={setProjectFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          onClearFilters={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
          // projects={projects}
        />
      </div>

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
        </div>
      )}

      <div className="grid gap-4">
        {filteredAndSortedTasks.map((task) => (
          <Card key={task.id} className="group relative overflow-hidden rounded-xl border bg-background hover:shadow-lg transition-all duration-300">
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
                  <QuickStatusUpdate 
                    taskId={task.id}
                    currentStatus={task.status}
                    onStatusUpdated={fetchTasks}
                  />
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <EditTaskForm 
                      task={task}
                      onTaskUpdated={fetchTasks}
                      trigger={
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DeleteTaskButton 
                      taskId={task.id}
                      taskTitle={task.title}
                      onTaskDeleted={fetchTasks}
                      trigger={
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
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
                  {/* {task.project && (
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {task.project.name}
                      </span>
                    </div>
                  )} */}
                  {task.dueAt && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className={`text-sm ${getDueDateColor(task.dueAt)}`}>
                        {formatDueDate(task.dueAt)}
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
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>
        ))}
      </div>

      {!isLoading && filteredAndSortedTasks.length === 0 && (
        <Card className="group relative overflow-hidden rounded-xl border bg-background hover:shadow-lg transition-all duration-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {hasActiveFilters ? 'No tasks found' : 'No tasks yet'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your search or filters to find more tasks'
                : 'Create your first task to get started with Flowdoro'
              }
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
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Card>
      )}
    </div>
  )
}
