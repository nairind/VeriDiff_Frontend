// components/AuthGuard.js - Updated to use modal instead of redirect
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import AuthModal from './AuthModal'

export default function AuthGuard({ children }) {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (status === 'unauthenticated') {
      // Show modal instead of redirecting
      setShowAuthModal(true)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [status])

  const handleAuthModalClose = () => {
    // Only close modal if user is now authenticated
    if (status === 'authenticated') {
      setShowAuthModal(false)
    }
    // If still unauthenticated, keep modal open
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <>
        {/* Show page content in background (blurred/disabled) */}
        <div style={{ 
          filter: 'blur(3px)', 
          pointerEvents: 'none',
          opacity: 0.5 
        }}>
          {children}
        </div>
        
        {/* Auth Modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={handleAuthModalClose}
          initialMode="signup"
        />
      </>
    )
  }

  return children
}

// Usage tracking hook (unchanged)
export function useUsageTracking() {
  const { data: session } = useSession()
  const [usage, setUsage] = useState(null)

  const trackUsage = async () => {
    if (!session) return null

    try {
      const response = await fetch('/api/usage/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to track usage')
      }

      setUsage(data.usage)
      return data.usage

    } catch (error) {
      console.error('Usage tracking error:', error)
      throw error
    }
  }

  const fetchUsage = async () => {
    if (!session) return null

    try {
      const response = await fetch('/api/usage/current')
      const data = await response.json()

      if (response.ok) {
        setUsage(data.usage)
        return data.usage
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error)
    }
    return null
  }

  return { usage, trackUsage, fetchUsage }
}
