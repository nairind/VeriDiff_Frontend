import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import AuthGuard from '../../components/auth/AuthGuard';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

// Import PDF-specific utilities
import { parsePDFFile, comparePDFFiles } from '../../utils/pdfFileComparison1';

// Import PDF result component
import PdfResults from '../../components/PdfResults';

// ===== PDF FILE SIZE LIMITS =====
const PDF_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB
const PDF_SIZE_LIMIT_TEXT = '100MB';

// ===== ENHANCED PDF COMPARISON OPTIONS =====
const COMPARISON_SENSITIVITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CUSTOM: 'custom'
};

const CHANGE_TYPES = {
  INSERTION: 'insertion',
  DELETION: 'deletion',
  MODIFICATION: 'modification',
  FORMATTING: 'formatting',
  MOVE: 'move'
};

// ===== ENHANCED PDF RESULTS COMPONENT =====
const EnhancedPdfResults = ({ results, file1Name, file2Name, onExport, onJumpToChange }) => {
  if (!results) return null;

  const { changes = [], statistics = {}, metadata = {} } = results;
  
  const changeTypeColors = {
    [CHANGE_TYPES.INSERTION]: '#22c55e',
    [CHANGE_TYPES.DELETION]: '#ef4444', 
    [CHANGE_TYPES.MODIFICATION]: '#f59e0b',
    [CHANGE_TYPES.FORMATTING]: '#8b5cf6',
    [CHANGE_TYPES.MOVE]: '#06b6d4'
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return '#22c55e';
    if (confidence >= 0.7) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '30px',
      marginBottom: '30px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb'
    }}>
      {/* Header with Export Options */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #dc2626, #ea580c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: 0
        }}>
          📊 Comparison Results
        </h2>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onExport('summary')}
            style={{
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            📄 Export Summary
          </button>
          <button
            onClick={() => onExport('detailed')}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            📑 Export Detailed Report
          </button>
          <button
            onClick={() => onExport('shareable')}
            style={{
              background: '#22c55e',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            🔗 Create Shareable Link
          </button>
        </div>
      </div>

      {/* Document Metadata Comparison */}
      {metadata && (
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: '600' }}>
            📋 Document Metadata
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            <div>
              <strong>File 1 ({file1Name}):</strong>
              <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '5px' }}>
                Pages: {metadata.file1?.pages || 'Unknown'}<br/>
                Created: {metadata.file1?.created || 'Unknown'}<br/>
                Modified: {metadata.file1?.modified || 'Unknown'}<br/>
                Author: {metadata.file1?.author || 'Unknown'}
              </div>
            </div>
            <div>
              <strong>File 2 ({file2Name}):</strong>
              <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '5px' }}>
                Pages: {metadata.file2?.pages || 'Unknown'}<br/>
                Created: {metadata.file2?.created || 'Unknown'}<br/>
                Modified: {metadata.file2?.modified || 'Unknown'}<br/>
                Author: {metadata.file2?.author || 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Statistics Dashboard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        {Object.entries(statistics).map(([type, count]) => (
          <div key={type} style={{
            background: `${changeTypeColors[type]}15`,
            border: `2px solid ${changeTypeColors[type]}30`,
            borderRadius: '12px',
            padding: '15px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: changeTypeColors[type],
              marginBottom: '5px'
            }}>
              {count || 0}
            </div>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#374151',
              textTransform: 'capitalize'
            }}>
              {type.replace('_', ' ')}s
            </div>
          </div>
        ))}
        
        {/* Overall Similarity Score */}
        <div style={{
          background: '#f0f9ff',
          border: '2px solid #0ea5e9',
          borderRadius: '12px',
          padding: '15px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#0ea5e9',
            marginBottom: '5px'
          }}>
            {Math.round((results.similarity || 0) * 100)}%
          </div>
          <div style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#374151'
          }}>
            Similarity
          </div>
        </div>
      </div>

      {/* Change Navigation */}
      {changes.length > 0 && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fbbf24',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: '600' }}>
            🔍 Navigate Changes ({changes.length} total)
          </h3>
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {changes.map((change, index) => (
              <div
                key={index}
                onClick={() => onJumpToChange(change)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'white',
                  border: `1px solid ${changeTypeColors[change.type]}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: changeTypeColors[change.type]
                  }}></div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                      {change.type.replace('_', ' ').toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Page {change.page} • Line {change.line}
                    </div>
                  </div>
                </div>
                
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginRight: '10px' }}>
                  {change.preview && change.preview.length > 50 
                    ? `${change.preview.substring(0, 50)}...`
                    : change.preview}
                </div>
                
                {/* Confidence Score */}
                <div style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'white',
                  background: getConfidenceColor(change.confidence || 0.8)
                }}>
                  {Math.round((change.confidence || 0.8) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Original Results Display */}
      <PdfResults 
        results={results} 
        file1Name={file1Name} 
        file2Name={file2Name} 
      />
    </div>
  );
};

// ===== ENHANCED PDF COMPARISON OPTIONS =====
const EnhancedPdfOptionsComponent = ({ 
  pdfOptions, 
  setPdfOptions, 
  pdfLoadingStatus, 
  onCompare, 
  loading 
}) => (
  <div style={{
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb'
  }}>
    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#1f2937' }}>
      ⚙️ Advanced PDF Comparison Options
    </h3>

    {/* PDF.js Loading Status */}
    {pdfLoadingStatus === 'checking' && (
      <div style={{
        background: '#fffbeb',
        border: '2px solid #f59e0b',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        color: '#92400e'
      }}>
        ⏳ Loading PDF processing engine... Please wait.
      </div>
    )}

    {pdfLoadingStatus === 'failed' && (
      <div style={{
        background: '#fef2f2',
        border: '2px solid #dc2626',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        color: '#dc2626'
      }}>
        ❌ PDF processing engine failed to load. Please refresh the page and try again.
      </div>
    )}

    {pdfLoadingStatus === 'loaded' && (
      <div style={{
        background: '#f0fdf4',
        border: '2px solid #22c55e',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        color: '#166534'
      }}>
        ✅ PDF processing engine ready!
      </div>
    )}

    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '25px',
      marginBottom: '25px'
    }}>
      {/* Basic Comparison Settings */}
      <div style={{
        background: '#f8fafc',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: '600' }}>
          📋 Basic Settings
        </h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
            Comparison Mode
          </label>
          <select
            value={pdfOptions.compareMode}
            onChange={(e) => setPdfOptions({...pdfOptions, compareMode: e.target.value})}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}
            disabled={pdfLoadingStatus !== 'loaded'}
          >
            <option value="text">Text content only</option>
            <option value="visual">Visual appearance</option>
            <option value="hybrid">Text + Visual (Recommended)</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
            Comparison Sensitivity
          </label>
          <select
            value={pdfOptions.sensitivity}
            onChange={(e) => setPdfOptions({...pdfOptions, sensitivity: e.target.value})}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}
            disabled={pdfLoadingStatus !== 'loaded'}
          >
            <option value="high">High (Character-level)</option>
            <option value="medium">Medium (Word-level)</option>
            <option value="low">Low (Sentence-level)</option>
          </select>
        </div>
      </div>

      {/* Advanced Options */}
      <div style={{
        background: '#f8fafc',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: '600' }}>
          🔧 Advanced Options
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: pdfLoadingStatus === 'loaded' ? 'pointer' : 'not-allowed' }}>
            <input
              type="checkbox"
              checked={pdfOptions.ignoreFormatting}
              onChange={(e) => setPdfOptions({...pdfOptions, ignoreFormatting: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
              disabled={pdfLoadingStatus !== 'loaded'}
            />
            <span>Ignore formatting changes</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: pdfLoadingStatus === 'loaded' ? 'pointer' : 'not-allowed' }}>
            <input
              type="checkbox"
              checked={pdfOptions.ignoreWhitespace}
              onChange={(e) => setPdfOptions({...pdfOptions, ignoreWhitespace: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
              disabled={pdfLoadingStatus !== 'loaded'}
            />
            <span>Ignore whitespace changes</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: pdfLoadingStatus === 'loaded' ? 'pointer' : 'not-allowed' }}>
            <input
              type="checkbox"
              checked={pdfOptions.detectMoves}
              onChange={(e) => setPdfOptions({...pdfOptions, detectMoves: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
              disabled={pdfLoadingStatus !== 'loaded'}
            />
            <span>Detect moved text blocks</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: pdfLoadingStatus === 'loaded' ? 'pointer' : 'not-allowed' }}>
            <input
              type="checkbox"
              checked={pdfOptions.pageByPage}
              onChange={(e) => setPdfOptions({...pdfOptions, pageByPage: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
              disabled={pdfLoadingStatus !== 'loaded'}
            />
            <span>Page-by-page comparison</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: pdfLoadingStatus === 'loaded' ? 'pointer' : 'not-allowed' }}>
            <input
              type="checkbox"
              checked={pdfOptions.includeImages}
              onChange={(e) => setPdfOptions({...pdfOptions, includeImages: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
              disabled={pdfLoadingStatus !== 'loaded'}
            />
            <span>Include image comparison</span>
          </label>
        </div>
      </div>

      {/* Professional Features */}
      <div style={{
        background: '#f8fafc',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: '600' }}>
          💼 Professional Features
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: pdfLoadingStatus === 'loaded' ? 'pointer' : 'not-allowed' }}>
            <input
              type="checkbox"
              checked={pdfOptions.compareMetadata}
              onChange={(e) => setPdfOptions({...pdfOptions, compareMetadata: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
              disabled={pdfLoadingStatus !== 'loaded'}
            />
            <span>Compare document metadata</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: pdfLoadingStatus === 'loaded' ? 'pointer' : 'not-allowed' }}>
            <input
              type="checkbox"
              checked={pdfOptions.detectWatermarks}
              onChange={(e) => setPdfOptions({...pdfOptions, detectWatermarks: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
              disabled={pdfLoadingStatus !== 'loaded'}
            />
            <span>Detect watermark changes</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: pdfLoadingStatus === 'loaded' ? 'pointer' : 'not-allowed' }}>
            <input
              type="checkbox"
              checked={pdfOptions.trackConfidence}
              onChange={(e) => setPdfOptions({...pdfOptions, trackConfidence: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
              disabled={pdfLoadingStatus !== 'loaded'}
            />
            <span>Show change confidence scores</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: pdfLoadingStatus === 'loaded' ? 'pointer' : 'not-allowed' }}>
            <input
              type="checkbox"
              checked={pdfOptions.generateReport}
              onChange={(e) => setPdfOptions({...pdfOptions, generateReport: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
              disabled={pdfLoadingStatus !== 'loaded'}
            />
            <span>Generate detailed comparison report</span>
          </label>
        </div>
      </div>
    </div>

    {/* Region-Specific Comparison */}
    {pdfOptions.regionSpecific && (
      <div style={{
        background: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: '600' }}>
          📍 Region-Specific Comparison
        </h4>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#92400e' }}>
          Select specific areas of your documents to compare. This is useful for focusing on particular sections like headers, footers, or specific content areas.
        </p>
        <button
          onClick={() => {/* Implement region selection */}}
          style={{
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          Select Regions
        </button>
      </div>
    )}

    <button
      onClick={onCompare}
      disabled={loading || pdfLoadingStatus !== 'loaded'}
      style={{
        background: loading || pdfLoadingStatus !== 'loaded' ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: loading || pdfLoadingStatus !== 'loaded' ? 'not-allowed' : 'pointer',
        width: '100%'
      }}
    >
      {loading ? 'Comparing PDFs...' : pdfLoadingStatus !== 'loaded' ? 'PDF Engine Loading...' : '🚀 Compare PDF Documents'}
    </button>
  </div>
);

// ===== PDF-SPECIFIC COMPONENTS (keeping existing ones) =====

// PDF Requirements Info Component
const PdfRequirementsInfo = () => {
  return (
    <div style={{
      background: '#eff6ff',
      border: '1px solid #2563eb',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px',
      fontSize: '0.9rem'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '1rem' }}>
        📑 Supported PDF Files
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div>
          <strong>✅ Supported:</strong>
          <div>• .pdf files with extractable text</div>
          <div>• Multi-page documents</div>
          <div>• Text-based content</div>
          <div>• Standard PDF formats</div>
          <div>• Business contracts & reports</div>
          <div>• Academic papers & research</div>
        </div>
        <div>
          <strong>📏 Requirements:</strong>
          <div>• Maximum size: 100MB</div>
          <div>• Text-extractable PDFs only</div>
          <div>• No password-protected files</div>
          <div>• Standard PDF/A format preferred</div>
          <div>• Stable internet connection required</div>
        </div>
      </div>
    </div>
  );
};

// PDF Success Tips Component
const PdfSuccessTips = () => {
  const tips = [
    { label: 'Enhanced change detection:', tip: 'New algorithms detect insertions, deletions, moves, and formatting changes' },
    { label: 'Professional export options:', tip: 'Generate PDF reports and shareable comparison links' },
    { label: 'Advanced sensitivity controls:', tip: 'Choose character, word, or sentence-level comparison precision' },
    { label: 'Metadata comparison:', tip: 'Compare document properties, creation dates, and author information' },
    { label: 'Confidence scoring:', tip: 'Each change includes accuracy confidence for better decision making' },
    { label: 'Region-specific analysis:', tip: 'Focus comparison on specific document sections or areas' }
  ];

  return (
    <div style={{
      background: '#f0fdf4',
      border: '1px solid #22c55e',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#166534', fontSize: '1rem' }}>
        💡 Enhanced Professional Features
      </h4>
      <div style={{ fontSize: '0.9rem', color: '#166534' }}>
        {tips.map((tip, index) => (
          <div key={index}>
            • <strong>{tip.label}</strong> {tip.tip}
            <br />
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced PDF Error Messages (keeping existing)
const getPdfErrorMessage = (error, fileName) => {
  const errorMsg = error.message.toLowerCase();
  
  if (errorMsg.includes('too large')) {
    return {
      title: "📁 PDF File Too Large",
      message: `"${fileName}" exceeds our 100MB size limit.`,
      solutions: [
        "PDF files: Maximum 100MB supported",
        "Compress your PDF using online tools",
        "Split large documents into smaller sections",
        "Remove unnecessary images to reduce size",
        "Contact support for enterprise solutions"
      ]
    };
  }
  
  if (errorMsg.includes('pdf.js') || errorMsg.includes('pdfjslib') || errorMsg.includes('pdf processing')) {
    return {
      title: "📚 PDF Processing Error",
      message: `PDF processing service issue.`,
      solutions: [
        "Refresh the page and try again",
        "Check your internet connection is stable",
        "Disable ad blockers temporarily",
        "Try a different PDF file to test",
        "Clear browser cache and reload",
        "Contact support if the issue persists"
      ]
    };
  }
  
  if (errorMsg.includes('password') || errorMsg.includes('encrypted')) {
    return {
      title: "🔒 Protected PDF File",
      message: `"${fileName}" is password-protected.`,
      solutions: [
        "Remove password protection from the PDF",
        "Use an unprotected version of the document",
        "Contact the document owner for an unlocked version",
        "Use PDF editing software to remove restrictions"
      ]
    };
  }
  
  if (errorMsg.includes('corrupted') || errorMsg.includes('invalid pdf')) {
    return {
      title: "💾 Corrupted PDF File",
      message: `"${fileName}" appears to be corrupted or invalid.`,
      solutions: [
        "Try opening the PDF in a PDF reader first",
        "Re-download the PDF from the original source",
        "Use PDF repair tools if available",
        "Contact the document provider for a fresh copy"
      ]
    };
  }
  
  if (errorMsg.includes('text extraction') || errorMsg.includes('no text found')) {
    return {
      title: "📄 No Extractable Text",
      message: `"${fileName}" contains no extractable text.`,
      solutions: [
        "This PDF may be image-based or scanned",
        "Use OCR software to convert images to text",
        "Try a different PDF with selectable text",
        "Contact support for image-based PDF comparison options"
      ]
    };
  }
  
  // Generic fallback
  return {
    title: "⚠️ PDF Comparison Error",
    message: error.message,
    solutions: [
      "Ensure both files are valid PDF documents",
      "Check file size is within 100MB limit",
      "Try refreshing the page and uploading again",
      "Test with a different PDF file",
      "Contact support if the issue persists"
    ]
  };
};

// PDF Error Display Component (keeping existing)
const PdfErrorDisplay = ({ error, fileName }) => {
  const errorInfo = getPdfErrorMessage(error, fileName || 'Unknown file');
  
  return (
    <div style={{
      background: '#fef2f2',
      border: '2px solid #dc2626',
      borderRadius: '12px',
      padding: '20px',
      margin: '20px 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
        <div style={{ fontSize: '2rem' }}>❌</div>
        <div>
          <h3 style={{ margin: 0, color: '#dc2626', fontSize: '1.3rem' }}>
            {errorInfo.title}
          </h3>
          <p style={{ margin: '5px 0 0 0', color: '#7f1d1d', fontSize: '1rem' }}>
            {errorInfo.message}
          </p>
        </div>
      </div>
      
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '15px',
        border: '1px solid #fca5a5'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#dc2626', fontSize: '1rem' }}>
          💡 How to Fix This:
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#7f1d1d' }}>
          {errorInfo.solutions.map((solution, index) => (
            <li key={index} style={{ marginBottom: '5px' }}>{solution}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ===== PDF FILE READING UTILITY (keeping existing) =====
const readPdfFile = (file) => {
  return new Promise((resolve, reject) => {
    console.log('📚 Reading PDF file:', file.name, 'Size:', file.size);
    
    if (!file) {
      reject(new Error('No PDF file provided'));
      return;
    }

    if (file.size === 0) {
      reject(new Error('PDF file is empty'));
      return;
    }

    if (file.size > PDF_SIZE_LIMIT) {
      reject(new Error(`PDF file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is ${PDF_SIZE_LIMIT_TEXT}.`));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        console.log('✅ PDF file read as ArrayBuffer, size:', arrayBuffer.byteLength);
        resolve(arrayBuffer);
      } catch (error) {
        console.error('❌ PDF file reading error:', error);
        reject(new Error('Failed to process PDF file content'));
      }
    };
    
    reader.onerror = (e) => {
      console.error('❌ FileReader error:', e);
      reject(new Error(`Failed to read PDF file "${file.name}". The file may be corrupted.`));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// ===== ENHANCED PDF FILE UPLOAD COMPONENT =====
const PdfFileUpload = ({ fileNum, file, onChange }) => {
  const [validationWarning, setValidationWarning] = useState(null);
  
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setValidationWarning(null);
    
    try {
      // Size validation
      if (selectedFile.size > PDF_SIZE_LIMIT) {
        setValidationWarning({
          type: 'error',
          message: `File is ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB (max ${PDF_SIZE_LIMIT_TEXT} allowed for PDF files)`
        });
        return;
      }
      
      // Warning for large files (but still within limits)
      if (selectedFile.size > PDF_SIZE_LIMIT * 0.7) { // 70% of limit
        setValidationWarning({
          type: 'warning',
          message: `Large PDF file (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB) - comparison may take longer`
        });
      }
      
      // File type validation
      const fileName = selectedFile.name.toLowerCase();
      const isValidPdf = fileName.endsWith('.pdf') || selectedFile.type === 'application/pdf';
      
      if (!isValidPdf) {
        setValidationWarning({
          type: 'error',
          message: `Please select a PDF file with .pdf extension`
        });
        return;
      }
      
      onChange(e, fileNum);
      
    } catch (error) {
      setValidationWarning({
        type: 'error',
        message: error.message
      });
    }
  };
  
  return (
    <div style={{
      background: '#f0f9ff',
      padding: '25px',
      borderRadius: '16px',
      border: '2px solid #0ea5e9'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#1f2937' }}>PDF File {fileNum}</h3>
      
      <input
        type="file"
        onChange={handleFileChange}
        accept=".pdf,application/pdf"
        style={{
          width: '100%',
          padding: '14px',
          border: '2px solid rgba(255,255,255,0.8)',
          borderRadius: '10px',
          fontSize: '1rem',
          background: 'rgba(255,255,255,0.9)'
        }}
      />
      
      {/* File Status Display */}
      {file && !validationWarning && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '2px solid #22c55e',
          borderRadius: '8px',
          color: '#166534',
          fontWeight: '600'
        }}>
          ✅ {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
        </div>
      )}
      
      {/* Validation Warnings */}
      {validationWarning && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          background: validationWarning.type === 'error' ? '#fef2f2' : '#fffbeb',
          border: `2px solid ${validationWarning.type === 'error' ? '#dc2626' : '#f59e0b'}`,
          borderRadius: '8px',
          color: validationWarning.type === 'error' ? '#dc2626' : '#92400e',
          fontWeight: '500'
        }}>
          {validationWarning.type === 'error' ? '❌' : '⚠️'} {validationWarning.message}
        </div>
      )}
    </div>
  );
};

function PdfComparePage() {
  const { data: session } = useSession();
  
  // Core states
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfLoadingStatus, setPdfLoadingStatus] = useState('checking'); // checking, loaded, failed
  
  // UI states
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [userTier, setUserTier] = useState('free');
  const [showPdfOptions, setShowPdfOptions] = useState(false);

  // Enhanced PDF comparison options
  const [pdfOptions, setPdfOptions] = useState({
    compareMode: 'hybrid',
    sensitivity: 'medium',
    ignoreFormatting: true,
    ignoreWhitespace: false,
    detectMoves: true,
    pageByPage: true,
    includeImages: false,
    compareMetadata: true,
    detectWatermarks: false,
    trackConfidence: true,
    generateReport: true,
    regionSpecific: false
  });

  // Enhanced PDF.js loading check
  const checkPDFJSLoading = () => {
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds total
    
    const checkInterval = setInterval(() => {
      attempts++;
      console.log(`📚 PDF.js loading check attempt ${attempts}/${maxAttempts}`);
      
      if (typeof window !== 'undefined' && window.pdfjsLib && window.pdfJsReady) {
        console.log('✅ PDF.js successfully loaded and ready');
        setPdfLoadingStatus('loaded');
        clearInterval(checkInterval);
        return;
      }
      
      if (window.pdfJsError) {
        console.error('❌ PDF.js loading error detected');
        setPdfLoadingStatus('failed');
        clearInterval(checkInterval);
        return;
      }
      
      if (attempts >= maxAttempts) {
        console.error('❌ PDF.js loading timeout after 30 seconds');
        setPdfLoadingStatus('failed');
        clearInterval(checkInterval);
        return;
      }
    }, 1000); // Check every second
  };

  // Fetch user data
  const fetchUserData = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/usage/current');
      const data = await response.json();
      if (response.ok) {
        setUserTier(data.user?.tier || 'free');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUserData();
    }
    
    // Start checking PDF.js loading after component mounts
    if (typeof window !== 'undefined') {
      // Small delay to let the scripts load
      setTimeout(() => {
        checkPDFJSLoading();
      }, 1000);
    }
  }, [session]);

  // ✅ UPDATED: Premium upgrade handlers to match index.js exactly
  const handlePremiumUpgrade = async () => {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_1RVEnnJbX57fsaKHqLt143Fg',
          successUrl: `${window.location.origin}/compare?success=true`,
          cancelUrl: `${window.location.origin}/?canceled=true`,
        }),
      });

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      alert('Sorry, there was an error starting your premium trial. Please try again or contact support.');
    }
  };

  const handleModalDismiss = () => {
    setShowPremiumModal(false);
  };

  // File handling
  const handleFileChange = (e, fileNum) => {
    // Block for free users
    if (userTier !== 'premium') {
      setShowPremiumModal(true);
      return;
    }
    
    const file = e.target.files[0];
    if (!file) return;
    
    if (fileNum === 1) setFile1(file);
    else setFile2(file);
  };

  // ===== ENHANCED EXPORT FUNCTIONS =====
  const handleExport = async (exportType) => {
    if (!results) return;

    try {
      switch (exportType) {
        case 'summary':
          await exportSummaryReport();
          break;
        case 'detailed':
          await exportDetailedReport();
          break;
        case 'shareable':
          await createShareableLink();
          break;
        default:
          console.warn('Unknown export type:', exportType);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export comparison results. Please try again.');
    }
  };

  const exportSummaryReport = async () => {
    const reportContent = generateSummaryReport();
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PDF_Comparison_Summary_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportDetailedReport = async () => {
    const reportContent = generateDetailedReport();
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PDF_Comparison_Detailed_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const createShareableLink = async () => {
    // In a real implementation, this would save to a backend and return a shareable URL
    const shareData = {
      files: [file1?.name, file2?.name],
      results: results,
      timestamp: new Date().toISOString()
    };
    
    const encodedData = btoa(JSON.stringify(shareData));
    const shareableUrl = `${window.location.origin}/compare/shared/${encodedData}`;
    
    try {
      await navigator.clipboard.writeText(shareableUrl);
      alert('Shareable link copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareableUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Shareable link copied to clipboard!');
    }
  };

  const generateSummaryReport = () => {
    const { statistics = {}, similarity = 0 } = results;
    
    return `PDF COMPARISON SUMMARY REPORT
Generated: ${new Date().toLocaleString()}

FILES COMPARED:
• File 1: ${file1?.name || 'Unknown'}
• File 2: ${file2?.name || 'Unknown'}

OVERALL SIMILARITY: ${Math.round(similarity * 100)}%

CHANGE STATISTICS:
${Object.entries(statistics).map(([type, count]) => 
  `• ${type.replace('_', ' ').toUpperCase()}: ${count || 0}`
).join('\n')}

COMPARISON SETTINGS:
• Mode: ${pdfOptions.compareMode}
• Sensitivity: ${pdfOptions.sensitivity}
• Ignore Formatting: ${pdfOptions.ignoreFormatting ? 'Yes' : 'No'}
• Ignore Whitespace: ${pdfOptions.ignoreWhitespace ? 'Yes' : 'No'}
• Detect Moves: ${pdfOptions.detectMoves ? 'Yes' : 'No'}

Generated by VeriDiff Professional PDF Comparison
`;
  };

  const generateDetailedReport = () => {
    const { changes = [], statistics = {}, similarity = 0, metadata = {} } = results;
    
    return `<!DOCTYPE html>
<html>
<head>
    <title>PDF Comparison Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 20px; border-radius: 8px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; text-align: center; }
        .change-item { background: white; border: 1px solid #e2e8f0; margin: 10px 0; padding: 15px; border-radius: 8px; }
        .insertion { border-left: 4px solid #22c55e; }
        .deletion { border-left: 4px solid #ef4444; }
        .modification { border-left: 4px solid #f59e0b; }
        .formatting { border-left: 4px solid #8b5cf6; }
        .move { border-left: 4px solid #06b6d4; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📑 PDF Comparison Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
    
    <h2>Files Compared</h2>
    <ul>
        <li><strong>File 1:</strong> ${file1?.name || 'Unknown'}</li>
        <li><strong>File 2:</strong> ${file2?.name || 'Unknown'}</li>
    </ul>
    
    <h2>Summary Statistics</h2>
    <div class="stats">
        <div class="stat-card">
            <h3>${Math.round(similarity * 100)}%</h3>
            <p>Similarity</p>
        </div>
        ${Object.entries(statistics).map(([type, count]) => `
        <div class="stat-card">
            <h3>${count || 0}</h3>
            <p>${type.replace('_', ' ')}</p>
        </div>
        `).join('')}
    </div>
    
    <h2>Detailed Changes (${changes.length} total)</h2>
    ${changes.map((change, index) => `
    <div class="change-item ${change.type}">
        <h4>Change #${index + 1} - ${change.type.replace('_', ' ').toUpperCase()}</h4>
        <p><strong>Location:</strong> Page ${change.page}, Line ${change.line}</p>
        <p><strong>Confidence:</strong> ${Math.round((change.confidence || 0.8) * 100)}%</p>
        <p><strong>Preview:</strong> ${change.preview || 'No preview available'}</p>
    </div>
    `).join('')}
    
    <footer style="margin-top: 40px; text-align: center; color: #64748b;">
        <p>Generated by VeriDiff Professional PDF Comparison</p>
    </footer>
</body>
</html>`;
  };

  // ===== ENHANCED CHANGE NAVIGATION =====
  const handleJumpToChange = (change) => {
    // In a real implementation, this would scroll to the specific change in the document view
    console.log('Jumping to change:', change);
    // You could implement smooth scrolling to the change location
    // or highlight the specific change in your PDF viewer
  };

  // ===== MAIN PDF COMPARISON HANDLER =====
  const handleComparePdfs = async () => {
    if (!file1 || !file2) {
      setError('Please select two PDF files.');
      return;
    }

    if (!session) {
      alert('Please sign in to compare PDF documents.');
      return;
    }

    if (userTier !== 'premium') {
      setShowPremiumModal(true);
      return;
    }

    // Check PDF.js loading status
    if (pdfLoadingStatus !== 'loaded') {
      setError('PDF processing library is not ready. Please refresh the page and try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📚 Starting enhanced PDF comparison...');
      console.log('📚 Files:', { file1: file1.name, file2: file2.name });
      console.log('📚 Options:', pdfOptions);

      // Enhanced comparison with new options
      const result = await comparePDFFiles(file1, file2, pdfOptions);

      // Enhance results with additional processing
      const enhancedResult = {
        ...result,
        statistics: result.statistics || {
          [CHANGE_TYPES.INSERTION]: result.changes?.filter(c => c.type === CHANGE_TYPES.INSERTION)?.length || 0,
          [CHANGE_TYPES.DELETION]: result.changes?.filter(c => c.type === CHANGE_TYPES.DELETION)?.length || 0,
          [CHANGE_TYPES.MODIFICATION]: result.changes?.filter(c => c.type === CHANGE_TYPES.MODIFICATION)?.length || 0,
          [CHANGE_TYPES.FORMATTING]: result.changes?.filter(c => c.type === CHANGE_TYPES.FORMATTING)?.length || 0,
          [CHANGE_TYPES.MOVE]: result.changes?.filter(c => c.type === CHANGE_TYPES.MOVE)?.length || 0
        },
        metadata: result.metadata || {
          file1: { pages: 'Unknown', created: 'Unknown', modified: 'Unknown', author: 'Unknown' },
          file2: { pages: 'Unknown', created: 'Unknown', modified: 'Unknown', author: 'Unknown' }
        }
      };

      console.log('📚 Enhanced PDF comparison completed:', enhancedResult);
      setResults(enhancedResult);
      
    } catch (err) {
      console.error('🚨 PDF COMPARISON ERROR:', err);
      console.error('🚨 ERROR STACK:', err.stack);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load files and show options
  const handleLoadPdfs = async () => {
    if (!file1 || !file2) {
      setError('Please select two PDF files.');
      return;
    }

    if (!session) {
      alert('Please sign in to compare PDF documents.');
      return;
    }

    if (userTier !== 'premium') {
      setShowPremiumModal(true);
      return;
    }

    setShowPdfOptions(true);
  };

  // Premium Modal Component
  const PremiumModal = () => {
    if (!showPremiumModal) return null;
    
    const handleBackdropClick = (e) => {
      // Close modal only if clicking the backdrop, not the modal content
      if (e.target === e.currentTarget) {
        setShowPremiumModal(false);
      }
    };

    const handleUpgradeClick = async (e) => {
      e.stopPropagation();
      console.log('Upgrade button clicked!');
      setShowPremiumModal(false); // Close modal first
      await handlePremiumUpgrade();
    };

    const handleCancelClick = (e) => {
      e.stopPropagation();
      setShowPremiumModal(false);
    };
    
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}
        onClick={handleBackdropClick}
      >
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          maxWidth: '600px',
          width: '100%'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5rem', fontWeight: '600' }}>
            🚀 Enhanced Premium PDF Comparison
          </h3>
          <p style={{ marginBottom: '20px' }}>
            Professional PDF comparison with advanced features now available. Perfect for contracts, 
            reports, legal documents, and academic papers.
          </p>
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #22c55e',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#166534' }}>Enhanced Premium Features:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#166534' }}>
              <li>Advanced change detection with confidence scoring</li>
              <li>Professional export options (PDF reports, shareable links)</li>
              <li>Document metadata comparison</li>
              <li>Enhanced sensitivity controls (character/word/sentence level)</li>
              <li>Move detection and formatting analysis</li>
              <li>Region-specific comparison capabilities</li>
              <li>Large file support (up to 100MB)</li>
              <li>Enterprise-grade privacy and security</li>
            </ul>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleUpgradeClick}
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                position: 'relative',
                zIndex: 10000
              }}
            >
              Upgrade to Premium
            </button>
            <button
              onClick={handleCancelClick}
              style={{
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 10000
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AuthGuard>
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <Head>
          <title>VeriDiff - Enhanced Professional PDF Comparison</title>
          
          {/* ENHANCED PDF.js Loading with Multiple CDN Fallbacks */}
          <script dangerouslySetInnerHTML={{
            __html: `
              (function() {
                console.log('🔧 Starting enhanced PDF.js loading process...');
                
                // Try multiple CDN sources
                const pdfSources = [
                  {
                    lib: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
                    worker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
                  },
                  {
                    lib: 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js',
                    worker: 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
                  },
                  {
                    lib: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
                    worker: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
                  }
                ];
                
                let currentSourceIndex = 0;
                
                function loadPDFJS() {
                  if (currentSourceIndex >= pdfSources.length) {
                    console.error('❌ All PDF.js sources failed to load');
                    window.pdfJsError = true;
                    return;
                  }
                  
                  const source = pdfSources[currentSourceIndex];
                  console.log(\`📚 Attempting to load PDF.js from source \${currentSourceIndex + 1}/\${pdfSources.length}\`);
                  
                  const script = document.createElement('script');
                  script.src = source.lib;
                  
                  script.onload = function() {
                    console.log(\`✅ PDF.js library loaded from source \${currentSourceIndex + 1}\`);
                    
                    // Wait a bit for pdfjsLib to be available
                    setTimeout(function() {
                      if (typeof window.pdfjsLib !== 'undefined') {
                        try {
                          window.pdfjsLib.GlobalWorkerOptions.workerSrc = source.worker;
                          window.pdfJsReady = true;
                          console.log('✅ PDF.js worker configured and ready');
                        } catch (error) {
                          console.error('❌ PDF.js worker configuration failed:', error);
                          window.pdfJsError = true;
                        }
                      } else {
                        console.error('❌ PDF.js library object not available');
                        currentSourceIndex++;
                        loadPDFJS();
                      }
                    }, 500);
                  };
                  
                  script.onerror = function() {
                    console.warn(\`⚠️ PDF.js source \${currentSourceIndex + 1} failed, trying next...\`);
                    currentSourceIndex++;
                    loadPDFJS();
                  };
                  
                  document.head.appendChild(script);
                }
                
                // Start loading process when DOM is ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', loadPDFJS);
                } else {
                  loadPDFJS();
                }
              })();
            `
          }} />
        </Head>

        <Header />

        {/* Security Trust Banner */}
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
              🔒 Enterprise-Grade Privacy: All file processing happens in your browser. We never see, store, or access your data.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <main style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '30px 20px'
        }}>
          {/* Enhanced Hero Section */}
          <div style={{
            textAlign: 'center',
            padding: '50px 30px',
            background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f59e0b 100%)',
            borderRadius: '20px',
            marginBottom: '40px',
            color: 'white'
          }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '700',
              margin: '0 0 15px 0'
            }}>
              📑 Enhanced Professional PDF Comparison
            </h1>
            <p style={{
              fontSize: '1.2rem',
              opacity: '0.9',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              Advanced PDF document comparison with enhanced change detection, professional export options, 
              and enterprise-grade accuracy. Now with confidence scoring and detailed analytics.
            </p>
            
            {/* Enhanced Use Case Badges */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '25px'
            }}>
              {['Legal Contracts', 'Business Reports', 'Academic Papers', 'Technical Manuals', 'Compliance Docs', 'Version Control'].map((useCase) => (
                <span key={useCase} style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>
                  {useCase}
                </span>
              ))}
            </div>
          </div>

          {/* Requirements and Tips */}
          <PdfRequirementsInfo />
          <PdfSuccessTips />

          {/* File Upload Section */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            marginBottom: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              background: 'linear-gradient(135deg, #dc2626, #ea580c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 15px 0',
              textAlign: 'center',
              fontWeight: '700'
            }}>
              Upload Your PDF Documents
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '25px',
              marginBottom: '35px'
            }}>
              <PdfFileUpload 
                fileNum={1} 
                file={file1} 
                onChange={handleFileChange}
              />
              <PdfFileUpload 
                fileNum={2} 
                file={file2} 
                onChange={handleFileChange}
              />
            </div>

            {/* Load Files Button */}
            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={userTier !== 'premium' ? handlePremiumUpgrade : handleLoadPdfs} 
                disabled={loading || (!file1 || !file2) && userTier === 'premium'}
                style={{
                  background: loading ? '#9ca3af' : userTier !== 'premium'
                    ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
                    : (!file1 || !file2) 
                      ? '#9ca3af'
                      : 'linear-gradient(135deg, #dc2626, #ea580c)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: loading || ((!file1 || !file2) && userTier === 'premium') ? 'not-allowed' : 'pointer',
                  minWidth: '200px'
                }}
              >
                {loading ? 'Loading...' : userTier !== 'premium' ? '🚀 Start Enhanced Premium Trial' : '📑 Load PDF Files'}
              </button>
            </div>
          </div>

          {/* Enhanced PDF Options */}
          {showPdfOptions && userTier === 'premium' && (
            <EnhancedPdfOptionsComponent
              pdfOptions={pdfOptions}
              setPdfOptions={setPdfOptions}
              pdfLoadingStatus={pdfLoadingStatus}
              onCompare={handleComparePdfs}
              loading={loading}
            />
          )}

          {/* Error Display */}
          {error && (
            <PdfErrorDisplay 
              error={new Error(error)} 
              fileName={file1?.name || file2?.name} 
            />
          )}

          {/* Loading */}
          {loading && (
            <div style={{
              margin: '20px 0',
              padding: '20px',
              background: '#eff6ff',
              border: '2px solid #2563eb',
              borderRadius: '12px',
              color: '#1e40af',
              fontSize: '1rem',
              fontWeight: '500',
              textAlign: 'center'
            }}>
              <strong>Processing PDF Documents with Enhanced Analysis...</strong> Please wait while we perform advanced text extraction, change detection, and confidence scoring...
            </div>
          )}

          {/* Enhanced Results */}
          {results && (
            <EnhancedPdfResults 
              results={results} 
              file1Name={file1?.name} 
              file2Name={file2?.name}
              onExport={handleExport}
              onJumpToChange={handleJumpToChange}
            />
          )}
        </main>

        {/* Premium Modal */}
        <PremiumModal />

        <Footer />
      </div>
    </AuthGuard>
  );
}

export default PdfComparePage;
