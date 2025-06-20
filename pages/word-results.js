// /pages/word-results.js - COMPLETE ENHANCED WORD RESULTS PAGE WITH COLOR HIGHLIGHTING EXPORT
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

  // ENHANCED EXPORT FUNCTIONALITY WITH COLOR HIGHLIGHTING
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
      console.log('📄 Generating enhanced Word comparison report with color highlighting...');
      
      // Generate enhanced report data
      const exportData = generateEnhancedReport(wordResults, fileInfo);
      
      // Create enhanced HTML report with color highlighting
      const htmlContent = createEnhancedHTMLReportWithColors(exportData);
      
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
      
      console.log('✅ Enhanced report with color highlighting exported successfully');
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #059669, #047857);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
      `;
      successMessage.innerHTML = '✅ Enhanced report with color highlighting exported!';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
      
    } catch (error) {
      console.error('❌ Enhanced export failed:', error);
      alert('Failed to export enhanced report. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  /**
   * Generate enhanced report data with better change processing
   */
  const generateEnhancedReport = (results, fileInfo) => {
    const stats = results.change_statistics || {};
    const navigation = results.navigation || {};
    
    return {
      metadata: {
        title: 'Enhanced Word Document Comparison Report',
        subtitle: 'Professional Semantic Analysis with Color Highlighting Technology',
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

  /**
   * ENHANCED: Create HTML report with beautiful color highlighting
   */
  const createEnhancedHTMLReportWithColors = (data) => {
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
        
        /* ENHANCED COLOR HIGHLIGHTING STYLES */
        .changes-section { margin-top: 40px; }
        .change-item { background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin-bottom: 25px; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .change-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
        .change-type { font-weight: 600; color: #374151; font-size: 1.1rem; }
        .change-annotation { background: #059669; color: white; padding: 6px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; white-space: nowrap; }
        .change-content { border-radius: 8px; padding: 20px; margin-bottom: 15px; line-height: 1.8; font-size: 1rem; }
        
        .severity-high .change-content { border-left: 4px solid #dc2626; background: #fef2f2; }
        .severity-medium .change-content { border-left: 4px solid #f59e0b; background: #fefbf2; }
        .severity-low .change-content { border-left: 4px solid #22c55e; background: #f0fdf4; }
        
        .word-added {
            background: linear-gradient(135deg, #dcfce7, #bbf7d0);
            color: #166534;
            padding: 3px 6px;
            border-radius: 4px;
            margin: 0 1px;
            font-weight: 600;
            border: 1px solid #4ade80;
            box-shadow: 0 1px 3px rgba(5, 150, 105, 0.2);
        }
        
        .word-removed {
            background: linear-gradient(135deg, #fee2e2, #fecaca);
            color: #991b1b;
            padding: 3px 6px;
            border-radius: 4px;
            margin: 0 1px;
            font-weight: 600;
            text-decoration: line-through;
            border: 1px solid #f87171;
            box-shadow: 0 1px 3px rgba(220, 38, 38, 0.2);
        }
        
        .financial-highlight {
            background: linear-gradient(135deg, #fef3c7, #fde047);
            color: #92400e;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            border: 1px solid #f59e0b;
            box-shadow: 0 1px 2px rgba(245, 158, 11, 0.2);
        }
        
        .percentage-highlight {
            background: linear-gradient(135deg, #ddd6fe, #c4b5fd);
            color: #6b21a8;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            border: 1px solid #8b5cf6;
            box-shadow: 0 1px 2px rgba(139, 92, 246, 0.2);
        }
        
        .number-highlight {
            background: linear-gradient(135deg, #e0f2fe, #b3e5fc);
            color: #0277bd;
            padding: 1px 4px;
            border-radius: 3px;
            font-weight: 500;
            border: 1px solid #29b6f6;
        }
        
        .content-added {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-left: 4px solid #22c55e;
            color: #166534;
        }
        
        .content-removed {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-left: 4px solid #dc2626;
            color: #dc2626;
            opacity: 0.9;
        }
        
        .content-modified {
            background: #fefbf2;
            border: 1px solid #fed7aa;
            border-left: 4px solid #f59e0b;
            color: #92400e;
        }
        
        .word-diff-container {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            line-height: 1.8;
            overflow-wrap: break-word;
        }
        
        .change-meta {
            font-size: 0.8rem;
            color: #6b7280;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #f3f4f6;
            font-style: italic;
        }
        
        .severity-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 10px;
        }
        
        .severity-high .severity-badge { background: #fee2e2; color: #dc2626; }
        .severity-medium .severity-badge { background: #fef3c7; color: #d97706; }
        .severity-low .severity-badge { background: #dcfce7; color: #059669; }
        
        .diff-legend {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
            font-size: 0.9rem;
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            align-items: center;
            border: 1px solid #e2e8f0;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .footer { margin-top: 50px; padding-top: 30px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; }
        .powered-by { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 20px; border-radius: 12px; margin-top: 20px; font-weight: 600; }
        
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
            .change-item { break-inside: avoid; }
        }
        
        @media (max-width: 768px) { 
            .stats-grid { grid-template-columns: repeat(2, 1fr); } 
            .container { padding: 20px; }
            .change-header { flex-direction: column; align-items: flex-start; }
            .diff-legend { flex-direction: column; align-items: flex-start; }
        }
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
            <h2 style="color: #374151; margin-bottom: 25px; font-size: 1.8rem;">📋 Detailed Change Analysis with Color Highlighting</h2>
            
            <!-- Color Legend -->
            <div class="diff-legend">
                <strong>🎨 Color Legend:</strong>
                <div class="legend-item">
                    <span class="word-added">Added Text</span>
                </div>
                <div class="legend-item">
                    <span class="word-removed">Removed Text</span>
                </div>
                <div class="legend-item">
                    <span class="financial-highlight">$2.4M Financial</span>
                </div>
                <div class="legend-item">
                    <span class="percentage-highlight">25% Percentage</span>
                </div>
                <div class="legend-item">
                    <span class="number-highlight">147 Number</span>
                </div>
            </div>
            
            ${changes.slice(0, 25).map((change, index) => `
                <div class="change-item severity-${change.severity || 'medium'}">
                    <div class="change-header">
                        <div class="change-type">
                            ${change.sectionTitle || 'Document'} • ${change.type?.replace(/_/g, ' ').replace(/^\\w/, c => c.toUpperCase()) || 'Change'}
                            <span class="severity-badge">${change.severity || 'medium'}</span>
                        </div>
                        <div class="change-annotation">${change.annotation || '✏️ Modified'}</div>
                    </div>
                    <div class="change-content ${getContentClass(change)}">
                        ${generateColorHighlightedContent(change)}
                        ${change.wordCount ? `<div class="change-meta">📊 Word count: ${typeof change.wordCount === 'object' ? `${change.wordCount.old} → ${change.wordCount.new} (${change.wordCount.change > 0 ? '+' : ''}${change.wordCount.change})` : change.wordCount}</div>` : ''}
                    </div>
                </div>
            `).join('')}
            ${changes.length > 25 ? `<div style="text-align: center; color: #6b7280; font-style: italic; margin-top: 20px; padding: 20px; background: #f8fafc; border-radius: 8px;">📋 <strong>Report Truncated:</strong> Showing first 25 changes of ${changes.length} total changes for optimal viewing. <br><small>Export the full comparison results from the application for complete analysis.</small></div>` : ''}
        </div>
        ` : ''}

        <div class="footer">
            <p><strong>Analysis Quality:</strong> ${summary.semanticCoverage}% semantic coverage • Processing time: ${summary.processingTime}ms</p>
            <p style="margin-top: 10px;">Performance: ${Math.round(data.performance.efficiency * 100)}% efficiency • ${Math.round(data.performance.accuracy * 100)}% accuracy</p>
            <div class="powered-by">
                🚀 Powered by VeriDiff Enhanced SmartDiff Technology - Professional Document Analysis with Color Highlighting
            </div>
        </div>
    </div>
