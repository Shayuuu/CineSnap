'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundaryClass extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: any): State {
    // Handle cases where non-Error objects are thrown (e.g., Event objects)
    if (error instanceof Error) {
      return { hasError: true, error }
    } else {
      // Convert non-Error values to Error objects
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message 
        ? error.message 
        : error?.toString 
        ? error.toString() 
        : 'An unexpected error occurred'
      
      return { 
        hasError: true, 
        error: new Error(errorMessage) 
      }
    }
  }

  componentDidCatch(error: any, errorInfo: React.ErrorInfo) {
    // Safely log the error
    if (error instanceof Error) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    } else {
      console.error('ErrorBoundary caught a non-Error value:', error, errorInfo)
      // Try to extract useful information
      if (error && typeof error === 'object') {
        try {
          console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
        } catch (e) {
          console.error('Error value:', String(error))
        }
      } else {
        console.error('Error value:', String(error))
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
              <p className="text-white/70 mb-6">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined })
                  window.location.reload()
                }}
                className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-white/90 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

export const ErrorBoundary = ErrorBoundaryClass

