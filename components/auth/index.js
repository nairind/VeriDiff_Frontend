import React, { useState } from 'react';

// ===========================================
// REGISTRATION MODAL COMPONENT
// ===========================================

export const RegistrationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone_number: '',
    company_name: '',
    job_title: '',
    how_heard_about_us: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const hearAboutOptions = [
    'Google Search',
    'LinkedIn',
    'Twitter/X',
    'Referral from colleague',
    'Industry publication/blog',
    'Conference or event',
    'Paid advertisement',
    'Direct outreach/email',
    'Word of mouth',
    'Other'
  ];

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          returnUrl: '/compare'
        })
      });

      if (response.ok) {
        setMessage('Magic link sent! Check your email to complete registration.');
        setTimeout(() => {
          onSuccess && onSuccess();
          onClose();
        }, 2000);
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to send magic link');
      }
    } catch (error) {
      setMessage('Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          padding: '2rem',
          borderRadius: '1rem 1rem 0 0',
          textAlign: 'center'
        }}>
          <h2 style={{
            color: 'white',
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '700'
          }}>
            Impressed? Create Your Free Account
          </h2>
          <p style={{
            color: '#bfdbfe',
            margin: '0.5rem 0 0',
            fontSize: '0.875rem'
          }}>
            Get 5 comparisons per month + advanced features
          </p>
        </div>

        <div style={{ padding: '2rem' }}>
          <div style={{
            background: '#f0fdf4',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#166534',
              fontWeight: '500'
            }}>
              🔒 Your files stay private - processed locally in your browser
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Full Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Company Name
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Job Title
              </label>
              <input
                type="text"
                value={formData.job_title}
                onChange={(e) => handleChange('job_title', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => handleChange('phone_number', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              How did you hear about us?
            </label>
            <select
              value={formData.how_heard_about_us}
              onChange={(e) => handleChange('how_heard_about_us', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                outline: 'none',
                background: 'white',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Select an option</option>
              {hearAboutOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Maybe Later
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 2,
                padding: '0.75rem',
                background: loading ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
            </button>
          </div>

          {message && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: message.includes('sent') ? '#dcfce7' : '#fef2f2',
              color: message.includes('sent') ? '#166534' : '#dc2626',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1.25rem'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// ===========================================
// FEEDBACK MODAL COMPONENT
// ===========================================

export const FeedbackModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [otherReason, setOtherReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const feedbackReasons = [
    'Too complicated to set up',
    "Didn't see enough value",
    'Need to discuss with team',
    'Pricing concerns',
    'Missing a feature I need',
    'Just testing/researching',
    'Security concerns',
    'Found a different solution'
  ];

  const handleReasonChange = (reason) => {
    setSelectedReasons(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const reasons = [...selectedReasons];
      if (otherReason.trim()) {
        reasons.push(`Other: ${otherReason.trim()}`);
      }

      await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          feedback_type: 'exit_intent',
          feedback_text: otherReason.trim(),
          selected_reasons: reasons
        })
      });

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Feedback submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        maxWidth: '450px',
        width: '90%',
        position: 'relative',
        padding: '2rem'
      }}>
        {!submitted ? (
          <>
            <h3 style={{
              color: '#1f2937',
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              Quick feedback to help us improve VeriDiff
            </h3>
            
            <p style={{
              color: '#6b7280',
              fontSize: '0.875rem',
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              What prevented you from creating an account today?
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              {feedbackReasons.map(reason => (
                <label
                  key={reason}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => handleReasonChange(reason)}
                >
                  <input
                    type="checkbox"
                    checked={selectedReasons.includes(reason)}
                    onChange={() => handleReasonChange(reason)}
                    style={{ marginRight: '0.75rem' }}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                    {reason}
                  </span>
                </label>
              ))}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Other reason (optional):
              </label>
              <textarea
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Tell us more..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Email (optional - for follow-up):
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Skip
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: loading ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Sending...' : 'Send Feedback'}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              ✨
            </div>
            <h3 style={{
              color: '#059669',
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Thank you for your feedback!
            </h3>
            <p style={{
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              Your insights help us improve VeriDiff for everyone.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '1.25rem'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};
