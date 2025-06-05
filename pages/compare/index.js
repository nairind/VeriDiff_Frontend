import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import AuthGuard from '../../components/auth/AuthGuard';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

function ComparisonEngineHub() {
  const { data: session } = useSession();
  
  // UI states
  const [userTier, setUserTier] = useState('free');
  const [hoveredTool, setHoveredTool] = useState(null);

  // Fetch user data
  const fetchUserData = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/usage/current');
      const data = await response.json();
      if (response.ok) {
        setUserTier(data.user?.tier || 'free');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUserData();
    }
  }, [session]);

  // Enhanced tool data with scenarios
  const tools = [
    {
      id: 'spreadsheets',
      title: 'Business Spreadsheets',
      subtitle: 'Excel & CSV Intelligence',
      description: 'Smart mapping, tolerance settings, and business data reconciliation. Perfect for financial analysis, budget variance, and data validation.',
      icon: '📊',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      route: '/compare/spreadsheets',
      features: ['Excel-Excel (FREE Forever)', 'Excel-CSV Cross-Format', 'Smart Header Mapping', 'Tolerance Controls'],
      scenario: 'Budget vs Actual Analysis',
      scenarioDetail: 'Compare Q1 budget.xlsx with actual_spend.csv - automatically map "Department" to "dept_name" and flag 15 over-budget departments',
      stats: { accuracy: '99.7%', timeSaved: '45 minutes', complexity: 'Medium' },
      free: true,
      primaryUse: 'Finance Teams • Budget Analysis • Data Reconciliation'
    },
    {
      id: 'documents',
      title: 'Professional Documents',
      subtitle: 'Contract & Report Analysis',
      description: 'Advanced PDF text extraction and page-by-page comparison for contracts, reports, and legal documents with enterprise accuracy.',
      icon: '📄',
      gradient: 'linear-gradient(135deg, #dc2626, #ea580c)',
      route: '/compare/pdf',
      features: ['PDF Text Extraction', 'Page-by-Page Analysis', 'Large Files (100MB)', 'Contract Change Detection'],
      scenario: 'Contract Version Control',
      scenarioDetail: 'Identify critical changes between Service_Agreement_v2.1.pdf and v2.2.pdf - payment terms changed from 30 to 15 days',
      stats: { accuracy: '99.9%', timeSaved: '2 hours', complexity: 'High' },
      free: false,
      primaryUse: 'Legal Teams • Contract Management • Compliance Review'
    },
    {
      id: 'technical',
      title: 'Technical Data Formats',
      subtitle: 'Developer & Configuration Tools',
      description: 'Format-specific analysis for technical teams. Structure-aware comparison for JSON, XML, and text configurations.',
      icon: '🔧',
      gradient: 'linear-gradient(135deg, #2563eb, #7c3aed)',
      route: '/compare/documents',
      features: ['JSON Structure Analysis', 'XML Schema Validation', 'Text Files (FREE)', 'Configuration Drift Detection'],
      scenario: 'Environment Configuration Audit',
      scenarioDetail: 'Compare prod_config.json vs staging_config.json - detect debug mode enabled and 4 new environment variables',
      stats: { accuracy: '99.8%', timeSaved: '90 minutes', complexity: 'Expert' },
      free: 'partial',
      primaryUse: 'DevOps Teams • System Admins • Technical Documentation'
    }
  ];

  // Enhanced Tool Card Component
  const ToolCard = ({ tool, isHovered }) => {
    const handleToolSelect = () => {
      window.location.href = tool.route;
    };

    return (
      <div
        onClick={handleToolSelect}
        onMouseEnter={() => setHoveredTool(tool.id)}
        onMouseLeave={() => setHoveredTool(null)}
        style={{
          background: 'white',
          borderRadius: '24px',
          padding: '2rem',
          cursor: 'pointer',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          border: isHovered ? '2px solid #2563eb' : '2px solid #e5e7eb',
          boxShadow: isHovered ? '0 25px 50px rgba(37, 99, 235, 0.15)' : '0 8px 32px rgba(0,0,0,0.08)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transform: isHovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated background effect */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-30%',
          width: '200px',
          height: '200px',
          background: tool.gradient,
          borderRadius: '50%',
          opacity: isHovered ? '0.05' : '0',
          transition: 'opacity 0.4s ease',
          zIndex: 1
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header with enhanced styling */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '20px',
              background: tool.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              flexShrink: 0
            }}>
              {tool.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  margin: '0',
                  color: '#1f2937',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>
                  {tool.title}
                </h3>
                {tool.free === true && (
                  <div style={{
                    background: '#dcfce7',
                    color: '#166534',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}>
                    FREE
                  </div>
                )}
                {tool.free === 'partial' && (
                  <div style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}>
                    FREEMIUM
                  </div>
                )}
              </div>
              <p style={{
                fontSize: '1rem',
                color: '#6b7280',
                margin: '0',
                fontWeight: '500',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                {tool.subtitle}
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: '#9ca3af',
                margin: '0.5rem 0 0 0',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                {tool.primaryUse}
              </p>
            </div>
          </div>

          {/* Description */}
          <p style={{
            fontSize: '1rem',
            color: '#374151',
            lineHeight: '1.6',
            marginBottom: '1.5rem',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            {tool.description}
          </p>

          {/* Scenario Showcase */}
          <div style={{
            background: '#f8fafc',
            padding: '1.25rem',
            borderRadius: '16px',
            marginBottom: '1.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 0.75rem 0',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              💡 Real-World Scenario: {tool.scenario}
            </h4>
            <p style={{
              fontSize: '0.85rem',
              color: '#4b5563',
              margin: '0 0 1rem 0',
              lineHeight: '1.5',
              fontStyle: 'italic',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              {tool.scenarioDetail}
            </p>
            
            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#059669' }}>{tool.stats.accuracy}</div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Accuracy</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#2563eb' }}>{tool.stats.timeSaved}</div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Time Saved</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#7c3aed' }}>{tool.stats.complexity}</div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Complexity</div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div style={{ marginBottom: '1.5rem', flex: 1 }}>
            <h4 style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 0.75rem 0',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Key Capabilities:
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.5rem'
            }}>
              {tool.features.map((feature, index) => (
                <div key={index} style={{
                  fontSize: '0.8rem',
                  color: '#059669',
                  background: '#f0fdf4',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #bbf7d0',
                  fontWeight: '500',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>
                  • {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced CTA Button */}
          <button
            style={{
              background: tool.gradient,
              color: 'white',
              border: 'none',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              width: '100%',
              transform: isHovered ? 'scale(1.02)' : 'scale(1)',
              boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.1)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            Launch {tool.title} →
          </button>
        </div>
      </div>
    );
  };

  // Responsive styles
  const containerStyle = {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const heroStyle = {
    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #ec4899 100%)',
    padding: '4rem 0',
    textAlign: 'center',
    color: 'white',
    position: 'relative',
    overflow: 'hidden'
  };

  // Enhanced media queries
  const mediaQueries = `
    @media (max-width: 768px) {
      .tools-grid { grid-template-columns: 1fr !important; }
      .hero-title { font-size: 2.5rem !important; }
      .hero-section { padding: 3rem 0 !important; }
      .main-container { padding: 2rem 1rem !important; }
      .scenario-stats { grid-template-columns: 1fr !important; gap: 0.5rem !important; }
      .feature-grid { grid-template-columns: 1fr !important; }
      .trust-indicators { flex-direction: column !important; gap: 1rem !important; }
      .value-props { grid-template-columns: 1fr !important; }
    }
    
    @media (max-width: 480px) {
      .hero-title { font-size: 2rem !important; }
      .hero-section { padding: 2.5rem 0 !important; }
      .main-container { padding: 1.5rem 0.75rem !important; }
      .tool-card { padding: 1.5rem !important; }
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      .tools-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .hero-title { font-size: 3rem !important; }
    }

    /* Enhanced animations */
    .tool-card {
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .floating-element {
      animation: float 6s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    .pulse-glow {
      animation: pulseGlow 3s ease-in-out infinite;
    }
    
    @keyframes pulseGlow {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }

    .fade-in-up {
      animation: fadeInUp 0.8s ease-out;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  return (
    <AuthGuard>
      <div style={containerStyle}>
        <Head>
          <title>VeriDiff Comparison Engine - Choose Your Professional Tool | Excel, PDF, JSON Comparison</title>
          <meta name="description" content="Professional file comparison tools for business teams. Excel comparison free forever, PDF and technical formats £19/month. Built by London security experts for global professionals." />
          <meta name="keywords" content="excel comparison tool, pdf comparison, json xml comparison, file diff tool, business document comparison, secure file comparison" />
          <meta name="robots" content="index, follow" />
          <meta property="og:title" content="VeriDiff Comparison Engine - Professional File Comparison Tools" />
          <meta property="og:description" content="Choose your specialized comparison tool. Excel free forever, all formats £19/month. Enterprise-grade privacy, locally processed." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://veridiff.com/compare" />
          
          {/* Schema.org structured data */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "VeriDiff Comparison Engine",
              "description": "Professional file comparison tools for Excel, PDF, JSON, XML and other business formats",
              "url": "https://veridiff.com/compare",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Comparison Tools",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "SoftwareApplication",
                      "name": "Business Spreadsheets Tool",
                      "description": "Excel and CSV comparison with smart mapping"
                    },
                    "price": "0",
                    "priceCurrency": "GBP"
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "SoftwareApplication", 
                      "name": "Professional Documents Tool",
                      "description": "PDF and document comparison"
                    },
                    "price": "19",
                    "priceCurrency": "GBP"
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "SoftwareApplication",
                      "name": "Technical Data Formats Tool", 
                      "description": "JSON, XML and configuration file comparison"
                    },
                    "price": "19",
                    "priceCurrency": "GBP"
                  }
                ]
              }
            })}
          </script>
          
          <style>{mediaQueries}</style>
        </Head>

        <Header />

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
              🔒 Enterprise-Grade Privacy: All file processing happens in your browser. We never see, store, or access your data.
            </p>
          </div>
        </div>

        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0' }} className="main-container">
          
          {/* Enhanced Hero Section */}
          <section style={heroStyle} className="hero-section">
            {/* Background decorations */}
            <div style={{
              position: 'absolute',
              top: '-30%',
              left: '-20%',
              width: '600px',
              height: '600px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%'
            }} className="floating-element" />
            <div style={{
              position: 'absolute',
              bottom: '-40%',
              right: '-30%',
              width: '800px',
              height: '800px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
              borderRadius: '50%'
            }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 2 }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                background: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '2rem', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                marginBottom: '2rem', 
                gap: '0.5rem',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                ⚡ London-Engineered for Global Professional Teams
              </div>
              
              <h1 style={{
                fontSize: '3.5rem',
                fontWeight: '700',
                marginBottom: '1.5rem',
                lineHeight: '1.2',
                textShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }} className="hero-title fade-in-up">
                Choose Your Specialized
                <span style={{ 
                  display: 'block',
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent', 
                  backgroundClip: 'text'
                }}>
                  Comparison Engine
                </span>
              </h1>
              
              <p style={{
                fontSize: '1.3rem',
                opacity: '0.9',
                lineHeight: '1.6',
                maxWidth: '700px',
                margin: '0 auto 2.5rem auto'
              }}>
                Each tool is precision-engineered for specific file types and professional use cases.
                <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '1.1rem', opacity: '0.8' }}>
                  Start free with Excel • Upgrade to save £26/month vs separate tools
                </span>
              </p>

              {/* Trust indicators */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '2rem',
                fontSize: '0.95rem',
                opacity: '0.85',
                marginBottom: '2rem'
              }} className="trust-indicators">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                  <span>Built by Security Experts</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                  <span>Enterprise-Grade Standards</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                  <span>Trusted by Early Access Partners</span>
                </div>
              </div>

              {/* Value proposition highlight */}
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '1rem',
                padding: '1.5rem',
                border: '1px solid rgba(255,255,255,0.2)',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                <div style={{ fontSize: '1rem', marginBottom: '0.5rem', opacity: '0.9' }}>
                  💰 Why pay £45/month for multiple tools?
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                  Get everything for £19/month • Save £312/year
                </div>
              </div>
            </div>
          </section>

          {/* Enhanced Tools Grid */}
          <section style={{ padding: '4rem 2rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '2.5rem',
              marginBottom: '4rem'
            }} className="tools-grid">
              {tools.map((tool) => (
                <ToolCard 
                  key={tool.id} 
                  tool={tool} 
                  isHovered={hoveredTool === tool.id}
                />
              ))}
            </div>

            {/* Value Propositions Section */}
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: '3rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb',
              marginBottom: '3rem'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '2rem',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Why Choose VeriDiff?
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
              }} className="value-props">
                <div style={{
                  textAlign: 'center',
                  padding: '1.5rem'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    margin: '0 auto 1rem auto'
                  }}>
                    🎯
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                    Start Free, Scale Smart
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    Excel comparison free forever. Upgrade only when you need PDF, JSON, or XML comparison.
                  </p>
                </div>

                <div style={{
                  textAlign: 'center',
                  padding: '1.5rem'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #dc2626, #ea580c)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    margin: '0 auto 1rem auto'
                  }}>
                    🔒
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                    Complete Privacy
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    Files processed locally in your browser. No uploads, no cloud storage, no data access.
                  </p>
                </div>

                <div style={{
                  textAlign: 'center',
                  padding: '1.5rem'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    margin: '0 auto 1rem auto'
                  }}>
                    💰
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                    Save £312/Year
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    One tool replaces multiple subscriptions. Professional-grade features without the premium price.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
              borderRadius: '24px',
              padding: '3rem',
              textAlign: 'center',
              border: '1px solid #cbd5e1'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                margin: '0 0 1rem 0',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Ready to Stop Overpaying?
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#6b7280',
                margin: '0 0 2rem 0',
                maxWidth: '600px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                Start with Excel comparison (free forever), then upgrade to unlock all file formats and save £26/month vs buying tools separately.
              </p>
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <Link href="/compare/spreadsheets" style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  transition: 'all 0.2s',
                  minWidth: '240px',
                  display: 'inline-block'
                }}>
                  🎯 Start Free with Excel
                </Link>
                <Link href="/pricing" style={{
                  background: 'white',
                  color: '#374151',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  border: '2px solid #e5e7eb',
                  transition: 'all 0.2s',
                  minWidth: '200px',
                  display: 'inline-block'
                }}>
                  🚀 View All Pricing
                </Link>
              </div>
              
              <div style={{
                marginTop: '2rem',
                fontSize: '0.9rem',
                color: '#9ca3af'
              }}>
                ✓ No credit card required for Excel comparison • ✓ 30-day money-back guarantee on premium
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
}

export default ComparisonEngineHub;
