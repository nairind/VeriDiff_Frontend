import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function Home() {
  const { data: session } = useSession();
  const [selectedDemo, setSelectedDemo] = useState('spreadsheets');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [pendingPremiumUpgrade, setPendingPremiumUpgrade] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  
  // Auto-cycling demo state
  const [isAutoCycling, setIsAutoCycling] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Check if user has already accepted cookies
  useEffect(() => {
    const cookieConsent = localStorage.getItem('veridiff-cookie-consent');
    if (cookieConsent === 'accepted') {
      setShowCookieBanner(false);
    }
  }, []);

  // Auto-cycling effect
  useEffect(() => {
    if (!isAutoCycling || isPaused) return;

    const interval = setInterval(() => {
      setSelectedDemo(prev => {
        if (prev === 'spreadsheets') return 'documents';
        if (prev === 'documents') return 'technical';
        return 'spreadsheets';
      });
    }, 7000); // Change every 7 seconds for 3 demos

    return () => clearInterval(interval);
  }, [isAutoCycling, isPaused]);

  // Handle premium upgrade after successful registration
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const premiumIntent = urlParams.get('premium') === 'true';
    
    if (session && (pendingPremiumUpgrade || premiumIntent)) {
      setPendingPremiumUpgrade(false);
      setShowRegistrationModal(false);
      
      if (premiumIntent) {
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('premium');
        window.history.replaceState({}, '', newUrl);
      }
      
      handlePremiumUpgradeFlow();
    }
  }, [session, pendingPremiumUpgrade]);

  const handleDemoSelect = (demo) => {
    setSelectedDemo(demo);
    setIsAutoCycling(false);
  };

  const toggleAutoCycle = () => {
    setIsAutoCycling(!isAutoCycling);
    setIsPaused(false);
  };

  const handleTryDemo = () => {
    window.location.href = '/compare';
  };

  const handleProTrial = async () => {
    if (!session) {
      console.log('User not signed in, showing registration modal first');
      setPendingPremiumUpgrade(true);
      setShowRegistrationModal(true);
      return;
    }

    await handlePremiumUpgradeFlow();
  };

  const handlePremiumUpgradeFlow = async () => {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_1RVEnnJbX57fsaKHqLt143Fg',
          successUrl: `${window.location.origin}/compare?success=true`,
          cancelUrl: `${window.location.origin}/?canceled=true`,
        }),
      });

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      alert('Sorry, there was an error starting your premium trial. Please try again or contact support.');
    }
  };

  const handleContactSales = () => {
    alert('Enterprise contact form coming soon! Email us at sales@veridiff.com');
  };

  const handleWatchVideo = () => {
    alert('Demo video coming soon! Click Try Live Demo above to test VeriDiff now.');
  };

  const handleRegistrationModalClose = () => {
    setShowRegistrationModal(false);
    setPendingPremiumUpgrade(false);
  };

  const handleCookieAccept = () => {
    localStorage.setItem('veridiff-cookie-consent', 'accepted');
    setShowCookieBanner(false);
  };

  // Responsive styles
  const containerStyle = {
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: 0,
    padding: 0,
    color: '#1f2937'
  };

  const heroStyle = {
    background: 'linear-gradient(135deg, #eff6ff, #f3e8ff)',
    padding: '5rem 0',
    textAlign: 'center'
  };

  const heroContainerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  };

  const sectionStyle = {
    padding: '5rem 0'
  };

  const sectionContainerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  };

  // Enhanced media queries with more animations
  const mediaQueries = `
    @media (max-width: 768px) {
      .hero-title { font-size: 2.5rem !important; }
      .hero-subtitle { font-size: 1.1rem !important; }
      .section-title { font-size: 1.8rem !important; }
      .section-padding { padding: 3rem 0 !important; }
      .demo-grid { grid-template-columns: 1fr !important; }
      .pricing-grid { grid-template-columns: 1fr !important; }
      .feature-grid { grid-template-columns: 1fr !important; }
      .file-types-grid { grid-template-columns: 1fr !important; }
      .use-cases-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .button-group { flex-direction: column !important; align-items: center !important; }
      .demo-tabs { flex-direction: column !important; gap: 0.5rem !important; }
      .tolerance-grid { grid-template-columns: 1fr !important; }
      .security-grid { grid-template-columns: 1fr !important; }
      .tab-slider { display: none !important; }
      .cta-benefits { 
        flex-direction: column !important; 
        gap: 1.2rem !important; 
        align-items: center !important;
        text-align: center !important;
      }
      .try-demo-section { padding: 3rem 0 !important; }
      .market-comparison-grid { grid-template-columns: 1fr !important; }
      .roi-calculator { 
        padding: 1rem !important;
        margin-bottom: 1.5rem !important;
      }
      .roi-calculator h2 { 
        font-size: 1.4rem !important; 
      }
      .roi-comparison { 
        grid-template-columns: 1fr auto 1fr !important;
        gap: 0.8rem !important;
      }
      .roi-comparison > div {
        font-size: 1.5rem !important;
      }
      .roi-savings {
        padding: 0.5rem !important;
        font-size: 0.9rem !important;
      }
    }
    
    @media (max-width: 480px) {
      .hero-section { padding: 3rem 0 !important; }
      .hero-title { font-size: 2rem !important; }
      .section-container { padding: 0 15px !important; }
      .pricing-card { margin-bottom: 1rem !important; }
      .use-cases-grid { grid-template-columns: 1fr !important; }
      .cta-benefits {
        padding: 0 1rem !important;
      }
      .cta-benefits > div {
        justify-content: center !important;
      }
      .try-demo-section { padding: 2rem 0 !important; }
      .market-comparison-grid { grid-template-columns: 1fr !important; }
      .roi-calculator { 
        padding: 1rem !important;
        margin-bottom: 1rem !important;
        maxWidth: '95%' !important;
      }
      .roi-calculator h2 { 
        font-size: 1.2rem !important;
        line-height: 1.3 !important;
      }
      .roi-comparison { 
        grid-template-columns: 1fr !important;
        gap: 0.5rem !important;
        text-align: center !important;
      }
      .roi-comparison > div {
        font-size: 1.3rem !important;
        margin-bottom: 0.5rem !important;
      }
      .roi-savings {
        padding: 0.5rem !important;
        font-size: 0.85rem !important;
      }
      .tolerance-grid { 
        grid-template-columns: 1fr !important; 
        gap: 1rem !important;
      }
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      .pricing-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .demo-grid { grid-template-columns: 1fr !important; }
      .file-types-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .use-cases-grid { grid-template-columns: repeat(3, 1fr) !important; }
      .market-comparison-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .roi-calculator { 
        max-width: 90% !important;
        padding: 1.2rem !important;
      }
      .tolerance-grid { 
        grid-template-columns: 1fr 1fr !important; 
        gap: 1.2rem !important;
      }
    }

    /* Enhanced animations */
    .demo-tab {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateY(0);
    }
    
    .demo-tab:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(37, 99, 235, 0.15);
    }
    
    .demo-tab.active {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.2);
    }
    
    .tab-slider {
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .progress-indicator {
      animation: progressFill 7s linear infinite;
      animation-play-state: ${isAutoCycling && !isPaused ? 'running' : 'paused'};
    }
    
    @keyframes progressFill {
      0% { width: 0%; }
      100% { width: 100%; }
    }
    
    .auto-cycle-pulse {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    .demo-content {
      animation: fadeInUp 0.5s ease-out;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Value card animations */
    .value-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .value-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.15) !important;
    }

    /* Mobile-specific benefit item styling */
    @media (max-width: 768px) {
      .cta-benefits > div {
        justify-content: center !important;
        text-align: center !important;
        padding: 0.5rem !important;
      }
      .cookie-banner {
        padding: 1rem !important;
        flex-direction: column !important;
        text-align: center !important;
        gap: 0.75rem !important;
      }
      .cookie-banner p {
        font-size: 0.85rem !important;
        margin-bottom: 0.5rem !important;
      }
      .cookie-banner button {
        width: 100% !important;
        max-width: 200px !important;
      }
    }

    /* Cookie banner animations */
    .cookie-banner {
      animation: slideUpFade 0.5s ease-out;
    }
    
    @keyframes slideUpFade {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  // Registration Modal Component
  const RegistrationModal = () => {
    if (!showRegistrationModal) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            margin: '0 0 15px 0', 
            fontSize: '1.5rem', 
            fontWeight: '600',
            color: '#1f2937'
          }}>
            🚀 Start Your Premium Trial
          </h3>
          
          <p style={{ 
            marginBottom: '20px',
            color: '#6b7280',
            fontSize: '1rem',
            lineHeight: '1.5'
          }}>
            {pendingPremiumUpgrade ? 
              "Great choice! Just sign up first, then we'll start your premium trial automatically." :
              "Sign up to unlock premium features and start your free trial."
            }
          </p>

          <div style={{
            background: '#eff6ff',
            border: '1px solid #2563eb',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '25px',
            textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1e40af', fontSize: '0.95rem' }}>
              ✨ What you get with Premium:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e40af', fontSize: '0.9rem' }}>
              <li>All file format comparisons (PDF, CSV, JSON, XML, TXT)</li>
              <li>Advanced tolerance & precision controls</li>
              <li>Priority support & feature requests</li>
              <li>30-day money-back guarantee</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.href = '/api/auth/signin?callbackUrl=' + encodeURIComponent(window.location.origin + '/?premium=true')}
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              {pendingPremiumUpgrade ? 'Sign Up & Start Trial' : 'Sign Up'}
            </button>
            <button
              onClick={handleRegistrationModalClose}
              style={{
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
          </div>

          <p style={{
            fontSize: '0.8rem',
            color: '#9ca3af',
            marginTop: '15px',
            marginBottom: 0
          }}>
            Your files stay private and secure - processed locally in your browser
          </p>
        </div>
      </div>
    );
  };

  // Privacy-First Cookie Banner Component
  const CookieBanner = () => {
    if (!showCookieBanner) return null;

    return (
      <div className="cookie-banner" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(135deg, #1e40af, #3730a3)',
        color: 'white',
        padding: '1.25rem 1.5rem',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '1rem', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🔒 Privacy-First Cookies
          </h4>
          <p style={{ 
            margin: 0, 
            fontSize: '0.9rem', 
            color: '#bfdbfe',
            lineHeight: '1.4'
          }}>
            We only use essential cookies for login and preferences. <strong>No tracking, no analytics, no data collection.</strong>
            <span style={{ marginLeft: '0.5rem' }}>
              <a 
                href="/cookie-policy" 
                style={{ 
                  color: '#fbbf24', 
                  textDecoration: 'underline',
                  fontWeight: '500'
                }}
              >
                View Policy
              </a>
            </span>
          </p>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          alignItems: 'center',
          flexShrink: 0
        }}>
          <button
            onClick={handleCookieAccept}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => e.target.style.background = '#059669'}
            onMouseOut={(e) => e.target.style.background = '#10b981'}
          >
            Accept Essential Only
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>VeriDiff - Secure File Comparison Platform for Business | Compare Excel, PDF, CSV Files Online</title>
        <meta name="description" content="Professional file comparison tool with enterprise-grade privacy. Compare Excel, PDF, CSV, JSON, XML files locally in your browser. Smart mapping, tolerance settings, GDPR compliant. Try free - no signup required." />
        <meta name="keywords" content="file comparison, document comparison, Excel comparison, PDF comparison, CSV comparison, data comparison tool, secure file diff, business file analysis, GDPR compliant, local file processing" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="VeriDiff - Secure File Comparison Platform for Business" />
        <meta property="og:description" content="Compare Excel, PDF, CSV, and other business files with enterprise-grade privacy. Local processing, smart mapping, GDPR compliant." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://veridiff.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="VeriDiff - Secure File Comparison Platform" />
        <meta name="twitter:description" content="Professional file comparison with local processing and smart mapping features." />
        
        {/* Schema.org structured data for software application */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "VeriDiff",
            "description": "Secure file comparison platform for comparing Excel, PDF, CSV and other business files with local processing",
            "url": "https://veridiff.com",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": [
              {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "GBP",
                "name": "Free Plan",
                "description": "Unlimited Excel-Excel comparisons"
              },
              {
                "@type": "Offer", 
                "price": "19",
                "priceCurrency": "GBP",
                "name": "Premium Plan",
                "description": "All file format comparisons with advanced features"
              }
            ],
            "featureList": [
              "Excel file comparison",
              "PDF document comparison", 
              "CSV data comparison",
              "JSON and XML comparison",
              "Local browser processing",
              "GDPR compliant",
              "Smart header mapping",
              "Tolerance settings"
            ]
          })}
        </script>
        
        <style>{mediaQueries}</style>
      </Head>
      
      <div style={containerStyle}>
        
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

        {/* Hero Section */}
        <section style={heroStyle} className="hero-section">
          <div style={heroContainerStyle} className="section-container">
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              background: '#dbeafe', 
              color: '#1e40af', 
              padding: '0.5rem 1rem', 
              borderRadius: '2rem', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              marginBottom: '2rem', 
              gap: '0.5rem' 
            }}>
              ⚡ Precision-Engineered in London for Global Professionals
            </div>
            
            {/* ROI Calculator Highlight */}
            <div className="roi-calculator" style={{
              background: 'linear-gradient(135deg, #fef3c7, #fed7aa)',
              border: '2px solid #f59e0b',
              borderRadius: '1rem',
              padding: '1.5rem',
              marginBottom: '2rem',
              maxWidth: '650px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#92400e',
                marginBottom: '1rem',
                textAlign: 'center',
                lineHeight: '1.3'
              }}>
                💰 Stop Paying £45/Month for Multiple Tools
              </h2>
              <div className="roi-comparison" style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                gap: '1rem',
                textAlign: 'center',
                marginBottom: '1rem'
              }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626', textDecoration: 'line-through' }}>
                    £45/month
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#7c2d12' }}>Separate tools</div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#92400e' }}>VS</div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#059669' }}>
                    £19/month
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#065f46' }}>VeriDiff All-in-One</div>
                </div>
              </div>
              <div className="roi-savings" style={{
                textAlign: 'center',
                padding: '0.75rem',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '0.5rem',
                fontWeight: '600',
                color: '#065f46'
              }}>
                🎯 Save £312/year starting today
              </div>
            </div>

            <h1 style={{ 
              fontSize: '3.5rem', 
              fontWeight: '700', 
              marginBottom: '1.5rem', 
              lineHeight: '1.2', 
              color: '#1f2937' 
            }} className="hero-title">
              The Secure File Comparison
              <span style={{ 
                display: 'block', 
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                backgroundClip: 'text' 
              }}>
                Platform Built for Business
              </span>
            </h1>
            
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#6b7280', 
              marginBottom: '2rem', 
              maxWidth: '48rem', 
              marginLeft: 'auto', 
              marginRight: 'auto',
              lineHeight: '1.6'
            }} className="hero-subtitle">
              Compare Excel, PDF, CSV, and other business files with enterprise-grade privacy. 
              Unlike cloud-based tools that upload your sensitive data to remote servers, VeriDiff processes everything locally in your browser.
            </p>

            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '1rem', 
              justifyContent: 'center', 
              marginBottom: '3rem' 
            }} className="button-group">
              <button onClick={handleTryDemo} style={{ 
                background: '#2563eb', 
                color: 'white', 
                border: 'none', 
                padding: '1rem 2rem', 
                borderRadius: '0.5rem', 
                fontSize: '1.125rem', 
                fontWeight: '500', 
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: '280px'
              }}>
                🎯 Start Free Excel Comparison
              </button>
              <button onClick={handleWatchVideo} style={{ 
                background: 'white', 
                color: '#374151', 
                border: '1px solid #d1d5db', 
                padding: '1rem 2rem', 
                borderRadius: '0.5rem', 
                fontSize: '1.125rem', 
                fontWeight: '500', 
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: '220px'
              }}>
                Watch 2-Min Demo
              </button>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1.5rem', 
              maxWidth: '80rem', 
              margin: '0 auto' 
            }} className="security-grid">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                color: '#374151',
                textAlign: 'center',
                padding: '1rem',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '0.5rem'
              }}>
                <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '1.2rem' }}>🎯</span>
                <span><strong>Excel comparison free</strong> after signup - no credit card</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                color: '#374151',
                textAlign: 'center',
                padding: '1rem',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '0.5rem'
              }}>
                <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '1.2rem' }}>💰</span>
                <span><strong>All file types for £19/month</strong> - save £26/month vs competitors</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                color: '#374151',
                textAlign: 'center',
                padding: '1rem',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '0.5rem'
              }}>
                <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '1.2rem' }}>🔒</span>
                <span><strong>Complete privacy</strong> - files processed locally in your browser</span>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Demo Section - SECOND */}
        <section id="features" style={{ ...sectionStyle, background: 'white' }} className="section-padding">
          <div style={sectionContainerStyle} className="section-container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ 
                fontSize: '2.25rem', 
                fontWeight: '700', 
                marginBottom: '1rem', 
                color: '#1f2937',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }} className="section-title">
                See the Difference in Action
              </h2>
              <p style={{ fontSize: '1.25rem', color: '#6b7280', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                Compare real business data scenarios that other tools cannot handle
              </p>
            </div>

            <div style={{ 
              background: '#f9fafb', 
              borderRadius: '1rem', 
              padding: '2rem' 
            }}>
              {/* Enhanced Tab Controls */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap'
              }}>
                {/* Tab Container with Slider */}
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  background: 'white',
                  borderRadius: '12px',
                  padding: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }} className="demo-tabs">
                  
                  {/* Animated Background Slider */}
                  <div 
                    className="tab-slider"
                    style={{
                      position: 'absolute',
                      top: '6px',
                      left: selectedDemo === 'spreadsheets' ? '6px' : 
                            selectedDemo === 'documents' ? '33.33%' : '66.66%',
                      width: 'calc(33.33% - 4px)',
                      height: 'calc(100% - 12px)',
                      background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                      zIndex: 1
                    }}
                  />
                  
                  {/* Tab Buttons */}
                  <button 
                    onClick={() => handleDemoSelect('spreadsheets')}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className="demo-tab"
                    style={{ 
                      position: 'relative',
                      zIndex: 2,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      border: 'none',
                      background: 'transparent',
                      color: selectedDemo === 'spreadsheets' ? 'white' : '#374151',
                      minWidth: '140px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '0.9rem',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    📊 Spreadsheets
                  </button>
                  
                  <button 
                    onClick={() => handleDemoSelect('documents')}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className="demo-tab"
                    style={{ 
                      position: 'relative',
                      zIndex: 2,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      border: 'none',
                      background: 'transparent',
                      color: selectedDemo === 'documents' ? 'white' : '#374151',
                      minWidth: '140px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '0.9rem',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    📄 Documents
                  </button>

                  <button 
                    onClick={() => handleDemoSelect('technical')}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className="demo-tab"
                    style={{ 
                      position: 'relative',
                      zIndex: 2,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      border: 'none',
                      background: 'transparent',
                      color: selectedDemo === 'technical' ? 'white' : '#374151',
                      minWidth: '140px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '0.9rem',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    🔧 Technical
                  </button>
                </div>

                {/* Auto-cycle Controls */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginLeft: '1rem'
                }}>
                  <button
                    onClick={toggleAutoCycle}
                    style={{
                      background: isAutoCycling ? '#22c55e' : '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                    className={isAutoCycling ? 'auto-cycle-pulse' : ''}
                  >
                    {isAutoCycling ? '⏸️' : '▶️'} {isAutoCycling ? 'Auto' : 'Manual'}
                  </button>
                  
                  {/* Progress Indicator */}
                  {isAutoCycling && (
                    <div style={{
                      width: '40px',
                      height: '4px',
                      background: '#e5e7eb',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div 
                        className="progress-indicator"
                        style={{
                          height: '100%',
                          background: '#2563eb',
                          borderRadius: '2px'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Demo Content with Animation */}
              <div className="demo-content" key={selectedDemo} style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                {selectedDemo === 'spreadsheets' && (
                  <>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '2rem', 
                      marginBottom: '1.5rem' 
                    }} className="demo-grid">
                      <div style={{ 
                        background: 'white', 
                        padding: '1.5rem', 
                        borderRadius: '0.5rem', 
                        border: '1px solid #e5e7eb' 
                      }}>
                        <h4 style={{ 
                          fontWeight: '600', 
                          marginBottom: '1rem', 
                          color: '#1f2937',
                          fontFamily: 'inherit'
                        }}>
                          📊 Budget_2024_Final.xlsx
                        </h4>
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '0.5rem' 
                        }}>
                          <div style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.875rem', 
                            background: '#ecfdf5', 
                            color: '#065f46', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            fontFamily: 'inherit'
                          }}>
                            <span>Department</span>
                            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>TEXT</span>
                          </div>
                          <div style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.875rem', 
                            background: '#ecfdf5', 
                            color: '#065f46', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            fontFamily: 'inherit'
                          }}>
                            <span>Budgeted Amount (£)</span>
                            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>CURRENCY</span>
                          </div>
                          <div style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.875rem', 
                            background: '#ecfdf5', 
                            color: '#065f46', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            fontFamily: 'inherit'
                          }}>
                            <span>Cost Centre Code</span>
                            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>TEXT</span>
                          </div>
                        </div>
                        <div style={{ 
                          marginTop: '1rem', 
                          padding: '0.75rem', 
                          background: '#f0fdf4', 
                          borderRadius: '0.5rem', 
                          fontSize: '0.75rem', 
                          color: '#166534',
                          fontFamily: 'inherit'
                        }}>
                          <strong>145 departments</strong> • Excel with formulas
                        </div>
                      </div>

                      <div style={{ 
                        background: 'white', 
                        padding: '1.5rem', 
                        borderRadius: '0.5rem', 
                        border: '1px solid #e5e7eb' 
                      }}>
                        <h4 style={{ 
                          fontWeight: '600', 
                          marginBottom: '1rem', 
                          color: '#1f2937',
                          fontFamily: 'inherit'
                        }}>
                          📄 actual_spend_q1.csv
                        </h4>
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '0.5rem' 
                        }}>
                          <div style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.875rem', 
                            background: '#eff6ff', 
                            color: '#1e40af', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            fontFamily: 'inherit'
                          }}>
                            <span>dept_name</span>
                            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>TEXT</span>
                          </div>
                          <div style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.875rem', 
                            background: '#eff6ff', 
                            color: '#1e40af', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            fontFamily: 'inherit'
                          }}>
                            <span>actual_amount</span>
                            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>NUMBER</span>
                          </div>
                          <div style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.875rem', 
                            background: '#eff6ff', 
                            color: '#1e40af', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            fontFamily: 'inherit'
                          }}>
                            <span>cost_centre</span>
                            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>TEXT</span>
                          </div>
                        </div>
                        <div style={{ 
                          marginTop: '1rem', 
                          padding: '0.75rem', 
                          background: '#eff6ff', 
                          borderRadius: '0.5rem', 
                          fontSize: '0.75rem', 
                          color: '#1e40af',
                          fontFamily: 'inherit'
                        }}>
                          <strong>142 departments</strong> • CSV export from finance system
                        </div>
                      </div>
                    </div>

                    <div style={{ 
                      background: '#dcfce7', 
                      color: '#166534', 
                      padding: '1.5rem', 
                      borderRadius: '0.75rem', 
                      fontFamily: 'inherit'
                    }}>
                      <h4 style={{ 
                        fontWeight: '600', 
                        marginBottom: '1.2rem', 
                        fontFamily: 'inherit',
                        textAlign: 'center',
                        fontSize: '1rem',
                        color: '#166534'
                      }}>
                        ✨ Smart Mapping & Tolerance Results:
                      </h4>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '1.5rem',
                        fontFamily: 'inherit'
                      }} className="tolerance-grid">
                        <div style={{ 
                          background: 'rgba(255, 255, 255, 0.6)',
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          border: '1px solid rgba(22, 101, 52, 0.2)'
                        }}>
                          <div style={{ 
                            fontWeight: '600', 
                            marginBottom: '0.75rem',
                            fontSize: '0.9rem', 
                            color: '#166534',
                            fontFamily: 'inherit'
                          }}>
                            ✓ Auto-mapped fields:
                          </div>
                          <div style={{ 
                            fontSize: '0.85rem', 
                            lineHeight: '1.6',
                            color: '#065f46',
                            fontFamily: 'inherit'
                          }}>
                            • Department → dept_name<br/>
                            • Budgeted Amount → actual_amount<br/>  
                            • Cost Centre Code → cost_centre
                          </div>
                        </div>
                        <div style={{ 
                          background: 'rgba(255, 255, 255, 0.6)',
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          border: '1px solid rgba(22, 101, 52, 0.2)'
                        }}>
                          <div style={{ 
                            fontWeight: '600', 
                            marginBottom: '0.75rem',
                            fontSize: '0.9rem', 
                            color: '#166534',
                            fontFamily: 'inherit'
                          }}>
                            📊 Variance Analysis (±3%):
                          </div>
                          <div style={{ 
                            fontSize: '0.85rem', 
                            lineHeight: '1.6',
                            color: '#065f46',
                            fontFamily: 'inherit'
                          }}>
                            • 127 departments within tolerance<br/>
                            • 15 over-budget flagged for review<br/>
                            • 3 missing departments identified
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedDemo === 'documents' && (
                  <>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '2rem', 
                      marginBottom: '1.5rem' 
                    }} className="demo-grid">
                      <div style={{ 
                        background: 'white', 
                        padding: '1.5rem', 
                        borderRadius: '0.5rem', 
                        border: '1px solid #e5e7eb' 
                      }}>
                        <h4 style={{ 
                          fontWeight: '600', 
                          marginBottom: '1rem', 
                          color: '#1f2937',
                          fontFamily: 'inherit'
                        }}>
                          📄 Service_Agreement_v2.1.pdf
                        </h4>
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '0.5rem' 
                        }}>
                          <div style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.875rem', 
                            background: '#fef2f2', 
                            color: '#991b1b', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            fontFamily: 'inherit'
                          }}>
                            <span>Pages</span>
                            <span style={{ fontWeight: 'bold' }}>23 pages</span>
                          </div>
                          <div style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.875rem', 
                            background: '#fef2f2', 
                            color: '#991b1b', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            fontFamily: 'inherit'
                          }}>
                            <span>Payment Terms</span>
                            <span style={{ fontWeight: 'bold' }}>Net 30 days</span>
                          </div>
                          <div style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.875rem', 
                            background: '#fef2f2', 
                            color: '#991b1b', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            fontFamily: 'inherit'
                          }}>
                            <span>Liability Cap</span>
                            <span style={{ fontWeight: 'bold' }}>£100,000</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ 
                        background: 'white', 
                        padding: '1.5rem', 
                        borderRadius: '0.5rem', 
                        border: '1px solid #e5e7eb' 
                      }}>
                        <h4 style={{ 
                          fontWeight: '600', 
                          marginBottom: '1rem', 
                          color: '#1f2937',
                          fontFamily: 'inherit'
                        }}>
                          📄 Service_Agreement_v2.2.pdf
                        </h4>
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '0.5rem' 
                        }}>
                          <div style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.875rem', 
                            background: '#f0f9ff', 
                            color: '#0369a1', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            fontFamily: 'inherit'
                          }}>
                            <span>Pages</span>
                            <span style={{ fontWeight: 'bold' }}>24 pages</span>
                          </div>
                          <div style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.875rem', 
                            background: '#f0f9ff', 
                            color: '#0369a1', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            fontFamily: 'inherit'
                          }}>
                            <span>Payment Terms</span>
                            <span style={{ fontWeight: 'bold' }}>Net 15 days</span>
                          </div>
                          <div style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.875rem', 
                            background: '#f0f9ff', 
                            color: '#0369a1', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            fontFamily: 'inherit'
                          }}>
                            <span>Liability Cap</span>
                            <span style={{ fontWeight: 'bold' }}>£250,000</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ 
                      background: '#fef3c7', 
                      color: '#92400e', 
                      padding: '1.5rem', 
                      borderRadius: '0.75rem',
                      fontFamily: 'inherit'
                    }}>
                      <h4 style={{ 
                        fontWeight: '600', 
                        marginBottom: '1.2rem', 
                        fontFamily: 'inherit',
                        textAlign: 'center',
                        fontSize: '1rem',
                        color: '#92400e'
                      }}>
                        📄 Document Analysis Results:
                      </h4>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr 1fr', 
                        gap: '1rem',
                        fontFamily: 'inherit'
                      }} className="tolerance-grid">
                        <div style={{ 
                          padding: '1rem', 
                          background: '#fef2f2', 
                          color: '#dc2626', 
                          borderRadius: '0.5rem',
                          fontFamily: 'inherit',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Payment Terms</div>
                          <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>30 days → 15 days</div>
                          <div style={{ fontSize: '0.75rem' }}>🔥 Critical change</div>
                        </div>
                        <div style={{ 
                          padding: '1rem', 
                          background: '#fef2f2', 
                          color: '#dc2626', 
                          borderRadius: '0.5rem',
                          fontFamily: 'inherit',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Liability Cap</div>
                          <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>£100k → £250k</div>
                          <div style={{ fontSize: '0.75rem' }}>🔥 Major increase</div>
                        </div>
                        <div style={{ 
                          padding: '1rem', 
                          background: '#f0fdf4', 
                          color: '#16a34a', 
                          borderRadius: '0.5rem',
                          fontFamily: 'inherit',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>New Content</div>
                          <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>+1 page added</div>
                          <div style={{ fontSize: '0.75rem' }}>✅ Additional clauses</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedDemo === 'technical' && (
                  <>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '2rem', 
                      marginBottom: '1.5rem' 
                    }} className="demo-grid">
                      <div style={{ 
                        background: 'white', 
                        padding: '1.5rem', 
                        borderRadius: '0.5rem', 
                        border: '1px solid #e5e7eb' 
                      }}>
                        <h4 style={{ 
                          fontWeight: '600', 
                          marginBottom: '1rem', 
                          color: '#1f2937',
                          fontFamily: 'inherit'
                        }}>
                          🔧 api_config_prod.json
                        </h4>
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '0.5rem' 
                        }}>
                          <div style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.875rem', 
                            background: '#f3e8ff', 
                            color: '#6b21a8', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            fontFamily: 'inherit'
                          }}>
                            <span>"timeout"</span>
                            <span style={{ fontWeight: 'bold' }}>5000</span>
                          </div>
                          <div style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.875rem', 
                            background: '#f3e8ff', 
                            color: '#6b21a8', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            fontFamily: 'inherit'
                          }}>
                            <span>"max_retries"</span>
                            <span style={{ fontWeight: 'bold' }}>3</span>
                          </div>
                          <div style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.875rem', 
                            background: '#f3e8ff', 
                            color: '#6b21a8', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            fontFamily: 'inherit'
                          }}>
                            <span>"debug_mode"</span>
                            <span style={{ fontWeight: 'bold' }}>false</span>
                          </div>
                        </div>
                        <div style={{ 
                          marginTop: '1rem', 
                          padding: '0.75rem', 
                          background: '#faf5ff', 
                          borderRadius: '0.5rem', 
                          fontSize: '0.75rem', 
                          color: '#6b21a8',
                          fontFamily: 'inherit'
                        }}>
                          <strong>Production environment</strong> • 47 configuration keys
                        </div>
                      </div>

                      <div style={{ 
                        background: 'white', 
                        padding: '1.5rem', 
                        borderRadius: '0.5rem', 
                        border: '1px solid #e5e7eb' 
                      }}>
                        <h4 style={{ 
                          fontWeight: '600', 
                          marginBottom: '1rem', 
                          color: '#1f2937',
                          fontFamily: 'inherit'
                        }}>
                          🔧 api_config_staging.json
                        </h4>
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '0.5rem' 
                        }}>
                          <div style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.875rem', 
                            background: '#eff6ff', 
                            color: '#1e40af', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            fontFamily: 'inherit'
                          }}>
                            <span>"timeout"</span>
                            <span style={{ fontWeight: 'bold' }}>10000</span>
                          </div>
                          <div style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.875rem', 
                            background: '#eff6ff', 
                            color: '#1e40af', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            fontFamily: 'inherit'
                          }}>
                            <span>"max_retries"</span>
                            <span style={{ fontWeight: 'bold' }}>5</span>
                          </div>
                          <div style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.875rem', 
                            background: '#eff6ff', 
                            color: '#1e40af', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            fontFamily: 'inherit'
                          }}>
                            <span>"debug_mode"</span>
                            <span style={{ fontWeight: 'bold' }}>true</span>
                          </div>
                        </div>
                        <div style={{ 
                          marginTop: '1rem', 
                          padding: '0.75rem', 
                          background: '#eff6ff', 
                          borderRadius: '0.5rem', 
                          fontSize: '0.75rem', 
                          color: '#1e40af',
                          fontFamily: 'inherit'
                        }}>
                          <strong>Staging environment</strong> • 51 configuration keys
                        </div>
                      </div>
                    </div>

                    <div style={{ 
                      background: '#eff6ff', 
                      color: '#1e40af', 
                      padding: '1.5rem', 
                      borderRadius: '0.75rem',
                      fontFamily: 'inherit'
                    }}>
                      <h4 style={{ 
                        fontWeight: '600', 
                        marginBottom: '1.2rem', 
                        fontFamily: 'inherit',
                        textAlign: 'center',
                        fontSize: '1rem',
                        color: '#1e40af'
                      }}>
                        🔧 Structure-Aware Configuration Analysis:
                      </h4>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr 1fr', 
                        gap: '1rem',
                        fontFamily: 'inherit'
                      }} className="tolerance-grid">
                        <div style={{ 
                          padding: '1rem', 
                          background: '#fef2f2', 
                          color: '#dc2626', 
                          borderRadius: '0.5rem',
                          fontFamily: 'inherit',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Performance Settings</div>
                          <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>timeout: 5s → 10s</div>
                          <div style={{ fontSize: '0.75rem' }}>⚠️ Environment drift</div>
                        </div>
                        <div style={{ 
                          padding: '1rem', 
                          background: '#fef2f2', 
                          color: '#dc2626', 
                          borderRadius: '0.5rem',
                          fontFamily: 'inherit',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Debug Settings</div>
                          <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>debug: false → true</div>
                          <div style={{ fontSize: '0.75rem' }}>⚠️ Should be disabled</div>
                        </div>
                        <div style={{ 
                          padding: '1rem', 
                          background: '#fff7ed', 
                          color: '#ea580c', 
                          borderRadius: '0.5rem',
                          fontFamily: 'inherit',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>New Keys</div>
                          <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>+4 additional settings</div>
                          <div style={{ fontSize: '0.75rem' }}>📋 Needs review</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Try Demo CTA Section - THIRD */}
        <section style={{ 
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)', 
          padding: '4rem 0',
          color: 'white', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }} className="section-padding try-demo-section">
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-20%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          
          <div style={{ ...sectionContainerStyle, position: 'relative', zIndex: 2 }} className="section-container">
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white', 
              padding: '0.5rem 1rem', 
              borderRadius: '2rem', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              marginBottom: '2rem', 
              gap: '0.5rem',
              backdropFilter: 'blur(10px)'
            }}>
              🚀 Ready to Experience the Difference?
            </div>
            
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              marginBottom: '1rem',
              lineHeight: '1.2'
            }} className="section-title">
              Try VeriDiff with Your Real Files
            </h2>
            <p style={{ 
              fontSize: '1.2rem', 
              color: '#bfdbfe', 
              marginBottom: '2.5rem',
              maxWidth: '600px',
              margin: '0 auto 2.5rem auto',
              lineHeight: '1.6'
            }}>
              See how VeriDiff handles your actual business data with complete privacy and precision
            </p>
            
            <button onClick={handleTryDemo} style={{ 
              background: 'white', 
              color: '#2563eb', 
              padding: '1.25rem 3rem', 
              borderRadius: '0.75rem', 
              fontWeight: '600', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '1.2rem',
              transition: 'all 0.3s',
              boxShadow: '0 8px 32px rgba(255,255,255,0.3)',
              minWidth: '320px'
            }}>
              🎯 Start Free Excel Comparison Now
            </button>
            
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '2rem',
              color: '#bfdbfe', 
              fontSize: '0.95rem',
              marginTop: '2rem'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                justifyContent: 'center'
              }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>No credit card required</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                justifyContent: 'center'
              }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>Files stay on your device</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                justifyContent: 'center'
              }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>Upgrade to all formats for £19/month</span>
              </div>
            </div>
          </div>
        </section>

        {/* Market Comparison & Pricing Section - FOURTH */}
        <section style={{ ...sectionStyle, background: '#f8fafc' }} className="section-padding">
          <div style={sectionContainerStyle} className="section-container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                background: '#fef3c7', 
                color: '#92400e', 
                padding: '0.5rem 1rem', 
                borderRadius: '2rem', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                marginBottom: '2rem', 
                gap: '0.5rem' 
              }}>
                💰 Why Pay for Multiple Tools When One Does It All?
              </div>
              
              <h2 style={{ 
                fontSize: '2.75rem', 
                fontWeight: '700', 
                marginBottom: '1.5rem', 
                color: '#1f2937',
                lineHeight: '1.2'
              }} className="section-title">
                All-in-One vs
                <span style={{ 
                  display: 'block',
                  background: 'linear-gradient(135deg, #dc2626, #ea580c)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent', 
                  backgroundClip: 'text'
                }}>
                  Buying Separately
                </span>
              </h2>
              <p style={{ fontSize: '1.3rem', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
                Start with Excel, scale to everything. Save £26/month • £312/year
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
              gap: '3rem', 
              marginBottom: '4rem'
            }} className="market-comparison-grid">
              
              {/* Separate Tools Cost */}
              <div className="value-card" style={{
                background: 'white',
                padding: '3rem',
                borderRadius: '1.5rem',
                border: '3px solid #fca5a5',
                boxShadow: '0 8px 32px rgba(220, 38, 38, 0.1)',
                textAlign: 'center',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#dc2626',
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  Separate Tools
                </div>
                
                <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', color: '#1f2937', marginTop: '1rem' }}>
                  The Expensive Way
                </h3>

                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '1rem',
                    marginBottom: '0.5rem',
                    background: '#fef2f2',
                    borderRadius: '8px'
                  }}>
                    <span style={{ color: '#374151', fontWeight: '500' }}>Professional Excel tool</span>
                    <span style={{ color: '#dc2626', fontWeight: '700' }}>£15/month</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '1rem',
                    marginBottom: '0.5rem',
                    background: '#fef2f2',
                    borderRadius: '8px'
                  }}>
                    <span style={{ color: '#374151', fontWeight: '500' }}>PDF comparison tool</span>
                    <span style={{ color: '#dc2626', fontWeight: '700' }}>£12/month</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '1rem',
                    marginBottom: '0.5rem',
                    background: '#fef2f2',
                    borderRadius: '8px'
                  }}>
                    <span style={{ color: '#374151', fontWeight: '500' }}>JSON/XML tools</span>
                    <span style={{ color: '#dc2626', fontWeight: '700' }}>£8/month</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    background: '#fef2f2',
                    borderRadius: '8px'
                  }}>
                    <span style={{ color: '#374151', fontWeight: '500' }}>Advanced tolerance features</span>
                    <span style={{ color: '#dc2626', fontWeight: '700' }}>£10/month</span>
                  </div>
                  
                  <div style={{
                    borderTop: '2px solid #dc2626',
                    paddingTop: '1rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#dc2626', marginBottom: '0.5rem' }}>
                      £45/month
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '1rem' }}>
                      £540/year + multiple logins + security risks
                    </div>
                  </div>
                </div>

                <div style={{
                  background: '#fef2f2',
                  padding: '1.5rem',
                  borderRadius: '10px',
                  border: '1px solid #fca5a5'
                }}>
                  <h4 style={{ color: '#dc2626', fontWeight: '600', marginBottom: '1rem' }}>❌ Downsides:</h4>
                  <ul style={{ color: '#7f1d1d', fontSize: '0.9rem', textAlign: 'left', margin: 0, paddingLeft: '1.2rem' }}>
                    <li>Multiple accounts to manage</li>
                    <li>Data shared across vendors</li>
                    <li>Inconsistent interfaces</li>
                    <li>Separate support contacts</li>
                  </ul>
                </div>
              </div>

              {/* VeriDiff All-in-One */}
              <div className="value-card" style={{
                background: 'white',
                padding: '3rem',
                borderRadius: '1.5rem',
                border: '3px solid #10b981',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.1)',
                textAlign: 'center',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#10b981',
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  VeriDiff All-in-One
                </div>
                
                <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', color: '#1f2937', marginTop: '1rem' }}>
                  The Smart Way
                </h3>

                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ 
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    background: '#f0fdf4',
                    borderRadius: '12px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{ fontSize: '0.9rem', color: '#166534', marginBottom: '1rem', fontWeight: '500' }}>
                      ✅ Everything included:
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#065f46', lineHeight: '1.6' }}>
                      • Excel, CSV, PDF, JSON, XML, TXT<br/>
                      • Advanced tolerance & precision<br/>
                      • Smart header mapping<br/>
                      • Single secure platform<br/>
                      • Priority support
                    </div>
                  </div>
                  
                  <div style={{
                    borderTop: '2px solid #10b981',
                    paddingTop: '1rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#10b981', marginBottom: '0.5rem' }}>
                      £19/month
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '1rem' }}>
                      £228/year
                    </div>
                    <div style={{
                      background: '#dcfce7',
                      color: '#166534',
                      padding: '10px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '1.1rem'
                    }}>
                      💰 Save £26/month • £312/year
                    </div>
                  </div>
                </div>

                <div style={{
                  background: '#f0fdf4',
                  padding: '1.5rem',
                  borderRadius: '10px',
                  border: '1px solid #bbf7d0'
                }}>
                  <h4 style={{ color: '#166534', fontWeight: '600', marginBottom: '1rem' }}>✅ Benefits:</h4>
                  <ul style={{ color: '#065f46', fontSize: '0.9rem', textAlign: 'left', margin: 0, paddingLeft: '1.2rem' }}>
                    <li>One login for everything</li>
                    <li>Complete data privacy</li>
                    <li>Consistent interface</li>
                    <li>Single support contact</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Future-Proof Value */}
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              padding: '3rem',
              borderRadius: '1.5rem',
              border: '1px solid #93c5fd',
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e40af' }}>
                🚀 Future-Proof Your Investment
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '2rem',
                fontSize: '1.05rem',
                color: '#1e40af'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>📈 Today</h4>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>Start with Excel comparison</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>📄 Next Month</h4>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>Client sends PDF changes</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>🔧 Next Quarter</h4>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>JSON API configurations</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>💪 Result</h4>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>You're ready for everything</p>
                </div>
              </div>
            </div>

            {/* Upgrade CTA */}
            <div style={{ textAlign: 'center' }}>
              <button onClick={handleProTrial} style={{ 
                background: 'linear-gradient(135deg, #dc2626, #ea580c)', 
                color: 'white', 
                padding: '1.5rem 3rem', 
                borderRadius: '1rem', 
                fontWeight: '700', 
                border: 'none', 
                cursor: 'pointer',
                fontSize: '1.3rem',
                transition: 'all 0.3s',
                boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)',
                minWidth: '380px'
              }}>
                🚀 Get All Tools for £19/Month - Save £26/Month!
              </button>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '0.9rem', 
                marginTop: '1rem' 
              }}>
                30-day money-back guarantee • Cancel anytime • Start saving immediately
              </p>
            </div>
          </div>
        </section>

        {/* Objection-Handling FAQ Section */}
        <section style={{ ...sectionStyle, background: 'white' }} className="section-padding">
          <div style={sectionContainerStyle} className="section-container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ 
                fontSize: '2.25rem', 
                fontWeight: '700', 
                marginBottom: '1rem', 
                color: '#1f2937'
              }} className="section-title">
                Questions? We've Got Answers
              </h2>
              <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>
                Everything you need to know to get started confidently
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '2rem',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🔒 "Is my data secure?"
                </h3>
                <p style={{ color: '#4b5563', lineHeight: '1.6', margin: 0 }}>
                  Absolutely. Unlike other tools that upload files to their servers, VeriDiff processes everything locally in your browser. Your files never leave your device, and we never see or store your data. It's the most secure way to compare sensitive business files.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📊 "I only need Excel comparison"
                </h3>
                <p style={{ color: '#4b5563', lineHeight: '1.6', margin: 0 }}>
                  Perfect! Start free with Excel comparison after signup. No credit card required. When you need PDF, CSV, or other formats later (and you probably will), upgrade for £19/month instead of buying separate tools for £45/month.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  💳 "Can I cancel anytime?"
                </h3>
                <p style={{ color: '#4b5563', lineHeight: '1.6', margin: 0 }}>
                  Yes, cancel your premium subscription anytime with one click. No contracts, no commitments. Plus, we offer a 30-day money-back guarantee if you're not completely satisfied with the premium features.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  ⚡ "How is this different from Excel's built-in compare?"
                </h3>
                <p style={{ color: '#4b5563', lineHeight: '1.6', margin: 0 }}>
                  Excel's compare is basic and only works within Excel. VeriDiff offers smart mapping for mismatched headers, tolerance settings for numerical differences, cross-format comparison (Excel vs CSV), and detailed reporting that Excel simply can't provide.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🚀 "What happens after I sign up?"
                </h3>
                <p style={{ color: '#4b5563', lineHeight: '1.6', margin: 0 }}>
                  Immediate access to Excel comparison features. Upload two Excel files and see the magic happen. When you're ready to compare other file types or need advanced features, upgrade to premium for £19/month.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  💰 "Why is this cheaper than competitors?"
                </h3>
                <p style={{ color: '#4b5563', lineHeight: '1.6', margin: 0 }}>
                  We're pre-launch and focused on building a loyal user base. By processing files locally, we have lower server costs than competitors. Our all-in-one approach means you pay for one tool instead of multiple specialized ones.
                </p>
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              marginTop: '3rem',
              padding: '2rem',
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              borderRadius: '1rem',
              border: '1px solid #93c5fd'
            }}>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: '#1e40af', 
                marginBottom: '1rem' 
              }}>
                Still Have Questions?
              </h3>
              <p style={{ color: '#1e40af', marginBottom: '1.5rem' }}>
                We're here to help! Get in touch and we'll respond within 24 hours.
              </p>
              <button 
                onClick={() => window.location.href = 'mailto:sales@veridiff.com?subject=Question about VeriDiff'}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                📧 Contact Us - sales@veridiff.com
              </button>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section style={{ 
          padding: '6rem 0', 
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)', 
          color: 'white', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }} className="section-padding">
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '-30%',
            left: '-20%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          
          <div style={{ ...sectionContainerStyle, position: 'relative', zIndex: 2 }} className="section-container">
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white', 
              padding: '0.5rem 1rem', 
              borderRadius: '2rem', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              marginBottom: '2rem', 
              gap: '0.5rem',
              backdropFilter: 'blur(10px)'
            }}>
              🚀 Join Thousands of Professional Teams
            </div>
            
            <h2 style={{ 
              fontSize: '3rem', 
              fontWeight: '700', 
              marginBottom: '1.5rem',
              lineHeight: '1.2'
            }} className="section-title">
              Ready to Save £26/Month on
              <span style={{ 
                display: 'block',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                backgroundClip: 'text'
              }}>
                File Comparison Tools?
              </span>
            </h2>
            <p style={{ 
              fontSize: '1.3rem', 
              color: '#bfdbfe', 
              marginBottom: '3rem',
              maxWidth: '700px',
              margin: '0 auto 3rem auto',
              lineHeight: '1.6'
            }}>
              Join smart professionals who stopped overpaying for multiple tools. Get everything you need in one secure platform.
            </p>
            
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '1.5rem', 
              justifyContent: 'center', 
              marginBottom: '3rem' 
            }} className="button-group">
              <button onClick={handleTryDemo} style={{ 
                background: 'white', 
                color: '#2563eb', 
                padding: '1.2rem 2.5rem', 
                borderRadius: '0.75rem', 
                fontWeight: '600', 
                border: 'none', 
                cursor: 'pointer',
                minWidth: '300px',
                transition: 'all 0.3s',
                fontSize: '1.1rem',
                boxShadow: '0 8px 24px rgba(255,255,255,0.2)'
              }}>
                🎯 Start Free Excel Comparison Now
              </button>
              <button onClick={handleProTrial} style={{ 
                background: 'rgba(255,255,255,0.1)', 
                color: 'white', 
                padding: '1.2rem 2.5rem', 
                borderRadius: '0.75rem', 
                fontWeight: '600', 
                border: '2px solid rgba(255,255,255,0.3)', 
                cursor: 'pointer',
                minWidth: '280px',
                transition: 'all 0.3s',
                fontSize: '1.1rem',
                backdropFilter: 'blur(10px)'
              }}>
                🚀 Get All Tools - £19/Month
              </button>
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '2rem',
              color: '#bfdbfe', 
              fontSize: '0.95rem',
              maxWidth: '1000px',
              margin: '0 auto'
            }} className="cta-benefits">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                justifyContent: 'center'
              }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>No credit card for Excel comparison</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                justifyContent: 'center'
              }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>Save £312/year vs buying separately</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                justifyContent: 'center'
              }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>Files never leave your device</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                justifyContent: 'center'
              }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        {/* Privacy-First Cookie Banner */}
        <CookieBanner />

        {/* Registration Modal */}
        <RegistrationModal />
      </div>
    </>
  );
}
