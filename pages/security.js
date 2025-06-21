import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function SecurityAssessment() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('veridiff_token');
      if (token) {
        const response = await fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('veridiff_token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleSignIn = () => {
    window.location.href = '/api/auth/signin';
  };

  const handleSignUp = () => {
    window.location.href = '/api/auth/signup';
  };

  return (
    <>
      <Head>
        <title>Security Assessment - Independent Third-Party Security Validation | VeriDiff</title>
        <meta name="description" content="VeriDiff undergoes regular independent security assessments. View our third-party security scores, malware scans, and blacklist checks from trusted security providers." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ 
        minHeight: '100vh', 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: 0,
        padding: 0,
        color: '#1f2937'
      }}>
        <Header onSignIn={handleSignIn} onSignUp={handleSignUp} />

        {/* Security Trust Banner */}
        <div style={{
          background: '#dcfce7',
          borderBottom: '1px solid #bbf7d0',
          padding: '0.75rem 0',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#166534',
              fontWeight: '500'
            }}>
              🛡️ Independently Verified: Third-party security assessments confirm VeriDiff meets enterprise security standards.
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #eff6ff, #f8fafc)',
          padding: '4rem 0',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              color: '#1f2937',
              lineHeight: '1.2'
            }}>
              Independent Security Assessment
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#6b7280',
              lineHeight: '1.7',
              marginBottom: '2rem'
            }}>
              VeriDiff undergoes regular third-party security evaluations to ensure we meet 
              the highest standards for enterprise data protection and application security. 
              <strong>Verify our claims yourself with live, independent security assessments.</strong>
            </p>
          </div>
        </section>

        {/* Trust Statement */}
        <section style={{
          padding: '3rem 0',
          background: 'white'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <div style={{
              background: '#f0fdf4',
              border: '2px solid #10b981',
              borderRadius: '1rem',
              padding: '2rem',
              marginBottom: '3rem',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#047857',
                marginBottom: '1rem'
              }}>
                ✅ Enterprise-Ready Security Architecture
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#047857',
                lineHeight: '1.6',
                margin: '0 0 1.5rem 0'
              }}>
                Built from the ground up to meet the rigorous security and data privacy requirements expected by all.
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#047857'
              }}>
                <span>Security Headers: A Grade (Snyk)</span>
                <span>•</span>
                <span>No Malware Found (Sucuri)</span>
                <span>•</span>
                <span>0/39 Blacklist Check (VirusTotal)</span>
              </div>
            </div>

            <div style={{
              background: '#eff6ff',
              border: '1px solid #dbeafe',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1e40af',
                marginBottom: '0.75rem'
              }}>
                🔍 Verify Our Security Claims
              </h3>
              <p style={{
                fontSize: '0.95rem',
                color: '#1e40af',
                lineHeight: '1.5',
                margin: '0'
              }}>
                Don't take our word for it. Click the links below to view live, real-time security assessments 
                from independent third-party providers. We update our scores regularly and encourage you to verify them directly.
              </p>
            </div>
          </div>
        </section>

        {/* Security Assessment Results */}
        <section style={{
          padding: '3rem 0',
          background: '#f8fafc'
        }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '2rem',
              color: '#1f2937',
              textAlign: 'center'
            }}>
              Third-Party Security Assessments
            </h2>
            
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '3rem',
              lineHeight: '1.6'
            }}>
              We believe in transparency. These independent assessments are performed by leading 
              security organizations. <strong>Click the "View Live Report" links below to see real-time results</strong> and verify our security claims for yourself.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              {/* Security Headers Assessment */}
              <div style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      borderRadius: '50%',
                      width: '60px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      color: 'white',
                      fontWeight: '700'
                    }}>A</div>
                    <div>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0'
                      }}>Security Headers</h3>
                      <p style={{
                        fontSize: '0.9rem',
                        color: '#6b7280',
                        margin: '0'
                      }}>by Snyk</p>
                    </div>
                  </div>
                  <div style={{
                    background: '#f0fdf4',
                    color: '#047857',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    Grade A
                  </div>
                </div>
                
                <p style={{
                  fontSize: '1rem',
                  color: '#4b5563',
                  lineHeight: '1.6',
                  marginBottom: '1.5rem'
                }}>
                  Comprehensive analysis of HTTP security headers including Content Security Policy, 
                  Permissions Policy, and Strict Transport Security.
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    background: '#f0fdf4',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '600' }}>✓ CSP</div>
                  </div>
                  <div style={{
                    background: '#f0fdf4',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '600' }}>✓ HSTS</div>
                  </div>
                  <div style={{
                    background: '#f0fdf4',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '600' }}>✓ X-Frame</div>
                  </div>
                  <div style={{
                    background: '#f0fdf4',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '600' }}>✓ Referrer</div>
                  </div>
                </div>

                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '0.5rem'
                }}>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: '0 0 0.75rem 0'
                  }}>
                    <strong>Scores updated regularly.</strong> Click below for live results.
                  </p>
                  <a 
                    href="https://securityheaders.com/?q=veridiff.com&followRedirects=on" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      fontSize: '0.9rem',
                      color: '#fff',
                      backgroundColor: '#3b82f6',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      textDecoration: 'none',
                      fontWeight: '600'
                    }}
                  >
                    View Live Report →
                  </a>
                </div>
              </div>

              {/* Malware & Safety Assessment */}
              <div style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      borderRadius: '0.75rem',
                      width: '60px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>🛡️</div>
                    <div>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0'
                      }}>Malware & Safety</h3>
                      <p style={{
                        fontSize: '0.9rem',
                        color: '#6b7280',
                        margin: '0'
                      }}>Multiple Providers</p>
                    </div>
                  </div>
                  <div style={{
                    background: '#f0fdf4',
                    color: '#047857',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    Clean
                  </div>
                </div>

                <p style={{
                  fontSize: '1rem',
                  color: '#4b5563',
                  lineHeight: '1.6',
                  marginBottom: '1.5rem'
                }}>
                  Regular scanning by leading security providers to detect malware, 
                  phishing attempts, and blacklist status across security databases.
                </p>

                <div style={{
                  display: 'grid',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>VirusTotal Scan</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#047857' }}>0/39 Detections</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Google Safe Browsing</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#047857' }}>No Unsafe Content</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Sucuri Malware Scan</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#047857' }}>No Malware Found</span>
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '0.5rem'
                }}>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: '0 0 1rem 0'
                  }}>
                    <strong>Live scanning results.</strong> Verify current status:
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    flexWrap: 'wrap'
                  }}>
                    <a 
                      href="https://www.virustotal.com/gui/domain/veridiff.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.8rem',
                        color: '#fff',
                        backgroundColor: '#10b981',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '0.25rem',
                        textDecoration: 'none',
                        fontWeight: '500'
                      }}
                    >
                      VirusTotal Check
                    </a>
                    <a 
                      href="https://transparencyreport.google.com/safe-browsing/search?url=https%3A%2F%2Fwww.veridiff.com%2F" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.8rem',
                        color: '#fff',
                        backgroundColor: '#10b981',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '0.25rem',
                        textDecoration: 'none',
                        fontWeight: '500'
                      }}
                    >
                      Google Safe Browsing
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Infrastructure Security */}
            <div style={{
              background: 'white',
              padding: '2.5rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                Infrastructure Security Assessment
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem'
              }}>
                <div style={{
                  textAlign: 'center',
                  padding: '1.5rem'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    marginBottom: '0.5rem'
                  }}>🔒</div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.5rem'
                  }}>SSL/TLS Grade</h4>
                  <p style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#10b981',
                    margin: '0'
                  }}>A+</p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: '0.25rem 0 0.75rem 0'
                  }}>Qualys SSL Labs</p>
                  <a 
                    href="https://www.ssllabs.com/ssltest/analyze.html?d=veridiff.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.75rem',
                      color: '#3b82f6',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}
                  >
                    Test Live →
                  </a>
                </div>

                <div style={{
                  textAlign: 'center',
                  padding: '1.5rem'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    marginBottom: '0.5rem'
                  }}>🌐</div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.5rem'
                  }}>CDN Security</h4>
                  <p style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#10b981',
                    margin: '0'
                  }}>✓ Enabled</p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: '0.25rem 0 0 0'
                  }}>DDoS Protection</p>
                </div>

                <div style={{
                  textAlign: 'center',
                  padding: '1.5rem'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    marginBottom: '0.5rem'
                  }}>📊</div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.5rem'
                  }}>Uptime</h4>
                  <p style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#10b981',
                    margin: '0'
                  }}>99.9%</p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: '0.25rem 0 0 0'
                  }}>30-day average</p>
                </div>

                <div style={{
                  textAlign: 'center',
                  padding: '1.5rem'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    marginBottom: '0.5rem'
                  }}>🏢</div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.5rem'
                  }}>Hosting</h4>
                  <p style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#10b981',
                    margin: '0'
                  }}>Vercel</p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: '0.25rem 0 0 0'
                  }}>Enterprise Cloud</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Independent Assessment Matters */}
        <section style={{
          padding: '3rem 0',
          background: 'white'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '2rem',
              color: '#1f2937',
              textAlign: 'center'
            }}>
              Why Independent Assessment Matters
            </h2>

            <div style={{
              display: 'grid',
              gap: '2rem'
            }}>
              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🎯 Objective Validation
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#4b5563',
                  lineHeight: '1.6',
                  margin: '0'
                }}>
                  Third-party security assessments provide unbiased evaluation of our security posture. 
                  These assessments are conducted by recognized security organizations with no vested 
                  interest in our success, ensuring objective and credible results.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🏢 Enterprise Trust
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#4b5563',
                  lineHeight: '1.6',
                  margin: '0'
                }}>
                  Corporate security teams rely on standardized assessments from trusted providers 
                  when evaluating vendor security. Our consistent high scores across multiple platforms 
                  demonstrate our commitment to maintaining enterprise-grade security standards.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🔄 Continuous Monitoring
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#4b5563',
                  lineHeight: '1.6',
                  margin: '0'
                }}>
                  Security is not a one-time achievement. These assessments run continuously, 
                  monitoring for new threats, vulnerabilities, and ensuring our security measures 
                  remain effective as the threat landscape evolves.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Assessment Schedule */}
        <section style={{
          padding: '3rem 0',
          background: '#f8fafc'
        }}>
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '0 20px',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '2rem',
              color: '#1f2937'
            }}>
              Live Security Monitoring
            </h2>
            
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'grid',
                gap: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '0.5rem'
                }}>
                  <span style={{ fontSize: '1rem', color: '#4b5563' }}>Security Headers</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1f2937' }}>Live Results</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '0.5rem'
                }}>
                  <span style={{ fontSize: '1rem', color: '#4b5563' }}>Malware Scanning</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1f2937' }}>Live Results</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '0.5rem'
                }}>
                  <span style={{ fontSize: '1rem', color: '#4b5563' }}>SSL/TLS Assessment</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1f2937' }}>Live Results</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '0.5rem'
                }}>
                  <span style={{ fontSize: '1rem', color: '#4b5563' }}>Blacklist Monitoring</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1f2937' }}>Real-Time</span>
                </div>
              </div>
              
              <p style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                margin: '1.5rem 0 0 0',
                fontStyle: 'italic'
              }}>
                <strong>100% Transparent:</strong> All results are publicly verifiable through the respective security provider websites. 
                We update our displayed scores regularly, but click the links above for real-time verification.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
