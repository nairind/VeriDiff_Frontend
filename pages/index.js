import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import UploadZone from '../components/UploadZone';
import FeatureSection from '../components/FeatureSection';
import PricingSection from '../components/PricingSection';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Simple analytics - just console log for now
    console.log('Page view: home');
  }, []);

  // File type detection helper
  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['xlsx', 'xls', 'xlsm'].includes(extension)) return 'excel';
    if (extension === 'csv') return 'csv';
    if (extension === 'pdf') return 'pdf';
    return 'unknown';
  };

  const handleFilesReady = async ({ file1, file2 }) => {
    try {
      // Detect file types
      const file1Type = getFileType(file1.name);
      const file2Type = getFileType(file2.name);
      
      console.log('🔍 File types detected:', { file1Type, file2Type });

      // Route based on file type combination
      if (file1Type === 'pdf' && file2Type === 'pdf') {
        console.log('📕 Routing to PDF comparison...');
        await router.push('/pdf-comparison');
        
      } else if (['excel', 'csv'].includes(file1Type) && ['excel', 'csv'].includes(file2Type)) {
        console.log('📊 Routing to Excel/CSV comparison...');
        await router.push('/excel-csv-comparison');
        
      } else {
        // Handle invalid file type combinations
        let errorMessage = '';
        
        if (file1Type === 'unknown' || file2Type === 'unknown') {
          errorMessage = 'Unsupported file type detected. Please upload PDF, Excel (.xlsx/.xls), or CSV files only.';
        } else if ((file1Type === 'pdf' && file2Type !== 'pdf') || (file1Type !== 'pdf' && file2Type === 'pdf')) {
          errorMessage = 'Cannot mix PDF with other file types. Please upload two PDF files or two data files (Excel/CSV).';
        } else {
          errorMessage = `Unexpected file combination: ${file1Type} and ${file2Type}. Please contact support.`;
        }
        
        console.error('❌ Invalid file combination:', { file1Type, file2Type });
        alert(errorMessage);
      }
      
    } catch (error) {
      console.error('Error navigating to comparison:', error);
      alert('Error proceeding to comparison. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>VeriDiff - Professional File Comparison Tool | Excel, CSV, Cross-Format Analysis</title>
        <meta name="description" content="Compare Excel, CSV, and mixed file formats with advanced features. Smart header mapping, tolerance settings, character-level diff, and professional reporting. All processing done locally in your browser." />
        <meta name="keywords" content="file comparison, excel comparison, csv comparison, data analysis, file diff, spreadsheet comparison, data validation, professional tools" />
        <meta name="robots" content="index, follow" />
        
        <style>{`
          .upload-zone {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .upload-zone:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(37, 99, 235, 0.15);
          }
          
          .upload-zone.drag-active {
            border-color: #2563eb !important;
            background-color: #eff6ff !important;
          }
          
          @media (max-width: 768px) {
            .upload-container { flex-direction: column !important; gap: 1rem !important; }
            .upload-zone { min-height: 120px !important; }
            .compare-button { width: 100% !important; margin-top: 1rem !important; }
          }
        `}</style>
      </Head>
      
      <div style={{
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: 0,
        padding: 0,
        color: '#1f2937',
        background: '#f8fafc'
      }}>
      {/* Partnership Header */}
<div style={{
  background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
  borderBottom: '2px solid #f59e0b',
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
      fontSize: '0.9rem',
      color: '#92400e',
      fontWeight: '600'
    }}>
      🎯 Get 6 Months Free + Shape the future of data comparison • Partnership Program ends July 11th, 2025
    </p>
  </div>
</div>    
        <Header />

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

        {/* Hero Section with Upload Interface */}
        <section style={{
          background: 'linear-gradient(135deg, #eff6ff, #f8fafc)',
          padding: '3rem 0',
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
              Professional File Comparison
              <span style={{ 
                display: 'block', 
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                backgroundClip: 'text' 
              }}>
                Made Simple
              </span>
            </h1>
            
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#6b7280', 
              marginBottom: '3rem', 
              maxWidth: '600px', 
              marginLeft: 'auto', 
              marginRight: 'auto',
              lineHeight: '1.6'
            }}>
              Compare Excel, CSV, and mixed file formats with enterprise-grade features. Smart mapping, tolerance settings, and detailed analysis.
            </p>

            {/* Upload Interface */}
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <UploadZone onFilesReady={handleFilesReady} />

              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                marginTop: '1.5rem',
                marginBottom: 0
              }}>
                Supports: Excel ↔ Excel • CSV ↔ CSV • Excel ↔ CSV cross-format • PDF ↔ PDF
              </p>
            </div>
          </div>
        </section>

        {/* Why Your Expertise Matters */}
        <section style={{
          padding: '2.5rem 0',
          background: 'white'
        }}>
          <div style={{
            maxWidth: '800px',
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
              
             {/* Why Your Expertise Matters */}
        <section style={{
          padding: '2.5rem 0',
          background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
              border: '2px solid #3b82f6',
              borderRadius: '50px',
              padding: '0.5rem 1.5rem',
              marginBottom: '2rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>🤝</span>
              <span style={{ fontWeight: '700', color: '#1e40af' }}>Professional Collaboration</span>
            </div>

            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '2rem',
              color: '#1f2937'
            }}>
              Why Your Professional Expertise Matters
            </h2>
            
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              marginBottom: '2rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem'
                }}>💼</div>
              </div>

              <p style={{
                fontSize: '1.2rem',
                color: '#6b7280',
                lineHeight: '1.7',
                marginBottom: '2rem'
              }}>
                We're building VeriDiff for professionals who understand the critical importance of accurate data comparison. 
                Your real-world experience with Excel files, CSV data, and document analysis is exactly what we need to 
                create a market-leading solution.
              </p>

              <div style={{
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                border: '2px solid #f59e0b',
                marginBottom: '1.5rem'
              }}>
                <p style={{
                  fontSize: '1.1rem',
                  color: '#92400e',
                  lineHeight: '1.6',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  💡 <strong>Your Impact:</strong> Every comparison you run, every edge case you encounter, and every suggestion you share 
                  helps us build features that matter for professional workflows.
                </p>
              </div>

              <p style={{
                fontSize: '1.1rem',
                color: '#059669',
                lineHeight: '1.6',
                fontWeight: '600',
                fontStyle: 'italic'
              }}>
                This isn't just testing—it's collaborative development with industry experts.
              </p>
            </div>
          </div>
        </section>   
          
        {/* What You Get in Return */}
        <section style={{
          padding: '2.5rem 0',
          background: '#f8fafc'
        }}>
          <div style={{
            maxWidth: '800px',
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
              What You Get in Return
            </h2>

            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#059669',
                marginBottom: '1rem'
              }}>
                6 Months Individual Plan Free (£114 Value)
              </h3>
              <p style={{
                fontSize: '1.1rem',
                color: '#6b7280',
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>
                Enterprise competitors charge £150-300 for similar 6-month access. You get VeriDiff's advanced features completely free.
              </p>
            </div>
          </div>
        </section>        

        {/* How Your Feedback Shapes Development */}
        <section style={{
          padding: '2.5rem 0',
          background: 'white'
        }}>
          <div style={{
            maxWidth: '800px',
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
              How Your Feedback Shapes Development
            </h2>
            
            <p style={{
              fontSize: '1.2rem',
              color: '#6b7280',
              lineHeight: '1.7',
              marginBottom: '2rem'
            }}>
              This isn't traditional beta testing. We're building VeriDiff's roadmap based on real professional needs. 
              Your feedback directly influences which features we prioritize and how we implement them.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
              marginTop: '3rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                  Feature Requests
                </h3>
                <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: '1.5' }}>
                  Your workflow needs become our development priorities
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔧</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                  Usability Improvements
                </h3>
                <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: '1.5' }}>
                  Interface refinements based on professional usage patterns
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚡</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                  Performance Optimization
                </h3>
                <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: '1.5' }}>
                  Speed and accuracy improvements for your specific file types
                </p>
              </div>
            </div>
          </div>
        </section>    

        {/* Partnership Details */}
        <section style={{
          padding: '2.5rem 0',
          background: '#f8fafc'
        }}>
          <div style={{
            maxWidth: '800px',
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
              Partnership Program Details
            </h2>

           <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '3rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              textAlign: 'left'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                How It Works
              </h3>
              
              <div style={{
                display: 'grid',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>1</div>
                  <span style={{ fontSize: '1rem', color: '#374151', lineHeight: '1.5' }}>
                    Use VeriDiff for your real work - unlimited comparisons, all features unlocked
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>2</div>
                  <span style={{ fontSize: '1rem', color: '#374151', lineHeight: '1.5' }}>
                    Share feedback through the in-app system when you encounter interesting cases
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>3</div>
                  <span style={{ fontSize: '1rem', color: '#374151', lineHeight: '1.5' }}>
                    Get 6 months Individual Plan free after providing meaningful insights
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>4</div>
                  <span style={{ fontSize: '1rem', color: '#374151', lineHeight: '1.5' }}>
                    Continue using VeriDiff with full access while we build features you've influenced
                  </span>
                </div>
              </div>

              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                borderRadius: '0.75rem',
                border: '2px solid #10b981'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  fontSize: '0.9rem',
                  color: '#047857',
                  lineHeight: '1.6'
                }}>
                  <div>
                    <strong style={{ color: '#065f46' }}>Program ends:</strong><br/>
                    July 11th, 2025
                  </div>
                  <div>
                    <strong style={{ color: '#065f46' }}>Commitment:</strong><br/>
                    Use for real work, share honest feedback
                  </div>
                  <div>
                    <strong style={{ color: '#065f46' }}>Time investment:</strong><br/>
                    Whatever you're comfortable with - no minimums
                  </div>
                </div>
              </div>
            </div>     
          </div>
        </section>              
      <FeatureSection />
     
        <Footer />
      </div>
    </>
  );
}
