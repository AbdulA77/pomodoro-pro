'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, Clock, Play, Archive } from 'lucide-react'
import { toast } from 'sonner'

interface QuickStatusUpdateProps {
  taskId: string
  currentStatus: string
  onStatusUpdated?: () => void
}

const statusOptions = [
  { value: 'BACKLOG', label: 'Backlog', icon: Archive },
  { value: 'TODO', label: 'To Do', icon: Clock },
  { value: 'IN_PROGRESS', label: 'In Progress', icon: Play },
  { value: 'DONE', label: 'Done', icon: CheckCircle },
]

export function QuickStatusUpdate({ taskId, currentStatus, onStatusUpdated }: QuickStatusUpdateProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: taskId,
          title: '', // We'll only update status, but need to provide required fields
          description: '',
          status: newStatus,
          priority: 'MEDIUM',
          estimatePomodoros: 1,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update task status')
      }

      toast.success('Status updated successfully!')
      onStatusUpdated?.()
    } catch (error) {
      console.error('Error updating task status:', error)
      toast.error('Failed to update status. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const currentStatusOption = statusOptions.find(option => option.value === currentStatus)
  const Icon = currentStatusOption?.icon || Clock

  return (
    <Select 
      value={currentStatus} 
      onValueChange={handleStatusChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[140px] h-8">
        <SelectValue>
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <span className="text-sm">{currentStatusOption?.label || currentStatus}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => {
          const OptionIcon = option.icon
          return (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center space-x-2">
                <OptionIcon className="h-4 w-4" />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

