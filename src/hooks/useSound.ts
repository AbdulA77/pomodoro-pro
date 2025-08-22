import { useCallback, useRef } from 'react'

interface SoundConfig {
  volume: number
  enabled: boolean
}

export const useSound = (config: SoundConfig) => {
  const audioContextRef = useRef<AudioContext | null>(null)

  // Initialize audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  // Generate a beep sound using Web Audio API
  const generateBeep = useCallback((frequency: number = 800, duration: number = 200) => {
    if (!config.enabled) return

    try {
      const audioContext = getAudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(config.volume / 100, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration / 1000)
    } catch (error) {
      console.warn('Error generating beep sound:', error)
    }
  }, [config.enabled, config.volume, getAudioContext])

  // Play bell sound (timer completion) - higher frequency
  const playBell = useCallback(() => {
    generateBeep(1000, 300)
  }, [generateBeep])

  // Play tick sound (lower frequency, shorter duration)
  const playTick = useCallback(() => {
    generateBeep(600, 100)
  }, [generateBeep])

  // Play completion sound (ascending tone)
  const playComplete = useCallback(() => {
    generateBeep(800, 200)
    setTimeout(() => generateBeep(1000, 200), 200)
  }, [generateBeep])

  // Test sound
  const testSound = useCallback(() => {
    playBell()
  }, [playBell])

  // Cleanup audio context
  const cleanup = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }, [])

  return {
    playBell,
    playTick,
    playComplete,
    testSound,
    cleanup,
  }
}
