// /pages/track-comparison.js - Updated with modal authentication
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SummaryCards from '../components/SummaryCards';
import ControlsBar from '../components/ControlsBar';
import ExportSection from '../components/ExportSection';
import ResultsDisplay from '../components/ResultsDisplay';
import AuthModal from '../components/AuthModal'; // Import the modal
import { createScrollManager } from '../utils/scrollUtils';
import { getFilteredResults, groupFields } from '../utils/filterUtils';
import { getRecordStatus, getStatusConfig } from '../utils/statusUtils';
import { getCharacterDiff, renderCharacterDiff } from '../utils/characterDiff';
import { handleDownloadExcel, handleDownloadCSV, handleDownloadHTMLDiff } from '../utils/exportUtils';
import { downloadResultsAsCSV } from '../utils/downloadResults';

// Simple analytics function
const trackAnalytics = async (eventType, data = {}) => {
  console.log('Analytics:', eventType, data);
};

export default function TrackComparison() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [scrollManager] = useState(() => createScrollManager());
  
  // Core states
  const [results, setResults] = useState(null);
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [error, setError] = useState(null);

  // Modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signin' or 'signup'

  // Results display states
  const [resultsFilter, setResultsFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [viewMode, setViewMode] = useState('unified');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [showCharacterDiff, setShowCharacterDiff] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [fieldGrouping, setFieldGrouping] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  useEffect(() => {
    // Restore results from sessionStorage
    const restoreData = () => {
      try {
        const resultsData = sessionStorage.getItem('veridiff_results');
        const fileTypeData = sessionStorage.getItem('veridiff_file_type');
        const file1Info = JSON.parse(sessionStorage.getItem('veridiff_file1_info'));
        const file2Info = JSON.parse(sessionStorage.getItem('veridiff_file2_info'));

        if (!resultsData || !fileTypeData || !file1Info || !file2Info) {
          router.push('/');
          return;
        }

        setResults(JSON.parse(resultsData));
        setFileType(fileTypeData);
        
        // Create file objects for display purposes
        setFile1({ name: file1Info.name, size: file1Info.size });
        setFile2({ name: file2Info.name, size: file2Info.size });

        // Auto-default to side-by-side for 10+ columns
        const parsedResults = JSON.parse(resultsData);
        if (parsedResults.results && parsedResults.results[0] && Object.keys(parsedResults.results[0].fields).length >= 10) {
          setViewMode('side-by-side');
        }
      } catch (error) {
        console.error('Error restoring results:', error);
        router.push('/');
      }
    };

    restoreData();
  }, [router]);

  useEffect(() => {
    scrollManager.restoreScroll();
  }, [viewMode, resultsFilter, searchTerm, focusMode, fieldGrouping, ignoreWhitespace, showCharacterDiff, sortField, sortDirection, expandedGroups, expandedRows, scrollManager]);

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
    // The page will automatically re-render with isAuthenticated = true after successful auth
  };

  // Handle new comparison
  const handleNewComparison = () => {
    // Clear sessionStorage
    sessionStorage.removeItem('veridiff_results');
    sessionStorage.removeItem('veridiff_file_type');
    sessionStorage.removeItem('veridiff_file1_info');
    sessionStorage.removeItem('veridiff_file2_info');
    sessionStorage.removeItem('veridiff_file1_data');
    sessionStorage.removeItem('veridiff_file2_data');
    
    router.push('/');
  };

  // State update handlers with scroll preservation
  const handleViewModeChange = useCallback((newMode) => {
    scrollManager.preserveScroll();
    setViewMode(newMode);
  }, [scrollManager]);

  const handleFilterChange = useCallback((newFilter) => {
    scrollManager.preserveScroll();
    setResultsFilter(newFilter);
  }, [scrollManager]);

  const handleSearchChange = useCallback((newTerm) => {
    scrollManager.preserveScroll();
    setSearchTerm(newTerm);
  }, [scrollManager]);

  const handleFocusModeToggle = useCallback((checked) => {
    scrollManager.preserveScroll();
    setFocusMode(checked);
  }, [scrollManager]);

  const handleFieldGroupingToggle = useCallback((checked) => {
    scrollManager.preserveScroll();
    setFieldGrouping(checked);
  }, [scrollManager]);

  const handleIgnoreWhitespaceToggle = useCallback((checked) => {
    scrollManager.preserveScroll();
    setIgnoreWhitespace(checked);
  }, [scrollManager]);

  const handleCharacterDiffToggle = useCallback((checked) => {
    scrollManager.preserveScroll();
    setShowCharacterDiff(checked);
  }, [scrollManager]);

  const toggleRowExpansion = (rowIndex) => {
    scrollManager.preserveScroll();
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowIndex)) {
      newExpanded.delete(rowIndex);
    } else {
      newExpanded.add(rowIndex);
    }
    setExpandedRows(newExpanded);
  };

  const toggleGroupExpansion = (groupName) => {
    scrollManager.preserveScroll();
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  // Get filtered results with progressive disclosure
  const filteredResults = getFilteredResults(results, resultsFilter, searchTerm, sortField, sortDirection);
  
  // Apply progressive disclosure - limit records for non-authenticated users
  const displayResults = isAuthenticated ? filteredResults : filteredResults.slice(0, 3);
  const hasMoreRecords = !isAuthenticated && filteredResults.length > 3;

  // Export handlers
  const onDownloadExcel = () => {
    handleDownloadExcel(results, file1, file2, fileType, viewMode, trackAnalytics)
      .catch(error => setError(error.message));
  };

  const onDownloadCSV = () => {
    handleDownloadCSV(results, file1, file2, viewMode, downloadResultsAsCSV, trackAnalytics, fileType)
      .catch(error => setError(error.message));
  };

  const onDownloadHTMLDiff = () => {
    handleDownloadHTMLDiff(results, file1, file2, fileType, viewMode, () => filteredResults, getRecordStatus, getStatusConfig, showCharacterDiff, trackAnalytics)
      .catch(error => setError(error.message));
  };

  if (!results) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading comparison results...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Comparison Results - VeriDiff</title>
        <meta name="description" content="View and analyze your file comparison results with advanced filtering and export options." />
        
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .focus-mode-row {
            transition: opacity 0.3s ease, transform 0.2s ease;
          }
          
          .focus-mode-row:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .field-group {
            transition: all 0.3s ease;
          }
          
          .field-group.expanded {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          }
          
          @media (max-width: 768px) {
            .results-controls { grid-template-columns: 1fr !important; }
            .unified-table { overflow-x: auto !important; }
            .unified-table table { min-width: 600px !important; }
            .unified-table th, .unified-table td { min-width: 80px !important; padding: 8px !important; }
            .field-group-grid { grid-template-columns: 1fr !important; }
            .side-by-side-grid { grid-template-columns: 1fr !important; }
            .side-by-side-row { grid-template-columns: 1fr !important; gap: 10px !important; }
            .file-column { margin-bottom: 15px !important; }
          }
          
          @media (max-width: 480px) {
            .results-controls { grid-template-columns: 1fr !important; gap: 10px !important; }
            .unified-table th, .unified-table td { min-width: 60px !important; padding: 6px !important; font-size: 0.8rem !important; }
            .field-value { font-size: 0.85rem !important; }
            .status-badge { font-size: 0.7rem !important; padding: 3px 6px !important; }
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
        
        <Header onSignIn={handleSignIn} onSignUp={handleSignUp} />

        {/* Auth Modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={handleAuthModalClose}
          initialMode={authMode}
        />

        {/* Error Display */}
        {error && (
          <section style={{
            padding: '2rem 0',
            background: '#fef2f2'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 20px'
            }}>
              <div style={{
                color: '#dc2626',
                padding: '20px',
                border: '2px solid #dc2626',
                borderRadius: '12px',
                background: 'white',
                fontSize: '1rem',
                fontWeight: '500',
                textAlign: 'center'
              }}>
                <strong>❌ Error:</strong> {error}
              </div>
            </div>
          </section>
        )}

        {/* Results Section */}
        <section id="results-section" style={{ 
          padding: '3rem 0',
          background: '#f0fdf4',
          borderTop: '1px solid #bbf7d0'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            
            {/* Enhanced Header */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '40px',
              padding: '30px',
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
              borderRadius: '20px',
              border: '1px solid #cbd5e1'
            }}>
              <h2 style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '2.5rem',
                fontWeight: '700',
                margin: '0 0 15px 0'
              }}>
                ✅ Comparison Complete!
              </h2>
              
              <p style={{
                fontSize: '1.1rem',
                color: '#6b7280',
                margin: '0 0 20px 0'
              }}>
                <strong>{file1?.name}</strong> vs <strong>{file2?.name}</strong>
                {!isAuthenticated && (
                  <span style={{
                    background: '#3b82f6',
                    color: 'white',
                    fontSize: '0.8rem',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    marginLeft: '10px'
                  }}>
                    Preview Mode
                  </span>
                )}
              </p>

              <div style={{
                display: 'inline-flex',
                gap: '15px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <button
                  type="button"
                  onClick={handleNewComparison}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🔄 Compare New Files
                </button>
              </div>
            </div>

            <SummaryCards results={results} />

            {/* Auto-detected Fields Banner */}
            {results.autoDetectedFields && results.autoDetectedFields.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                border: '2px solid #22c55e',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🤖</div>
                <div style={{ color: '#166534', fontWeight: '600', fontSize: '1.1rem', marginBottom: '5px' }}>
                  AI Auto-Detected Amount Fields
                </div>
                <div style={{ color: '#16a34a', fontSize: '1rem' }}>
                  {results.autoDetectedFields.join(' • ')}
                </div>
              </div>
            )}

            <ControlsBar
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              resultsFilter={resultsFilter}
              onFilterChange={handleFilterChange}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              focusMode={focusMode}
              onFocusModeToggle={handleFocusModeToggle}
              fieldGrouping={fieldGrouping}
              onFieldGroupingToggle={handleFieldGroupingToggle}
              ignoreWhitespace={ignoreWhitespace}
              onIgnoreWhitespaceToggle={handleIgnoreWhitespaceToggle}
              showCharacterDiff={showCharacterDiff}
              onCharacterDiffToggle={handleCharacterDiffToggle}
              filteredResultsLength={displayResults.length}
            />

            {/* Results Display */}
            <ResultsDisplay 
              filteredResults={displayResults}
              viewMode={viewMode}
              file1={file1}
              file2={file2}
              focusMode={focusMode}
              fieldGrouping={fieldGrouping}
              expandedGroups={expandedGroups}
              toggleGroupExpansion={toggleGroupExpansion}
              ignoreWhitespace={ignoreWhitespace}
              showCharacterDiff={showCharacterDiff}
              sortField={sortField}
              sortDirection={sortDirection}
              setSortField={setSortField}
              setSortDirection={setSortDirection}
              preserveScroll={scrollManager.preserveScroll}
              results={results}
            />

            {/* Upgrade prompt for non-authenticated users */}
            {hasMoreRecords && (
              <div style={{
                marginTop: '20px',
                padding: '25px',
                background: 'linear-gradient(135deg, #f0f9ff, #ecfdf5)',
                borderRadius: '12px',
                border: '2px solid #3b82f6',
                textAlign: 'center'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  marginBottom: '10px',
                  color: '#1f2937'
                }}>
                  🔓 See All {filteredResults.length} Records
                </h3>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '20px',
                  fontSize: '1rem'
                }}>
                  You're viewing {displayResults.length} of {filteredResults.length} records. Sign up to see complete results + export features.
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button 
                    onClick={handleSignUp}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    🚀 Sign Up Free
                  </button>
                  <button 
                    onClick={handleSignIn}
                    style={{
                      background: 'white',
                      color: '#3b82f6',
                      border: '2px solid #3b82f6',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    📧 Already have an account?
                  </button>
                </div>
              </div>
            )}

            <ExportSection 
              onDownloadExcel={onDownloadExcel}
              onDownloadCSV={onDownloadCSV}
              onDownloadHTMLDiff={onDownloadHTMLDiff}
            />
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
