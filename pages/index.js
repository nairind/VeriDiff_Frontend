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
  
  // Auto-cycling demo state
  const [isAutoCycling, setIsAutoCycling] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

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
    alert('Enterprise contact form coming soon! Email us at hello@veridiff.com');
  };

  const handleWatchVideo = () => {
    alert('Demo video coming soon! Click Try Live Demo above to test VeriDiff now.');
  };

  const handleRegistrationModalClose = () => {
    setShowRegistrationModal(false);
    setPendingPremiumUpgrade(false);
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
      .cta-benefits { flex-direction: column !important; gap: 1rem !important; }
    }
    
    @media (max-width: 480px) {
      .hero-section { padding: 3rem 0 !important; }
      .hero-title { font-size: 2rem !important; }
      .section-container { padding: 0 15px !important; }
      .pricing-card { margin-bottom: 1rem !important; }
      .use-cases-grid { grid-template-columns: 1fr !important; }
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      .pricing-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .demo-grid { grid-template-columns: 1fr !important; }
      .file-types-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .use-cases-grid { grid-template-columns: repeat(3, 1fr) !important; }
    }

    /* Enhanced animations for file type cards */
    .file-type-card {
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateY(0);
    }
    
    .file-type-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
    }

    /* Demo tab animations */
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

    /* Use case hover animations */
    .use-case-card {
      transition: all 0.3s ease;
    }
    
    .use-case-card:hover {
      transform: translateY(-3px);
    }

    /* Security section enhanced animations */
    .security-feature-card {
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .security-feature-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 32px rgba(0,0,0,0.12) !important;
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
                minWidth: '250px'
              }}>
                ▶ Try Full Demo - No Signup Required
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
                minWidth: '200px'
              }}>
                Watch 2-Min Video
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
                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>🚫</span>
                <span><strong>No registration required</strong> to test with your real files</span>
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
                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>🔒</span>
                <span><strong>Your files never leave your browser</strong> - processed locally</span>
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
                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>⚡</span>
                <span><strong>Smart mapping</strong> when columns don't match perfectly</span>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section - HERO TREATMENT */}
        <section style={{ 
          background: 'linear-gradient(135deg, #0c4a6e, #1e40af, #7c3aed)',
          padding: '6rem 0',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }} className="section-padding">
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          
          <div style={sectionContainerStyle} className="section-container">
            <div style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative', zIndex: 2 }}>
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
                🛡️ Your Data Security is Our Foundation
              </div>
              
              <h2 style={{ 
                fontSize: '3rem', 
                fontWeight: '700', 
                marginBottom: '1.5rem', 
                lineHeight: '1.2'
              }} className="section-title">
                Bank-Level Security
                <span style={{ 
                  display: 'block',
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent', 
                  backgroundClip: 'text'
                }}>
                  Without the Complexity
                </span>
              </h2>
              <p style={{ 
                fontSize: '1.3rem', 
                opacity: '0.9', 
                lineHeight: '1.6',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Perfect for confidential business data that can't be uploaded to third-party servers
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2.5rem', 
              marginBottom: '4rem',
              position: 'relative',
              zIndex: 2
            }} className="security-grid">
              
              <div className="security-feature-card" style={{
                background: 'rgba(255,255,255,0.95)',
                color: '#1f2937',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  borderRadius: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem',
                  fontSize: '2rem',
                  boxShadow: '0 8px 24px rgba(5, 150, 105, 0.3)'
                }}>
                  🔒
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
                  100% Local Processing
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.7', fontSize: '1.05rem' }}>
                  All file processing happens in your browser. Your sensitive business data never touches our servers or any cloud infrastructure.
                </p>
              </div>

              <div className="security-feature-card" style={{
                background: 'rgba(255,255,255,0.95)',
                color: '#1f2937',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  borderRadius: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem',
                  fontSize: '2rem',
                  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)'
                }}>
                  📊
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
                  Try with Real Data
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.7', fontSize: '1.05rem' }}>
                  Upload your actual confidential files to test VeriDiff's capabilities. No dummy data needed - your files stay completely private.
                </p>
              </div>

              <div className="security-feature-card" style={{
                background: 'rgba(255,255,255,0.95)',
                color: '#1f2937',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                  borderRadius: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem',
                  fontSize: '2rem',
                  boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)'
                }}>
                  ⚡
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
                  GDPR Compliant by Design
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.7', fontSize: '1.05rem' }}>
                  Zero data collection or sharing. Built for European privacy standards - perfect for teams handling sensitive information.
                </p>
              </div>
            </div>

            {/* Testimonial */}
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '2.5rem',
              borderRadius: '1.5rem',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              zIndex: 2
            }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '1.5rem', color: 'white' }}>
                Trusted by Professional Teams Worldwide
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', marginBottom: '2rem', fontStyle: 'italic' }}>
                "Finally, a file comparison tool we can use with client data without security concerns."
              </p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1.5rem',
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.9)'
              }}>
                <div>✓ Used by accounting firms</div>
                <div>✓ Trusted by banks</div>
                <div>✓ Preferred by consultants</div>
                <div>✓ Relied on by analysts</div>
              </div>
            </div>
          </div>
        </section>

        {/* File Types Section - Enhanced Engagement */}
        <section style={{ 
          ...sectionStyle, 
          background: 'linear-gradient(135deg, #f8fafc, #eff6ff)', 
          position: 'relative',
          overflow: 'hidden'
        }} className="section-padding">
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '-30%',
            left: '-10%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          
          <div style={sectionContainerStyle} className="section-container">
            <div style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative', zIndex: 2 }}>
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
                🎯 Precision Tools for Every File Type
              </div>
              
              <h2 style={{ 
                fontSize: '2.75rem', 
                fontWeight: '700', 
                marginBottom: '1.5rem', 
                color: '#1f2937',
                lineHeight: '1.2'
              }} className="section-title">
                Professional File Comparison
                <span style={{ 
                  display: 'block',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent', 
                  backgroundClip: 'text'
                }}>
                  for Every Business Need
                </span>
              </h2>
              <p style={{ fontSize: '1.3rem', color: '#6b7280', maxWidth: '700px', margin: '0 auto' }}>
                From spreadsheets to documents to technical data formats - we handle them all with precision and security
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '2.5rem', 
              marginBottom: '4rem',
              position: 'relative',
              zIndex: 2
            }} className="file-types-grid">
              
              {/* Spreadsheets */}
              <div className="file-type-card" style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #059669, #10b981)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'content-box, border-box',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Subtle background pattern */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(5, 150, 105, 0.05) 0%, transparent 70%)',
                  borderRadius: '50%'
                }} />
                
                <div style={{
                  width: '90px',
                  height: '90px',
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  borderRadius: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem',
                  fontSize: '2.2rem',
                  boxShadow: '0 12px 28px rgba(5, 150, 105, 0.25)',
                  position: 'relative',
                  zIndex: 2
                }}>
                  📊
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937', position: 'relative', zIndex: 2 }}>
                  Business Spreadsheets
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.7', marginBottom: '1.5rem', fontSize: '1.05rem', position: 'relative', zIndex: 2 }}>
                  Smart mapping and tolerance settings for Excel, CSV files. Perfect for financial reconciliation and data validation.
                </p>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '0.5rem', 
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  position: 'relative',
                  zIndex: 2
                }}>
                  <span style={{ background: '#f0fdf4', color: '#166534', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500' }}>Excel (.xlsx)</span>
                  <span style={{ background: '#f0fdf4', color: '#166534', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500' }}>CSV</span>
                  <span style={{ background: '#f0fdf4', color: '#166534', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500' }}>Excel-CSV</span>
                </div>
                <div style={{ background: '#dcfce7', color: '#166534', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', position: 'relative', zIndex: 2 }}>
                  ✅ Excel-Excel comparisons always FREE
                </div>
              </div>

              {/* Documents */}
              <div className="file-type-card" style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #dc2626, #ea580c)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'content-box, border-box',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(220, 38, 38, 0.05) 0%, transparent 70%)',
                  borderRadius: '50%'
                }} />
                
                <div style={{
                  width: '90px',
                  height: '90px',
                  background: 'linear-gradient(135deg, #dc2626, #ea580c)',
                  borderRadius: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem',
                  fontSize: '2.2rem',
                  boxShadow: '0 12px 28px rgba(220, 38, 38, 0.25)',
                  position: 'relative',
                  zIndex: 2
                }}>
                  📄
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937', position: 'relative', zIndex: 2 }}>
                  Professional Documents
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.7', marginBottom: '1.5rem', fontSize: '1.05rem', position: 'relative', zIndex: 2 }}>
                  Advanced text extraction and page-by-page analysis for contracts, reports, and legal documents up to 100MB.
                </p>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '0.5rem', 
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  position: 'relative',
                  zIndex: 2
                }}>
                  <span style={{ background: '#fef2f2', color: '#dc2626', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500' }}>PDF</span>
                  <span style={{ background: '#fef2f2', color: '#dc2626', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500' }}>Text (.txt)</span>
                </div>
                <div style={{ background: '#fef3c7', color: '#92400e', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', position: 'relative', zIndex: 2 }}>
                  💎 Premium Feature
                </div>
              </div>

              {/* Technical Files */}
              <div className="file-type-card" style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb, #7c3aed)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'content-box, border-box',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: '-50%',
                  right: '-50%',
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)',
                  borderRadius: '50%'
                }} />
                
                <div style={{
                  width: '90px',
                  height: '90px',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  borderRadius: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem',
                  fontSize: '2.2rem',
                  boxShadow: '0 12px 28px rgba(37, 99, 235, 0.25)',
                  position: 'relative',
                  zIndex: 2
                }}>
                  🔧
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937', position: 'relative', zIndex: 2 }}>
                  Technical Data Formats
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.7', marginBottom: '1.5rem', fontSize: '1.05rem', position: 'relative', zIndex: 2 }}>
                  Format-specific analysis for developers and technical teams. Structure-aware comparison for complex data.
                </p>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '0.5rem', 
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  position: 'relative',
                  zIndex: 2
                }}>
                  <span style={{ background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500' }}>JSON</span>
                  <span style={{ background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500' }}>XML</span>
                </div>
                <div style={{ background: '#f0f9ff', color: '#0369a1', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', position: 'relative', zIndex: 2 }}>
                  🔄 TXT files FREE, JSON/XML Premium
                </div>
              </div>
            </div>

            {/* Enhanced Use Cases - 6 cases for balance */}
            <div style={{
              background: 'white',
              padding: '3rem',
              borderRadius: '1.5rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
              position: 'relative',
              zIndex: 2
            }}>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2.5rem', color: '#1f2937', textAlign: 'center' }}>
                Built for Professional Use Cases
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '2rem'
              }} className="use-cases-grid">
                <div className="use-case-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <h4 style={{ color: '#059669', fontWeight: '700', marginBottom: '0.8rem', fontSize: '1.1rem' }}>💰 Financial Services</h4>
                  <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.6' }}>Budget vs. actual reconciliation, transaction validation, audit trail creation</p>
                </div>
                <div className="use-case-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <h4 style={{ color: '#dc2626', fontWeight: '700', marginBottom: '0.8rem', fontSize: '1.1rem' }}>⚖️ Legal & Compliance</h4>
                  <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.6' }}>Contract versioning, policy updates, regulatory document comparison</p>
                </div>
                <div className="use-case-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <h4 style={{ color: '#2563eb', fontWeight: '700', marginBottom: '0.8rem', fontSize: '1.1rem' }}>🔧 Technical Teams</h4>
                  <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.6' }}>Configuration management, API response validation, data migration checks</p>
                </div>
                <div className="use-case-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <h4 style={{ color: '#7c3aed', fontWeight: '700', marginBottom: '0.8rem', fontSize: '1.1rem' }}>📊 Business Analysis</h4>
                  <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.6' }}>Report validation, data quality checks, multi-source data reconciliation</p>
                </div>
                <div className="use-case-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <h4 style={{ color: '#ea580c', fontWeight: '700', marginBottom: '0.8rem', fontSize: '1.1rem' }}>💼 Payroll & HR</h4>
                  <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.6' }}>Payroll reconciliation, employee data validation, benefits comparison</p>
                </div>
                <div className="use-case-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <h4 style={{ color: '#059669', fontWeight: '700', marginBottom: '0.8rem', fontSize: '1.1rem' }}>🛒 Procurement</h4>
                  <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.6' }}>Purchase order verification, supplier invoice matching, expense validation</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Demo Section */}
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
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}>
                          <strong>142 departments</strong> • CSV export from finance system
                        </div>
                      </div>
                    </div>

                    <div style={{ 
                      background: '#dcfce7', 
                      color: '#166534', 
                      padding: '1rem', 
                      borderRadius: '0.5rem', 
                      textAlign: 'center',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>
                      <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
                        ✨ Smart Mapping & Tolerance Results:
                      </p>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '1rem', 
                        textAlign: 'left' 
                      }} className="tolerance-grid">
                        <div>
                          <strong>✓ Auto-mapped fields:</strong><br/>
                          • Department → dept_name<br/>
                          • Budgeted Amount → actual_amount<br/>  
                          • Cost Centre Code → cost_centre
                        </div>
                        <div>
                          <strong>📊 Variance Analysis (±3%):</strong><br/>
                          • 127 departments within tolerance<br/>
                          • 15 over-budget flagged for review<br/>
                          • 3 missing departments identified
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
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                      padding: '1rem', 
                      borderRadius: '0.5rem',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>
                      <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
                        📄 Document Analysis Results:
                      </p>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr 1fr', 
                        gap: '1rem', 
                        textAlign: 'center' 
                      }} className="tolerance-grid">
                        <div style={{ 
                          padding: '0.5rem', 
                          background: '#fef2f2', 
                          color: '#dc2626', 
                          borderRadius: '0.25rem' 
                        }}>
                          <strong>Payment Terms</strong><br/>
                          30 days → 15 days<br/>
                          <span style={{ fontSize: '0.75rem' }}>🔥 Critical change</span>
                        </div>
                        <div style={{ 
                          padding: '0.5rem', 
                          background: '#fef2f2', 
                          color: '#dc2626', 
                          borderRadius: '0.25rem' 
                        }}>
                          <strong>Liability Cap</strong><br/>
                          £100k → £250k<br/>
                          <span style={{ fontSize: '0.75rem' }}>🔥 Major increase</span>
                        </div>
                        <div style={{ 
                          padding: '0.5rem', 
                          background: '#f0fdf4', 
                          color: '#16a34a', 
                          borderRadius: '0.25rem' 
                        }}>
                          <strong>New Content</strong><br/>
                          +1 page added<br/>
                          <span style={{ fontSize: '0.75rem' }}>✅ Additional clauses</span>
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
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}>
                          <strong>Staging environment</strong> • 51 configuration keys
                        </div>
                      </div>
                    </div>

                    <div style={{ 
                      background: '#eff6ff', 
                      color: '#1e40af', 
                      padding: '1rem', 
                      borderRadius: '0.5rem',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>
                      <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
                        🔧 Structure-Aware Configuration Analysis:
                      </p>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr 1fr', 
                        gap: '1rem', 
                        textAlign: 'center' 
                      }} className="tolerance-grid">
                        <div style={{ 
                          padding: '0.5rem', 
                          background: '#fef2f2', 
                          color: '#dc2626', 
                          borderRadius: '0.25rem' 
                        }}>
                          <strong>Performance Settings</strong><br/>
                          timeout: 5s → 10s<br/>
                          <span style={{ fontSize: '0.75rem' }}>⚠️ Environment drift</span>
                        </div>
                        <div style={{ 
                          padding: '0.5rem', 
                          background: '#fef2f2', 
                          color: '#dc2626', 
                          borderRadius: '0.25rem' 
                        }}>
                          <strong>Debug Settings</strong><br/>
                          debug: false → true<br/>
                          <span style={{ fontSize: '0.75rem' }}>⚠️ Should be disabled</span>
                        </div>
                        <div style={{ 
                          padding: '0.5rem', 
                          background: '#fff7ed', 
                          color: '#ea580c', 
                          borderRadius: '0.25rem' 
                        }}>
                          <strong>New Keys</strong><br/>
                          +4 additional settings<br/>
                          <span style={{ fontSize: '0.75rem' }}>📋 Needs review</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Simplified Pricing Section */}
        <section id="pricing" style={{ ...sectionStyle, background: '#f9fafb' }} className="section-padding">
          <div style={sectionContainerStyle} className="section-container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ 
                fontSize: '2.25rem', 
                fontWeight: '700', 
                marginBottom: '1rem', 
                color: '#1f2937' 
              }} className="section-title">
                Simple, Transparent Pricing
              </h2>
              <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>
                Start free with Excel comparisons • Upgrade for all file formats
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '2rem', 
              maxWidth: '900px', 
              margin: '0 auto' 
            }} className="pricing-grid">
              
              {/* Free Plan */}
              <div style={{ 
                background: 'white', 
                padding: '2.5rem', 
                borderRadius: '1rem', 
                border: '3px solid #22c55e',
                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.1)'
              }} className="pricing-card">
                <div style={{ 
                  background: '#22c55e', 
                  color: 'white', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '2rem', 
                  fontSize: '0.875rem', 
                  fontWeight: '600',
                  textAlign: 'center',
                  marginBottom: '1.5rem'
                }}>
                  Always Free for Signed-In Users
                </div>
                <h3 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '700', 
                  marginBottom: '0.5rem', 
                  color: '#1f2937' 
                }}>
                  Free
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                  Perfect for spreadsheet comparisons
                </p>
                <div style={{ marginBottom: '2rem' }}>
                  <span style={{ 
                    fontSize: '3rem', 
                    fontWeight: '700', 
                    color: '#22c55e' 
                  }}>
                    £0
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '1.1rem' }}>/month</span>
                </div>
                <div style={{ marginBottom: '2.5rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '1rem',
                    fontSize: '1rem'
                  }}>
                    <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '1.2rem' }}>✓</span>
                    <span><strong>Unlimited Excel-Excel comparisons</strong></span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '1rem',
                    fontSize: '1rem'
                  }}>
                    <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '1.2rem' }}>✓</span>
                    <span>Smart header mapping & tolerance settings</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '1rem',
                    fontSize: '1rem'
                  }}>
                    <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '1.2rem' }}>✓</span>
                    <span>Local processing - files never leave your browser</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '1rem',
                    fontSize: '1rem'
                  }}>
                    <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '1.2rem' }}>✓</span>
                    <span>GDPR compliant by design</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '1rem',
                    fontSize: '1rem'
                  }}>
                    <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '1.2rem' }}>✓</span>
                    <span>Download results as Excel or CSV</span>
                  </div>
                </div>
                <button onClick={handleTryDemo} style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  borderRadius: '0.75rem', 
                  fontWeight: '600', 
                  cursor: 'pointer', 
                  border: 'none', 
                  background: '#22c55e', 
                  color: 'white',
                  fontSize: '1.1rem',
                  transition: 'all 0.2s'
                }}>
                  🎉 Start Free Now
                </button>
              </div>

              {/* Premium Plan */}
              <div style={{ 
                background: 'white', 
                padding: '2.5rem', 
                borderRadius: '1rem', 
                border: '3px solid #2563eb',
                boxShadow: '0 4px 20px rgba(37, 99, 235, 0.1)',
                position: 'relative'
              }} className="pricing-card">
                <div style={{ 
                  background: '#2563eb', 
                  color: 'white', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '2rem', 
                  fontSize: '0.875rem', 
                  fontWeight: '600',
                  textAlign: 'center',
                  marginBottom: '1.5rem'
                }}>
                  All File Formats + Advanced Features
                </div>
                <h3 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '700', 
                  marginBottom: '0.5rem', 
                  color: '#1f2937' 
                }}>
                  Premium
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                  For professional data analysis
                </p>
                <div style={{ marginBottom: '2rem' }}>
                  <span style={{ 
                    fontSize: '3rem', 
                    fontWeight: '700', 
                    color: '#2563eb' 
                  }}>
                    £19
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '1.1rem' }}>/month</span>
                </div>
                <div style={{ marginBottom: '2.5rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '1rem',
                    fontSize: '1rem'
                  }}>
                    <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '1.2rem' }}>✓</span>
                    <span><strong>Everything in Free, plus:</strong></span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '1rem',
                    fontSize: '1rem'
                  }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>🚀</span>
                    <span><strong>Excel-CSV, CSV-CSV comparisons</strong></span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '1rem',
                    fontSize: '1rem'
                  }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>📄</span>
                    <span>PDF, JSON, XML, Text file comparisons</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '1rem',
                    fontSize: '1rem'
                  }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>⚡</span>
                    <span>Advanced tolerance & precision controls</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '1rem',
                    fontSize: '1rem'
                  }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>📊</span>
                    <span>Priority support & feature requests</span>
                  </div>
                </div>
                <button onClick={handleProTrial} style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  borderRadius: '0.75rem', 
                  fontWeight: '600', 
                  cursor: 'pointer', 
                  border: 'none', 
                  background: '#2563eb', 
                  color: 'white',
                  fontSize: '1.1rem',
                  transition: 'all 0.2s'
                }}>
                  {session ? '🚀 Start Premium Trial' : '🚀 Sign Up & Start Trial'}
                </button>
                <p style={{ 
                  textAlign: 'center', 
                  color: '#6b7280', 
                  fontSize: '0.875rem', 
                  marginTop: '1rem' 
                }}>
                  Cancel anytime • 30-day money-back guarantee
                </p>
              </div>
            </div>

            {/* Security Promise - Moved Higher */}
            <div style={{
              background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
              padding: '2.5rem',
              borderRadius: '1.5rem',
              border: '1px solid #a7f3d0',
              textAlign: 'center',
              marginTop: '3rem',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.1)'
            }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '1.5rem', color: '#065f46' }}>
                🔒 Security Promise: Both Plans Include
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem',
                fontSize: '1.1rem',
                color: '#047857'
              }}>
                <div style={{ padding: '1rem' }}>
                  <strong>✓ 100% local processing</strong><br/>
                  <span style={{ fontSize: '0.95rem', opacity: '0.9' }}>Files never uploaded to our servers</span>
                </div>
                <div style={{ padding: '1rem' }}>
                  <strong>✓ Zero data collection</strong><br/>
                  <span style={{ fontSize: '0.95rem', opacity: '0.9' }}>GDPR compliant by design</span>
                </div>
                <div style={{ padding: '1rem' }}>
                  <strong>✓ Bank-level privacy</strong><br/>
                  <span style={{ fontSize: '0.95rem', opacity: '0.9' }}>Perfect for confidential business data</span>
                </div>
                <div style={{ padding: '1rem' }}>
                  <strong>✓ No registration required</strong><br/>
                  <span style={{ fontSize: '0.95rem', opacity: '0.9' }}>Test with real files immediately</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
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
              Ready to Transform Your
              <span style={{ 
                display: 'block',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                backgroundClip: 'text'
              }}>
                File Comparison Workflow?
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
              Join forward-thinking professionals using secure, intelligent file comparison with complete privacy
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
                minWidth: '280px',
                transition: 'all 0.3s',
                fontSize: '1.1rem',
                boxShadow: '0 8px 24px rgba(255,255,255,0.2)'
              }}>
                ▶ Try Full Demo - No Signup Required
              </button>
              <button onClick={handleProTrial} style={{ 
                background: 'rgba(255,255,255,0.1)', 
                color: 'white', 
                padding: '1.2rem 2.5rem', 
                borderRadius: '0.75rem', 
                fontWeight: '600', 
                border: '2px solid rgba(255,255,255,0.3)', 
                cursor: 'pointer',
                minWidth: '220px',
                transition: 'all 0.3s',
                fontSize: '1.1rem',
                backdropFilter: 'blur(10px)'
              }}>
                {session ? 'Start Premium - £19/month' : 'Sign Up & Start Premium'}
              </button>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1.5rem',
              color: '#bfdbfe', 
              fontSize: '0.95rem',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>No registration required for demo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>Your files never leave your browser</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>30-day money-back guarantee</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>Cancel anytime, no commitments</span>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        {/* Registration Modal */}
        <RegistrationModal />
      </div>
    </>
  );
}
