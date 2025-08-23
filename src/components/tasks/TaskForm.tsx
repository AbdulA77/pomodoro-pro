'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, type TaskInput } from '@/lib/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Plus, Loader2, Target, Flag, Clock, CalendarDays, Tag, FolderOpen, Sparkles, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface TaskFormProps {
  onTaskCreated?: () => void
  trigger?: React.ReactNode
  projects?: Array<{
    id: string
    name: string
    color: string
  }>
}

export function TaskForm({ onTaskCreated, trigger, projects }: TaskFormProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      estimatePomodoros: 1,
      dueAt: '',
    },
  })

  const onSubmit = async (data: TaskInput) => {
    setIsLoading(true)
    console.log('Creating task with data:', data)
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      console.log('Task creation response:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Task creation failed:', errorData)
        throw new Error(errorData.error || 'Failed to create task')
      }

      const task = await response.json()
      console.log('Task created successfully:', task)
      toast.success('Task created successfully! 🎉')
      form.reset()
      setOpen(false)
      onTaskCreated?.()
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <Flag className="h-4 w-4" />
      case 'HIGH':
        return <Flag className="h-4 w-4" />
      case 'MEDIUM':
        return <Target className="h-4 w-4" />
      case 'LOW':
        return <Clock className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-400'
      case 'HIGH':
        return 'text-orange-400'
      case 'MEDIUM':
        return 'text-yellow-400'
      case 'LOW':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-slate-900/95 backdrop-blur-sm border-white/10 shadow-2xl">
        <DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Create New Task
            </DialogTitle>
            <DialogDescription className="text-gray-300 mt-1 text-sm">
              Add a new task to your workflow and start tracking your progress.
            </DialogDescription>
          </motion.div>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Task Title - Prominent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Task Title *</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="What needs to be done?"
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-blue-500/50 h-12 text-lg"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Description - Compact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Description</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Add details about this task..."
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-blue-500/50 min-h-[60px] resize-none"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Priority & Estimate - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium flex items-center space-x-2">
                        <Flag className="h-4 w-4" />
                        <span>Priority</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white focus:bg-white/10 focus:border-blue-500/50">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-white/20">
                          <SelectItem value="LOW" className="text-green-400">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>Low</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="MEDIUM" className="text-yellow-400">
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4" />
                              <span>Medium</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="HIGH" className="text-orange-400">
                            <div className="flex items-center space-x-2">
                              <Flag className="h-4 w-4" />
                              <span>High</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="CRITICAL" className="text-red-400">
                            <div className="flex items-center space-x-2">
                              <Flag className="h-4 w-4" />
                              <span>Critical</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <FormField
                  control={form.control}
                  name="estimatePomodoros"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span>Est. Sessions</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          max="20"
                          placeholder="1"
                          className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-blue-500/50 h-10"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-400 text-xs">
                        25-min sessions
                      </FormDescription>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </motion.div>
            </div>

            {/* Project & Due Date - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium flex items-center space-x-2">
                        <FolderOpen className="h-4 w-4" />
                        <span>Project</span>
                      </FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === 'none' ? null : value)} value={field.value || 'none'}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white focus:bg-white/10 focus:border-blue-500/50 h-10">
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-white/20">
                          <SelectItem value="none">No Project</SelectItem>
                          {projects?.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: project.color }}
                                />
                                <span>{project.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <FormField
                  control={form.control}
                  name="dueAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium flex items-center space-x-2">
                        <CalendarDays className="h-4 w-4" />
                        <span>Due Date</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal bg-white/5 border-white/20 text-white hover:bg-white/10 h-10",
                                !field.value && "text-gray-400"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "MMM dd")
                              ) : (
                                <span>Set due date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-slate-800 border-white/20" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date ? date.toISOString() : '')}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                            className="bg-slate-800 text-white"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </motion.div>
            </div>

            <DialogFooter className="pt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex items-center space-x-3 w-full"
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10 h-10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-10"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Create Task</span>
                    </div>
                  )}
                </Button>
              </motion.div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
