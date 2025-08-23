'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Plus, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Edit2, 
  Trash2, 
  Calendar, 
  FileText,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Target,
  Zap,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Archive,
  Play,
  Pause,
  CheckCircle,
  Circle,
  Clock3,
  Flag,
  CalendarDays,
  Tag,
  Users,
  FolderOpen,
  Eye,
  EyeOff,
  Grid3X3,
  List,
  Download,
  Upload,
  Settings,
  Sparkles
} from 'lucide-react'
import { TaskForm } from '@/components/tasks/TaskForm'
import { EditTaskForm } from '@/components/tasks/EditTaskForm'
import { DeleteTaskButton } from '@/components/tasks/DeleteTaskButton'
import { QuickStatusUpdate } from '@/components/tasks/QuickStatusUpdate'
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
  createdAt: string
  updatedAt: string
}

interface TaskStats {
  total: number
  completed: number
  inProgress: number
  todo: number
  overdue: number
  dueToday: number
  totalPomodoros: number
  completedPomodoros: number
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

const taskCardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: {
      duration: 0.3
    }
  }
}

export default function TasksPage() {
  const { data: session, status } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Array<{ id: string; name: string; color: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [showCompleted, setShowCompleted] = useState(true)
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [dueDateFilter, setDueDateFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [sortBy, setSortBy] = useState('priority')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const fetchTasks = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    }
    
    try {
      const response = await fetch('/api/tasks')
      
      if (!response.ok) {
        if (response.status === 401) {
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
      setRefreshing(false)
    }
  }, [])

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
    if (status === 'authenticated' && session) {
      fetchTasks()
      fetchProjects()
    } else if (status === 'unauthenticated') {
      setIsLoading(false)
    }
  }, [status, session, fetchTasks])

  // Calculate task statistics
  const taskStats: TaskStats = tasks.reduce((stats, task) => {
    stats.total++
    
    if (task.status === 'DONE') stats.completed++
    else if (task.status === 'IN_PROGRESS') stats.inProgress++
    else stats.todo++
    
    if (task.dueAt && new Date(task.dueAt) < new Date()) stats.overdue++
    if (task.dueAt && new Date(task.dueAt).toDateString() === new Date().toDateString()) stats.dueToday++
    
    stats.totalPomodoros += task.estimatePomodoros
    stats.completedPomodoros += task.completedPomodoros
    
    return stats
  }, {
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    overdue: 0,
    dueToday: 0,
    totalPomodoros: 0,
    completedPomodoros: 0
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'IN_PROGRESS':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'TODO':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle className="h-4 w-4" />
      case 'IN_PROGRESS':
        return <Clock3 className="h-4 w-4" />
      case 'TODO':
        return <Circle className="h-4 w-4" />
      default:
        return <Circle className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'LOW':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <Flag className="h-4 w-4" />
      case 'HIGH':
        return <AlertCircle className="h-4 w-4" />
      case 'MEDIUM':
        return <Target className="h-4 w-4" />
      case 'LOW':
        return <Circle className="h-4 w-4" />
      default:
        return <Circle className="h-4 w-4" />
    }
  }

  const getDueDateColor = (dueAt: string | null) => {
    if (!dueAt) return 'text-gray-400'
    
    const dueDate = new Date(dueAt)
    const today = new Date()
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    
    if (dueDate < today) return 'text-red-400'
    if (dueDate.toDateString() === today.toDateString()) return 'text-orange-400'
    if (dueDate.toDateString() === tomorrow.toDateString()) return 'text-yellow-400'
    
    return 'text-gray-400'
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
      // Show completed filter
      if (!showCompleted && task.status === 'DONE') return false
      
      // Search filter
      const matchesSearch = searchQuery === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      
      // Priority filter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
      
      // Due date filter
      let matchesDueDate = true
      if (dueDateFilter === 'overdue') {
        matchesDueDate = task.dueAt ? new Date(task.dueAt) < new Date() : false
      } else if (dueDateFilter === 'today') {
        const today = new Date()
        const taskDate = task.dueAt ? new Date(task.dueAt) : null
        matchesDueDate = taskDate ? taskDate.toDateString() === today.toDateString() : false
      } else if (dueDateFilter === 'this_week') {
        const today = new Date()
        const endOfWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        const taskDate = task.dueAt ? new Date(task.dueAt) : null
        matchesDueDate = taskDate ? taskDate >= today && taskDate <= endOfWeek : false
      }
      
      // Project filter
      const matchesProject = projectFilter === 'all' || task.project?.id === projectFilter
      
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
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        default:
          comparison = 0
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || priorityFilter !== 'all' || dueDateFilter !== 'all' || projectFilter !== 'all'

  const clearAllFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setDueDateFilter('all')
    setProjectFilter('all')
  }

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredAndSortedTasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(filteredAndSortedTasks.map(task => task.id))
    }
  }

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedTasks.length === 0) return
    
    try {
      const promises = selectedTasks.map(taskId =>
        fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        })
      )
      
      await Promise.all(promises)
      toast.success(`Updated ${selectedTasks.length} tasks`)
      setSelectedTasks([])
      fetchTasks()
    } catch (error) {
      toast.error('Failed to update tasks')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedTasks.length} tasks?`)) return
    
    try {
      const promises = selectedTasks.map(taskId =>
        fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      )
      
      await Promise.all(promises)
      toast.success(`Deleted ${selectedTasks.length} tasks`)
      setSelectedTasks([])
      fetchTasks()
    } catch (error) {
      toast.error('Failed to delete tasks')
    }
  }

  // Show loading while checking authentication
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

  // Show message if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-300">Please sign in to view your tasks.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse" />
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
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
                Tasks
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-gray-300 text-lg"
              >
                Manage your tasks and track progress
              </motion.p>
            </div>
            <div className="flex items-center space-x-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Button
                  onClick={() => fetchTasks(true)}
                  disabled={refreshing}
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all duration-300"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <TaskForm 
                  onTaskCreated={fetchTasks} 
                  projects={projects}
                  trigger={
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold">
                      <Plus className="h-4 w-4 mr-2" />
                      New Task
                    </Button>
                  }
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div variants={cardVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Total Tasks</p>
                    <p className="text-2xl font-bold text-white">{taskStats.total}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                    <CheckSquare className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">In Progress</p>
                    <p className="text-2xl font-bold text-blue-400">{taskStats.inProgress}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Clock3 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Completed</p>
                    <p className="text-2xl font-bold text-green-400">{taskStats.completed}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Pomodoros</p>
                    <p className="text-2xl font-bold text-orange-400">{taskStats.completedPomodoros}/{taskStats.totalPomodoros}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-6"
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/10"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="TODO">To Do</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-40 bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={dueDateFilter} onValueChange={setDueDateFilter}>
                    <SelectTrigger className="w-40 bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Due Date" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="today">Due Today</SelectItem>
                      <SelectItem value="this_week">This Week</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="dueAt">Due Date</SelectItem>
                      <SelectItem value="createdAt">Created</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </Button>
                </div>

                {/* View Controls */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Additional Controls */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-completed"
                      checked={showCompleted}
                      onCheckedChange={(checked) => setShowCompleted(checked as boolean)}
                      className="border-white/20 data-[state=checked]:bg-blue-600"
                    />
                    <label htmlFor="show-completed" className="text-sm text-gray-300">
                      Show completed
                    </label>
                  </div>
                  
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>

                <div className="text-sm text-gray-400">
                  {filteredAndSortedTasks.length} of {tasks.length} tasks
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bulk Actions */}
        {selectedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
          >
            <Card className="bg-blue-500/10 backdrop-blur-sm border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-blue-300">
                      {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkStatusUpdate('DONE')}
                      className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkStatusUpdate('IN_PROGRESS')}
                      className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                    >
                      <Clock3 className="h-4 w-4 mr-2" />
                      Start Progress
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTasks([])}
                    className="text-gray-400 hover:text-white"
                  >
                    Clear Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tasks Grid/List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}
        >
          <AnimatePresence>
            {filteredAndSortedTasks.map((task) => (
              <motion.div
                key={task.id}
                variants={taskCardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] shadow-xl">
                  <CardContent className="p-6">
                    {/* Task Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3 flex-1">
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={() => handleSelectTask(task.id)}
                          className="mt-1 border-white/20 data-[state=checked]:bg-blue-600"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <QuickStatusUpdate 
                          taskId={task.id}
                          currentStatus={task.status}
                          onStatusUpdated={fetchTasks}
                        />
                        <EditTaskForm 
                          task={task}
                          onTaskUpdated={fetchTasks}
                          trigger={
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DeleteTaskButton 
                          taskId={task.id}
                          taskTitle={task.title}
                          onTaskDeleted={fetchTasks}
                          trigger={
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </div>

                    {/* Task Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={`${getStatusColor(task.status)} border`}>
                        {getStatusIcon(task.status)}
                        <span className="ml-1">{task.status.replace('_', ' ')}</span>
                      </Badge>
                      <Badge className={`${getPriorityColor(task.priority)} border`}>
                        {getPriorityIcon(task.priority)}
                        <span className="ml-1">{task.priority}</span>
                      </Badge>
                      {task.dueAt && (
                        <Badge className={`${getDueDateColor(task.dueAt) === 'text-red-400' ? 'bg-red-500/20 text-red-400 border-red-500/30' : getDueDateColor(task.dueAt) === 'text-orange-400' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'} border`}>
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDueDate(task.dueAt)}
                        </Badge>
                      )}
                    </div>

                    {/* Task Details */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Target className="h-4 w-4" />
                          <span>{task.completedPomodoros}/{task.estimatePomodoros}</span>
                        </div>
                        {task.project && (
                          <div className="flex items-center space-x-1 text-gray-400">
                            <FolderOpen className="h-4 w-4" />
                            <span>{task.project.name}</span>
                          </div>
                        )}
                      </div>
                      
                      {task.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          {task.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs bg-white/10 text-gray-300">
                              {tag}
                            </Badge>
                          ))}
                          {task.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs bg-white/10 text-gray-300">
                              +{task.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {task.estimatePomodoros > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{Math.round((task.completedPomodoros / task.estimatePomodoros) * 100)}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((task.completedPomodoros / task.estimatePomodoros) * 100, 100)}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {!isLoading && filteredAndSortedTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8"
          >
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="flex flex-col items-center justify-center py-16">
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
                  <div className="p-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                    <CheckSquare className="h-12 w-12 text-blue-400" />
                  </div>
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {hasActiveFilters ? 'No tasks found' : 'No tasks yet'}
                </h3>
                <p className="text-gray-400 text-center mb-6 max-w-md">
                  {hasActiveFilters 
                    ? 'Try adjusting your search or filters to find more tasks'
                    : 'Create your first task to get started with Flowdoro and boost your productivity'
                  }
                </p>
                <div className="flex items-center space-x-3">
                  <TaskForm 
                    onTaskCreated={fetchTasks}
                    projects={projects}
                    trigger={
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Task
                      </Button>
                    }
                  />
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={clearAllFilters}
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
