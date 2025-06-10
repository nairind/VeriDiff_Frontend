// /pages/track-comparison.js
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SummaryCards from '../components/SummaryCards';
import ControlsBar from '../components/ControlsBar';
import ExportSection from '../components/ExportSection';
import ResultsDisplay from '../components/ResultsDisplay';
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
  const [scrollManager] = useState(() => createScrollManager());
  
  // Core states
  const [results, setResults] = useState(null);
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [error, setError] = useState(null);

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

  // Get filtered results
  const filteredResults = getFilteredResults(results, resultsFilter, searchTerm, sortField, sortDirection);

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
        
        <Header />

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
              filteredResultsLength={filteredResults.length}
            />

            <ExportSection 
              onDownloadExcel={onDownloadExcel}
              onDownloadCSV={onDownloadCSV}
              onDownloadHTMLDiff={onDownloadHTMLDiff}
            />

            {/* Results Display */}
            <ResultsDisplay 
              filteredResults={filteredResults}
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
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
