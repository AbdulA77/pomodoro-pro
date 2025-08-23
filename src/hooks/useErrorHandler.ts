import { useCallback } from 'react'
import { toast } from 'sonner'

interface ErrorHandlerOptions {
  showToast?: boolean
  logToConsole?: boolean
  fallbackMessage?: string
}

export const useErrorHandler = () => {
  const handleError = useCallback((
    error: unknown, 
    context?: string, 
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logToConsole = true,
      fallbackMessage = 'An unexpected error occurred'
    } = options

    // Extract error message
    let errorMessage = fallbackMessage
    let errorDetails: string | undefined

    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = error.stack
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message)
    }

    // Log to console if enabled
    if (logToConsole) {
      console.error(`Error${context ? ` in ${context}` : ''}:`, error)
      if (errorDetails) {
        console.error('Stack trace:', errorDetails)
      }
    }

    // Show toast if enabled
    if (showToast) {
      toast.error(errorMessage, {
        description: context ? `Error occurred in ${context}` : undefined,
        duration: 5000,
      })
    }

    // Return error info for further handling
    return {
      message: errorMessage,
      details: errorDetails,
      originalError: error
    }
  }, [])

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error, context, options)
      return null
    }
  }, [handleError])

  const handleNetworkError = useCallback((
    response: Response,
    context?: string
  ) => {
    let errorMessage = 'Network error occurred'
    
    switch (response.status) {
      case 400:
        errorMessage = 'Bad request. Please check your input.'
        break
      case 401:
        errorMessage = 'Authentication required. Please sign in again.'
        break
      case 403:
        errorMessage = 'Access denied. You don\'t have permission for this action.'
        break
      case 404:
        errorMessage = 'Resource not found.'
        break
      case 429:
        errorMessage = 'Too many requests. Please try again later.'
        break
      case 500:
        errorMessage = 'Server error. Please try again later.'
        break
      case 502:
      case 503:
      case 504:
        errorMessage = 'Service temporarily unavailable. Please try again later.'
        break
      default:
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
    }

    handleError(new Error(errorMessage), context, { showToast: true })
  }, [handleError])

  const handleValidationError = useCallback((
    errors: Record<string, string[]>,
    context?: string
  ) => {
    const errorMessages = Object.values(errors).flat()
    const errorMessage = errorMessages.length > 0 
      ? errorMessages.join(', ')
      : 'Validation failed'

    handleError(new Error(errorMessage), context, { showToast: true })
  }, [handleError])

  return {
    handleError,
    handleAsyncError,
    handleNetworkError,
    handleValidationError
  }
}
