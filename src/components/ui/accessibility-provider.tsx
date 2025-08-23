'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface AccessibilityContextType {
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'
  toggleReducedMotion: () => void
  toggleHighContrast: () => void
  setFontSize: (size: 'small' | 'medium' | 'large') => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [fontSize, setFontSizeState] = useState<'small' | 'medium' | 'large'>('medium')

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedReducedMotion = localStorage.getItem('accessibility-reduced-motion') === 'true'
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true'
    const savedFontSize = localStorage.getItem('accessibility-font-size') as 'small' | 'medium' | 'large' || 'medium'

    setReducedMotion(savedReducedMotion)
    setHighContrast(savedHighContrast)
    setFontSizeState(savedFontSize)

    // Apply CSS custom properties
    document.documentElement.style.setProperty('--reduced-motion', savedReducedMotion ? 'reduce' : 'no-preference')
    document.documentElement.style.setProperty('--high-contrast', savedHighContrast ? 'high' : 'normal')
    document.documentElement.style.setProperty('--font-size', savedFontSize)
  }, [])

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion
    setReducedMotion(newValue)
    localStorage.setItem('accessibility-reduced-motion', String(newValue))
    document.documentElement.style.setProperty('--reduced-motion', newValue ? 'reduce' : 'no-preference')
    toast.success(`Reduced motion ${newValue ? 'enabled' : 'disabled'}`)
  }

  const toggleHighContrast = () => {
    const newValue = !highContrast
    setHighContrast(newValue)
    localStorage.setItem('accessibility-high-contrast', String(newValue))
    document.documentElement.style.setProperty('--high-contrast', newValue ? 'high' : 'normal')
    toast.success(`High contrast ${newValue ? 'enabled' : 'disabled'}`)
  }

  const setFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSizeState(size)
    localStorage.setItem('accessibility-font-size', size)
    document.documentElement.style.setProperty('--font-size', size)
    toast.success(`Font size set to ${size}`)
  }

  const value: AccessibilityContextType = {
    reducedMotion,
    highContrast,
    fontSize,
    toggleReducedMotion,
    toggleHighContrast,
    setFontSize,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}
