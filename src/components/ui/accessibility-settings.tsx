'use client'

import { useState } from 'react'
import { Eye, Type, Zap, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useAccessibility } from './accessibility-provider'

interface AccessibilitySettingsProps {
  className?: string
  showDetails?: boolean
}

export function AccessibilitySettings({ className, showDetails = false }: AccessibilitySettingsProps) {
  const { reducedMotion, highContrast, fontSize, toggleReducedMotion, toggleHighContrast, setFontSize } = useAccessibility()
  const [isOpen, setIsOpen] = useState(false)

  const getStatusColor = () => {
    if (reducedMotion || highContrast || fontSize !== 'medium') {
      return 'text-blue-400'
    }
    return 'text-gray-400'
  }

  const getStatusText = () => {
    const activeFeatures = []
    if (reducedMotion) activeFeatures.push('Reduced Motion')
    if (highContrast) activeFeatures.push('High Contrast')
    if (fontSize !== 'medium') activeFeatures.push(`${fontSize.charAt(0).toUpperCase() + fontSize.slice(1)} Font`)
    
    return activeFeatures.length > 0 ? activeFeatures.join(', ') : 'Default'
  }

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Settings className={`h-4 w-4 ${getStatusColor()}`} />
        <span className={`text-sm ${getStatusColor()}`}>{getStatusText()}</span>
      </div>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all duration-300 ${className}`}
        >
          <Settings className={`h-4 w-4 mr-2 ${getStatusColor()}`} />
          Accessibility
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white/10 backdrop-blur-sm border-white/20">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Settings className={`h-6 w-6 ${getStatusColor()}`} />
            <div>
              <h4 className="font-semibold text-white">Accessibility Settings</h4>
              <p className="text-sm text-gray-300">Customize your experience</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Reduced Motion */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-white">Reduced Motion</p>
                  <p className="text-xs text-gray-300">Minimize animations and transitions</p>
                </div>
              </div>
              <Button
                size="sm"
                variant={reducedMotion ? 'default' : 'outline'}
                onClick={toggleReducedMotion}
                className={reducedMotion ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'}
              >
                {reducedMotion ? 'On' : 'Off'}
              </Button>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center space-x-3">
                <Eye className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-white">High Contrast</p>
                  <p className="text-xs text-gray-300">Increase color contrast for better visibility</p>
                </div>
              </div>
              <Button
                size="sm"
                variant={highContrast ? 'default' : 'outline'}
                onClick={toggleHighContrast}
                className={highContrast ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'}
              >
                {highContrast ? 'On' : 'Off'}
              </Button>
            </div>

            {/* Font Size */}
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center space-x-3 mb-3">
                <Type className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-white">Font Size</p>
                  <p className="text-xs text-gray-300">Adjust text size for better readability</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <Button
                    key={size}
                    size="sm"
                    variant={fontSize === size ? 'default' : 'outline'}
                    onClick={() => setFontSize(size)}
                    className={`flex-1 ${
                      fontSize === size 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Current Settings</span>
              <Badge variant="outline" className="text-xs bg-white/5 border-white/20 text-gray-300">
                {getStatusText()}
              </Badge>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
