import { useEffect, useRef, useCallback } from 'react'

interface PerformanceMetrics {
  fps: number
  memoryUsage?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
  loadTime: number
  renderTime: number
}

interface PerformanceMonitorOptions {
  enabled?: boolean
  fpsInterval?: number
  memoryInterval?: number
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void
}

export const usePerformanceMonitor = (options: PerformanceMonitorOptions = {}) => {
  const {
    enabled = process.env.NODE_ENV === 'development',
    fpsInterval = 1000,
    memoryInterval = 5000,
    onMetricsUpdate
  } = options

  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const fpsRef = useRef(0)
  const memoryRef = useRef<any>(null)
  const loadTimeRef = useRef(performance.now())
  const renderTimeRef = useRef(0)

  const updateFPS = useCallback(() => {
    const currentTime = performance.now()
    const deltaTime = currentTime - lastTime.current
    
    if (deltaTime >= fpsInterval) {
      fpsRef.current = Math.round((frameCount.current * 1000) / deltaTime)
      frameCount.current = 0
      lastTime.current = currentTime
      
      // Update memory usage if available
      if ('memory' in performance) {
        memoryRef.current = (performance as any).memory
      }
      
      const metrics: PerformanceMetrics = {
        fps: fpsRef.current,
        memoryUsage: memoryRef.current,
        loadTime: loadTimeRef.current,
        renderTime: renderTimeRef.current
      }
      
      onMetricsUpdate?.(metrics)
    }
    
    frameCount.current++
    requestAnimationFrame(updateFPS)
  }, [fpsInterval, onMetricsUpdate])

  const measureRenderTime = useCallback((callback: () => void) => {
    const start = performance.now()
    callback()
    const end = performance.now()
    renderTimeRef.current = end - start
  }, [])

  const getMetrics = useCallback((): PerformanceMetrics => {
    return {
      fps: fpsRef.current,
      memoryUsage: memoryRef.current,
      loadTime: loadTimeRef.current,
      renderTime: renderTimeRef.current
    }
  }, [])

  const logPerformanceWarning = useCallback((metric: keyof PerformanceMetrics, threshold: number, current: number) => {
    if (current > threshold) {
      console.warn(`Performance warning: ${metric} is ${current} (threshold: ${threshold})`)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    // Start FPS monitoring
    const fpsId = requestAnimationFrame(updateFPS)

    // Monitor memory usage periodically
    const memoryId = setInterval(() => {
      if ('memory' in performance) {
        memoryRef.current = (performance as any).memory
        
        // Log warnings for high memory usage
        const memoryUsage = memoryRef.current
        if (memoryUsage) {
          const usagePercent = (memoryUsage.usedJSHeapSize / memoryUsage.jsHeapSizeLimit) * 100
          logPerformanceWarning('memoryUsage', 80, usagePercent)
        }
      }
    }, memoryInterval)

    return () => {
      cancelAnimationFrame(fpsId)
      clearInterval(memoryId)
    }
  }, [enabled, updateFPS, memoryInterval, logPerformanceWarning])

  return {
    getMetrics,
    measureRenderTime,
    logPerformanceWarning
  }
}
