'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Task {
  id: string
  title: string
  description?: string
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  estimatePomodoros: number
  completedPomodoros: number
  project?: {
    id: string
    name: string
    color: string
  }
  tags: string[]
}

interface TaskSelectorProps {
  currentTaskId: string | null
  onTaskSelect: (taskId: string | null) => void
  className?: string
}

export function TaskSelector({ currentTaskId, onTaskSelect, className }: TaskSelectorProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      } else {
        console.error('Failed to fetch tasks')
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const currentTask = tasks.find(task => task.id === currentTaskId)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500'
      case 'HIGH': return 'bg-orange-500'
      case 'MEDIUM': return 'bg-yellow-500'
      case 'LOW': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-green-500'
      case 'IN_PROGRESS': return 'bg-blue-500'
      case 'TODO': return 'bg-yellow-500'
      case 'BACKLOG': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const handleTaskSelect = (taskId: string | null) => {
    onTaskSelect(taskId)
    setOpen(false)
    
    if (taskId) {
      const task = tasks.find(t => t.id === taskId)
      toast.success(`Selected task: ${task?.title}`)
    } else {
      toast.success('Cleared task selection')
    }
  }

  const availableTasks = tasks.filter(task => task.status !== 'DONE')

  return (
    <div className={className}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
                     <Button
             variant="outline"
             size="lg"
             className="bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all duration-300 text-sm sm:text-base min-w-[200px] sm:min-w-[200px] w-full sm:w-auto justify-between"
           >
            <div className="flex items-center space-x-2 truncate">
              {currentTask ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="truncate">{currentTask.title}</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Select Task</span>
                </>
              )}
            </div>
            <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        
                 <DropdownMenuContent 
           align="end" 
           className="w-[calc(100vw-2rem)] sm:w-80 max-h-96 overflow-y-auto bg-purple-900/95 backdrop-blur-md border-purple-400/40 shadow-2xl"
         >
          {loading ? (
            <DropdownMenuItem disabled className="text-gray-400">
              Loading tasks...
            </DropdownMenuItem>
          ) : availableTasks.length === 0 ? (
            <DropdownMenuItem disabled className="text-gray-400">
              No available tasks
            </DropdownMenuItem>
          ) : (
            <>
              {availableTasks.map((task) => (
                <DropdownMenuItem
                  key={task.id}
                  onClick={() => handleTaskSelect(task.id)}
                  className="flex flex-col items-start space-y-2 p-3 hover:bg-purple-400/30 cursor-pointer border-b border-purple-400/30 last:border-b-0"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      {currentTaskId === task.id && (
                        <Check className="h-4 w-4 text-green-400" />
                      )}
                      <span className="font-medium text-white">{task.title}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge 
                        className={`${getPriorityColor(task.priority)} text-white text-xs`}
                      >
                        {task.priority}
                      </Badge>
                      <Badge 
                        className={`${getStatusColor(task.status)} text-white text-xs`}
                      >
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between w-full text-xs text-gray-400">
                    <div className="flex items-center space-x-2">
                      {task.project && (
                        <span className="flex items-center space-x-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: task.project.color }}
                          />
                          <span>{task.project.name}</span>
                        </span>
                      )}
                      <span>Est: {task.estimatePomodoros} pomodoros</span>
                    </div>
                    <span>Completed: {task.completedPomodoros}</span>
                  </div>
                  
                  {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {task.tags.slice(0, 3).map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs bg-purple-400/30 border-purple-400/40 text-gray-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {task.tags.length > 3 && (
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-purple-400/30 border-purple-400/40 text-gray-200"
                        >
                          +{task.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator className="bg-purple-400/40" />
              
              <DropdownMenuItem
                onClick={() => handleTaskSelect(null)}
                className="text-gray-300 hover:bg-purple-400/30 cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4" />
                  <span>Clear Selection</span>
                </div>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
