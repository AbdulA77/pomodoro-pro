'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface LazyLoaderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  delay?: number
  threshold?: number
  className?: string
}

interface IntersectionObserverProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  className?: string
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center space-x-2">
      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      <span className="text-sm text-gray-400">Loading...</span>
    </div>
  </div>
)

export const LazyLoader: React.FC<LazyLoaderProps> = ({
  children,
  fallback = <DefaultFallback />,
  delay = 0,
  className = ''
}) => {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setShouldLoad(true), delay)
      return () => clearTimeout(timer)
    } else {
      setShouldLoad(true)
    }
  }, [delay])

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {!shouldLoad ? (
          <motion.div
            key="fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {fallback}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Suspense fallback={fallback}>
              {children}
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const IntersectionObserver: React.FC<IntersectionObserverProps> = ({
  children,
  fallback = <DefaultFallback />,
  threshold = 0.1,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setIsVisible(true)
          setHasIntersected(true)
        }
      },
      { threshold }
    )

    const element = document.querySelector(`[data-lazy-id="${className}"]`)
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [threshold, hasIntersected, className])

  return (
    <div data-lazy-id={className} className={className}>
      <AnimatePresence mode="wait">
        {!isVisible ? (
          <motion.div
            key="fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {fallback}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Suspense fallback={fallback}>
              {children}
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    delay?: number
    fallback?: React.ReactNode
    className?: string
  } = {}
) => {
  const LazyComponent = (props: P) => (
    <LazyLoader
      delay={options.delay}
      fallback={options.fallback}
      className={options.className}
    >
      <Component {...props} />
    </LazyLoader>
  )

  LazyComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`
  return LazyComponent
}
