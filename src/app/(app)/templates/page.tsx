'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit2, Trash2, FileText, Plus, Loader2, Clock, Target } from 'lucide-react'
import { TaskTemplateForm } from '@/components/templates/TaskTemplateForm'
import { UseTemplateButton } from '@/components/templates/UseTemplateButton'
import { DeleteTemplateButton } from '@/components/templates/DeleteTemplateButton'
import { toast } from 'sonner'

interface Template {
  id: string
  name: string
  description?: string
  priority: string
  estimatePomodoros: number
  projectId?: string
  tags: string
  project?: {
    id: string
    name: string
    color: string
  }
  createdAt: string
  updatedAt: string
}

interface Project {
  id: string
  name: string
  color: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Failed to load templates')
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
    fetchTemplates()
    fetchProjects()
  }, [])

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

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      red: 'bg-red-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-500',
      pink: 'bg-pink-500',
      indigo: 'bg-indigo-500',
      teal: 'bg-teal-500',
      gray: 'bg-gray-500',
    }
    return colorMap[color] || 'bg-blue-500'
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Task Templates</h1>
          <p className="text-muted-foreground">
            Create reusable templates for common tasks and workflows
          </p>
        </div>
        <TaskTemplateForm onTemplateCreated={fetchTemplates} projects={projects} />
      </div>

      {templates.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first template to speed up task creation
            </p>
            <TaskTemplateForm 
              onTemplateCreated={fetchTemplates}
              projects={projects}
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Template
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>
                        Updated {new Date(template.updatedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TaskTemplateForm
                      mode="edit"
                      template={template}
                      onTemplateCreated={fetchTemplates}
                      projects={projects}
                      trigger={
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DeleteTemplateButton
                      templateId={template.id}
                      templateName={template.name}
                      onTemplateDeleted={fetchTemplates}
                      trigger={
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {template.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor(template.priority)}>
                    {template.priority}
                  </Badge>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{template.estimatePomodoros} pomodoros</span>
                  </div>
                </div>

                {template.project && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getColorClass(template.project.color)}`} />
                    <span className="text-sm text-muted-foreground">
                      {template.project.name}
                    </span>
                  </div>
                )}

                {template.tags && template.tags.trim() !== '' && (
                  <div className="flex flex-wrap gap-1">
                    {template.tags.split(',').slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                    {template.tags.split(',').length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.split(',').length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <UseTemplateButton 
                    template={template}
                    onTaskCreated={() => {
                      // Optionally refresh tasks if we're on the tasks page
                      toast.success('Task created! Check your tasks list.')
                    }}
                    projects={projects}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
