import { useCallback, useState, useEffect } from 'react'

interface NotificationConfig {
  enabled: boolean
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported('Notification' in window)
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Notifications not supported')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }, [isSupported])

  // Send a notification
  const sendNotification = useCallback(
    (config: NotificationConfig) => {
      if (!isSupported || !config.enabled) return

      if (permission !== 'granted') {
        console.warn('Notification permission not granted')
        return
      }

      try {
        const notification = new Notification(config.title, {
          body: config.body,
          icon: config.icon || '/icon.png',
          badge: config.badge || '/icon.png',
          tag: config.tag,
          requireInteraction: false,
          silent: false,
        })

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close()
        }, 5000)

        return notification
      } catch (error) {
        console.error('Error sending notification:', error)
      }
    },
    [isSupported, permission]
  )

  // Send timer completion notification
  const sendTimerCompleteNotification = useCallback(
    (phase: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK') => {
      const messages = {
        FOCUS: {
          title: 'Focus Session Complete!',
          body: 'Great job! Time for a break.',
        },
        SHORT_BREAK: {
          title: 'Short Break Complete!',
          body: 'Ready to focus again?',
        },
        LONG_BREAK: {
          title: 'Long Break Complete!',
          body: 'You\'ve earned this break. Ready for the next session?',
        },
      }

      const message = messages[phase]
      sendNotification({
        enabled: true,
        title: message.title,
        body: message.body,
        tag: `timer-${phase.toLowerCase()}`,
      })
    },
    [sendNotification]
  )

  // Send task reminder notification
  const sendTaskReminderNotification = useCallback(
    (taskTitle: string) => {
      sendNotification({
        enabled: true,
        title: 'Task Reminder',
        body: `Don't forget: ${taskTitle}`,
        tag: 'task-reminder',
      })
    },
    [sendNotification]
  )

  // Send daily summary notification
  const sendDailySummaryNotification = useCallback(
    (completedPomodoros: number, totalFocusTime: number) => {
      const hours = Math.floor(totalFocusTime / 60)
      const minutes = totalFocusTime % 60
      
      sendNotification({
        enabled: true,
        title: 'Daily Summary',
        body: `You completed ${completedPomodoros} pomodoros today (${hours}h ${minutes}m of focus time)`,
        tag: 'daily-summary',
      })
    },
    [sendNotification]
  )

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    sendTimerCompleteNotification,
    sendTaskReminderNotification,
    sendDailySummaryNotification,
  }
}
