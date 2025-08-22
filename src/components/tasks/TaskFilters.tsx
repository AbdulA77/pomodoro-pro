'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, Filter, SortAsc, SortDesc, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TaskFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  priorityFilter: string
  onPriorityFilterChange: (priority: string) => void
  dueDateFilter: string
  onDueDateFilterChange: (filter: string) => void
  projectFilter: string
  onProjectFilterChange: (project: string) => void
  sortBy: string
  onSortByChange: (sort: string) => void
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: (order: 'asc' | 'desc') => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  projects?: Array<{ id: string; name: string; color: string }>
}

export function TaskFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  dueDateFilter,
  onDueDateFilterChange,
  projectFilter,
  onProjectFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
  hasActiveFilters,
  projects
}: TaskFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </Button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-2">
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                          <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="estimatePomodoros">Estimate</SelectItem>
            <SelectItem value="dueAt">Due Date</SelectItem>
            <SelectItem value="project">Project</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="h-8 w-8 p-0"
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg border">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="BACKLOG">Backlog</SelectItem>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <Select value={dueDateFilter} onValueChange={onDueDateFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="All due dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All due dates</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="today">Due Today</SelectItem>
                <SelectItem value="this_week">Due This Week</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* {projects && projects.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <Select value={projectFilter} onValueChange={onProjectFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All projects</SelectItem>
                  <SelectItem value="no-project">No Project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full bg-${project.color}-500`} />
                        <span>{project.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )} */}
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {statusFilter && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Status: {statusFilter.replace('_', ' ')}</span>
              <button
                onClick={() => onStatusFilterChange('')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {priorityFilter && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Priority: {priorityFilter}</span>
              <button
                onClick={() => onPriorityFilterChange('')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dueDateFilter && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Due: {dueDateFilter.replace('_', ' ')}</span>
              <button
                onClick={() => onDueDateFilterChange('')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {/* {projectFilter && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>
                Project: {projectFilter === 'no-project' 
                  ? 'No Project' 
                  : projects?.find(p => p.id === projectFilter)?.name || projectFilter
                }
              </span>
              <button
                onClick={() => onProjectFilterChange('')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )} */}
        </div>
      )}
    </div>
  )
}
