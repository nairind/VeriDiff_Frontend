import React from 'react';

export default function PricingSection({ file1, file2, onCompare }) {
  return (
    <section style={{
      padding: '5rem 0',
      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        
        {/* Section Header */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '2px solid #f59e0b',
            borderRadius: '50px',
            padding: '0.5rem 1.5rem',
            marginBottom: '2rem'
          }}>
            <span style={{ fontSize: '1.2rem' }}>🚀</span>
            <span style={{ fontWeight: '700', color: '#92400e' }}>Launch Pricing - Limited Time</span>
          </div>
          
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '800',
            marginBottom: '1rem',
            color: '#1f2937'
          }}>
            Enterprise Precision at
            <span style={{
              display: 'block',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Breakthrough Pricing
            </span>
          </h2>
          
          <p style={{
            fontSize: '1.3rem',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Start with 3 free precision comparisons. Experience enterprise-grade capabilities before you commit.
          </p>
        </div>

        {/* Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          
          {/* Starter Plan */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            border: '2px solid #e5e7eb',
            position: 'relative',
            textAlign: 'left'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '25px',
              display: 'inline-block',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '1.5rem'
            }}>
              INDIVIDUAL
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: '800',
                color: '#1f2937',
                lineHeight: '1'
              }}>
                £19
                <span style={{
                  fontSize: '1.2rem',
                  fontWeight: '500',
                  color: '#6b7280'
                }}>/month</span>
              </div>
              <p style={{
                color: '#6b7280',
                fontSize: '1rem',
                margin: '0.5rem 0'
              }}>
                Professional precision for individual users
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#166534',
                  marginBottom: '0.5rem'
                }}>
                  ✓ 3 Free Comparisons to Start
                </div>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#166534',
                  margin: 0
                }}>
                  Test our precision before you pay
                </p>
              </div>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {[
                  'Unlimited file comparisons',
                  'Character-level precision detection',
                  'Smart sheet selection',
                  'Configurable tolerance settings',
                  'Professional HTML & Excel reports',
                  'Cross-format support (Excel↔CSV↔PDF)',
                  'Local processing (bank-level security)'
                ].map((feature, index) => (
                  <li key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 0',
                    fontSize: '0.95rem',
                    color: '#374151'
                  }}>
                    <span style={{ color: '#10b981', fontSize: '1.2rem' }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button style={{
              width: '100%',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }} onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.4)';
            }} onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}>
              Start Free Trial
            </button>
          </div>

          {/* Professional Plan - Most Popular */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 20px 60px rgba(124, 58, 237, 0.15)',
            border: '3px solid #7c3aed',
            position: 'relative',
            textAlign: 'left',
            transform: 'scale(1.05)'
          }}>
            
            {/* Most Popular Badge */}
            <div style={{
              position: 'absolute',
              top: '-15px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              color: 'white',
              padding: '0.5rem 2rem',
              borderRadius: '25px',
              fontSize: '0.9rem',
              fontWeight: '700',
              boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
            }}>
              MOST POPULAR
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '25px',
              display: 'inline-block',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              marginTop: '1rem'
            }}>
              PROFESSIONAL
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: '800',
                color: '#1f2937',
                lineHeight: '1'
              }}>
                £39
                <span style={{
                  fontSize: '1.2rem',
                  fontWeight: '500',
                  color: '#6b7280'
                }}>/month</span>
              </div>
              <p style={{
                color: '#6b7280',
                fontSize: '1rem',
                margin: '0.5rem 0'
              }}>
                For teams up to 5 users (£7.80 per user)
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #fef7ff, #fae8ff)',
                border: '2px solid #7c3aed',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#7c3aed',
                  marginBottom: '0.5rem'
                }}>
                  ✓ Everything in Individual, Plus:
                </div>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#7c3aed',
                  margin: 0
                }}>
                  Team collaboration & advanced features
                </p>
              </div>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {[
                  'Up to 5 user accounts',
                  'Team collaboration features',
                  'Advanced tolerance configurations',
                  'Batch processing capabilities',
                  'Priority email support',
                  'Custom export formats',
                  'Usage analytics & reporting'
                ].map((feature, index) => (
                  <li key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 0',
                    fontSize: '0.95rem',
                    color: '#374151'
                  }}>
                    <span style={{ color: '#7c3aed', fontSize: '1.2rem' }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button style={{
              width: '100%',
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }} onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 25px rgba(124, 58, 237, 0.4)';
            }} onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}>
              Start Professional Trial
            </button>
          </div>

          {/* Enterprise Plan */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            border: '2px solid #e5e7eb',
            position: 'relative',
            textAlign: 'left'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #111827, #374151)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '25px',
              display: 'inline-block',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '1.5rem'
            }}>
              ENTERPRISE
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                fontSize: '2.2rem',
                fontWeight: '800',
                color: '#1f2937',
                lineHeight: '1',
                marginBottom: '0.5rem'
              }}>
                Custom Pricing
              </div>
              <p style={{
                color: '#6b7280',
                fontSize: '1rem',
                margin: 0
              }}>
                Tailored solutions for large organizations
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  ✓ Everything in Professional, Plus:
                </div>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Enterprise-grade security & compliance
                </p>
              </div>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {[
                  'Unlimited users',
                  'On-premise deployment options',
                  'SSO & advanced authentication',
                  'Custom API integrations',
                  'Dedicated support manager',
                  'SLA guarantees',
                  'Compliance certifications (SOC2, GDPR)'
                ].map((feature, index) => (
                  <li key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 0',
                    fontSize: '0.95rem',
                    color: '#374151'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '1.2rem' }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button style={{
              width: '100%',
              background: 'linear-gradient(135deg, #111827, #374151)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }} onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 25px rgba(17, 24, 39, 0.4)';
            }} onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}>
              Contact Sales
            </button>
          </div>
        </div>

        {/* Trust & Guarantee Section */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            alignItems: 'center'
          }}>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
                Risk-Free Trial
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>
                3 free comparisons to test our precision before you commit to any plan
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
                Flexible Cancellation
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>
                Cancel anytime with 30-day notice. No hidden fees or complicated refunds
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛡️</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
                Data Security
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>
                All processing happens locally in your browser. Your data never leaves your device
              </p>
            </div>
            
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: '1.1rem',
            color: '#6b7280',
            marginBottom: '1.5rem'
          }}>
            Ready to experience enterprise-grade precision? Start with 3 free comparisons.
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <button style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              Start Free Trial
            </button>
            
            <button style={{
              background: 'transparent',
              color: '#6b7280',
              border: '2px solid #d1d5db',
              borderRadius: '12px',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
