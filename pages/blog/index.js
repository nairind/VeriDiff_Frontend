import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AuthModal from '../../components/AuthModal';

export default function BlogIndex({ posts }) {
  // Modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  
  // Cookie consent state
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    // Simple analytics - just console log for now
    console.log('Page view: blog');
    
    // Check cookie consent
    checkCookieConsent();
  }, []);

  const checkCookieConsent = () => {
    const consent = localStorage.getItem('veridiff_cookie_consent');
    if (!consent) {
      setShowCookieBanner(true);
    }
  };

  const handleCookieAccept = () => {
    localStorage.setItem('veridiff_cookie_consent', 'accepted');
    setShowCookieBanner(false);
  };

  // Modal handlers
  const handleSignUp = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get featured and regular posts
  const featuredPosts = posts?.filter(post => post.featured) || [];
  const regularPosts = posts?.filter(post => !post.featured) || [];

  return (
    <>
      <Head>
        <title>VeriDiff Blog - Data Comparison Insights & Best Practices</title>
        <meta name="description" content="Expert insights on data comparison, Excel analysis, CSV validation, and professional file comparison techniques. Stay updated with VeriDiff's latest features and best practices." />
        <meta name="keywords" content="data comparison blog, excel comparison tips, csv analysis, file comparison best practices, data validation, spreadsheet analysis" />
        <meta name="robots" content="index, follow" />
      </Head>
      
      <div style={{
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: 0,
        padding: 0,
        color: '#1f2937',
        background: '#f8fafc'
      }}>
        <Header onSignIn={handleSignIn} onSignUp={handleSignUp} />

        {/* Trust Banner */}
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
              🔒 All file processing happens locally in your browser - your data never leaves your device
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
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            
            <h1 style={{ 
              fontSize: '3.5rem', 
              fontWeight: '700', 
              marginBottom: '1rem', 
              lineHeight: '1.2', 
              color: '#1f2937' 
            }}>
              VeriDiff 
              <span style={{ 
                display: 'block', 
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                backgroundClip: 'text' 
              }}>
                Blog
              </span>
            </h1>
            
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#6b7280', 
              marginBottom: '2rem', 
              maxWidth: '600px', 
              marginLeft: 'auto', 
              marginRight: 'auto',
              lineHeight: '1.6'
            }}>
              Expert insights on data comparison, best practices, and professional techniques for Excel, CSV, and cross-format analysis.
            </p>
          </div>
        </section>

        {/* Debug Info */}
        <section style={{ padding: '2rem 0', background: '#f0f9ff', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <h3>🧪 Blog System Status:</h3>
              <p><strong>Posts loaded:</strong> {posts ? posts.length : 0}</p>
              <p><strong>Featured posts:</strong> {featuredPosts.length}</p>
              <p><strong>Regular posts:</strong> {regularPosts.length}</p>
              {posts && posts.length > 0 && (
                <div style={{ textAlign: 'left', marginTop: '1rem' }}>
                  <strong>Post titles:</strong>
                  <ul>
                    {posts.map((post, index) => (
                      <li key={index}>{post.title} ({post.featured ? 'Featured' : 'Regular'})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPosts.length > 0 && featuredPosts.map(post => (
          <section key={post.slug} style={{
            padding: '3rem 0',
            background: 'white'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 20px'
            }}>
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
                <span style={{ fontSize: '1.2rem' }}>⭐</span>
                <span style={{ fontWeight: '700', color: '#92400e' }}>Featured Article</span>
              </div>

              <article style={{
                background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                borderRadius: '1rem',
                padding: '3rem',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{
                    background: '#2563eb',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    {post.category}
                  </span>
                </div>

                <h2 style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  color: '#1f2937',
                  lineHeight: '1.2'
                }}>
                  <Link href={`/blog/${post.slug}`} style={{
                    textDecoration: 'none',
                    color: '#1f2937'
                  }}>
                    {post.title}
                  </Link>
                </h2>

                <p style={{
                  fontSize: '1.25rem',
                  color: '#6b7280',
                  lineHeight: '1.6',
                  marginBottom: '2rem'
                }}>
                  {post.excerpt}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '2rem'
                }}>
                  <span>{formatDate(post.date)}</span>
                  <span>{post.readTime}</span>
                </div>

                <Link href={`/blog/${post.slug}`} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#2563eb',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'background 0.2s'
                }}>
                  Read Full Article
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </article>
            </div>
          </section>
        ))}

        {/* Blog Posts Grid */}
        <section style={{
          padding: '3rem 0',
          background: '#f8fafc'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '3rem',
              color: '#1f2937',
              textAlign: 'center'
            }}>
              {featuredPosts.length > 0 ? 'Latest Articles' : 'All Articles'}
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2rem'
            }}>
              {regularPosts.map(post => (
                <article key={post.slug} style={{
                  background: 'white',
                  borderRadius: '1rem',
                  padding: '2rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid #e5e7eb',
                  transition: 'transform 0.2s, boxShadow 0.2s'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{
                      background: '#f3f4f6',
                      color: '#374151',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {post.category}
                    </span>
                  </div>

                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    color: '#1f2937',
                    lineHeight: '1.3'
                  }}>
                    <Link href={`/blog/${post.slug}`} style={{
                      textDecoration: 'none',
                      color: '#1f2937'
                    }}>
                      {post.title}
                    </Link>
                  </h3>

                  <p style={{
                    fontSize: '1rem',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem'
                  }}>
                    {post.excerpt}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span>{formatDate(post.date)}</span>
                      <span>{post.readTime}</span>
                    </div>
                    <Link href={`/blog/${post.slug}`} style={{
                      color: '#2563eb',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}>
                      Read more →
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* No posts message */}
            {(!posts || posts.length === 0) && (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#6b7280', marginBottom: '1rem' }}>
                  Blog posts coming soon!
                </h3>
                <p style={{ color: '#9ca3af' }}>
                  We're working on creating valuable content for data professionals.
                </p>
              </div>
            )}
          </div>
        </section>

        <Footer />

        {/* Cookie Consent Banner */}
        {showCookieBanner && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'white',
            borderTop: '1px solid #e5e7eb',
            padding: '1rem',
            zIndex: 2000,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: '#374151',
                  lineHeight: '1.4'
                }}>
                  Data privacy is important to us, we only collect minimum required as default. No tracking, no ads, forever. 
                  <a href="/cookies" style={{ color: '#2563eb', textDecoration: 'underline', marginLeft: '0.5rem' }}>
                    Show the cookie policy
                  </a>
                </p>
              </div>
              <button
                onClick={handleCookieAccept}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Accept
              </button>
            </div>
          </div>
        )}

        {/* Auth Modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={handleAuthModalClose}
          initialMode={authMode}
        />
      </div>

      <style jsx>{`
        article:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
        
        @media (max-width: 768px) {
          h1 { font-size: 2.5rem !important; }
          h2 { font-size: 2rem !important; }
          .grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

// Get blog posts at build time - using dynamic import to avoid issues
export async function getStaticProps() {
  try {
    console.log('🔍 Starting getStaticProps...');
    
    // Dynamic import to avoid build-time issues
    const { getAllPosts } = await import('../../lib/markdown');
    console.log('✅ Successfully imported getAllPosts');
    
    const posts = getAllPosts();
    console.log('✅ Successfully got posts:', posts.length);
    
    return {
      props: {
        posts: posts || []
      }
    };
  } catch (error) {
    console.error('❌ Error in getStaticProps:', error);
    console.error('Error details:', error.message);
    
    // Return empty posts array instead of failing
    return {
      props: {
        posts: []
      }
    };
  }
}
