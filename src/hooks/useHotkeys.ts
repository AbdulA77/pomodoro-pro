import { useEffect, useCallback } from 'react'

type HotkeyHandler = (event: KeyboardEvent) => void

interface HotkeyConfig {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  handler: HotkeyHandler
  preventDefault?: boolean
}

export const useHotkeys = (hotkeys: HotkeyConfig[]) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const hotkey of hotkeys) {
        const {
          key,
          ctrl = false,
          shift = false,
          alt = false,
          meta = false,
          handler,
          preventDefault = true,
        } = hotkey

        // Check if all modifiers match
        const modifiersMatch =
          event.ctrlKey === ctrl &&
          event.shiftKey === shift &&
          event.altKey === alt &&
          event.metaKey === meta

        // Check if key matches (case insensitive)
        const keyMatches =
          event.key.toLowerCase() === key.toLowerCase() ||
          event.code.toLowerCase() === key.toLowerCase()

        if (modifiersMatch && keyMatches) {
          if (preventDefault) {
            event.preventDefault()
          }
          handler(event)
          break // Only handle the first matching hotkey
        }
      }
    },
    [hotkeys]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}

// Predefined hotkey configurations for common actions
export const HOTKEYS = {
  START_PAUSE: { key: ' ', description: 'Start/Pause timer' },
  SKIP: { key: 's', description: 'Skip current phase' },
  RESET: { key: 'r', description: 'Reset timer' },
  FOCUS: { key: 'f', description: 'Switch to focus phase' },
  SHORT_BREAK: { key: 'b', description: 'Switch to short break' },
  LONG_BREAK: { key: 'l', description: 'Switch to long break' },
  QUICK_TASK: { key: 't', description: 'Quick add task' },
  COMMAND_PALETTE: { key: 'k', meta: true, description: 'Open command palette' },
  SETTINGS: { key: ',', description: 'Open settings' },
  DASHBOARD: { key: 'd', description: 'Go to dashboard' },
  TASKS: { key: '1', description: 'Go to tasks' },
  STATS: { key: '2', description: 'Go to stats' },
} as const

// Helper function to create hotkey configs
export const createHotkeyConfig = (
  key: string,
  handler: HotkeyHandler,
  options: {
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    meta?: boolean
    preventDefault?: boolean
  } = {}
): HotkeyConfig => ({
  key,
  handler,
  ...options,
})
