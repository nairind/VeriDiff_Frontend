// components/AuthModal.js
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }) {
  const [mode, setMode] = useState(initialMode) // 'signin' or 'signup'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
      })
      setError('')
      setLoading(false)
      setMode(initialMode)
    }
  }, [isOpen, initialMode])

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Prevent background scroll
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      setLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.ok) {
        onClose() // Close modal on success
      } else {
        setError('Invalid email or password')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      // Create user account
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      // Auto sign in after successful registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.ok) {
        onClose() // Close modal on success
      } else {
        setError('Registration successful, but login failed. Please try signing in.')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
      onClick={handleBackdropClick}
    >
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
        position: 'relative',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#6b7280',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          ×
        </button>

        <div style={{ padding: '3rem 3rem 2rem 3rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#1f2937', 
              margin: 0 
            }}>
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p style={{ 
              color: '#6b7280', 
              margin: '0.5rem 0 0',
              fontSize: '0.95rem'
            }}>
              {mode === 'signin' 
                ? 'Sign in to unlock all results' 
                : 'Start comparing files for free'
              }
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem',
              color: '#dc2626',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          {/* Forms */}
          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}>
            {/* Full Name (signup only) */}
            {mode === 'signup' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'block', 
                  fontWeight: '500', 
                  marginBottom: '0.5rem', 
                  color: '#374151',
                  fontSize: '0.9rem'
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '500', 
                marginBottom: '0.5rem', 
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '500', 
                marginBottom: '0.5rem', 
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
                placeholder={mode === 'signup' ? "Create a password (min 6 characters)" : "Enter your password"}
              />
            </div>

            {/* Confirm Password (signup only) */}
            {mode === 'signup' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'block', 
                  fontWeight: '500', 
                  marginBottom: '0.5rem', 
                  color: '#374151',
                  fontSize: '0.9rem'
                }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                padding: '0.875rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '1rem'
              }}
            >
              {loading 
                ? (mode === 'signin' ? 'Signing In...' : 'Creating Account...') 
                : (mode === 'signin' ? 'Sign In' : 'Create Account')
              }
            </button>
          </form>

          {/* Mode Switch */}
          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          {/* Privacy Message (signup only) */}
          {mode === 'signup' && (
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              border: '2px solid #3b82f6',
              padding: '1rem',
              borderRadius: '0.75rem',
              marginTop: '1.5rem'
            }}>
              <div style={{
                textAlign: 'center',
                color: '#1e40af',
                fontSize: '0.85rem',
                lineHeight: '1.4'
              }}>
                <div style={{ 
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  marginBottom: '0.25rem'
                }}>
                  🔒 Privacy at its highest
                </div>
                <div style={{ fontWeight: '600' }}>
                  Comparison data <strong>never leaves your browser</strong>
                </div>
                <div style={{ 
                  fontSize: '0.8rem',
                  marginTop: '0.25rem',
                  opacity: '0.9'
                }}>
                  100% client-side processing • Your files stay private
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
