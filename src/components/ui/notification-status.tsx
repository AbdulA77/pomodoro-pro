'use client'

import { useState } from 'react'
import { Bell, BellOff, Settings, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useNotifications } from '@/hooks/useNotifications'
import { toast } from 'sonner'

interface NotificationStatusProps {
  className?: string
  showDetails?: boolean
}

export function NotificationStatus({ className, showDetails = false }: NotificationStatusProps) {
  const { isSupported, permission, isBlocked, lastNotificationTime, requestPermission } = useNotifications()
  const [isRequesting, setIsRequesting] = useState(false)

  const handleRequestPermission = async () => {
    setIsRequesting(true)
    try {
      const granted = await requestPermission()
      if (granted) {
        toast.success('Notifications enabled!')
      } else {
        toast.error('Notification permission denied')
      }
    } catch (error) {
      toast.error('Failed to request notification permission')
    } finally {
      setIsRequesting(false)
    }
  }

  const getStatusColor = () => {
    if (!isSupported) return 'text-gray-400'
    if (isBlocked) return 'text-red-400'
    if (permission === 'granted') return 'text-green-400'
    return 'text-yellow-400'
  }

  const getStatusIcon = () => {
    if (!isSupported) return BellOff
    if (isBlocked) return BellOff
    if (permission === 'granted') return CheckCircle
    return AlertTriangle
  }

  const getStatusText = () => {
    if (!isSupported) return 'Not Supported'
    if (isBlocked) return 'Blocked'
    if (permission === 'granted') return 'Enabled'
    return 'Permission Required'
  }

  const StatusIcon = getStatusIcon()

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <StatusIcon className={`h-4 w-4 ${getStatusColor()}`} />
        <span className={`text-sm ${getStatusColor()}`}>{getStatusText()}</span>
      </div>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all duration-300 ${className}`}
        >
          <StatusIcon className={`h-4 w-4 mr-2 ${getStatusColor()}`} />
          {getStatusText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white/10 backdrop-blur-sm border-white/20">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <StatusIcon className={`h-6 w-6 ${getStatusColor()}`} />
            <div>
              <h4 className="font-semibold text-white">Notification Status</h4>
              <p className="text-sm text-gray-300">{getStatusText()}</p>
            </div>
          </div>

          <div className="space-y-3">
            {!isSupported && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-300">
                  Notifications are not supported in this browser.
                </p>
              </div>
            )}

            {isBlocked && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-300 mb-2">
                  Notifications are blocked. Please enable them in your browser settings.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toast.info('Please enable notifications in your browser settings and refresh the page.')
                  }}
                  className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  How to Enable
                </Button>
              </div>
            )}

            {permission === 'default' && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-300 mb-2">
                  Enable notifications to get alerts when your timer sessions complete.
                </p>
                <Button
                  size="sm"
                  onClick={handleRequestPermission}
                  disabled={isRequesting}
                  className="bg-yellow-500/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {isRequesting ? 'Requesting...' : 'Enable Notifications'}
                </Button>
              </div>
            )}

            {permission === 'granted' && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-300">
                  Notifications are enabled! You'll receive alerts when timer sessions complete.
                </p>
                {lastNotificationTime && (
                  <p className="text-xs text-green-400 mt-1">
                    Last notification: {lastNotificationTime.toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Browser Support</span>
              <Badge variant={isSupported ? 'default' : 'destructive'} className="text-xs">
                {isSupported ? 'Supported' : 'Not Supported'}
              </Badge>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
