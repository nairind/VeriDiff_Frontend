// /pages/pdf-results.js - PDF RESULTS ONLY (Clean Split)
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PdfResults from '../components/PdfResults';

export default function PDFResultsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileInfo, setFileInfo] = useState({ file1: null, file2: null });
  const [pdfResults, setPdfResults] = useState(null);
  const [pdfOptions, setPdfOptions] = useState(null);

  useEffect(() => {
    loadPDFResults();
  }, []);

  const loadPDFResults = async () => {
    try {
      console.log('📕 Loading PDF comparison results...');
      
      // Load file info
      const file1Info = JSON.parse(sessionStorage.getItem('veridiff_file1_info') || 'null');
      const file2Info = JSON.parse(sessionStorage.getItem('veridiff_file2_info') || 'null');
      
      if (!file1Info || !file2Info) {
        console.error('❌ File info not found, redirecting to home');
        router.push('/');
        return;
      }

      // Verify these are PDF files
      if (!file1Info.name.toLowerCase().endsWith('.pdf') || !file2Info.name.toLowerCase().endsWith('.pdf')) {
        setError('This page is for PDF results only. Invalid file types detected.');
        setIsLoading(false);
        return;
      }

      setFileInfo({ file1: file1Info, file2: file2Info });

      // Load PDF results
      const pdfResultsData = sessionStorage.getItem('veridiff_pdf_results');
      const pdfOptionsData = sessionStorage.getItem('veridiff_pdf_options');

      console.log('🔍 DEBUG - PDF data availability:', {
        hasPdfResults: !!pdfResultsData,
        pdfResultsLength: pdfResultsData?.length,
        hasPdfOptions: !!pdfOptionsData,
        pdfOptionsLength: pdfOptionsData?.length
      });

      if (!pdfResultsData) {
        throw new Error('PDF comparison results not found in sessionStorage. Please run the comparison again.');
      }

      // Parse PDF results
      console.log('🔍 DEBUG - Parsing PDF results...');
      const parsedResults = JSON.parse(pdfResultsData);
      const parsedOptions = pdfOptionsData ? JSON.parse(pdfOptionsData) : {};

      console.log('🔍 DEBUG - Parsed PDF results structure:', {
        type: typeof parsedResults,
        keys: parsedResults ? Object.keys(parsedResults) : 'null',
        hasPages: !!parsedResults.pages,
        pagesCount: parsedResults.pages?.length,
        hasSummary: !!parsedResults.summary
      });

      // Validate PDF results
      if (!parsedResults || typeof parsedResults !== 'object') {
        throw new Error('Invalid PDF results format');
      }

      setPdfResults(parsedResults);
      setPdfOptions(parsedOptions);
      setIsLoading(false);

      console.log('✅ PDF results loaded successfully:', {
        pagesProcessed: parsedResults.pages?.length || 'unknown',
        hasComparison: !!parsedResults.summary
      });

    } catch (error) {
      console.error('❌ Error loading PDF results:', error);
      setError(`Failed to load PDF results: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleStartNewComparison = () => {
    // Clear session storage
    sessionStorage.clear();
    router.push('/');
  };

  const handleBackToSetup = () => {
    // Keep file data but go back to PDF setup
    sessionStorage.removeItem('veridiff_pdf_results');
    sessionStorage.removeItem('veridiff_pdf_options');
    router.push('/pdf-comparison');
  };

  const renderLoadingState = () => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📕</div>
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#1f2937'
      }}>
        Loading PDF Analysis Results
      </h3>
      <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
        Processing your PDF comparison analysis and generating detailed results...
      </p>
      <div style={{
        background: '#f3f4f6',
        borderRadius: '8px',
        padding: '15px',
        marginTop: '20px',
        display: 'inline-block'
      }}>
        <div style={{ fontSize: '0.9rem', color: '#374151' }}>
          📄 {fileInfo.file1?.name} vs {fileInfo.file2?.name}
        </div>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>❌</div>
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#dc2626'
      }}>
        PDF Results Error
      </h3>
      <p style={{
        color: '#6b7280',
        fontSize: '1.1rem',
        marginBottom: '25px',
        lineHeight: '1.6',
        maxWidth: '500px',
        margin: '0 auto 25px'
      }}>
        {error}
      </p>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={handleBackToSetup}
          style={{
            background: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🔧 Back to PDF Setup
        </button>
        <button
          onClick={handleStartNewComparison}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🏠 New Comparison
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>
          {isLoading 
            ? 'Loading PDF Results - VeriDiff'
            : error 
              ? 'PDF Results Error - VeriDiff'
              : `PDF Comparison Results - VeriDiff`
          }
        </title>
        <meta name="description" content="View your detailed PDF document comparison results and analysis" />
      </Head>
      
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Header />
        
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '20px'
        }}>
          {/* Page Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '10px',
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {isLoading 
                ? '⏳ Processing PDF Analysis'
                : error 
                  ? '❌ PDF Results Error'
                  : '📕 PDF Document Analysis'
              }
            </h1>
            
            {!isLoading && !error && (
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '15px',
                margin: '0 auto',
                maxWidth: '600px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ 
                  fontSize: '0.95rem', 
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  <span>📄 <strong>{fileInfo.file1?.name}</strong></span>
                  <span style={{ color: '#dc2626' }}>vs</span>
                  <span>📄 <strong>{fileInfo.file2?.name}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons (when not loading and no error) */}
          {!isLoading && !error && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px',
              marginBottom: '30px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleBackToSetup}
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔧 Modify PDF Settings
              </button>
              <button
                onClick={handleStartNewComparison}
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔄 New Comparison
              </button>
            </div>
          )}

          {/* Content */}
          {isLoading && renderLoadingState()}
          
          {error && renderErrorState()}
          
          {!isLoading && !error && pdfResults && (
            <PdfResults 
              results={pdfResults}
              file1Name={fileInfo.file1?.name}
              file2Name={fileInfo.file2?.name}
              options={pdfOptions}
            />
          )}
        </div>
        
        <Footer />
      </div>
    </>
  );
}
