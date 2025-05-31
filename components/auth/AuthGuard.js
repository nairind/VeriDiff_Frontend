import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function AuthGuard({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (status === 'unauthenticated') {
      // Redirect to signup page
      router.push('/auth/signup')
    } else {
      setLoading(false)
    }
  }, [status, router])

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
    return null // Will redirect
  }

  return children
}

// Usage tracking hook
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
