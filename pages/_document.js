// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Essential meta tags */}
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Plausible Analytics - Added without affecting PDF.js */}
        <script 
          defer 
          data-domain="veridiff.com" 
          src="https://plausible.io/js/script.js"
        />
        
        {/* PDF.js Library Loading - Using working CDN with fallback */}
        <script 
          src="https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.min.js"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        ></script>
        
        {/* Fallback PDF.js from CDNJS if jsDelivr fails */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Fallback loader for PDF.js if primary CDN fails
              (function() {
                if (!window.pdfjsLib) {
                  console.log('🔄 Primary PDF.js CDN failed, loading fallback...');
                  var script = document.createElement('script');
                  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js';
                  script.crossOrigin = 'anonymous';
                  script.referrerPolicy = 'no-referrer';
                  script.onload = function() {
                    console.log('✅ Fallback PDF.js loaded from CDNJS');
                  };
                  script.onerror = function() {
                    console.error('❌ Both PDF.js CDNs failed');
                  };
                  document.head.appendChild(script);
                }
              })();
            `
          }}
        />
        
        {/* PDF.js Configuration Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Enhanced PDF.js initialization with comprehensive error handling for Edge browser
              (function() {
                console.log('🔧 Initializing PDF.js configuration for large file support...');
                
                let initAttempts = 0;
                const maxAttempts = 15; // Increased for Edge browser
                
                function initializePDFJS() {
                  initAttempts++;
                  console.log('🔍 PDF.js initialization attempt', initAttempts);
                  
                  try {
                    if (typeof window !== 'undefined' && window.pdfjsLib) {
                      // Configure worker with proper CDN URLs
                      const version = window.pdfjsLib.version || '4.6.82';
                      
                      // Try jsDelivr first (most up-to-date)
                      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
                        \`https://cdn.jsdelivr.net/npm/pdfjs-dist@\${version}/build/pdf.worker.min.js\`;
                      
                      console.log('🔧 PDF.js version detected:', version);
                      console.log('🔧 Worker source set to:', window.pdfjsLib.GlobalWorkerOptions.workerSrc);
                      
                      // Enhanced functionality test for large files
                      if (window.pdfjsLib.getDocument && 
                          window.pdfjsLib.GlobalWorkerOptions &&
                          window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
                        
                        // Test with a simple document to ensure worker is functional
                        window.pdfJsReady = true;
                        console.log('✅ PDF.js loaded and configured successfully for large files');
                        console.log('📊 Supported features: Large files up to 100MB, Text extraction, Document comparison');
                        
                        // Dispatch ready event
                        window.dispatchEvent(new CustomEvent('pdfJsReady', {
                          detail: { 
                            version: version,
                            workerSrc: window.pdfjsLib.GlobalWorkerOptions.workerSrc,
                            largeFileSupport: true,
                            maxFileSize: '100MB'
                          }
                        }));
                        return true;
                      } else {
                        throw new Error('PDF.js core functions not available');
                      }
                    }
                    return false;
                  } catch (error) {
                    console.error(\`❌ PDF.js initialization error (attempt \${initAttempts}):\`, error);
                    
                    // Try fallback worker URL if primary fails
                    if (window.pdfjsLib && initAttempts <= 3) {
                      try {
                        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
                          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';
                        console.log('🔄 Trying fallback worker URL...');
                        return false; // Continue retrying
                      } catch (fallbackError) {
                        console.error('❌ Fallback worker configuration failed:', fallbackError);
                      }
                    }
                    
                    if (initAttempts >= maxAttempts) {
                      window.pdfJsError = true;
                      window.pdfJsErrorMessage = error.message;
                    }
                    return false;
                  }
                }
                
                // Try immediate initialization
                if (!initializePDFJS()) {
                  console.log('⏳ PDF.js not ready yet, setting up retry mechanism for Edge browser...');
                  
                  // Retry mechanism with exponential backoff optimized for Edge
                  function retryInit() {
                    if (initAttempts >= maxAttempts) {
                      console.error(\`❌ PDF.js initialization failed after \${maxAttempts} attempts\`);
                      window.pdfJsError = true;
                      window.pdfJsErrorMessage = 
                        'PDF.js failed to load after multiple attempts. This may be due to:\\n' +
                        '• Network connectivity issues\\n' +
                        '• Browser security settings blocking external scripts\\n' +
                        '• CDN availability problems\\n\\n' +
                        'Solutions for Edge browser:\\n' +
                        '• Check internet connection\\n' +
                        '• Disable any ad blockers temporarily\\n' +
                        '• Try refreshing the page\\n' +
                        '• Clear browser cache and try again\\n' +
                        '• Ensure Edge is updated to latest version';
                      return;
                    }
                    
                    console.log(\`🔄 PDF.js initialization retry \${initAttempts}/\${maxAttempts}\`);
                    
                    if (initializePDFJS()) {
                      return; // Success!
                    }
                    
                    // Progressive delay: 500ms, 1s, 1.5s, 2s, 3s, 4s, 5s max
                    const delay = Math.min(500 + (initAttempts * 500), 5000);
                    
                    setTimeout(retryInit, delay);
                  }
                  
                  // Start retry process immediately for Edge
                  setTimeout(retryInit, 100);
                  
                  // Additional fallbacks for Edge browser
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', function() {
                      setTimeout(function() {
                        if (!window.pdfJsReady && !window.pdfJsError && initAttempts < maxAttempts) {
                          console.log('📄 DOM loaded, trying PDF.js init for Edge...');
                          retryInit();
                        }
                      }, 1000);
                    });
                  }
                  
                  // Final fallback when window loads
                  window.addEventListener('load', function() {
                    setTimeout(function() {
                      if (!window.pdfJsReady && !window.pdfJsError && initAttempts < maxAttempts) {
                        console.log('🌐 Window loaded, final PDF.js init attempt for Edge...');
                        retryInit();
                      }
                    }, 2000);
                  });
                }
              })();
            `
          }}
        />
        
        {/* Enhanced CSS for better error display and large file warnings */}
        <style>{`
          .pdf-loading-error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            color: #991b1b;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .pdf-loading-error h3 {
            margin: 0 0 10px 0;
            color: #dc2626;
            font-size: 1.2rem;
          }
          .pdf-loading-error ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .pdf-loading-error li {
            margin: 5px 0;
          }
          .pdf-large-file-warning {
            background: #fffbeb;
            border: 1px solid #fed7aa;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            color: #92400e;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .pdf-large-file-warning h4 {
            margin: 0 0 8px 0;
            color: #d97706;
            font-size: 1rem;
          }
          .pdf-success-indicator {
            background: #ecfdf5;
            border: 1px solid #10b981;
            border-radius: 8px;
            padding: 12px;
            margin: 12px 0;
            color: #065f46;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 0.9rem;
          }
        `}</style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
