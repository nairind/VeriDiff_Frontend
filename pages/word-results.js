// /pages/word-results.js - ENHANCED WORD RESULTS PAGE WITH PROFESSIONAL FEATURES
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import WordResults from '../components/WordResults';
import AuthModal from '../components/AuthModal';

export default function EnhancedWordResultsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileInfo, setFileInfo] = useState({ file1: null, file2: null });
  const [wordResults, setWordResults] = useState(null);
  const [wordOptions, setWordOptions] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup');

  useEffect(() => {
    loadEnhancedWordResults();
  }, []);

  const loadEnhancedWordResults = async () => {
    try {
      console.log('📝 Loading enhanced Word comparison results...');
      
      // Load file info
      const file1Info = JSON.parse(sessionStorage.getItem('veridiff_file1_info') || 'null');
      const file2Info = JSON.parse(sessionStorage.getItem('veridiff_file2_info') || 'null');
      
      if (!file1Info || !file2Info) {
        console.error('❌ File info not found, redirecting to home');
        router.push('/');
        return;
      }

      // Verify these are Word files
      const isWordFile = (fileName) => {
        const ext = fileName.toLowerCase();
        return ext.endsWith('.docx') || ext.endsWith('.doc');
      };

      if (!isWordFile(file1Info.name) || !isWordFile(file2Info.name)) {
        setError('This page is for Word results only. Invalid file types detected.');
        setIsLoading(false);
        return;
      }

      setFileInfo({ file1: file1Info, file2: file2Info });

      // Load enhanced Word results
      const wordResultsData = sessionStorage.getItem('veridiff_word_results');
      const wordOptionsData = sessionStorage.getItem('veridiff_word_options');

      console.log('🔍 DEBUG - Enhanced Word data availability:', {
        hasWordResults: !!wordResultsData,
        wordResultsLength: wordResultsData?.length,
        hasWordOptions: !!wordOptionsData,
        wordOptionsLength: wordOptionsData?.length
      });

      if (!wordResultsData) {
        throw new Error('Enhanced Word comparison results not found in sessionStorage. Please run the comparison again.');
      }

      // Parse enhanced Word results
      console.log('🔍 DEBUG - Parsing enhanced Word results...');
      const parsedResults = JSON.parse(wordResultsData);
      const parsedOptions = wordOptionsData ? JSON.parse(wordOptionsData) : {};

      console.log('🔍 DEBUG - Parsed enhanced Word results structure:', {
        type: typeof parsedResults,
        keys: parsedResults ? Object.keys(parsedResults) : 'null',
        hasEnhancedChanges: !!parsedResults.enhanced_changes,
        changesCount: parsedResults.enhanced_changes?.length || 0,
        hasNavigation: !!parsedResults.navigation,
        hasStats: !!parsedResults.change_statistics,
        comparisonMethod: parsedResults.comparison_method
      });

      // Validate enhanced Word results
      if (!parsedResults || typeof parsedResults !== 'object') {
        throw new Error('Invalid enhanced Word results format');
      }

      // Check if this is legacy format and needs conversion
      if (!parsedResults.enhanced_changes && parsedResults.text_changes) {
        console.warn('⚠️ Legacy Word results detected, converting to enhanced format...');
        const convertedResults = convertLegacyResults(parsedResults);
        setWordResults(convertedResults);
      } else {
        setWordResults(parsedResults);
      }
      
      setWordOptions(parsedOptions);
      setIsLoading(false);

      console.log('✅ Enhanced Word results loaded successfully:', {
        enhancedChanges: parsedResults.enhanced_changes?.length || 0,
        similarityScore: parsedResults.similarity_score,
        totalSections: parsedResults.navigation?.total_sections || 0,
        semanticCoverage: parsedResults.quality_metrics?.semantic_analysis_coverage || 0
      });

    } catch (error) {
      console.error('❌ Error loading enhanced Word results:', error);
      setError(`Failed to load enhanced Word results: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Convert legacy results to enhanced format
  const convertLegacyResults = (legacyResults) => {
    console.log('🔄 Converting legacy Word results to enhanced format...');
    
    const enhancedChanges = (legacyResults.text_changes || []).map((change, index) => ({
      id: `legacy_change_${index}`,
      type: `paragraph_${change.type}`,
      sectionIndex: change.section || 0,
      sectionTitle: 'Document Section',
      paragraphIndex: change.paragraph || 0,
      content: change.old_text || change.new_text || '',
      oldContent: change.old_text,
      newContent: change.new_text,
      annotation: '✏️ Text change',
      severity: 'medium',
      wordCount: typeof change.word_count === 'number' ? change.word_count : 0,
      displayIndex: index + 1
    }));

    return {
      ...legacyResults,
      comparison_method: 'enhanced_word_semantic_comparison',
      enhanced_changes: enhancedChanges,
      change_statistics: {
        total_changes: enhancedChanges.length,
        additions: enhancedChanges.filter(c => c.type.includes('added')).length,
        deletions: enhancedChanges.filter(c => c.type.includes('removed')).length,
        modifications: enhancedChanges.filter(c => c.type.includes('modified')).length,
        unchanged: 0,
        semantic_breakdown: {
          financial: 0,
          quantitative: 0,
          qualitative: 0,
          textual: enhancedChanges.length
        }
      },
      navigation: {
        total_sections: 1,
        sections_with_changes: 1,
        major_changes: enhancedChanges.filter(c => c.severity === 'high').length,
        change_density: enhancedChanges.length / Math.max(1, enhancedChanges.length)
      },
      quality_metrics: {
        overall_success_rate: 1.0,
        semantic_analysis_coverage: 0,
        processing_efficiency: 1.0
      }
    };
  };

  const handleStartNewComparison = () => {
    sessionStorage.clear();
    router.push('/');
  };

  const handleBackToSetup = () => {
    sessionStorage.removeItem('veridiff_word_results');
    sessionStorage.removeItem('veridiff_word_options');
    router.push('/word-comparison');
  };

  // Enhanced export functionality
  const handleExportReport = async () => {
    if (!wordResults || !isAuthenticated) {
      if (!isAuthenticated) {
        setAuthMode('signup');
        setShowAuthModal(true);
        return;
      }
      return;
    }

    setExportLoading(true);
    
    try {
      console.log('📄 Generating enhanced Word comparison report...');
      
      const exportData = generateEnhancedReport(wordResults, fileInfo);
      
      // Create enhanced HTML report
      const htmlContent = createEnhancedHTMLReport(exportData);
      
      // Download the report
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Enhanced_Word_Comparison_Report_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ Enhanced report exported successfully');
      
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const generateEnhancedReport = (results, fileInfo) => {
    const stats = results.change_statistics || {};
    const navigation = results.navigation || {};
    
    return {
      metadata: {
        title: 'Enhanced Word Document Comparison Report',
        subtitle: 'Professional Semantic Analysis with SmartDiff Technology',
        generatedAt: new Date().toLocaleString('en-GB', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        files: {
          file1: fileInfo.file1?.name || 'Document 1',
          file2: fileInfo.file2?.name || 'Document 2'
        }
      },
      summary: {
        similarity: results.similarity_score || 0,
        totalChanges: stats.total_changes || 0,
        sectionsAnalyzed: navigation.total_sections || 0,
        semanticCoverage: Math.round((results.quality_metrics?.semantic_analysis_coverage || 0) * 100),
        processingTime: results.processing_time?.total_time_ms || 0
      },
      statistics: {
        additions: stats.additions || 0,
        deletions: stats.deletions || 0,
        modifications: stats.modifications || 0,
        financial: stats.semantic_breakdown?.financial || 0,
        quantitative: stats.semantic_breakdown?.quantitative || 0,
        qualitative: stats.semantic_breakdown?.qualitative || 0,
        majorChanges: (results.enhanced_changes || []).filter(c => c.severity === 'high').length
      },
      changes: results.enhanced_changes || [],
      performance: {
        efficiency: results.quality_metrics?.processing_efficiency || 1.0,
        accuracy: results.quality_metrics?.overall_success_rate || 1.0
      }
    };
  };

  const createEnhancedHTMLReport = (data) => {
    const { metadata, summary, statistics, changes } = data;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metadata.title} - ${metadata.files.file1} vs ${metadata.files.file2}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; background: #f8fafc; padding: 20px; 
        }
        .container { max-width: 1400px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 3px solid #059669; }
        .title { font-size: 2.5rem; font-weight: 800; margin-bottom: 15px; background: linear-gradient(135deg, #059669, #047857); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .subtitle { color: #6b7280; font-size: 1.2rem; margin-bottom: 20px; }
        .meta-info { background: #f0fdf4; padding: 20px; border-radius: 12px; margin-top: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .stat-card { background: #f8fafc; padding: 25px; border-radius: 12px; border: 2px solid #e5e7eb; text-align: center; transition: transform 0.2s ease; }
        .stat-card:hover { transform: translateY(-2px); border-color: #059669; }
        .stat-value { font-size: 2.5rem; font-weight: 700; margin-bottom: 8px; }
        .stat-label { color: #6b7280; font-size: 0.9rem; font-weight: 500; }
        .similarity-excellent { color: #22c55e; }
        .similarity-good { color: #84cc16; }
        .similarity-fair { color: #f59e0b; }
        .similarity-poor { color: #ef4444; }
        .changes-section { margin-top: 40px; }
        .change-item { background: white; border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 20px; position: relative; }
        .change-header { display: flex; justify-content: between; align-items: center; margin-bottom: 15px; }
        .change-type { font-weight: 600; color: #374151; font-size: 1.1rem; }
        .change-annotation { background: #059669; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .change-content { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #059669; }
        .severity-high { border-left-color: #dc2626; }
        .severity-medium { border-left-color: #f59e0b; }
        .severity-low { border-left-color: #22c55e; }
        .footer { margin-top: 50px; padding-top: 30px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; }
        .powered-by { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 20px; border-radius: 12px; margin-top: 20px; font-weight: 600; }
        @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .container { padding: 20px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">📝 ${metadata.title}</h1>
            <p class="subtitle">${metadata.subtitle}</p>
            <div class="meta-info">
                <p><strong>Generated:</strong> ${metadata.generatedAt}</p>
                <p><strong>Comparison:</strong> <span style="color: #059669; font-weight: 600;">${metadata.files.file1}</span> vs <span style="color: #059669; font-weight: 600;">${metadata.files.file2}</span></p>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value similarity-${summary.similarity >= 80 ? 'excellent' : summary.similarity >= 60 ? 'good' : summary.similarity >= 40 ? 'fair' : 'poor'}">
                    ${summary.similarity}%
                </div>
                <div class="stat-label">Document Similarity</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #7c3aed;">${summary.totalChanges}</div>
                <div class="stat-label">Total Changes Detected</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #059669;">${summary.sectionsAnalyzed}</div>
                <div class="stat-label">Sections Analyzed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #dc2626;">${statistics.majorChanges}</div>
                <div class="stat-label">Major Changes</div>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value" style="color: #22c55e;">+${statistics.additions}</div>
                <div class="stat-label">Additions</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #ef4444;">-${statistics.deletions}</div>
                <div class="stat-label">Deletions</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #f59e0b;">${statistics.modifications}</div>
                <div class="stat-label">Modifications</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #059669;">${statistics.financial + statistics.quantitative}</div>
                <div class="stat-label">Data Changes</div>
            </div>
        </div>

        ${changes.length > 0 ? `
        <div class="changes-section">
            <h2 style="color: #374151; margin-bottom: 25px; font-size: 1.8rem;">📋 Detailed Change Analysis</h2>
            ${changes.slice(0, 20).map((change, index) => `
                <div class="change-item">
                    <div class="change-header">
                        <div class="change-type">${change.sectionTitle || 'Document'} • ${change.type?.replace(/_/g, ' ').replace(/^\\w/, c => c.toUpperCase()) || 'Change'}</div>
                        <div class="change-annotation">${change.annotation || '✏️ Modified'}</div>
                    </div>
                    <div class="change-content severity-${change.severity || 'medium'}">
                        ${change.newContent || change.content || change.oldContent || 'Content changed'}
                        ${change.wordCount ? `<div style="margin-top: 10px; font-size: 0.8rem; color: #6b7280;">Word count: ${typeof change.wordCount === 'object' ? `${change.wordCount.old} → ${change.wordCount.new}` : change.wordCount}</div>` : ''}
                    </div>
                </div>
            `).join('')}
            ${changes.length > 20 ? `<div style="text-align: center; color: #6b7280; font-style: italic; margin-top: 20px;">... and ${changes.length - 20} more changes (showing first 20)</div>` : ''}
        </div>
        ` : ''}

        <div class="footer">
            <p><strong>Analysis Quality:</strong> ${summary.semanticCoverage}% semantic coverage • Processing time: ${summary.processingTime}ms</p>
            <p style="margin-top: 10px;">Performance: ${Math.round(data.performance.efficiency * 100)}% efficiency • ${Math.round(data.performance.accuracy * 100)}% accuracy</p>
            <div class="powered-by">
                🚀 Powered by VeriDiff Enhanced SmartDiff Technology - Professional Document Analysis
            </div>
        </div>
    </div>
</body>
</html>`;
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

  const renderLoadingState = () => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🧠</div>
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#1f2937'
      }}>
        Loading Enhanced Word Analysis
      </h3>
      <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
        Processing semantic analysis and generating professional comparison results...
      </p>
      <div style={{
        background: '#f3f4f6',
        borderRadius: '8px',
        padding: '15px',
        marginTop: '20px',
        display: 'inline-block'
      }}>
        <div style={{ fontSize: '0.9rem', color: '#374151' }}>
          🧠 Semantic analysis with SmartDiff technology
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
        Enhanced Word Results Error
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
          🔧 Back to Word Setup
        </button>
        <button
          onClick={handleStartNewComparison}
          style={{
            background: 'linear-gradient(135deg, #059669, #047857)',
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
            ? 'Loading Enhanced Word Results - VeriDiff'
            : error 
              ? 'Word Results Error - VeriDiff'
              : `Enhanced Word Comparison Results - VeriDiff`
          }
        </title>
        <meta name="description" content="View your detailed Word document comparison results with enhanced semantic analysis" />
      </Head>
      
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Header />
        
        {/* Auth Modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={handleAuthModalClose}
          initialMode={authMode}
        />
        
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
              background: 'linear-gradient(135deg, #059669, #047857)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {isLoading 
                ? '🧠 Processing Enhanced Analysis'
                : error 
                  ? '❌ Word Results Error'
                  : '🧠 Enhanced Word Document Analysis'
              }
            </h1>
            
            {!isLoading && !error && (
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '15px',
                margin: '0 auto',
                maxWidth: '700px',
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
                  <span>📝 <strong>{fileInfo.file1?.name}</strong></span>
                  <span style={{ color: '#059669' }}>vs</span>
                  <span>📝 <strong>{fileInfo.file2?.name}</strong></span>
                  {wordResults?.comparison_method === 'enhanced_word_semantic_comparison' && (
                    <span style={{
                      background: '#059669',
                      color: 'white',
                      fontSize: '0.8rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      marginLeft: '8px'
                    }}>
                      Enhanced
                    </span>
                  )}
                  {!isAuthenticated && (
                    <span style={{
                      background: '#f59e0b',
                      color: 'white',
                      fontSize: '0.8rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      marginLeft: '8px'
                    }}>
                      Preview
                    </span>
                  )}
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
                  background: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
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
                onClick={handleExportReport}
                disabled={exportLoading || !isAuthenticated}
                style={{
                  background: exportLoading ? '#9ca3af' : isAuthenticated ? '#6366f1' : '#e5e7eb',
                  color: exportLoading ? 'white' : isAuthenticated ? 'white' : '#9ca3af',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: exportLoading ? 'not-allowed' : isAuthenticated ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                title={!isAuthenticated ? 'Sign in to export professional reports' : ''}
              >
                {exportLoading ? '⏳ Exporting...' : '📄 Export Report'}
              </button>
              
              <button
                onClick={handleStartNewComparison}
                style={{
                  background: 'linear-gradient(135deg, #059669, #047857)',
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
          
          {!isLoading && !error && wordResults && (
            <WordResults 
              results={wordResults}
              file1Name={fileInfo.file1?.name}
              file2Name={fileInfo.file2?.name}
              options={wordOptions}
              isAuthenticated={isAuthenticated}
              onSignUp={handleSignUp}
              onSignIn={handleSignIn}
            />
          )}
        </div>
        
        <Footer />
      </div>
    </>
  );
}
