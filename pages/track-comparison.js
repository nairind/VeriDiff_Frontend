// /pages/track-comparison.js (or your results page)
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PdfResults from '../components/PdfResults';
// Import your existing Excel/CSV results components
// import ExcelCSVResults from '../components/ExcelCSVResults';

export default function TrackComparison() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisonType, setComparisonType] = useState(null);
  const [results, setResults] = useState(null);
  const [fileInfo, setFileInfo] = useState({ file1: null, file2: null });

  // For Excel/CSV results (your existing state)
  const [tabularResults, setTabularResults] = useState(null);
  const [headerMappings, setHeaderMappings] = useState(null);
  const [toleranceSettings, setToleranceSettings] = useState(null);

  // For PDF results
  const [pdfResults, setPdfResults] = useState(null);
  const [pdfOptions, setPdfOptions] = useState(null);

  useEffect(() => {
    loadComparisonResults();
  }, []);

  const loadComparisonResults = async () => {
    try {
      // Load file info
      const file1Info = JSON.parse(sessionStorage.getItem('veridiff_file1_info') || 'null');
      const file2Info = JSON.parse(sessionStorage.getItem('veridiff_file2_info') || 'null');
      
      if (!file1Info || !file2Info) {
        router.push('/');
        return;
      }

      setFileInfo({ file1: file1Info, file2: file2Info });

      // Determine comparison type
      const storedComparisonType = sessionStorage.getItem('veridiff_comparison_type');
      
      if (storedComparisonType === 'pdf') {
        // Load PDF results
        await loadPDFResults();
      } else {
        // Load Excel/CSV results (your existing logic)
        await loadTabularResults();
      }

    } catch (error) {
      console.error('Error loading comparison results:', error);
      setError('Failed to load comparison results. Please try again.');
      setIsLoading(false);
    }
  };

  const loadPDFResults = async () => {
    try {
      console.log('Loading PDF comparison results...');
      
      const pdfResultsData = sessionStorage.getItem('veridiff_pdf_results');
      const pdfOptionsData = sessionStorage.getItem('veridiff_pdf_options');

      if (!pdfResultsData) {
        throw new Error('PDF comparison results not found');
      }

      const parsedResults = JSON.parse(pdfResultsData);
      const parsedOptions = pdfOptionsData ? JSON.parse(pdfOptionsData) : {};

      setPdfResults(parsedResults);
      setPdfOptions(parsedOptions);
      setComparisonType('pdf');
      setIsLoading(false);

      console.log('PDF results loaded successfully:', parsedResults);

    } catch (error) {
      console.error('Error loading PDF results:', error);
      setError(`Failed to load PDF results: ${error.message}`);
      setIsLoading(false);
    }
  };

  const loadTabularResults = async () => {
    try {
      console.log('Loading tabular comparison results...');
      
      // Your existing logic to load and process Excel/CSV results
      const fileType = sessionStorage.getItem('veridiff_file_type');
      const headerMappingsData = sessionStorage.getItem('veridiff_header_mappings');
      const toleranceSettingsData = sessionStorage.getItem('veridiff_tolerance_settings');
      const selectedSheetsData = sessionStorage.getItem('veridiff_selected_sheets');

      if (!fileType) {
        throw new Error('File type information not found');
      }

      // Load your existing comparison engine results
      // This would call your existing comparison functions
      // const results = await performTabularComparison({
      //   fileType,
      //   headerMappings: JSON.parse(headerMappingsData || '{}'),
      //   toleranceSettings: JSON.parse(toleranceSettingsData || '{}'),
      //   selectedSheets: JSON.parse(selectedSheetsData || '{}')
      // });

      // For now, using placeholder structure
      const mockResults = {
        type: 'tabular',
        fileType: fileType,
        differences: [],
        matches: [],
        summary: { /* your existing summary structure */ }
      };

      setTabularResults(mockResults);
      setHeaderMappings(JSON.parse(headerMappingsData || '{}'));
      setToleranceSettings(JSON.parse(toleranceSettingsData || '{}'));
      setComparisonType('tabular');
      setIsLoading(false);

      console.log('Tabular results loaded successfully');

    } catch (error) {
      console.error('Error loading tabular results:', error);
      setError(`Failed to load comparison results: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleStartNewComparison = () => {
    // Clear session storage
    sessionStorage.clear();
    router.push('/');
  };

  const handleBackToSetup = () => {
    // Keep file data but go back to setup
    sessionStorage.removeItem('veridiff_pdf_results');
    sessionStorage.removeItem('veridiff_comparison_type');
    sessionStorage.removeItem('veridiff_pdf_options');
    router.push('/comparison');
  };

  const renderTabularResults = () => {
    // Your existing Excel/CSV results component
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          📊 Data Comparison Results
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
          Excel/CSV comparison results would be displayed here using your existing components.
        </p>
        
        {/* Your existing ExcelCSVResults component would go here */}
        {/* <ExcelCSVResults 
          results={tabularResults}
          fileInfo={fileInfo}
          headerMappings={headerMappings}
          toleranceSettings={toleranceSettings}
        /> */}
        
        <div style={{
          background: '#f8fafc',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Your existing Excel/CSV results display components will render here
          </p>
        </div>
      </div>
    );
  };

  const renderLoadingState = () => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⏳</div>
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#1f2937'
      }}>
        Loading Comparison Results
      </h3>
      <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
        Processing your files and generating detailed analysis...
      </p>
      <div style={{
        background: '#f3f4f6',
        borderRadius: '8px',
        padding: '15px',
        marginTop: '20px',
        display: 'inline-block'
      }}>
        <div style={{ fontSize: '0.9rem', color: '#374151' }}>
          📁 {fileInfo.file1?.name} vs {fileInfo.file2?.name}
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
        Comparison Failed
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
          🔧 Back to Setup
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
            ? 'Loading Results - VeriDiff'
            : error 
              ? 'Error - VeriDiff'
              : `Comparison Results - VeriDiff`
          }
        </title>
        <meta name="description" content="View your detailed file comparison results and analysis" />
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
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {isLoading 
                ? '⏳ Processing Comparison'
                : error 
                  ? '❌ Comparison Error'
                  : comparisonType === 'pdf'
                    ? '📕 PDF Document Analysis'
                    : '📊 Data Comparison Results'
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
                  <span>📁 <strong>{fileInfo.file1?.name}</strong></span>
                  <span style={{ color: '#2563eb' }}>vs</span>
                  <span>📁 <strong>{fileInfo.file2?.name}</strong></span>
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
                  background: '#f8fafc',
                  color: '#374151',
                  border: '1px solid #d1d5db',
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
                🔧 Modify Settings
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
          
          {!isLoading && !error && comparisonType === 'pdf' && (
            <PdfResults 
              results={pdfResults}
              file1Name={fileInfo.file1?.name}
              file2Name={fileInfo.file2?.name}
              options={pdfOptions}
            />
          )}
          
          {!isLoading && !error && comparisonType === 'tabular' && renderTabularResults()}
        </div>
        
        <Footer />
      </div>
    </>
  );
}
