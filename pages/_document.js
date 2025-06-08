// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Essential meta tags */}
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* PDF.js Library Loading */}
        <script 
          src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
          integrity="sha512-bcKr3HCs9FgGDDH6wx8gA/3L3U4D3t4BXGxTl8/9Zj3m1qQnX8wr4p2HNu0AcV3BzN8tZUTN7d2F9xIgFXNpMQ=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        ></script>
        
        {/* PDF.js Configuration Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Enhanced PDF.js initialization with comprehensive error handling
              (function() {
                console.log('🔧 Initializing PDF.js configuration...');
                
                function initializePDFJS() {
                  try {
                    if (typeof window !== 'undefined' && window.pdfjsLib) {
                      // Configure worker
                      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                      
                      // Test PDF.js functionality
                      if (window.pdfjsLib.getDocument && window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
                        window.pdfJsReady = true;
                        console.log('✅ PDF.js loaded and configured successfully');
                        
                        // Dispatch ready event
                        window.dispatchEvent(new CustomEvent('pdfJsReady'));
                        return true;
                      } else {
                        throw new Error('PDF.js core functions not available');
                      }
                    }
                    return false;
                  } catch (error) {
                    console.error('❌ PDF.js initialization error:', error);
                    window.pdfJsError = true;
                    window.pdfJsErrorMessage = error.message;
                    return false;
                  }
                }
                
                // Try immediate initialization
                if (!initializePDFJS()) {
                  console.log('⏳ PDF.js not ready yet, setting up retry mechanism...');
                  
                  // Retry mechanism with exponential backoff
                  let retryCount = 0;
                  const maxRetries = 10;
                  
                  function retryInit() {
                    retryCount++;
                    console.log('🔄 PDF.js initialization attempt', retryCount);
                    
                    if (initializePDFJS()) {
                      return; // Success!
                    }
                    
                    if (retryCount < maxRetries) {
                      const delay = Math.min(1000 * Math.pow(1.5, retryCount), 5000);
                      setTimeout(retryInit, delay);
                    } else {
                      console.error('❌ PDF.js initialization failed after', maxRetries, 'attempts');
                      window.pdfJsError = true;
                      window.pdfJsErrorMessage = 'PDF.js failed to load after multiple attempts. Please check your internet connection and try refreshing the page.';
                    }
                  }
                  
                  // Start retry process
                  setTimeout(retryInit, 500);
                  
                  // Fallback: try again when page is fully loaded
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', function() {
                      setTimeout(function() {
                        if (!window.pdfJsReady && !window.pdfJsError) {
                          console.log('📄 DOM loaded, trying PDF.js init again...');
                          retryInit();
                        }
                      }, 1000);
                    });
                  }
                  
                  // Final fallback: try when window loads
                  window.addEventListener('load', function() {
                    setTimeout(function() {
                      if (!window.pdfJsReady && !window.pdfJsError) {
                        console.log('🌐 Window loaded, final PDF.js init attempt...');
                        retryInit();
                      }
                    }, 2000);
                  });
                }
              })();
            `
          }}
        />
        
        {/* Fallback CSS for better error display */}
        <style>{`
          .pdf-loading-error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            color: #991b1b;
          }
          .pdf-loading-error h3 {
            margin: 0 0 10px 0;
            color: #dc2626;
          }
          .pdf-loading-error ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .pdf-loading-error li {
            margin: 5px 0;
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
