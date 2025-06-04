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

  // Tool data
  const tools = [
    {
      id: 'spreadsheets',
      title: 'Business Spreadsheets',
      subtitle: 'Excel & CSV Comparison',
      description: 'Smart mapping, tolerance settings, and business data reconciliation. Excel-Excel comparisons are FREE forever.',
      icon: '📊',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      route: '/compare/spreadsheets',
      features: ['Excel-Excel (FREE)', 'Excel-CSV (Premium)', 'Smart header mapping', 'Tolerance controls'],
      usage: 'Perfect for financial reports, data validation, and business reconciliation',
      free: true
    },
    {
      id: 'pdf',
      title: 'PDF Documents',
      subtitle: 'Professional Document Analysis',
      description: 'Advanced PDF text extraction and page-by-page comparison for contracts, reports, and legal documents.',
      icon: '📄',
      gradient: 'linear-gradient(135deg, #dc2626, #ea580c)',
      route: '/compare/pdf',
      features: ['Text extraction', 'Page-by-page analysis', 'Large files (100MB)', 'Enterprise-grade accuracy'],
      usage: 'Ideal for legal contracts, business reports, and academic papers',
      free: false
    },
    {
      id: 'technical',
      title: 'Technical Files',
      subtitle: 'Code & Data Formats',
      description: 'Format-specific analysis for developers and technical teams. Text files are FREE, advanced formats require premium.',
      icon: '🔧',
      gradient: 'linear-gradient(135deg, #2563eb, #7c3aed)',
      route: '/compare/documents',
      features: ['Text files (FREE)', 'JSON & XML (Premium)', 'Format-specific analysis', 'Developer tools'],
      usage: 'Built for developers, IT teams, and technical documentation',
      free: 'partial'
    }
  ];

  // Tool card component
  const ToolCard = ({ tool }) => {
    const handleToolSelect = () => {
      window.location.href = tool.route;
    };

    return (
      <div
        onClick={handleToolSelect}
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '2px solid #e5e7eb',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
          e.currentTarget.style.borderColor = '#2563eb';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: tool.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            {tool.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              margin: '0 0 4px 0',
              color: '#1f2937'
            }}>
              {tool.title}
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: '#6b7280',
              margin: '0',
              fontWeight: '500'
            }}>
              {tool.subtitle}
            </p>
          </div>
          {tool.free === true && (
            <div style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              FREE
            </div>
          )}
          {tool.free === 'partial' && (
            <div style={{
              background: '#fef3c7',
              color: '#92400e',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              FREEMIUM
            </div>
          )}
        </div>

        {/* Description */}
        <p style={{
          fontSize: '1rem',
          color: '#374151',
          lineHeight: '1.6',
          marginBottom: '20px',
          flex: 1
        }}>
          {tool.description}
        </p>

        {/* Features */}
        <div style={{
          marginBottom: '20px'
        }}>
          <h4 style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 10px 0'
          }}>
            Key Features:
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '8px'
          }}>
            {tool.features.map((feature, index) => (
              <div key={index} style={{
                fontSize: '0.85rem',
                color: '#059669',
                background: '#f0fdf4',
                padding: '4px 8px',
                borderRadius: '4px',
                textAlign: 'center',
                border: '1px solid #bbf7d0'
              }}>
                • {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Usage */}
        <div style={{
          background: '#f8fafc',
          padding: '15px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <p style={{
            fontSize: '0.85rem',
            color: '#374151',
            margin: '0',
            fontStyle: 'italic'
          }}>
            💡 {tool.usage}
          </p>
        </div>

        {/* CTA Button */}
        <button
          style={{
            background: tool.gradient,
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: '100%'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'none';
          }}
        >
          Start Comparison →
        </button>
      </div>
    );
  };

  // Responsive styles
  const containerStyle = {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const mainStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px'
  };

  const heroStyle = {
    textAlign: 'center',
    padding: '60px 30px',
    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #ec4899 100%)',
    borderRadius: '24px',
    marginBottom: '50px',
    color: 'white',
    boxShadow: '0 20px 40px rgba(37, 99, 235, 0.3)'
  };

  // Media query styles
  const mediaQueries = `
    @media (max-width: 768px) {
      .tools-grid { grid-template-columns: 1fr !important; }
      .hero-title { font-size: 2.5rem !important; }
      .hero-section { padding: 40px 20px !important; }
      .main-container { padding: 20px 15px !important; }
    }
    
    @media (max-width: 480px) {
      .hero-title { font-size: 2rem !important; }
      .hero-section { padding: 30px 15px !important; }
      .main-container { padding: 15px 10px !important; }
    }
  `;

  return (
    <AuthGuard>
      <div style={containerStyle}>
        <Head>
          <title>VeriDiff - Comparison Engine</title>
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

        <main style={mainStyle} className="main-container">
          {/* Hero Section */}
          <div style={heroStyle} className="hero-section">
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '700',
              margin: '0 0 20px 0',
              lineHeight: '1.2'
            }} className="hero-title">
              Comparison Engine
            </h1>
            <p style={{
              fontSize: '1.3rem',
              opacity: '0.9',
              lineHeight: '1.6',
              maxWidth: '700px',
              margin: '0 auto 30px auto'
            }}>
              Choose your specialized comparison tool. Each tool is precision-engineered for specific file types and use cases.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '15px',
              fontSize: '0.9rem',
              opacity: '0.8'
            }}>
              <span>✓ Browser-only processing</span>
              <span>✓ Enterprise-grade privacy</span>
              <span>✓ Professional accuracy</span>
            </div>
          </div>

          {/* Tools Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '30px',
            marginBottom: '50px'
          }} className="tools-grid">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              margin: '0 0 15px 0',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Not Sure Which Tool to Use?
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              margin: '0 0 25px 0',
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Start with Business Spreadsheets for Excel files, or contact our team for guidance on the best tool for your specific needs.
            </p>
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link href="/compare/spreadsheets" style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}>
                Start with Spreadsheets
              </Link>
              <a href="mailto:hello@veridiff.com" style={{
                background: 'white',
                color: '#374151',
                padding: '12px 24px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: '600',
                border: '2px solid #e5e7eb',
                transition: 'all 0.2s'
              }}>
                Contact Support
              </a>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
}

export default ComparisonEngineHub;
