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
          }} className="tool-header">
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
          }} className="scenario-showcase">
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
            }} className="stats-grid">
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
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem'
            }} className="capabilities-grid">
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

  // Enhanced media queries with better responsive design
  const mediaQueries = `
    @media (max-width: 1200px) {
      .tools-grid { 
        grid-template-columns: 1fr !important; 
        gap: 2rem !important;
        max-width: 600px !important;
        margin: 0 auto 4rem auto !important;
      }
    }
    
    @media (max-width: 768px) {
      .tools-grid { 
        grid-template-columns: 1fr !important; 
        gap: 1.5rem !important;
        padding: 0 1rem !important;
      }
      .hero-title { font-size: 2.5rem !important; }
      .hero-section { padding: 3rem 0 !important; }
      .main-container { padding: 2rem 1rem !important; }
      .scenario-stats { grid-template-columns: 1fr !important; gap: 0.5rem !important; }
      .feature-grid { grid-template-columns: 1fr !important; gap: 0.5rem !important; }
      .trust-indicators { 
        flex-direction: column !important; 
        gap: 1rem !important;
        align-items: center !important;
      }
      .value-props { grid-template-columns: 1fr !important; }
      .tool-card { 
        padding: 1.5rem !important;
        margin-bottom: 1rem !important;
      }
      .tool-header {
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
        gap: 1rem !important;
      }
      .capabilities-grid {
        grid-template-columns: 1fr !important;
        gap: 0.5rem !important;
      }
    }
    
    @media (max-width: 480px) {
      .hero-title { font-size: 2rem !important; }
      .hero-section { padding: 2.5rem 0 !important; }
      .main-container { padding: 1.5rem 0.75rem !important; }
      .tool-card { 
        padding: 1.25rem !important;
        border-radius: 16px !important;
      }
      .trust-indicators {
        gap: 0.75rem !important;
      }
      .trust-indicators > div {
        font-size: 0.85rem !important;
      }
      .scenario-showcase {
        padding: 1rem !important;
      }
      .stats-grid {
        grid-template-columns: 1fr !important;
        gap: 0.5rem !important;
        text-align: center !important;
      }
    }
    
    @media (min-width: 1201px) {
      .tools-grid { 
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 2.5rem !important;
      }
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
          <title>File Comparison Tools | Excel, PDF, JSON, XML Comparison Software | VeriDiff</title>
          <meta name="description" content="Professional file comparison software for business teams. Compare Excel spreadsheets (free), PDF documents, JSON/XML files. Secure browser-based processing. Save £312/year vs separate tools." />
          <meta name="keywords" content="file comparison tool, excel comparison software, pdf document comparison, json xml diff tool, spreadsheet comparison, document diff, business file analysis, secure file comparison, data reconciliation tool" />
          <meta name="robots" content="index, follow" />
          <meta property="og:title" content="Professional File Comparison Tools - Excel, PDF, JSON, XML | VeriDiff" />
          <meta property="og:description" content="Compare business files securely in your browser. Excel comparison free forever. PDF, JSON, XML tools £19/month. Save £312/year vs separate subscriptions." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://veridiff.com/compare" />
          <link rel="canonical" href="https://veridiff.com/compare" />
          
          {/* Enhanced Schema.org structured data */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebPage",
                  "@id": "https://veridiff.com/compare",
                  "url": "https://veridiff.com/compare",
                  "name": "File Comparison Tools | Excel, PDF, JSON, XML Comparison Software",
                  "description": "Professional file comparison software for business teams. Compare Excel spreadsheets (free), PDF documents, JSON/XML files.",
                  "breadcrumb": {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                      {
                        "@type": "ListItem",
                        "position": 1,
                        "item": {
                          "@type": "WebPage",
                          "@id": "https://veridiff.com",
                          "name": "VeriDiff Home"
                        }
                      },
                      {
                        "@type": "ListItem",
                        "position": 2,
                        "item": {
                          "@type": "WebPage",
                          "@id": "https://veridiff.com/compare",
                          "name": "Comparison Tools"
                        }
                      }
                    ]
                  }
                },
                {
                  "@type": "SoftwareApplication",
                  "name": "VeriDiff File Comparison Platform",
                  "description": "Professional file comparison tools for Excel, PDF, JSON, XML and other business formats with enterprise-grade security",
                  "url": "https://veridiff.com/compare",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Web Browser",
                  "softwareVersion": "2.0",
                  "offers": [
                    {
                      "@type": "Offer",
                      "name": "Excel Comparison Tool - Free",
                      "description": "Free Excel spreadsheet comparison with smart mapping and tolerance settings",
                      "price": "0",
                      "priceCurrency": "GBP",
                      "availability": "https://schema.org/InStock",
                      "itemOffered": {
                        "@type": "SoftwareApplication",
                        "name": "Excel Comparison Tool",
                        "applicationSubCategory": "Spreadsheet Comparison Software",
                        "featureList": ["Excel file comparison", "Smart header mapping", "Tolerance controls", "Cross-format comparison"]
                      }
                    },
                    {
                      "@type": "Offer", 
                      "name": "Premium Comparison Tools",
                      "description": "PDF, JSON, XML comparison tools with advanced features for professional teams",
                      "price": "19",
                      "priceCurrency": "GBP",
                      "billingIncrement": "P1M",
                      "availability": "https://schema.org/InStock",
                      "itemOffered": {
                        "@type": "SoftwareApplication",
                        "name": "Premium File Comparison Suite",
                        "applicationSubCategory": "Document Comparison Software",
                        "featureList": ["PDF comparison", "JSON comparison", "XML comparison", "Technical file analysis", "Advanced tolerance settings"]
                      }
                    }
                  ],
                  "featureList": [
                    "Excel spreadsheet comparison",
                    "PDF document comparison", 
                    "JSON data comparison",
                    "XML file comparison",
                    "Local browser processing",
                    "Enterprise-grade security",
                    "Smart header mapping",
                    "Configurable tolerance settings",
                    "Cross-format file comparison",
                    "Business data reconciliation"
                  ]
                }
              ]
            })}
          </script>
          
          <style>{mediaQueries}</style>
        </Head>

        <Header />

        {/* Breadcrumb Navigation */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.75rem 0'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <nav style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              <Link href="/" style={{ 
                color: '#2563eb', 
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                Home
              </Link>
              <span style={{ margin: '0 0.5rem', color: '#9ca3af' }}>›</span>
              <span style={{ color: '#374151', fontWeight: '500' }}>File Comparison Tools</span>
            </nav>
          </div>
        </div>

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
                Professional File Comparison Tools
                <span style={{ 
                  display: 'block',
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent', 
                  backgroundClip: 'text'
                }}>
                  for Business Teams
                </span>
              </h1>
              
              <p style={{
                fontSize: '1.3rem',
                opacity: '0.9',
                lineHeight: '1.6',
                maxWidth: '700px',
                margin: '0 auto 2.5rem auto'
              }}>
                Compare Excel spreadsheets, PDF documents, JSON files, and XML data with enterprise-grade security.
                <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '1.1rem', opacity: '0.8' }}>
                  Excel comparison free forever • All formats £19/month • Save £312/year vs separate tools
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
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                color: '#1f2937'
              }}>
                Choose Your File Comparison Tool
              </h2>
              <p style={{
                fontSize: '1.2rem',
                color: '#6b7280',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Professional-grade comparison tools designed for specific file types and business use cases
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2rem',
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
                Why Choose VeriDiff File Comparison Software?
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
                Start Comparing Files Today
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#6b7280',
                margin: '0 0 2rem 0',
                maxWidth: '600px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                Join professionals who switched from expensive separate tools to VeriDiff's all-in-one platform. 
                Excel spreadsheet comparison free forever, then upgrade to unlock PDF document comparison, 
                JSON data analysis, and XML configuration comparison for just £19/month.
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
                <div style={{ marginTop: '0.5rem' }}>
                  <Link href="/features" style={{ color: '#2563eb', textDecoration: 'none', marginRight: '1rem' }}>
                    View All Features
                  </Link>
                  <Link href="/security" style={{ color: '#2563eb', textDecoration: 'none', marginRight: '1rem' }}>
                    Security Details
                  </Link>
                  <Link href="/support" style={{ color: '#2563eb', textDecoration: 'none' }}>
                    Get Support
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* FAQ Section - Moved to Bottom */}
        <section style={{ background: 'white', padding: '4rem 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: '3rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '2.5rem',
                color: '#1f2937'
              }}>
                Frequently Asked Questions About File Comparison
              </h2>
              
              <div style={{
                maxWidth: '800px',
                margin: '0 auto'
              }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.75rem'
                  }}>
                    What file formats can VeriDiff compare?
                  </h3>
                  <p style={{
                    color: '#4b5563',
                    lineHeight: '1.6',
                    fontSize: '1rem'
                  }}>
                    VeriDiff supports Excel (.xlsx, .xls), CSV files, PDF documents, JSON data files, XML configuration files, and plain text documents. Excel-to-Excel comparison is free forever, while cross-format comparison (Excel-to-CSV) and other formats require our premium plan at £19/month.
                  </p>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.75rem'
                  }}>
                    How secure is VeriDiff's file comparison process?
                  </h3>
                  <p style={{
                    color: '#4b5563',
                    lineHeight: '1.6',
                    fontSize: '1rem'
                  }}>
                    VeriDiff processes all files locally in your browser - your files never leave your device. Unlike cloud-based comparison tools that upload sensitive business data to remote servers, VeriDiff ensures complete privacy and security for confidential documents, financial data, and proprietary information.
                  </p>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.75rem'
                  }}>
                    Can VeriDiff handle large Excel files and complex spreadsheets?
                  </h3>
                  <p style={{
                    color: '#4b5563',
                    lineHeight: '1.6',
                    fontSize: '1rem'
                  }}>
                    Yes, VeriDiff is designed for professional use and can handle large Excel files with thousands of rows, complex formulas, and multiple worksheets. Our smart header mapping technology automatically matches columns even when header names differ between files, making it perfect for financial reconciliation and business data analysis.
                  </p>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.75rem'
                  }}>
                    What's the difference between free Excel comparison and premium features?
                  </h3>
                  <p style={{
                    color: '#4b5563',
                    lineHeight: '1.6',
                    fontSize: '1rem'
                  }}>
                    Free Excel comparison includes smart mapping, basic tolerance settings, and detailed difference reporting for Excel-to-Excel comparisons. Premium features (£19/month) add PDF document comparison, JSON/XML analysis, cross-format comparison (Excel-to-CSV), advanced tolerance controls, and priority support. This saves £312/year compared to buying separate comparison tools.
                  </p>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.75rem'
                  }}>
                    How does VeriDiff compare to Excel's built-in compare feature?
                  </h3>
                  <p style={{
                    color: '#4b5563',
                    lineHeight: '1.6',
                    fontSize: '1rem'
                  }}>
                    Excel's built-in compare is basic and only works within Excel. VeriDiff offers intelligent header mapping for mismatched column names, configurable tolerance settings for numerical differences, cross-format comparison capabilities, detailed reporting with exportable results, and the ability to compare files from different systems or departments.
                  </p>
                </div>

                <div>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.75rem'
                  }}>
                    Which teams typically use VeriDiff's comparison tools?
                  </h3>
                  <p style={{
                    color: '#4b5563',
                    lineHeight: '1.6',
                    fontSize: '1rem'
                  }}>
                    Finance teams use VeriDiff for budget variance analysis and financial reconciliation. Legal departments compare contract versions and compliance documents. IT teams analyze configuration files and technical documentation. Business analysts reconcile data from different systems. Any team that needs to identify differences between important business files benefits from VeriDiff's precision and security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced FAQ Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What file formats can VeriDiff compare?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "VeriDiff supports Excel (.xlsx, .xls), CSV files, PDF documents, JSON data files, XML configuration files, and plain text documents. Excel-to-Excel comparison is free forever, while cross-format comparison and other formats require premium."
                }
              },
              {
                "@type": "Question", 
                "name": "How secure is VeriDiff's file comparison process?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "VeriDiff processes all files locally in your browser - your files never leave your device. Unlike cloud-based tools, VeriDiff ensures complete privacy for confidential business documents."
                }
              },
              {
                "@type": "Question",
                "name": "Can VeriDiff handle large Excel files and complex spreadsheets?", 
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, VeriDiff handles large Excel files with thousands of rows, complex formulas, and multiple worksheets. Smart header mapping automatically matches columns even when names differ."
                }
              },
              {
                "@type": "Question",
                "name": "What's the difference between free and premium features?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Free includes Excel-to-Excel comparison with smart mapping. Premium (£19/month) adds PDF, JSON/XML comparison, cross-format capabilities, and advanced controls - saving £312/year vs separate tools."
                }
              },
              {
                "@type": "Question",
                "name": "How does VeriDiff compare to Excel's built-in feature?",
                "acceptedAnswer": {
                  "@type": "Answer", 
                  "text": "VeriDiff offers intelligent header mapping, configurable tolerance settings, cross-format comparison, detailed reporting, and works with files from different systems - beyond Excel's basic capabilities."
                }
              },
              {
                "@type": "Question",
                "name": "Which teams typically use VeriDiff?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Finance teams for budget analysis, legal departments for contract comparison, IT teams for configuration analysis, and business analysts for data reconciliation from different systems."
                }
              }
            ]
          })}
        </script>

        <Footer />
      </div>
    </AuthGuard>
  );
}

export default ComparisonEngineHub;