</body>
</html>`;
  };

  /**
   * Get CSS class for change content based on change type
   */
  const getContentClass = (change) => {
    if (change.type === 'paragraph_added') return 'content-added';
    if (change.type === 'paragraph_removed') return 'content-removed';
    if (change.type === 'paragraph_modified') return 'content-modified';
    return 'content-modified';
  };

  /**
   * Generate color-highlighted content with beautiful formatting
   */
  const generateColorHighlightedContent = (change) => {
    // Handle word-level diff with color highlighting
    if (change.wordDiff && Array.isArray(change.wordDiff)) {
      return `
        <div style="margin-bottom: 10px; font-weight: 600; color: #374151; font-size: 0.9rem;">
          🎨 Word-Level Changes:
        </div>
        <div class="word-diff-container">
          ${change.wordDiff.map(word => {
            switch (word.type) {
              case 'added':
                return `<span class="word-added">${escapeHtml(word.text)}</span>`;
              case 'removed':
                return `<span class="word-removed">${escapeHtml(word.text)}</span>`;
              case 'unchanged':
                return `<span>${escapeHtml(word.text)}</span>`;
              default:
                return `<span>${escapeHtml(word.text)}</span>`;
            }
          }).join('')}
        </div>
      `;
    }
    
    // Handle regular content with semantic highlighting
    const content = change.newContent || change.content || change.oldContent || '';
    
    // Apply semantic highlighting based on change type
    if (change.semantic) {
      return applySemanticHighlighting(content, change.semantic);
    }
    
    // Apply basic content highlighting
    return `<div style="font-size: 1rem; line-height: 1.6;">${applyBasicHighlighting(content)}</div>`;
  };

  /**
   * Apply semantic highlighting for financial, percentage, and numerical changes
   */
  const applySemanticHighlighting = (content, semantic) => {
    let highlightedContent = escapeHtml(content);
    
    // Highlight financial amounts
    if (semantic.type === 'financial') {
      highlightedContent = highlightedContent.replace(
        /(\$[\d,]+(?:\.\d{2})?|\$\d+(?:\.\d+)?\s*(?:million|M|thousand|K))/gi,
        '<span class="financial-highlight">$1</span>'
      );
    }
    
    // Highlight percentages
    if (semantic.type === 'quantitative' && semantic.category?.includes('Percentage')) {
      highlightedContent = highlightedContent.replace(
        /(\d+(?:\.\d+)?%)/gi,
        '<span class="percentage-highlight">$1</span>'
      );
    }
    
    // Highlight numbers
    if (semantic.type === 'quantitative' && !semantic.category?.includes('Percentage')) {
      highlightedContent = highlightedContent.replace(
        /(\b\d{1,3}(?:,\d{3})*\b)/g,
        '<span class="number-highlight">$1</span>'
      );
    }
    
    return `<div style="font-size: 1rem; line-height: 1.6;">${highlightedContent}</div>`;
  };

  /**
   * Apply basic highlighting for non-semantic content
   */
  const applyBasicHighlighting = (content) => {
    let highlighted = escapeHtml(content);
    
    // Highlight financial patterns
    highlighted = highlighted.replace(
      /(\$[\d,]+(?:\.\d{2})?|\$\d+(?:\.\d+)?\s*(?:million|M|thousand|K))/gi,
      '<span class="financial-highlight">$1</span>'
    );
    
    // Highlight percentages
    highlighted = highlighted.replace(
      /(\d+(?:\.\d+)?%)/gi,
      '<span class="percentage-highlight">$1</span>'
    );
    
    // Highlight large numbers
    highlighted = highlighted.replace(
      /(\b\d{1,3}(?:,\d{3})*\b)/g,
      '<span class="number-highlight">$1</span>'
    );
    
    return highlighted;
  };

  /**
   * Escape HTML to prevent XSS
   */
  const escapeHtml = (text) => {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
        whiteSpace: 'pre-line',
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
        <meta name="description" content="View your detailed Word document comparison results with enhanced semantic analysis and color highlighting" />
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
                      Enhanced + Color Highlighting
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
                title={!isAuthenticated ? 'Sign in to export professional reports with color highlighting' : ''}
              >
                {exportLoading ? '⏳ Exporting...' : '🎨 Export Report with Color Highlighting'}
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
