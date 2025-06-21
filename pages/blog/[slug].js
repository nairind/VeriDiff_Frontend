import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AuthModal from '../../components/AuthModal';
import { getAllPostSlugs, getPostBySlug, getRelatedPosts, markdownToHtml } from '../../lib/markdown';

export default function BlogPost({ post, relatedPosts }) {
  const router = useRouter();
  
  // Modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  
  // Cookie consent state
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    // Simple analytics - just console log for now
    console.log('Page view: blog post', post?.slug);
    
    // Check cookie consent
    checkCookieConsent();
  }, [post?.slug]);

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

  const generateStructuredData = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: post.featuredImage || 'https://veridiff.com/images/blog-default.jpg',
      author: {
        '@type': 'Organization',
        name: 'VeriDiff',
        url: 'https://veridiff.com'
      },
      publisher: {
        '@type': 'Organization',
        name: 'VeriDiff',
        logo: {
          '@type': 'ImageObject',
          url: 'https://veridiff.com/images/logo.png'
        }
      },
      datePublished: post.date,
      dateModified: post.lastModified || post.date,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://veridiff.com/blog/${post.slug}`
      },
      keywords: post.tags?.join(', '),
      articleSection: post.category,
      wordCount: post.wordCount || 1000,
      url: `https://veridiff.com/blog/${post.slug}`
    };
  };

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <>
      <Head>
        <title>{post.title} | VeriDiff Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={`${post.category}, data comparison, ${post.tags?.join(', ')}`} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href={`https://veridiff.com/blog/${post.slug}`} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://veridiff.com/blog/${post.slug}`} />
        <meta property="og:image" content={post.featuredImage || 'https://veridiff.com/images/blog-default.jpg'} />
        <meta property="og:site_name" content="VeriDiff" />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:modified_time" content={post.lastModified || post.date} />
        <meta property="article:author" content="VeriDiff Team" />
        <meta property="article:section" content={post.category} />
        {post.tags?.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={post.featuredImage || 'https://veridiff.com/images/blog-default.jpg'} />
        
        {/* Additional SEO tags */}
        <meta name="author" content="VeriDiff Team" />
        <meta name="copyright" content="VeriDiff" />
        <meta name="language" content="English" />
        
        {/* Structured Data */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateStructuredData()) }}
        />
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

        {/* Breadcrumb */}
        <div style={{
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 0'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <nav style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
              <span style={{ margin: '0 0.5rem' }}>/</span>
              <Link href="/blog" style={{ color: '#6b7280', textDecoration: 'none' }}>Blog</Link>
              <span style={{ margin: '0 0.5rem' }}>/</span>
              <span style={{ color: '#1f2937' }}>{post.title}</span>
            </nav>
          </div>
        </div>

        {/* Article Header */}
        <article style={{
          background: 'white',
          padding: '3rem 0'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <div style={{ marginBottom: '2rem' }}>
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

            <h1 style={{
              fontSize: '3rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              color: '#1f2937',
              lineHeight: '1.2'
            }}>
              {post.title}
            </h1>

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
              paddingBottom: '2rem',
              borderBottom: '1px solid #e5e7eb',
              marginBottom: '3rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  VD
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>VeriDiff Team</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {formatDate(post.date)} • {post.readTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div style={{
              fontSize: '1.125rem',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {/* Tags */}
            {post.tags && (
              <div style={{
                marginTop: '3rem',
                paddingTop: '2rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '1rem'
                }}>
                  Tags
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        background: '#f3f4f6',
                        color: '#374151',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share Section */}
            <div style={{
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '1rem'
              }}>
                Found this helpful? Share it with your team
              </h3>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={() => navigator.share?.({
                    title: post.title,
                    text: post.excerpt,
                    url: window.location.href
                  })}
                  style={{
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Share Article
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
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
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '2rem',
                color: '#1f2937',
                textAlign: 'center'
              }}>
                Related Articles
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
              }}>
                {relatedPosts.map(relatedPost => (
                  <article key={relatedPost.slug} style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e5e7eb'
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
                        {relatedPost.category}
                      </span>
                    </div>

                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: '#1f2937',
                      lineHeight: '1.3'
                    }}>
                      <Link href={`/blog/${relatedPost.slug}`} style={{
                        textDecoration: 'none',
                        color: '#1f2937'
                      }}>
                        {relatedPost.title}
                      </Link>
                    </h3>

                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      lineHeight: '1.5',
                      marginBottom: '1rem'
                    }}>
                      {relatedPost.excerpt}
                    </p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      <span>{formatDate(relatedPost.date)}</span>
                      <Link href={`/blog/${relatedPost.slug}`} style={{
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
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section style={{
          padding: '3rem 0',
          background: 'linear-gradient(135deg, #eff6ff, #f8fafc)'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '1rem',
              color: '#1f2937'
            }}>
              Ready to try VeriDiff?
            </h2>
            
            <p style={{
              fontSize: '1.125rem',
              color: '#6b7280',
              marginBottom: '2rem'
            }}>
              Put these insights into practice with our professional file comparison tool.
            </p>

            <Link href="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#2563eb',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.125rem'
            }}>
              Start Comparing Files
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
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
        @media (max-width: 768px) {
          h1 { font-size: 2rem !important; }
          h2 { font-size: 1.5rem !important; }
        }
        
        /* Article content styling */
        article h2 { 
          font-size: 1.75rem; 
          font-weight: 600; 
          margin: 2rem 0 1rem 0; 
          color: #1f2937; 
        }
        
        article h3 { 
          font-size: 1.5rem; 
          font-weight: 600; 
          margin: 1.5rem 0 1rem 0; 
          color: #1f2937; 
        }
        
        article h4 { 
          font-size: 1.25rem; 
          font-weight: 600; 
          margin: 1.25rem 0 0.75rem 0; 
          color: #1f2937; 
        }
        
        article p { 
          margin-bottom: 1.5rem; 
        }
        
        article ul, article ol { 
          margin: 1.5rem 0; 
          padding-left: 2rem; 
        }
        
        article li { 
          margin-bottom: 0.5rem; 
        }
        
        article code { 
          background: #f3f4f6; 
          padding: 0.25rem 0.5rem; 
          border-radius: 0.25rem; 
          font-family: 'Monaco', 'Consolas', monospace; 
          font-size: 0.875rem; 
        }
        
        article pre { 
          background: #f8fafc; 
          border: 1px solid #e5e7eb; 
          border-radius: 0.5rem; 
          padding: 1rem; 
          overflow-x: auto; 
          margin: 1.5rem 0; 
        }
        
        article blockquote { 
          border-left: 4px solid #2563eb; 
          padding-left: 1rem; 
          margin: 1.5rem 0; 
          font-style: italic; 
          color: #6b7280; 
        }
        
        article table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 1.5rem 0; 
        }
        
        article th, article td { 
          border: 1px solid #e5e7eb; 
          padding: 0.75rem; 
          text-align: left; 
        }
        
        article th { 
          background: #f8fafc; 
          font-weight: 600; 
        }
      `}</style>
    </>
  );
}

// This function gets called at build time
export async function getStaticPaths() {
  try {
    const paths = getAllPostSlugs().map((slug) => ({
      params: { slug }
    }));

    return {
      paths,
      fallback: false
    };
  } catch (error) {
    console.error('Error generating static paths:', error);
    return {
      paths: [],
      fallback: false
    };
  }
}

// This function gets called at build time for each blog post
export async function getStaticProps({ params }) {
  try {
    const post = getPostBySlug(params.slug);
    
    if (!post) {
      return {
        notFound: true
      };
    }

    // Convert markdown content to HTML
    const content = await markdownToHtml(post.content || '');
    
    // Get related posts
    const relatedPosts = getRelatedPosts(post, 2);

    return {
      props: {
        post: {
          ...post,
          content
        },
        relatedPosts
      }
    };
  } catch (error) {
    console.error('Error generating static props for blog post:', error);
    return {
      notFound: true
    };
  }
}
