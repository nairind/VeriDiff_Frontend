import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import UploadZone from '../components/UploadZone';
import FeatureSection from '../components/FeatureSection';
import PricingSection from '../components/PricingSection';

export default function Home() {
  const router = useRouter();
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [dragActive, setDragActive] = useState({ file1: false, file2: false });

  useEffect(() => {
    // Simple analytics - just console log for now
    console.log('Page view: home');
  }, []);

  const handleFileSelect = (fileNumber, event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (fileNumber === 1) {
        setFile1(selectedFile);
      } else {
        setFile2(selectedFile);
      }
    }
  };

  const handleDrop = (fileNumber, event) => {
    event.preventDefault();
    setDragActive({ ...dragActive, [`file${fileNumber}`]: false });
    
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      if (fileNumber === 1) {
        setFile1(droppedFile);
      } else {
        setFile2(droppedFile);
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDragEnter = (fileNumber) => {
    setDragActive({ ...dragActive, [`file${fileNumber}`]: true });
  };

  const handleDragLeave = (fileNumber) => {
    setDragActive({ ...dragActive, [`file${fileNumber}`]: false });
  };

  const handleProceedToComparison = () => {
    if (!file1 || !file2) {
      alert('Please select both files to compare');
      return;
    }

    // Store file metadata
    const file1Data = {
      name: file1.name,
      size: file1.size,
      type: file1.type,
      lastModified: file1.lastModified
    };
    const file2Data = {
      name: file2.name,
      size: file2.size,
      type: file2.type,
      lastModified: file2.lastModified
    };

    sessionStorage.setItem('veridiff_file1_info', JSON.stringify(file1Data));
    sessionStorage.setItem('veridiff_file2_info', JSON.stringify(file2Data));
    
    // Store actual file data as base64
    const storeFile = (file, key) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            // Store as base64 string (remove data URL prefix)
            const base64 = e.target.result.split(',')[1];
            sessionStorage.setItem(key, base64);
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    Promise.all([
      storeFile(file1, 'veridiff_file1_data'),
      storeFile(file2, 'veridiff_file2_data')
    ]).then(() => {
      router.push('/comparison');
    }).catch(error => {
      console.error('Error storing files:', error);
      alert('Error storing files. Please try again.');
    });
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }} className="upload-container">
                
                <UploadZone
                  fileNumber={1}
                  file={file1}
                  dragActive={dragActive.file1}
                  onFileSelect={(e) => handleFileSelect(1, e)}
                  onDrop={(e) => handleDrop(1, e)}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleDragEnter(1)}
                  onDragLeave={() => handleDragLeave(1)}
                />

                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  color: '#2563eb',
                  padding: '0 1rem'
                }}>
                  VS
                </div>

                <UploadZone
                  fileNumber={2}
                  file={file2}
                  dragActive={dragActive.file2}
                  onFileSelect={(e) => handleFileSelect(2, e)}
                  onDrop={(e) => handleDrop(2, e)}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleDragEnter(2)}
                  onDragLeave={() => handleDragLeave(2)}
                />
              </div>

              <button
                type="button"
                className="compare-button"
                onClick={handleProceedToComparison}
                disabled={!file1 || !file2}
                style={{
                  background: (!file1 || !file2) ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 3rem',
                  borderRadius: '0.75rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  cursor: (!file1 || !file2) ? 'not-allowed' : 'pointer',
                  marginTop: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  margin: '1.5rem auto 0',
                  transition: 'all 0.3s ease'
                }}
              >
                🔍 Compare Files
              </button>

              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                marginTop: '1rem',
                marginBottom: 0
              }}>
                Supports: Excel ↔ Excel • CSV ↔ CSV • Excel ↔ CSV cross-format
              </p>
            </div>
          </div>
        </section>

        <FeatureSection />
        
        <PricingSection 
          file1={file1} 
          file2={file2} 
          onCompare={handleProceedToComparison} 
        />

        <Footer />
      </div>
    </>
  );
}
