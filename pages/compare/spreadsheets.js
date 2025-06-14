import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import AuthGuard from '../../components/auth/AuthGuard';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

// ✅ KEEP: Excel/CSV utilities only
import { parseCSVFile } from '../../utils/simpleCSVComparison';
import { parseExcelFile, compareExcelFiles, getExcelFileInfo } from '../../utils/excelFileComparison';
import { compareExcelCSVFiles } from '../../utils/excelCSVComparison';

// ✅ KEEP: Business logic components
import HeaderMapper from '../../components/HeaderMapper';
import SheetSelector from '../../components/SheetSelector';
import { mapHeaders } from '../../utils/mapHeaders';
import { downloadResultsAsExcel, downloadResultsAsCSV } from '../../utils/downloadResults';

// FEATURE FLAGS - easily disable problematic features
const FEATURES = {
  SHEET_SELECTION: true,         // ENABLED: SheetSelector is ready to test
  AUTO_DETECTION: true,          // Auto-detection of amount fields
  AUTO_RERUN: true,             // Auto-rerun functionality
  ENHANCED_EXCEL_PARSING: true,  // Use enhanced Excel parsing with data extraction
  FLEXIBLE_CROSS_FORMAT: true,   // NEW: Use flexible cross-format comparison
  ADVANCED_DIFF_VIEW: true      // NEW: Advanced diff view with side-by-side comparison
};

function ComparePage() {
  const { data: session } = useSession();
  const [usage, setUsage] = useState(null);
  
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [fileType, setFileType] = useState('excel'); // ✅ Default to free Excel

  // Core states (always present)
  const [showMapper, setShowMapper] = useState(false);
  const [headers1, setHeaders1] = useState([]);
  const [headers2, setHeaders2] = useState([]);
  const [suggestedMappings, setSuggestedMappings] = useState([]);
  const [finalMappings, setFinalMappings] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sampleData1, setSampleData1] = useState(null);
  const [sampleData2, setSampleData2] = useState(null);

  // Optional states (only used if features enabled)
  const [file1Info, setFile1Info] = useState(null);
  const [file2Info, setFile2Info] = useState(null);
  const [selectedSheet1, setSelectedSheet1] = useState(null);
  const [selectedSheet2, setSelectedSheet2] = useState(null);
  const [showSheetSelector, setShowSheetSelector] = useState(false);

  // ✅ Processing protection state
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ NEW: Premium modal state (replaces showPremiumUpgrade)
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [userTier, setUserTier] = useState('free');

  // ✅ NEW: Enhanced results display state variables
  const [resultsFilter, setResultsFilter] = useState('all'); // 'all', 'differences', 'matches'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [expandedRows, setExpandedRows] = useState(new Set());

  // ✅ NEW: Advanced diff view state variables
  const [viewMode, setViewMode] = useState('unified'); // 'unified' or 'side-by-side'
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [showCharacterDiff, setShowCharacterDiff] = useState(true);

  // ✅ NEW: Character-level diff highlighting function
  const getCharacterDiff = (str1, str2, ignoreWhitespace = false) => {
    if (!str1 || !str2) return { str1: str1 || '', str2: str2 || '', hasChanges: str1 !== str2 };
    
    // Normalize strings if ignoring whitespace
    let s1 = ignoreWhitespace ? str1.replace(/\s+/g, ' ').trim() : str1;
    let s2 = ignoreWhitespace ? str2.replace(/\s+/g, ' ').trim() : str2;
    
    if (s1 === s2) {
      return { str1, str2, hasChanges: false };
    }
    
    // Simple character-level diff (for production, consider using a library like diff)
    const result1 = [];
    const result2 = [];
    
    const maxLen = Math.max(s1.length, s2.length);
    
    for (let i = 0; i < maxLen; i++) {
      const char1 = s1[i] || '';
      const char2 = s2[i] || '';
      
      if (char1 === char2) {
        result1.push({ char: char1, type: 'same' });
        result2.push({ char: char2, type: 'same' });
      } else {
        result1.push({ char: char1, type: char1 ? 'removed' : 'missing' });
        result2.push({ char: char2, type: char2 ? 'added' : 'missing' });
      }
    }
    
    return { str1: result1, str2: result2, hasChanges: true };
  };

  // ✅ NEW: Enhanced status detection function
  const getRecordStatus = (row) => {
    if (!row.fields) return 'unknown';
    
    const fieldValues = Object.values(row.fields);
    const hasDifferences = fieldValues.some(field => field.status === 'difference');
    const hasAcceptable = fieldValues.some(field => field.status === 'acceptable');
    const allMatches = fieldValues.every(field => field.status === 'match');
    
    if (allMatches) return 'match';
    if (hasDifferences) return 'modified';
    if (hasAcceptable) return 'acceptable';
    return 'unknown';
  };

  // ✅ NEW: Enhanced status configuration
  const getStatusConfig = (status) => {
    switch (status) {
      case 'match':
        return { 
          color: '#16a34a', 
          bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', 
          border: '#22c55e', 
          icon: '✅', 
          label: 'Perfect Match',
          description: 'All fields identical'
        };
      case 'modified':
        return { 
          color: '#d97706', 
          bg: 'linear-gradient(135deg, #fefce8, #fef3c7)', 
          border: '#f59e0b', 
          icon: '✏️', 
          label: 'Modified',
          description: 'Some fields differ'
        };
      case 'acceptable':
        return { 
          color: '#0369a1', 
          bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)', 
          border: '#3b82f6', 
          icon: '⚠️', 
          label: 'Within Tolerance',
          description: 'Differences within acceptable range'
        };
      case 'added':
        return { 
          color: '#059669', 
          bg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', 
          border: '#10b981', 
          icon: '➕', 
          label: 'Added',
          description: 'New record in File 2'
        };
      case 'deleted':
        return { 
          color: '#dc2626', 
          bg: 'linear-gradient(135deg, #fef2f2, #fee2e2)', 
          border: '#ef4444', 
          icon: '🗑️', 
          label: 'Deleted',
          description: 'Record removed from File 1'
        };
      default:
        return { 
          color: '#6b7280', 
          bg: 'linear-gradient(135deg, #f9fafb, #f3f4f6)', 
          border: '#d1d5db', 
          icon: '❓', 
          label: 'Unknown',
          description: 'Status could not be determined'
        };
    }
  };

  // ✅ NEW: Render character-level diff
  const renderCharacterDiff = (diffResult) => {
    if (!showCharacterDiff || !diffResult.hasChanges) {
      return <span>{typeof diffResult.str1 === 'string' ? diffResult.str1 : diffResult.str1.map(c => c.char).join('')}</span>;
    }
    
    return (
      <span>
        {Array.isArray(diffResult.str1) ? diffResult.str1.map((charObj, idx) => (
          <span
            key={idx}
            style={{
              backgroundColor: charObj.type === 'removed' ? '#fee2e2' : 
                             charObj.type === 'missing' ? '#fef3c7' : 'transparent',
              color: charObj.type === 'removed' ? '#dc2626' : 
                     charObj.type === 'missing' ? '#d97706' : 'inherit',
              textDecoration: charObj.type === 'removed' ? 'line-through' : 'none',
              padding: charObj.type !== 'same' ? '1px 2px' : '0',
              borderRadius: '2px'
            }}
          >
            {charObj.char}
          </span>
        )) : diffResult.str1}
      </span>
    );
  };

  // ✅ NEW: HTML Export Function
  const handleDownloadHTMLDiff = () => {
    if (!results?.results) {
      alert('No comparison results to export');
      return;
    }

    const timestamp = new Date().toISOString().slice(0,10);
    const filename = `veridiff_comparison_${timestamp}.html`;
    
    const htmlContent = generateDiffHTML();
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ✅ NEW: Generate HTML for export
  const generateDiffHTML = () => {
    const filteredResults = getFilteredResults();
    const summary = {
      totalRecords: results.total_records,
      differences: results.differences_found,
      matches: results.total_records - results.differences_found,
      matchRate: (((results.total_records - results.differences_found) / results.total_records) * 100).toFixed(1)
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VeriDiff Comparison Report - ${new Date().toLocaleDateString()}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: #f8fafc; 
            color: #1f2937; 
            line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            background: linear-gradient(135deg, #2563eb, #7c3aed); 
            color: white; 
            padding: 30px; 
            border-radius: 12px; 
            text-align: center; 
            margin-bottom: 30px;
        }
        .header h1 { font-size: 2rem; margin-bottom: 10px; }
        .header p { opacity: 0.9; }
        .summary { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
        }
        .summary-card { 
            background: white; 
            padding: 20px; 
            border-radius: 12px; 
            text-align: center; 
            border: 2px solid #e5e7eb;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .summary-card h3 { font-size: 2rem; margin-bottom: 5px; }
        .summary-card.matches { border-color: #22c55e; background: linear-gradient(135deg, #f0fdf4, #dcfce7); }
        .summary-card.differences { border-color: #ef4444; background: linear-gradient(135deg, #fef2f2, #fee2e2); }
        .summary-card.total { border-color: #3b82f6; background: linear-gradient(135deg, #eff6ff, #dbeafe); }
        .summary-card.rate { border-color: #f59e0b; background: linear-gradient(135deg, #fefce8, #fef3c7); }
        .legend { 
            background: white; 
            padding: 20px; 
            border-radius: 12px; 
            margin-bottom: 20px;
            border: 1px solid #e5e7eb;
        }
        .legend h3 { margin-bottom: 15px; }
        .legend-items { display: flex; gap: 15px; flex-wrap: wrap; }
        .legend-item { 
            display: flex; 
            align-items: center; 
            gap: 8px; 
            padding: 8px 12px; 
            border-radius: 8px; 
            font-size: 0.9rem;
        }
        .comparison-table { 
            background: white; 
            border-radius: 12px; 
            overflow: hidden; 
            border: 1px solid #e5e7eb;
            margin-bottom: 20px;
        }
        .table-header { 
            background: #f8fafc; 
            padding: 15px; 
            border-bottom: 2px solid #e5e7eb; 
            display: grid; 
            grid-template-columns: 80px 1fr 1fr; 
            gap: 20px; 
            font-weight: 600;
        }
        .comparison-row { 
            border-bottom: 1px solid #f3f4f6; 
            display: grid; 
            grid-template-columns: 80px 1fr 1fr; 
            gap: 20px; 
            padding: 15px; 
            align-items: center;
        }
        .status-cell { text-align: center; }
        .status-badge { 
            display: inline-flex; 
            align-items: center; 
            gap: 5px; 
            padding: 6px 10px; 
            border-radius: 8px; 
            font-size: 0.8rem; 
            font-weight: 600;
        }
        .file-data { 
            background: #f9fafb; 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            padding: 12px; 
        }
        .field-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
            gap: 8px; 
        }
        .field-item { 
            background: white; 
            padding: 8px; 
            border-radius: 6px; 
            border: 1px solid #e5e7eb;
        }
        .field-item.changed { border-color: #f59e0b; background: #fefce8; }
        .field-item.added { border-color: #10b981; background: #ecfdf5; }
        .field-item.removed { border-color: #ef4444; background: #fef2f2; }
        .field-label { font-size: 0.75rem; color: #6b7280; margin-bottom: 2px; }
        .field-value { font-weight: 500; }
        .char-diff-removed { background: #fee2e2; color: #dc2626; text-decoration: line-through; padding: 1px 2px; border-radius: 2px; }
        .char-diff-added { background: #d1fae5; color: #059669; padding: 1px 2px; border-radius: 2px; }
        .footer { 
            text-align: center; 
            padding: 20px; 
            color: #6b7280; 
            font-size: 0.9rem; 
            background: white; 
            border-radius: 12px; 
            border: 1px solid #e5e7eb;
        }
        @media print { 
            body { background: white; } 
            .container { max-width: none; padding: 10px; }
            .comparison-row { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 VeriDiff Comparison Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>File Comparison: ${fileType === 'excel' ? 'Excel ↔ Excel' : fileType === 'excel_csv' ? 'Excel ↔ CSV' : 'CSV ↔ CSV'}</p>
        </div>

        <div class="summary">
            <div class="summary-card total">
                <h3 style="color: #2563eb;">${summary.totalRecords}</h3>
                <p>Total Records</p>
            </div>
            <div class="summary-card differences">
                <h3 style="color: #dc2626;">${summary.differences}</h3>
                <p>Differences Found</p>
            </div>
            <div class="summary-card matches">
                <h3 style="color: #16a34a;">${summary.matches}</h3>
                <p>Perfect Matches</p>
            </div>
            <div class="summary-card rate">
                <h3 style="color: #d97706;">${summary.matchRate}%</h3>
                <p>Match Rate</p>
            </div>
        </div>

        <div class="legend">
            <h3>📖 Legend</h3>
            <div class="legend-items">
                <div class="legend-item" style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 1px solid #22c55e;">
                    <span>✅</span> <span style="color: #16a34a; font-weight: 600;">Perfect Match</span>
                </div>
                <div class="legend-item" style="background: linear-gradient(135deg, #fefce8, #fef3c7); border: 1px solid #f59e0b;">
                    <span>✏️</span> <span style="color: #d97706; font-weight: 600;">Modified</span>
                </div>
                <div class="legend-item" style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 1px solid #3b82f6;">
                    <span>⚠️</span> <span style="color: #0369a1; font-weight: 600;">Within Tolerance</span>
                </div>
            </div>
        </div>

        <div class="comparison-table">
            <div class="table-header">
                <div>Status</div>
                <div style="text-align: center; color: #2563eb;">📄 File 1 (${file1?.name || 'Original'})</div>
                <div style="text-align: center; color: #16a34a;">📄 File 2 (${file2?.name || 'Comparison'})</div>
            </div>
            
            ${filteredResults.map(row => {
              const status = getRecordStatus(row);
              const config = getStatusConfig(status);
              
              return `
                <div class="comparison-row" style="border-left: 4px solid ${config.border}; background: ${config.bg};">
                    <div class="status-cell">
                        <div class="status-badge" style="background: white; color: ${config.color}; border: 1px solid ${config.border};">
                            <span>${config.icon}</span>
                            <span>${config.label}</span>
                        </div>
                    </div>
                    
                    <div class="file-data">
                        <div class="field-grid">
                            ${Object.entries(row.fields).map(([fieldName, fieldData]) => {
                              const isChanged = fieldData.status === 'difference';
                              const diffResult = getCharacterDiff(String(fieldData.val1), String(fieldData.val2), ignoreWhitespace);
                              
                              return `
                                <div class="field-item ${isChanged ? 'changed' : ''}">
                                    <div class="field-label">${fieldName}</div>
                                    <div class="field-value">${
                                      showCharacterDiff && diffResult.hasChanges && Array.isArray(diffResult.str1) 
                                        ? diffResult.str1.map(c => 
                                            c.type === 'removed' ? `<span class="char-diff-removed">${c.char}</span>` :
                                            c.type === 'missing' ? `<span class="char-diff-added">${c.char}</span>` :
                                            c.char
                                          ).join('')
                                        : fieldData.val1
                                    }</div>
                                    ${fieldData.difference ? `<div style="font-size: 0.8rem; color: #6b7280; margin-top: 4px;">Δ ${fieldData.difference}</div>` : ''}
                                </div>
                              `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <div class="file-data">
                        <div class="field-grid">
                            ${Object.entries(row.fields).map(([fieldName, fieldData]) => {
                              const isChanged = fieldData.status === 'difference';
                              const diffResult = getCharacterDiff(String(fieldData.val1), String(fieldData.val2), ignoreWhitespace);
                              
                              return `
                                <div class="field-item ${isChanged ? 'changed' : ''}">
                                    <div class="field-label">${fieldName}</div>
                                    <div class="field-value">${
                                      showCharacterDiff && diffResult.hasChanges && Array.isArray(diffResult.str2) 
                                        ? diffResult.str2.map(c => 
                                            c.type === 'added' ? `<span class="char-diff-added">${c.char}</span>` :
                                            c.type === 'missing' ? `<span class="char-diff-removed">${c.char}</span>` :
                                            c.char
                                          ).join('')
                                        : fieldData.val2
                                    }</div>
                                    ${fieldData.difference ? `<div style="font-size: 0.8rem; color: #6b7280; margin-top: 4px;">Δ ${fieldData.difference}</div>` : ''}
                                </div>
                              `;
                            }).join('')}
                        </div>
                    </div>
                </div>
              `;
            }).join('')}
        </div>

        <div class="footer">
            <p>🔒 Generated by VeriDiff - Enterprise-Grade File Comparison</p>
            <p>All processing performed locally in your browser. No data uploaded to external servers.</p>
            <p>Report contains ${filteredResults.length} records | Generated with ${ignoreWhitespace ? 'whitespace ignored' : 'whitespace considered'} | Character-level diff: ${showCharacterDiff ? 'enabled' : 'disabled'}</p>
        </div>
    </div>
</body>
</html>`;
  };

  // ✅ FIXED: Premium upgrade with simplified Stripe integration
  const handlePremiumUpgrade = async () => {
    console.log('=== FRONTEND STRIPE CHECKOUT START ===');
    
    try {
      setLoading(true);
      console.log('Making request to create checkout session...');
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          errorData = { error: 'Unknown error', details: errorText };
        }
        
        throw new Error(`${errorData.error || 'Unknown error'}: ${errorData.message || errorText}`);
      }

      const data = await response.json();
      console.log('✅ Checkout session data:', data);

      if (!data.url) {
        throw new Error('No checkout URL received from server');
      }

      console.log('Redirecting to Stripe checkout:', data.url);
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
      
    } catch (error) {
      console.log('❌ FRONTEND ERROR:', error);
      setLoading(false);
      
      // Enhanced error handling with user-friendly messages
      let errorMessage = 'Sorry, there was an error starting your premium subscription. ';
      
      if (error.message.includes('Failed to create checkout session')) {
        errorMessage += 'Please try again in a moment, or contact support if the issue persists.';
      } else if (error.message.includes('network')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else {
        errorMessage += 'Please contact support at hello@veridiff.com for assistance.';
      }
      
      alert(`🔒 Premium Subscription Error\n\n${errorMessage}\n\nNote: Excel-Excel comparisons remain FREE for all signed-in users!`);
    }
    
    console.log('=== FRONTEND STRIPE CHECKOUT END ===');
  };

  // ✅ NEW: Modal upgrade handler
  const handleModalUpgrade = async () => {
    setShowPremiumModal(false);
    await handlePremiumUpgrade();
  };

  // ✅ NEW: Modal dismiss handler
  const handleModalDismiss = () => {
    setShowPremiumModal(false);
    // Reset file type selection back to excel
    setFileType('excel');
  };

  // Usage tracking functions
  const trackUsage = async () => {
    if (!session) return null;

    try {
      const response = await fetch('/api/usage/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to track usage');
      }

      setUsage(data.usage);
      return data.usage;

    } catch (error) {
      console.error('Usage tracking error:', error);
      throw error;
    }
  };

  // ✅ ENHANCED: Analytics tracking function with detailed user information
  const trackAnalytics = async (comparisonType, tier) => {
    if (!session) return;

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // User identification
          user_id: session.user.id,
          user_email: session.user.email,
          user_name: session.user.name,
          
          // Comparison details
          comparison_type: comparisonType,
          tier: tier,
          
          // Timing and metadata
          timestamp: new Date().toISOString(),
          
          // Optional: File information
          file1_name: file1?.name || null,
          file2_name: file2?.name || null,
          file1_size: file1?.size || null,
          file2_size: file2?.size || null,
          
          // Browser/device info
          user_agent: navigator.userAgent,
          page_url: window.location.href
        })
      });
      
      console.log(`📊 Analytics tracked: ${comparisonType} (${tier}) for ${session.user.email}`);
      
    } catch (error) {
      console.error('Analytics tracking failed:', error);
      // Don't block the comparison if analytics fails
    }
  };

  const fetchUsage = async () => {
    if (!session) return null;

    try {
      const response = await fetch('/api/usage/current');
      const data = await response.json();

      if (response.ok) {
        setUsage(data.usage);
        setUserTier(data.user?.tier || 'free'); // ✅ NEW: Track user tier
        return data.usage;
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    }
    return null;
  };

  // Fetch usage on component mount
  useEffect(() => {
    if (session) {
      fetchUsage();
    }
  }, [session]);

  // ✅ NEW: Check for successful payment on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('upgrade');

    if (success === 'success') {
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Show success message
      alert(`🎉 Premium Subscription Activated!\n\nWelcome to VeriDiff Premium! You now have access to all file comparison formats.\n\nYour payment was successful.\n\nStart comparing any file format now!`);
      
      // Refresh user data to get updated tier
      if (session) {
        fetchUsage();
      }
    } else if (success === 'cancelled') {
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Show cancellation message
      alert(`❌ Subscription Canceled\n\nNo worries! You can upgrade to Premium anytime.\n\nExcel-Excel comparisons remain FREE forever for signed-in users!`);
    }
  }, [session]);

  // ✅ UPDATED: Simplified comparison handler since premium blocking is upfront
  const handleCompareFiles = async () => {
    if (isProcessing) {
      console.log('🚫 Comparison already in progress, ignoring duplicate call');
      return;
    }

    try {
      setIsProcessing(true);
      
      if (fileType === 'excel') {
        // Excel-Excel: Free analytics tracking only
        console.log('📊 Excel-Excel comparison - FREE tier');
        await trackAnalytics('excel-excel', 'free');
        await handleRunComparison();
        console.log('✅ Free Excel-Excel comparison completed');
      } else {
        // Premium formats: Should never reach here due to upfront blocking
        console.log('🚀 Premium comparison proceeding...');
        await trackAnalytics(fileType, 'premium');
        await handleRunComparison();
        console.log('✅ Premium comparison completed');
      }
      
    } catch (error) {
      console.error('❌ Comparison error:', error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ UPDATED: Show usage status with free Excel-Excel messaging
  const showUsageStatus = () => {
    if (!usage) return null;
    
    return (
      <div style={{ 
        background: fileType === 'excel' ? '#f0fdf4' : (userTier === 'premium' ? '#f0fdf4' : '#fef2f2'),
        padding: '1rem',
        borderRadius: '0.5rem',
        margin: '1rem 0',
        border: fileType === 'excel' ? '2px solid #22c55e' : (userTier === 'premium' ? '2px solid #22c55e' : '2px solid #ef4444')
      }}>
        {fileType === 'excel' ? (
          <p style={{ margin: 0, color: '#166534', fontWeight: '600' }}>
            🎉 Excel-Excel comparisons are FREE forever! No usage limits for signed-in users.
          </p>
        ) : userTier === 'premium' ? (
          <p style={{ margin: 0, color: '#166534', fontWeight: '600' }}>
            ✅ Premium Active: Unlimited access to all comparison formats!
          </p>
        ) : (
          <p style={{ margin: 0, color: '#dc2626', fontWeight: '600' }}>
            🔒 Premium format selected. Upgrade required to access advanced comparison features.
          </p>
        )}
      </div>
    );
  };

  // INLINE FILE DETECTION (inside component)
  const detectFileTypeInline = (file) => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.xlsm')) {
      return { type: 'excel', label: 'Excel' };
    }
    if (fileName.endsWith('.csv')) {
      return { type: 'csv', label: 'CSV' };
    }
    
    return { type: 'unknown', label: 'Unknown' };
  };

  // ENFORCED FILE ORDER VALIDATION - Simple and Clear
  const validateExcelCSVOrder = (file1, file2) => {
    const file1Type = detectFileTypeInline(file1);
    const file2Type = detectFileTypeInline(file2);
    
    console.log(`🔍 File 1 (${file1.name}) detected as: ${file1Type.type}`);
    console.log(`🔍 File 2 (${file2.name}) detected as: ${file2Type.type}`);
    
    // STRICT: File 1 must be Excel, File 2 must be CSV
    if (file1Type.type !== 'excel') {
      return {
        valid: false,
        error: `❌ File Order Error!\n\nFile 1 must be an Excel file (.xlsx, .xls)\nYou uploaded: ${file1Type.label}\n\nPlease upload Excel file first, then CSV file.`
      };
    }
    
    if (file2Type.type !== 'csv') {
      return {
        valid: false,
        error: `❌ File Order Error!\n\nFile 2 must be a CSV file (.csv)\nYou uploaded: ${file2Type.label}\n\nPlease upload Excel file first, then CSV file.`
      };
    }
    
    console.log("✅ Correct file order: Excel → CSV");
    return {
      valid: true,
      excelFile: file1,
      csvFile: file2
    };
  };

  const handleFileChange = (e, fileNum) => {
    // ✅ UPDATED: Only block for non-premium users on premium formats
    if (fileType !== 'excel' && userTier !== 'premium') {
      return; // Don't allow file uploads for premium formats
    }
    
    const file = e.target.files[0];
    if (!file) return;
    if (fileNum === 1) setFile1(file);
    else setFile2(file);
  };

  // ✅ UPDATED: File type change shows modal for premium formats
  const handleFileTypeChange = (e) => {
    const newFileType = e.target.value;
    
    // If selecting a premium format and user is not premium, show modal immediately
    if (newFileType !== 'excel' && userTier !== 'premium' && session) {
      setShowPremiumModal(true);
      // Don't change fileType yet - let user decide in modal
      return;
    }
    
    // Normal flow for excel or premium users
    setFileType(newFileType);
    setFile1(null);
    setFile2(null);
    setResults(null);
    setError(null);
    setShowMapper(false);
    
    // Reset optional states
    if (FEATURES.SHEET_SELECTION) {
      setShowSheetSelector(false);
      setFile1Info(null);
      setFile2Info(null);
    }
  };

  // LEGACY EXCEL-CSV PARSING FUNCTION (fallback)
  const legacyExcelCSVParsing = async () => {
    console.log("Using legacy Excel-CSV parsing...");
    let data1 = [], data2 = [];
    
    try {
      if (FEATURES.SHEET_SELECTION) {
        const excelInfo = await getExcelFileInfo(file1);
        setFile1Info(excelInfo);
        
        if (excelInfo.sheets.length > 1) {
          setShowSheetSelector(true);
          setLoading(false);
          return { data1: [], data2: [] };
        }
        
        const result1 = await parseExcelFile(file1, excelInfo.defaultSheet);
        data1 = safeExtractExcelData(result1);
      } else {
        const result1 = await parseExcelFile(file1);
        data1 = safeExtractExcelData(result1);
      }
    } catch (excelError) {
      console.warn('Enhanced Excel parsing failed, using fallback:', excelError);
      const result1 = await parseExcelFile(file1);
      data1 = Array.isArray(result1) ? result1 : (result1.data || []);
    }
    
    data2 = await parseCSVFile(file2);
    return { data1, data2 };
  };

  // MODULAR: Safe Excel data extraction
  const safeExtractExcelData = (result) => {
    if (FEATURES.ENHANCED_EXCEL_PARSING && result && typeof result === 'object' && result.data) {
      return result.data;
    }
    return Array.isArray(result) ? result : [];
  };

  // MODULAR: Safe data validation
  const validateDataFormat = (data1, data2) => {
    if (!FEATURES.ENHANCED_EXCEL_PARSING) return;
    
    if (!Array.isArray(data1) || data1.length === 0) {
      throw new Error('File 1 contains no valid data rows');
    }
    if (!Array.isArray(data2) || data2.length === 0) {
      throw new Error('File 2 contains no valid data rows');
    }
    
    if (typeof data1[0] !== 'object' || Array.isArray(data1[0])) {
      throw new Error('File 1 data format is not supported - expected object rows');
    }
    if (typeof data2[0] !== 'object' || Array.isArray(data2[0])) {
      throw new Error('File 2 data format is not supported - expected object rows');
    }
  };

  // MODULAR: Sheet selection handler
  const handleSheetSelect = (sheet1, sheet2) => {
    if (!FEATURES.SHEET_SELECTION) return;
    setSelectedSheet1(sheet1);
    setSelectedSheet2(sheet2);
  };

  // ✅ UPDATED: handleLoadFiles with simplified logic (premium check already done)
  const handleLoadFiles = async () => {
    console.log("🚀 handleLoadFiles started");
    console.log("📁 File 1:", file1?.name);
    console.log("📁 File 2:", file2?.name);
    console.log("🎯 File type:", fileType);
    
    if (!file1 || !file2) {
      setError('Please select two files.');
      return;
    }

    // ✅ AUTHENTICATION CHECK - All users must be signed in
    if (!session) {
      alert('Please sign in to use VeriDiff. Excel comparisons are free forever, but we need to know who\'s using our service!');
      return;
    }

    // ✅ PREMIUM CHECK ALREADY DONE - This function only runs for allowed formats
    console.log('✅ Proceeding with file processing...');
    setLoading(true);
    setError(null);
    
    try {
      let data1 = [], data2 = [];
      
      if (fileType === 'excel_csv') {
        console.log("📊 Processing Excel-CSV combination");
        console.log("🔧 FLEXIBLE_CROSS_FORMAT feature:", FEATURES.FLEXIBLE_CROSS_FORMAT);
        
        if (FEATURES.FLEXIBLE_CROSS_FORMAT) {
          console.log("✅ Using flexible cross-format system");
          
          try {
            console.log("🔍 Starting file validation...");
            
            const validation = validateExcelCSVOrder(file1, file2);
            console.log("🔍 Validation result:", validation);
            
            if (!validation.valid) {
              throw new Error(validation.error);
            }
            
            console.log("✅ File validation passed");
            
            console.log("📊 Parsing Excel file (File 1):", validation.excelFile.name);
            const excelResult = await parseExcelFile(validation.excelFile, selectedSheet1);
            data1 = safeExtractExcelData(excelResult);
            
            console.log("📊 Parsing CSV file (File 2):", validation.csvFile.name);
            data2 = await parseCSVFile(validation.csvFile);
            
            console.log("📊 Final data1 length:", data1?.length);
            console.log("📊 Final data2 length:", data2?.length);
            
          } catch (flexibleError) {
            console.warn("❌ Flexible cross-format failed:", flexibleError);
            console.log("🔄 Falling back to legacy approach");
            
            const legacyResult = await legacyExcelCSVParsing();
            data1 = legacyResult.data1;
            data2 = legacyResult.data2;
          }
        } else {
          console.log("🔄 Using legacy approach (feature disabled)");
          const legacyResult = await legacyExcelCSVParsing();
          data1 = legacyResult.data1;
          data2 = legacyResult.data2;
        }
        
      } else if (fileType === 'csv') {
        data1 = await parseCSVFile(file1);
        data2 = await parseCSVFile(file2);
        
      } else if (fileType === 'excel') {
        try {
          if (FEATURES.SHEET_SELECTION) {
            const [excelInfo1, excelInfo2] = await Promise.all([
              getExcelFileInfo(file1),
              getExcelFileInfo(file2)
            ]);
            setFile1Info(excelInfo1);
            setFile2Info(excelInfo2);
            
            if (excelInfo1.sheets.length > 1 || excelInfo2.sheets.length > 1) {
              setShowSheetSelector(true);
              setLoading(false);
              return;
            }
            
            const [result1, result2] = await Promise.all([
              parseExcelFile(file1, excelInfo1.defaultSheet),
              parseExcelFile(file2, excelInfo2.defaultSheet)
            ]);
            data1 = safeExtractExcelData(result1);
            data2 = safeExtractExcelData(result2);
          } else {
            const [result1, result2] = await Promise.all([
              parseExcelFile(file1),
              parseExcelFile(file2)
            ]);
            data1 = safeExtractExcelData(result1);
            data2 = safeExtractExcelData(result2);
          }
        } catch (excelError) {
          console.warn('Enhanced Excel parsing failed, using fallback:', excelError);
          const [result1, result2] = await Promise.all([
            parseExcelFile(file1),
            parseExcelFile(file2)
          ]);
          data1 = Array.isArray(result1) ? result1 : (result1.data || []);
          data2 = Array.isArray(result2) ? result2 : (result2.data || []);
        }
        
      } else {
        throw new Error('Unsupported file type.');
      }
      
      try {
        validateDataFormat(data1, data2);
      } catch (validationError) {
        console.warn('Data validation warning:', validationError.message);
      }
      
      const h1 = Object.keys(data1[0] || {});
      const h2 = Object.keys(data2[0] || {});
      const suggested = mapHeaders(h1, h2);
      
      setHeaders1(h1);
      setHeaders2(h2);
      setSuggestedMappings(suggested);
      setSampleData1(data1.slice(0, 10));
      setSampleData2(data2.slice(0, 10));
      setShowMapper(true);
      
    } catch (err) {
      console.error('File loading error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedWithSheets = async () => {
    if (!FEATURES.SHEET_SELECTION) return;
    
    if (!selectedSheet1 || (fileType === 'excel' && !selectedSheet2)) {
      setError('Please select sheets for both files.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let data1 = [], data2 = [];
      
      if (fileType === 'excel_csv') {
        const result1 = await parseExcelFile(file1, selectedSheet1);
        data1 = safeExtractExcelData(result1);
        data2 = await parseCSVFile(file2);
      } else if (fileType === 'excel') {
        const [result1, result2] = await Promise.all([
          parseExcelFile(file1, selectedSheet1),
          parseExcelFile(file2, selectedSheet2)
        ]);
        data1 = safeExtractExcelData(result1);
        data2 = safeExtractExcelData(result2);
      }
      
      const h1 = Object.keys(data1[0] || {});
      const h2 = Object.keys(data2[0] || {});
      const suggested = mapHeaders(h1, h2);
      
      setHeaders1(h1);
      setHeaders2(h2);
      setSuggestedMappings(suggested);
      setSampleData1(data1.slice(0, 10));
      setSampleData2(data2.slice(0, 10));
      setShowMapper(true);
      setShowSheetSelector(false);
      
    } catch (err) {
      console.error('Sheet processing error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMappingConfirmed = (mappings) => {
    setFinalMappings(mappings);
  };

  const handleDownloadExcel = () => {
    try {
      const timestamp = new Date().toISOString().slice(0,10);
      const filename = `comparison_results_${timestamp}.xlsx`;
      downloadResultsAsExcel(results, filename);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDownloadCSV = () => {
    try {
      const timestamp = new Date().toISOString().slice(0,10);
      const filename = `comparison_results_${timestamp}.csv`;
      downloadResultsAsCSV(results, filename);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRunComparison = async () => {
    if (!file1 || !file2 || finalMappings.length === 0) {
      setError('Missing files or mappings.');
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      const options = {};
      if (FEATURES.SHEET_SELECTION) {
        options.sheet1 = selectedSheet1;
        options.sheet2 = selectedSheet2;
      }
      if (FEATURES.AUTO_DETECTION) {
        options.autoDetectAmounts = true;
      }
      
      if (fileType === 'excel_csv') {
        result = await compareExcelCSVFiles(file1, file2, finalMappings);
      } else if (fileType === 'excel') {
        result = await compareExcelFiles(file1, file2, finalMappings, options);
      } else if (fileType === 'csv') {
        result = await compareExcelCSVFiles(file1, file2, finalMappings);
      } else {
        result = await compareExcelCSVFiles(file1, file2, finalMappings);
      }
      
      setResults(result);
      
    } catch (err) {
      console.error('Comparison error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Enhanced results display helper functions
  const getFilteredResults = () => {
    if (!results?.results) return [];
    
    let filtered = results.results;
    
    // Apply filter
    if (resultsFilter === 'differences') {
      filtered = filtered.filter(row => 
        Object.values(row.fields).some(field => field.status === 'difference')
      );
    } else if (resultsFilter === 'matches') {
      filtered = filtered.filter(row => 
        Object.values(row.fields).every(field => field.status === 'match')
      );
    }
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row.fields).some(field =>
          String(field.val1).toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(field.val2).toLowerCase().includes(searchTerm.toLowerCase())
        ) || String(row.ID).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aVal = sortField === 'ID' ? a.ID : a.fields[sortField]?.val1 || '';
        let bVal = sortField === 'ID' ? b.ID : b.fields[sortField]?.val1 || '';
        
        // Convert to numbers if possible
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          aVal = aNum;
          bVal = bNum;
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  };

  const toggleRowExpansion = (rowIndex) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowIndex)) {
      newExpanded.delete(rowIndex);
    } else {
      newExpanded.add(rowIndex);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'match': return '✅';
      case 'difference': return '❌';
      case 'acceptable': return '⚠️';
      default: return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'match': return { bg: '#f0fdf4', border: '#22c55e', text: '#166534' };
      case 'difference': return { bg: '#fef2f2', border: '#ef4444', text: '#dc2626' };
      case 'acceptable': return { bg: '#fefce8', border: '#f59e0b', text: '#92400e' };
      default: return { bg: '#f8fafc', border: '#64748b', text: '#475569' };
    }
  };

  // ✅ NEW: Render side-by-side comparison view
  const renderSideBySideView = () => {
    const filteredResults = getFilteredResults();
    
    return (
      <div style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
      }}>
        {/* Table Header */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
          padding: '20px',
          borderBottom: '2px solid #e5e7eb'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr 1fr',
            gap: '20px',
            alignItems: 'center',
            fontWeight: '700',
            color: '#1f2937',
            fontSize: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>Status</div>
            <div style={{ textAlign: 'center', color: '#2563eb' }}>
              📄 File 1 ({file1?.name || 'Original'})
            </div>
            <div style={{ textAlign: 'center', color: '#16a34a' }}>
              📄 File 2 ({file2?.name || 'Comparison'})
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {filteredResults.map((row, rowIndex) => {
            const status = getRecordStatus(row);
            const config = getStatusConfig(status);
            
            return (
              <div key={rowIndex} style={{
                borderBottom: '1px solid #f3f4f6',
                borderLeft: `4px solid ${config.border}`,
                background: config.bg
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr 1fr',
                  gap: '20px',
                  padding: '20px',
                  minHeight: '120px',
                  alignItems: 'center'
                }}>
                  {/* Status Column */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{config.icon}</div>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: config.color,
                      background: 'white',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: `2px solid ${config.border}`,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {config.label}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: '#6b7280',
                      marginTop: '4px'
                    }}>
                      Record {row.ID}
                    </div>
                  </div>

                  {/* File 1 Column */}
                  <div style={{
                    background: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '15px',
                    minHeight: '80px'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '10px'
                    }}>
                      {Object.entries(row.fields).map(([fieldName, fieldData]) => {
                        const isChanged = fieldData.status === 'difference';
                        const diffResult = getCharacterDiff(String(fieldData.val1), String(fieldData.val2), ignoreWhitespace);
                        
                        return (
                          <div key={fieldName} style={{
                            background: isChanged ? '#fee2e2' : '#f9fafb',
                            padding: '10px',
                            borderRadius: '8px',
                            border: isChanged ? '2px solid #fca5a5' : '1px solid #e5e7eb'
                          }}>
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              marginBottom: '4px',
                              fontWeight: '600'
                            }}>
                              {fieldName}
                            </div>
                            <div style={{
                              fontWeight: '500',
                              color: isChanged ? '#dc2626' : '#1f2937',
                              fontSize: '0.9rem'
                            }}>
                              {showCharacterDiff && isChanged ? 
                                renderCharacterDiff(diffResult) : 
                                fieldData.val1
                              }
                            </div>
                            {fieldData.difference && (
                              <div style={{
                                fontSize: '0.7rem',
                                color: '#ef4444',
                                marginTop: '4px',
                                fontWeight: '600'
                              }}>
                                Δ {fieldData.difference}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* File 2 Column */}
                  <div style={{
                    background: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '15px',
                    minHeight: '80px'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '10px'
                    }}>
                      {Object.entries(row.fields).map(([fieldName, fieldData]) => {
                        const isChanged = fieldData.status === 'difference';
                        const diffResult = getCharacterDiff(String(fieldData.val1), String(fieldData.val2), ignoreWhitespace);
                        
                        return (
                          <div key={fieldName} style={{
                            background: isChanged ? '#d1fae5' : '#f9fafb',
                            padding: '10px',
                            borderRadius: '8px',
                            border: isChanged ? '2px solid #86efac' : '1px solid #e5e7eb'
                          }}>
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              marginBottom: '4px',
                              fontWeight: '600'
                            }}>
                              {fieldName}
                            </div>
                            <div style={{
                              fontWeight: isChanged ? '600' : '500',
                              color: isChanged ? '#16a34a' : '#1f2937',
                              fontSize: '0.9rem'
                            }}>
                              {showCharacterDiff && isChanged && diffResult.str2 ? 
                                <span>
                                  {Array.isArray(diffResult.str2) ? diffResult.str2.map((charObj, idx) => (
                                    <span
                                      key={idx}
                                      style={{
                                        backgroundColor: charObj.type === 'added' ? '#dcfce7' : 'transparent',
                                        color: charObj.type === 'added' ? '#16a34a' : 'inherit',
                                        fontWeight: charObj.type === 'added' ? '600' : 'inherit',
                                        padding: charObj.type === 'added' ? '1px 2px' : '0',
                                        borderRadius: '2px'
                                      }}
                                    >
                                      {charObj.char}
                                    </span>
                                  )) : diffResult.str2}
                                </span> :
                                fieldData.val2
                              }
                            </div>
                            {fieldData.difference && (
                              <div style={{
                                fontSize: '0.7rem',
                                color: '#16a34a',
                                marginTop: '4px',
                                fontWeight: '600'
                              }}>
                                Δ {fieldData.difference}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ✅ NEW: Premium Upgrade Modal Component
  const PremiumUpgradeModal = () => {
    if (!showPremiumModal) return null;
    
    return (
      <div style={{
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
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '0',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white',
            padding: '40px 30px',
            borderRadius: '24px 24px 0 0',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* Close button */}
            <button
              onClick={handleModalDismiss}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🚀</div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              margin: '0 0 10px 0'
            }}>
              Upgrade to Premium
            </h2>
            <p style={{
              fontSize: '1.1rem',
              opacity: '0.9',
              margin: '0'
            }}>
              This format requires premium access
            </p>
          </div>

          {/* Content */}
          <div style={{ padding: '30px' }}>
            <p style={{
              fontSize: '1.1rem',
              color: '#374151',
              textAlign: 'center',
              marginBottom: '25px'
            }}>
              Get instant access to <strong>Excel-CSV</strong>, PDF, JSON, XML, and all advanced comparison formats with professional-grade features.
            </p>

            {/* Features grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px',
              marginBottom: '30px'
            }}>
              <div style={{
                background: '#f0f9ff',
                padding: '15px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '2px solid #e0f2fe'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>📊</div>
                <strong>All Formats</strong>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                  Excel-CSV, PDF, JSON, XML
                </div>
              </div>
              <div style={{
                background: '#f0fdf4',
                padding: '15px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '2px solid #dcfce7'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>⚡</div>
                <strong>Advanced Features</strong>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                  Smart mapping & controls
                </div>
              </div>
              <div style={{
                background: '#fefce8',
                padding: '15px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '2px solid #fef3c7'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>🔒</div>
                <strong>Same Privacy</strong>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                  Local processing only
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
              border: '2px solid #e5e7eb',
              borderRadius: '16px',
              padding: '25px',
              textAlign: 'center',
              marginBottom: '25px'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '5px'
              }}>
                £19<span style={{ fontSize: '1rem', opacity: '0.7' }}>/month</span>
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                Cancel anytime • 30-day money-back guarantee
              </div>
            </div>

            {/* Action buttons */}
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleModalUpgrade}
                disabled={loading}
                style={{
                  background: loading 
                    ? '#94a3b8' 
                    : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '200px'
                }}
              >
                {loading ? '⏳ Loading...' : '🚀 Upgrade Now'}
              </button>
              
              <button
                onClick={handleModalDismiss}
                style={{
                  background: 'white',
                  color: '#6b7280',
                  border: '2px solid #e5e7eb',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Maybe Later
              </button>
            </div>

            {/* Excel reminder */}
            <p style={{
              fontSize: '0.9rem',
              color: '#6b7280',
              textAlign: 'center',
              marginTop: '20px',
              marginBottom: '0'
            }}>
              💡 <strong>Remember:</strong> Excel-Excel comparisons remain FREE forever!
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Responsive styles
  const containerStyle = {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const mainStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px'
  };

  const heroStyle = {
    textAlign: 'center',
    padding: '50px 30px',
    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    borderRadius: '20px',
    marginBottom: '40px',
    color: 'white',
    boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)'
  };

  const sectionStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    marginBottom: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb'
  };

  const sectionTitleStyle = {
    fontSize: '1.8rem',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: '0 0 15px 0',
    textAlign: 'center',
    fontWeight: '700'
  };

  const fileTypeGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    maxWidth: '900px',
    margin: '0 auto'
  };

  const fileUploadGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '25px',
    marginBottom: '35px'
  };

  const loadButtonStyle = {
    background: loading || !file1 || !file2 || isProcessing
      ? 'linear-gradient(135deg, #94a3b8, #64748b)' 
      : 'linear-gradient(135deg, #2563eb, #7c3aed, #ec4899)',
    color: 'white',
    border: 'none',
    padding: '20px 50px',
    borderRadius: '60px',
    fontSize: '1.4rem',
    fontWeight: '700',
    cursor: loading || !file1 || !file2 || isProcessing ? 'not-allowed' : 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    minWidth: '360px',
    boxShadow: loading || !file1 || !file2 || isProcessing
      ? '0 4px 15px rgba(100, 116, 139, 0.2)' 
      : '0 10px 30px rgba(37, 99, 235, 0.4)',
    position: 'relative',
    overflow: 'hidden'
  };

  // Media query styles
  const mediaQueries = `
    @media (max-width: 768px) {
      .file-type-grid { grid-template-columns: 1fr !important; }
      .file-upload-grid { grid-template-columns: 1fr !important; }
      .load-button { 
        min-width: 300px !important; 
        font-size: 1.2rem !important;
        padding: 16px 40px !important;
      }
      .hero-title { font-size: 2.5rem !important; }
      .section-title { font-size: 1.5rem !important; }
      .section-padding { padding: 25px !important; }
      .spreadsheet-benefits { grid-template-columns: repeat(2, 1fr) !important; }
      .use-case-grid { grid-template-columns: 1fr !important; }
    }
    
    @media (max-width: 480px) {
      .main-container { padding: 15px !important; }
      .hero-section { padding: 30px 20px !important; }
      .load-button { 
        min-width: 280px !important; 
        font-size: 1.1rem !important;
        padding: 14px 30px !important;
      }
      .spreadsheet-benefits { 
        grid-template-columns: 1fr !important; 
        gap: 1rem !important;
      }
    }
  `;

  return (
    <AuthGuard>
      <div style={containerStyle}>
        <Head>
          <title>Excel Spreadsheet Comparison Tool | Free Excel vs CSV | Smart Mapping | VeriDiff</title>
          <meta name="description" content="Professional Excel spreadsheet comparison tool. Compare Excel files free forever, Excel-to-CSV cross-format analysis. Smart header mapping, tolerance settings. Used by finance teams globally." />
          <meta name="keywords" content="excel comparison, spreadsheet comparison, csv comparison, excel vs csv, financial data comparison, budget analysis tool, excel file comparison, spreadsheet diff, financial reconciliation, data validation tool" />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://veridiff.com/compare/spreadsheets" />
          
          <style>{mediaQueries}</style>
        </Head>

        <Header />

        {/* Breadcrumb Navigation */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.75rem 0'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <nav style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              <Link href="/" style={{ 
                color: '#2563eb', 
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                Home
              </Link>
              <span style={{ margin: '0 0.5rem', color: '#9ca3af' }}>›</span>
              <Link href="/compare" style={{ 
                color: '#2563eb', 
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                File Comparison Tools
              </Link>
              <span style={{ margin: '0 0.5rem', color: '#9ca3af' }}>›</span>
              <span style={{ color: '#374151', fontWeight: '500' }}>Excel Spreadsheet Comparison</span>
            </nav>
          </div>
        </div>

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

        <main style={mainStyle} className="main-container">
          {/* Usage status */}
          {showUsageStatus()}

          {/* Enhanced Hero Section for Spreadsheets */}
          <div style={heroStyle} className="hero-section">
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white', 
              padding: '0.5rem 1rem', 
              borderRadius: '2rem', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              marginBottom: '1.5rem', 
              gap: '0.5rem',
              backdropFilter: 'blur(10px)'
            }}>
              📊 #1 Excel Comparison Tool for Finance Teams
            </div>
            
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '700',
              margin: '0 0 15px 0',
              lineHeight: '1.2'
            }} className="hero-title">
              Excel Spreadsheet Comparison Tool
            </h1>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '400',
              margin: '0 0 20px 0',
              opacity: '0.9'
            }}>
              Smart Mapping • Tolerance Settings • Free Forever
            </h2>
            <p style={{
              fontSize: '1.1rem',
              opacity: '0.9',
              lineHeight: '1.6',
              maxWidth: '700px',
              margin: '0 auto 2rem auto'
            }}>
              Compare Excel files with intelligence that understands your business data. Smart header mapping automatically matches mismatched columns. Tolerance settings handle acceptable variances. Perfect for budget analysis, financial reconciliation, and data validation.
            </p>
            
            {/* Spreadsheet-specific trust indicators */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '2rem',
              fontSize: '0.95rem',
              opacity: '0.85'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>Excel-Excel FREE Forever</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>Excel-CSV £19/month</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>Enterprise-Grade Security</span>
              </div>
            </div>
          </div>

          {/* NEW: Common Use Cases Section - MOVED TO TOP */}
          <div style={sectionStyle} className="section-padding">
            <h2 style={sectionTitleStyle} className="section-title">
              Common Spreadsheet Comparison Scenarios
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              textAlign: 'center',
              margin: '0 0 35px 0'
            }}>
              Real situations where VeriDiff's Excel comparison saves hours of manual work
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '25px'
            }} className="use-case-grid">
              <div style={{
                background: 'white',
                padding: '25px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '15px', color: '#1f2937' }}>
                  📊 Budget vs Actual Analysis
                </h3>
                <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '15px' }}>
                  Compare Q4_Budget.xlsx with Actual_Expenses.csv from your accounting system. Automatically identify departments over-budget by more than 5%.
                </p>
                <div style={{
                  background: '#f0fdf4',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#166534'
                }}>
                  <strong>Result:</strong> 15 departments flagged for review, 3 with variance {'>'}10%
                </div>
              </div>

              <div style={{
                background: 'white',
                padding: '25px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '15px', color: '#1f2937' }}>
                  🔍 Invoice Reconciliation
                </h3>
                <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '15px' }}>
                  Match invoices_sent.xlsx with payments_received.csv. Tolerance of ±£0.01 handles rounding differences while flagging true discrepancies.
                </p>
                <div style={{
                  background: '#eff6ff',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#1e40af'
                }}>
                  <strong>Result:</strong> 2,847 matched, 23 outstanding payments identified
                </div>
              </div>

              <div style={{
                background: 'white',
                padding: '25px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '15px', color: '#1f2937' }}>
                  📋 Data Migration Validation
                </h3>
                <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '15px' }}>
                  Verify old_system_export.xlsx matches new_system_data.csv after migration. Ensure no data loss during system transition.
                </p>
                <div style={{
                  background: '#fefce8',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#92400e'
                }}>
                  <strong>Result:</strong> 99.8% match rate, 12 records need manual review
                </div>
              </div>
            </div>
          </div>

          {/* File Type Selection - NOW POSITIONED AFTER USE CASES */}
          <div style={sectionStyle} className="section-padding">
            <h2 style={sectionTitleStyle} className="section-title">
              Choose Your Comparison Type
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              textAlign: 'center',
              margin: '0 0 35px 0'
            }}>
              Excel-Excel is free for all signed-in users • Excel-CSV requires premium
            </p>
            
            <div style={fileTypeGridStyle} className="file-type-grid">
              {[
                { value: 'excel', label: 'Excel–Excel', featured: false, free: true },
                { value: 'excel_csv', label: 'Excel–CSV', featured: true, free: false },
                { value: 'csv', label: 'CSV–CSV', featured: false, free: false }
              ].map((option) => (
                <label
                  key={option.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '20px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: option.free
                      ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
                      : option.featured 
                        ? 'linear-gradient(135deg, #fef3c7, #fde68a)' 
                        : 'white',
                    border: option.free
                      ? '2px solid #22c55e'
                      : option.featured 
                        ? '2px solid #f59e0b' 
                        : fileType === option.value 
                          ? '2px solid #2563eb' 
                          : '2px solid #e5e7eb',
                    fontWeight: option.featured ? '600' : '500',
                    fontSize: '1rem',
                    minHeight: '60px'
                  }}
                  onMouseOver={(e) => {
                    if (fileType !== option.value) {
                      e.target.style.borderColor = option.free ? '#16a34a' : '#2563eb';
                      e.target.style.background = option.free 
                        ? 'linear-gradient(135deg, #d1fae5, #bbf7d0)'
                        : option.featured 
                          ? 'linear-gradient(135deg, #fde68a, #fcd34d)' 
                          : '#f0f4ff';
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (fileType !== option.value) {
                      e.target.style.borderColor = option.free 
                        ? '#22c55e'
                        : option.featured 
                          ? '#f59e0b' 
                          : '#e5e7eb';
                      e.target.style.background = option.free
                        ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
                        : option.featured 
                          ? 'linear-gradient(135deg, #fef3c7, #fde68a)' 
                          : 'white';
                      e.target.style.transform = 'none';
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="fileType"
                    value={option.value}
                    checked={fileType === option.value}
                    onChange={handleFileTypeChange}
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: option.free ? '#22c55e' : '#2563eb'
                    }}
                  />
                  <span style={{ flex: 1 }}>
                    {option.label}
                    {option.free && (
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '0.75em',
                        background: '#dcfce7',
                        color: '#166534',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: '600'
                      }}>
                        FREE for signed-in users ✨
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* File Upload Section - NOW POSITIONED AFTER COMPARISON TYPE */}
          {(fileType === 'excel' || userTier === 'premium') && (
            <div style={sectionStyle} className="section-padding">
              <h2 style={sectionTitleStyle} className="section-title">
                Upload Your Spreadsheet Files
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#6b7280',
                textAlign: 'center',
                margin: '0 0 35px 0'
              }}>
                {fileType === 'excel' 
                  ? '🎉 Free Excel comparison for signed-in users!' 
                  : '✅ Premium format - advanced comparison features'
                }
              </p>

              <div style={fileUploadGridStyle} className="file-upload-grid">
                {/* File 1 Upload */}
                <div style={{
                  background: fileType === 'excel'
                    ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
                    : fileType === 'excel_csv' 
                      ? 'linear-gradient(135deg, #fef3c7, #fde68a)' 
                      : 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                  padding: '25px',
                  borderRadius: '16px',
                  border: fileType === 'excel'
                    ? '2px solid #22c55e'
                    : fileType === 'excel_csv' 
                      ? '2px solid #f59e0b' 
                      : '2px solid #0ea5e9',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: fileType === 'excel'
                        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                        : fileType === 'excel_csv' 
                          ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                          : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.2rem'
                    }}>
                      1
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontWeight: '700',
                        color: '#1f2937',
                        fontSize: '1.1rem',
                        margin: '0'
                      }}>
                        {fileType === 'excel_csv' 
                          ? 'Excel File (.xlsx, .xls, .xlsm)' 
                          : 'First Excel File'}
                      </label>
                      {fileType === 'excel' && (
                        <small style={{
                          color: '#166534',
                          fontSize: '0.85rem',
                          fontWeight: '500'
                        }}>
                          🎉 FREE Excel comparison for signed-in users!
                        </small>
                      )}
                      {fileType === 'excel_csv' && (
                        <small style={{
                          color: '#92400e',
                          fontSize: '0.85rem',
                          fontWeight: '500'
                        }}>
                          📊 Upload your Excel spreadsheet first
                        </small>
                      )}
                    </div>
                  </div>
                  
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 1)}
                    accept={fileType === 'excel_csv' ? '.xlsx,.xls,.xlsm' : '.xlsx,.xls,.xlsm'}
                    disabled={isProcessing}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '2px solid rgba(255,255,255,0.8)',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      background: 'rgba(255,255,255,0.9)',
                      fontWeight: '500',
                      opacity: isProcessing ? 0.7 : 1
                    }}
                  />
                  {file1 && (
                    <div style={{
                      marginTop: '15px',
                      padding: '12px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '2px solid #22c55e',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      color: '#166534',
                      fontWeight: '600'
                    }}>
                      ✅ {file1.name}
                    </div>
                  )}
                </div>
                
                {/* File 2 Upload */}
                <div style={{
                  background: fileType === 'excel'
                    ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
                    : fileType === 'excel_csv' 
                      ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' 
                      : 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                  padding: '25px',
                  borderRadius: '16px',
                  border: fileType === 'excel'
                    ? '2px solid #22c55e'
                    : fileType === 'excel_csv' 
                      ? '2px solid #22c55e' 
                      : '2px solid #0ea5e9',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: fileType === 'excel'
                        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                        : fileType === 'excel_csv' 
                          ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
                          : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.2rem'
                    }}>
                      2
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontWeight: '700',
                        color: '#1f2937',
                        fontSize: '1.1rem',
                        margin: '0'
                      }}>
                        {fileType === 'excel_csv' 
                          ? 'CSV File (.csv)' 
                          : 'Second Excel File'}
                      </label>
                      {fileType === 'excel' && (
                        <small style={{
                          color: '#166534',
                          fontSize: '0.85rem',
                          fontWeight: '500'
                        }}>
                          🎉 FREE Excel comparison for signed-in users!
                        </small>
                      )}
                      {fileType === 'excel_csv' && (
                        <small style={{
                          color: '#166534',
                          fontSize: '0.85rem',
                          fontWeight: '500'
                        }}>
                          📄 Upload your CSV data file second
                        </small>
                      )}
                    </div>
                  </div>
                  
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 2)}
                    accept={fileType === 'excel_csv' ? '.csv' : '.xlsx,.xls,.xlsm'}
                    disabled={isProcessing}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '2px solid rgba(255,255,255,0.8)',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      background: 'rgba(255,255,255,0.9)',
                      fontWeight: '500',
                      opacity: isProcessing ? 0.7 : 1
                    }}
                  />
                  {file2 && (
                    <div style={{
                      marginTop: '15px',
                      padding: '12px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '2px solid #22c55e',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      color: '#166534',
                      fontWeight: '600'
                    }}>
                      ✅ {file2.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Load Button */}
              <div style={{ textAlign: 'center', position: 'relative' }}>
                <button 
                  onClick={handleLoadFiles} 
                  disabled={loading || !file1 || !file2 || isProcessing}
                  style={loadButtonStyle}
                  className="load-button"
                  onMouseOver={(e) => {
                    if (!loading && file1 && file2 && !isProcessing) {
                      e.target.style.transform = 'translateY(-4px) scale(1.03)';
                      e.target.style.boxShadow = '0 15px 40px rgba(37, 99, 235, 0.6)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading && file1 && file2 && !isProcessing) {
                      e.target.style.transform = 'none';
                      e.target.style.boxShadow = '0 10px 30px rgba(37, 99, 235, 0.4)';
                    }
                  }}
                >
                  {loading || isProcessing ? (
                    <>
                      <span style={{ 
                        marginRight: '12px',
                        display: 'inline-block',
                        animation: 'spin 1s linear infinite'
                      }}>⏳</span>
                      {loading ? 'Processing Spreadsheets...' : 'Running Comparison...'}
                    </>
                  ) : (
                    <>
                      <span style={{ 
                        marginRight: '12px',
                        fontSize: '1.6rem',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                      }}>{fileType === 'excel' ? '🎉' : '🚀'}</span>
                      <span style={{
                        background: 'linear-gradient(45deg, #ffffff, #f0f9ff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        {fileType === 'excel' 
                          ? 'Start Free Excel Comparison' 
                          : 'Load Files & Start Comparison'
                        }
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Sheet Selector */}
          {FEATURES.SHEET_SELECTION && showSheetSelector && (
            <div style={sectionStyle}>
              <SheetSelector
                file1Info={file1Info}
                file2Info={file2Info}
                onSheetSelect={handleSheetSelect}
                fileType={fileType}
              />
              <div style={{ textAlign: 'center', marginTop: '25px' }}>
                <button 
                  onClick={handleProceedWithSheets} 
                  disabled={loading || !selectedSheet1 || (fileType === 'excel' && !selectedSheet2) || isProcessing}
                  style={{
                    background: loading || !selectedSheet1 || (fileType === 'excel' && !selectedSheet2) || isProcessing
                      ? '#9ca3af' 
                      : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    color: 'white',
                    border: 'none',
                    padding: '14px 30px',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: loading || !selectedSheet1 || (fileType === 'excel' && !selectedSheet2) || isProcessing ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading || isProcessing ? 'Processing...' : 'Proceed with Selected Sheets'}
                </button>
              </div>
            </div>
          )}

          {/* NEW: Spreadsheet-Specific Benefits Section - MOVED AFTER UPLOAD */}
          <div style={sectionStyle} className="section-padding">
            <h2 style={sectionTitleStyle} className="section-title">
              Why Finance Teams Choose VeriDiff for Excel Comparison
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              textAlign: 'center',
              margin: '0 0 35px 0'
            }}>
              Purpose-built for professional spreadsheet analysis with features Excel's built-in compare simply cannot provide
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '25px',
              marginBottom: '30px'
            }} className="spreadsheet-benefits">
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                padding: '25px',
                borderRadius: '16px',
                border: '2px solid #22c55e',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  margin: '0 auto 15px auto',
                  color: 'white'
                }}>
                  🎯
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '10px', color: '#166534' }}>
                  Smart Header Mapping
                </h3>
                <p style={{ color: '#065f46', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                  Automatically matches "Department" with "dept_name", "Budget Amount" with "budgeted_total" - no manual column mapping required.
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                padding: '25px',
                borderRadius: '16px',
                border: '2px solid #2563eb',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  margin: '0 auto 15px auto',
                  color: 'white'
                }}>
                  ⚖️
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '10px', color: '#1e40af' }}>
                  Tolerance Settings
                </h3>
                <p style={{ color: '#1e3a8a', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                  Set ±3% tolerance for budget variance or ±£0.01 for financial reconciliation. Flag true discrepancies, not rounding differences.
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #fefce8, #fef3c7)',
                padding: '25px',
                borderRadius: '16px',
                border: '2px solid #f59e0b',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  margin: '0 auto 15px auto',
                  color: 'white'
                }}>
                  🔄
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '10px', color: '#92400e' }}>
                  Cross-Format Analysis
                </h3>
                <p style={{ color: '#78350f', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                  Compare Excel budget.xlsx with actual_spend.csv from your finance system. Bridge the gap between different data sources.
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
                padding: '25px',
                borderRadius: '16px',
                border: '2px solid #7c3aed',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  margin: '0 auto 15px auto',
                  color: 'white'
                }}>
                  🤖
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '10px', color: '#6b21a8' }}>
                  Auto-Detection
                </h3>
                <p style={{ color: '#581c87', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                  Automatically identifies amount fields, applies smart tolerance, and highlights critical variances that need your attention.
                </p>
              </div>
            </div>
          </div>

          {/* Header Mapper */}
          {showMapper && (
            <HeaderMapper
              file1Headers={headers1}
              file2Headers={headers2}
              suggestedMappings={suggestedMappings}
              sampleData1={sampleData1}
              sampleData2={sampleData2}
              onConfirm={handleMappingConfirmed}
              showRunButton={true}
              onRun={handleCompareFiles}
              isProcessing={isProcessing}
            />
          )}

          {/* Error Display */}
          {error && (
            <div style={{
              color: '#dc2626',
              margin: '20px 0',
              padding: '20px',
              border: '2px solid #dc2626',
              borderRadius: '12px',
              background: '#fef2f2',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Loading */}
          {(loading || isProcessing) && (
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
              <strong>{loading ? 'Processing...' : 'Running Comparison...'}</strong> Please wait while we {loading ? 'load and analyze' : 'compare'} your {fileType === 'excel' ? 'Excel files' : 'spreadsheet files'}...
            </div>
          )}

          {/* ✅ ENHANCED RESULTS SECTION - WITH SIDE-BY-SIDE DIFF VIEW */}
          {results && (
            <div style={sectionStyle}>
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
                  Advanced Comparison Results ✨
                </h2>
                
                {fileType === 'excel' && (
                  <div style={{
                    background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                    border: '2px solid #22c55e',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '25px',
                    display: 'inline-block'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🎉</div>
                    <div style={{ color: '#166534', fontWeight: '600', fontSize: '1.1rem' }}>
                      Free Excel Comparison Complete!
                    </div>
                    <div style={{ color: '#16a34a', fontSize: '0.95rem', marginTop: '5px' }}>
                      No usage limits for signed-in users
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Summary Dashboard */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '25px',
                marginBottom: '40px'
              }}>
                {/* Total Records Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                  border: '2px solid #0ea5e9',
                  borderRadius: '20px',
                  padding: '30px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '80px',
                    height: '80px',
                    background: 'rgba(14, 165, 233, 0.1)',
                    borderRadius: '50%'
                  }}></div>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📊</div>
                  <div style={{ 
                    fontSize: '3rem', 
                    fontWeight: '700', 
                    color: '#0369a1',
                    marginBottom: '8px'
                  }}>
                    {results.total_records}
                  </div>
                  <div style={{ 
                    color: '#0369a1', 
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>
                    Total Records
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#0284c7',
                    marginTop: '5px'
                  }}>
                    Analyzed & Compared
                  </div>
                </div>

                {/* Differences Card */}
                <div style={{
                  background: results.differences_found > 0 
                    ? 'linear-gradient(135deg, #fef2f2, #fee2e2)' 
                    : 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  border: results.differences_found > 0 
                    ? '2px solid #ef4444' 
                    : '2px solid #22c55e',
                  borderRadius: '20px',
                  padding: '30px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '80px',
                    height: '80px',
                    background: results.differences_found > 0 
                      ? 'rgba(239, 68, 68, 0.1)' 
                      : 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '50%'
                  }}></div>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
                    {results.differences_found > 0 ? '⚠️' : '✅'}
                  </div>
                  <div style={{ 
                    fontSize: '3rem', 
                    fontWeight: '700', 
                    color: results.differences_found > 0 ? '#dc2626' : '#16a34a',
                    marginBottom: '8px'
                  }}>
                    {results.differences_found}
                  </div>
                  <div style={{ 
                    color: results.differences_found > 0 ? '#dc2626' : '#16a34a', 
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>
                    Differences Found
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: results.differences_found > 0 ? '#b91c1c' : '#15803d',
                    marginTop: '5px'
                  }}>
                    {results.differences_found > 0 ? 'Needs Review' : 'Perfect Match!'}
                  </div>
                </div>

                {/* Matches Card - FIXED CALCULATION */}
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  border: '2px solid #22c55e',
                  borderRadius: '20px',
                  padding: '30px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '80px',
                    height: '80px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '50%'
                  }}></div>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✨</div>
                  <div style={{ 
                    fontSize: '3rem', 
                    fontWeight: '700', 
                    color: '#16a34a',
                    marginBottom: '8px'
                  }}>
                    {/* 🔧 FIXED: Correct calculation */}
                    {results.total_records - results.differences_found}
                  </div>
                  <div style={{ 
                    color: '#16a34a', 
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>
                    Matches Found
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#15803d',
                    marginTop: '5px'
                  }}>
                    {/* 🔧 FIXED: Correct percentage calculation */}
                    {(((results.total_records - results.differences_found) / results.total_records) * 100).toFixed(1)}% Match Rate
                  </div>
                </div>

                {/* Match Rate Percentage Card - FIXED CALCULATION */}
                <div style={{
                  background: 'linear-gradient(135deg, #fefce8, #fef3c7)',
                  border: '2px solid #f59e0b',
                  borderRadius: '20px',
                  padding: '30px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '80px',
                    height: '80px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: '50%'
                  }}></div>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎯</div>
                  <div style={{ 
                    fontSize: '3rem', 
                    fontWeight: '700', 
                    color: '#d97706',
                    marginBottom: '8px'
                  }}>
                    {/* 🔧 FIXED: Correct percentage calculation */}
                    {(((results.total_records - results.differences_found) / results.total_records) * 100).toFixed(1)}%
                  </div>
                  <div style={{ 
                    color: '#d97706', 
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>
                    Match Rate
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#b45309',
                    marginTop: '5px'
                  }}>
                    Data Quality Score
                  </div>
                </div>
              </div>

              {/* Auto-detected Fields Banner */}
              {FEATURES.AUTO_DETECTION && results.autoDetectedFields && results.autoDetectedFields.length > 0 && (
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

              {/* ✅ NEW: Advanced Controls Bar with View Toggle */}
              <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '25px',
                marginBottom: '30px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '20px',
                  alignItems: 'center'
                }}>
                  {/* View Mode Toggle */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      👁️ View Mode
                    </label>
                    <div style={{
                      display: 'flex',
                      background: '#f3f4f6',
                      borderRadius: '10px',
                      padding: '4px'
                    }}>
                      <button
                        onClick={() => setViewMode('unified')}
                        style={{
                          background: viewMode === 'unified' ? '#2563eb' : 'transparent',
                          color: viewMode === 'unified' ? 'white' : '#6b7280',
                          border: 'none',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontSize: '0.9rem'
                        }}
                      >
                        📋 Unified
                      </button>
                      <button
                        onClick={() => setViewMode('side-by-side')}
                        style={{
                          background: viewMode === 'side-by-side' ? '#2563eb' : 'transparent',
                          color: viewMode === 'side-by-side' ? 'white' : '#6b7280',
                          border: 'none',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontSize: '0.9rem'
                        }}
                      >
                        ⚖️ Side-by-Side
                      </button>
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      📋 Filter Results
                    </label>
                    <select
                      value={resultsFilter}
                      onChange={(e) => setResultsFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        fontWeight: '500',
                        background: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="all">Show All Records</option>
                      <option value="differences">Differences Only</option>
                      <option value="matches">Matches Only</option>
                    </select>
                  </div>

                  {/* Search */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      🔍 Search Records
                    </label>
                    <input
                      type="text"
                      placeholder="Search employee names, amounts, IDs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Advanced Options */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      ⚙️ Advanced Options
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem',
                        color: '#4b5563'
                      }}>
                        <input
                          type="checkbox"
                          checked={ignoreWhitespace}
                          onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                          style={{ accentColor: '#2563eb' }}
                        />
                        Ignore Whitespace
                      </label>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem',
                        color: '#4b5563'
                      }}>
                        <input
                          type="checkbox"
                          checked={showCharacterDiff}
                          onChange={(e) => setShowCharacterDiff(e.target.checked)}
                          style={{ accentColor: '#2563eb' }}
                        />
                        Character-Level Diff
                      </label>
                    </div>
                  </div>
                </div>

                {/* Results Counter */}
                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '1px solid #0ea5e9'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0369a1' }}>
                    {getFilteredResults().length}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#0284c7', fontWeight: '500' }}>
                    Records Shown ({viewMode === 'side-by-side' ? 'Side-by-Side' : 'Unified'} View)
                  </div>
                </div>
              </div>

              {/* ✅ ENHANCED RESULTS DISPLAY WITH SIDE-BY-SIDE */}
              {getFilteredResults().length > 0 ? (
                viewMode === 'side-by-side' ? renderSideBySideView() : (
                  // Unified View (existing enhanced table)
                  <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                  }}>
                    {/* Table Header */}
                    <div style={{
                      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                      padding: '20px',
                      borderBottom: '2px solid #e5e7eb'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: `100px repeat(${Object.keys(results.results[0].fields).length}, 1fr) 60px`,
                        gap: '15px',
                        alignItems: 'center',
                        fontWeight: '700',
                        color: '#1f2937',
                        fontSize: '1rem'
                      }}>
                        <div>Record ID</div>
                        {Object.keys(results.results[0].fields).map((field, idx) => (
                          <div 
                            key={idx}
                            style={{
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                            onClick={() => {
                              if (sortField === field) {
                                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                              } else {
                                setSortField(field);
                                setSortDirection('asc');
                              }
                            }}
                          >
                            {field}
                            {sortField === field && (
                              <span style={{ fontSize: '0.8rem' }}>
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        ))}
                        <div>Details</div>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      {getFilteredResults().map((row, rowIndex) => {
                        const hasAnyDifference = Object.values(row.fields).some(field => field.status === 'difference');
                        const isExpanded = expandedRows.has(rowIndex);
                        
                        return (
                          <div key={rowIndex}>
                            {/* Main Row - ENHANCED */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: `100px repeat(${Object.keys(row.fields).length}, 1fr) 60px`,
                              gap: '15px',
                              alignItems: 'center',
                              padding: '20px',
                              background: hasAnyDifference 
                                ? 'linear-gradient(135deg, #fef2f2, #fef7f7)' 
                                : (rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb'),
                              borderBottom: '1px solid #f3f4f6',
                              borderLeft: hasAnyDifference ? '4px solid #ef4444' : '4px solid transparent',
                              transition: 'all 0.2s ease',
                              boxShadow: hasAnyDifference ? '0 2px 8px rgba(239, 68, 68, 0.08)' : 'none'
                            }}>
                              {/* Record ID */}
                              <div style={{
                                fontWeight: '600',
                                color: '#1f2937',
                                fontSize: '1rem'
                              }}>
                                {row.ID}
                              </div>

                              {/* Enhanced Field Values */}
                              {Object.entries(row.fields).map(([key, value], idx) => {
                                const colors = getStatusColor(value.status);
                                const isMatch = value.val1 === value.val2;
                                const isDifference = value.status === 'difference';
                                
                                return (
                                  <div key={idx} style={{
                                    background: colors.bg,
                                    border: `2px solid ${colors.border}`,
                                    borderRadius: '12px',
                                    padding: '15px',
                                    fontSize: '0.95rem',
                                    position: 'relative',
                                    minHeight: '80px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    boxShadow: isDifference ? '0 4px 12px rgba(239, 68, 68, 0.15)' : '0 2px 4px rgba(0,0,0,0.05)',
                                    transition: 'all 0.2s ease'
                                  }}>
                                    {/* Enhanced Status Icon */}
                                    <div style={{
                                      position: 'absolute',
                                      top: '8px',
                                      right: '8px',
                                      fontSize: '1.2rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      background: 'rgba(255, 255, 255, 0.9)',
                                      borderRadius: '8px',
                                      padding: '4px 6px',
                                      backdropFilter: 'blur(4px)'
                                    }}>
                                      {getStatusIcon(value.status)}
                                      {FEATURES.AUTO_DETECTION && value.isAutoDetectedAmount && (
                                        <span style={{ fontSize: '1rem' }}>🤖</span>
                                      )}
                                    </div>

                                    {/* Enhanced Values Display */}
                                    {isMatch ? (
                                      <div style={{ textAlign: 'center' }}>
                                        <div style={{
                                          fontWeight: '700',
                                          color: colors.text,
                                          marginBottom: '8px',
                                          fontSize: '1.1rem'
                                        }}>
                                          {value.val1}
                                        </div>
                                        <div style={{
                                          fontSize: '0.8rem',
                                          color: '#16a34a',
                                          fontWeight: '600',
                                          background: 'rgba(34, 197, 94, 0.1)',
                                          padding: '4px 8px',
                                          borderRadius: '6px',
                                          display: 'inline-block'
                                        }}>
                                          Perfect Match ✓
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <div style={{
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '8px'
                                        }}>
                                          <div style={{
                                            background: isDifference 
                                              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.25))'
                                              : 'rgba(59, 130, 246, 0.1)',
                                            padding: '8px 10px',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            border: isDifference ? '1px solid rgba(59, 130, 246, 0.3)' : 'none'
                                          }}>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '2px' }}>
                                              File 1
                                            </div>
                                            <div style={{ color: '#1e40af' }}>
                                              {showCharacterDiff && isDifference ? 
                                                renderCharacterDiff(getCharacterDiff(String(value.val1), String(value.val2), ignoreWhitespace)) : 
                                                value.val1
                                              }
                                            </div>
                                          </div>
                                          <div style={{
                                            background: isDifference 
                                              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.25))'
                                              : 'rgba(16, 185, 129, 0.1)',
                                            padding: '8px 10px',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            border: isDifference ? '1px solid rgba(16, 185, 129, 0.3)' : 'none'
                                          }}>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '2px' }}>
                                              File 2
                                            </div>
                                            <div style={{ color: '#059669' }}>
                                              {value.val2}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Enhanced Difference Display */}
                                        {value.difference && (
                                          <div style={{
                                            fontSize: '0.85rem',
                                            color: colors.text,
                                            fontWeight: '700',
                                            marginTop: '10px',
                                            textAlign: 'center',
                                            background: isDifference 
                                              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.2))'
                                              : 'rgba(245, 158, 11, 0.1)',
                                            padding: '6px 10px',
                                            borderRadius: '8px',
                                            border: `1px solid ${colors.border}`,
                                            fontSize: '0.9rem'
                                          }}>
                                            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Difference: </span>
                                            <span style={{ fontSize: '1rem' }}>Δ {value.difference}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {/* Enhanced Expand Button */}
                              <div style={{ textAlign: 'center' }}>
                                <button
                                  onClick={() => toggleRowExpansion(rowIndex)}
                                  style={{
                                    background: isExpanded 
                                      ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                                      : 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '10px 12px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '700',
                                    color: isExpanded ? 'white' : '#6b7280',
                                    transition: 'all 0.3s ease',
                                    minWidth: '45px',
                                    boxShadow: isExpanded 
                                      ? '0 4px 12px rgba(245, 158, 11, 0.25)' 
                                      : '0 2px 4px rgba(0,0,0,0.1)',
                                    transform: isExpanded ? 'scale(1.05)' : 'scale(1)'
                                  }}
                                  onMouseOver={(e) => {
                                    e.target.style.transform = isExpanded ? 'scale(1.08)' : 'scale(1.03)';
                                    e.target.style.boxShadow = isExpanded 
                                      ? '0 6px 16px rgba(245, 158, 11, 0.35)' 
                                      : '0 4px 8px rgba(0,0,0,0.15)';
                                  }}
                                  onMouseOut={(e) => {
                                    e.target.style.transform = isExpanded ? 'scale(1.05)' : 'scale(1)';
                                    e.target.style.boxShadow = isExpanded 
                                      ? '0 4px 12px rgba(245, 158, 11, 0.25)' 
                                      : '0 2px 4px rgba(0,0,0,0.1)';
                                  }}
                                >
                                  {isExpanded ? '▲' : '▼'}
                                </button>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                              <div style={{
                                background: '#f8fafc',
                                padding: '20px',
                                borderBottom: '1px solid #e5e7eb'
                              }}>
                                <h4 style={{
                                  margin: '0 0 15px 0',
                                  color: '#374151',
                                  fontSize: '1.1rem',
                                  fontWeight: '600'
                                }}>
                                  🔍 Detailed Analysis for Record {row.ID}
                                </h4>
                                
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                  gap: '15px'
                                }}>
                                  {Object.entries(row.fields).map(([fieldName, fieldData], idx) => (
                                    <div key={idx} style={{
                                      background: 'white',
                                      border: '1px solid #e5e7eb',
                                      borderRadius: '8px',
                                      padding: '15px'
                                    }}>
                                      <div style={{
                                        fontWeight: '600',
                                        color: '#1f2937',
                                        marginBottom: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                      }}>
                                        {getStatusIcon(fieldData.status)} {fieldName}
                                      </div>
                                      
                                      <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '10px',
                                        fontSize: '0.9rem'
                                      }}>
                                        <div>
                                          <div style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '4px' }}>
                                            File 1 Value:
                                          </div>
                                          <div style={{
                                            background: '#f0f9ff',
                                            padding: '8px',
                                            borderRadius: '6px',
                                            fontWeight: '500'
                                          }}>
                                            {fieldData.val1}
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <div style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '4px' }}>
                                            File 2 Value:
                                          </div>
                                          <div style={{
                                            background: '#f0fdf4',
                                            padding: '8px',
                                            borderRadius: '6px',
                                            fontWeight: '500'
                                          }}>
                                            {fieldData.val2}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div style={{
                                        marginTop: '10px',
                                        padding: '8px',
                                        background: getStatusColor(fieldData.status).bg,
                                        borderRadius: '6px',
                                        fontSize: '0.85rem',
                                        fontWeight: '500',
                                        color: getStatusColor(fieldData.status).text
                                      }}>
                                        Status: {fieldData.status.charAt(0).toUpperCase() + fieldData.status.slice(1)}
                                        {fieldData.difference && ` (${fieldData.difference})`}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              ) : (
                <div style={{
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '60px',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '10px' }}>
                    No Records Match Your Filter
                  </h3>
                  <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
                    Try adjusting your search terms or filter settings
                  </p>
                  <button
                    onClick={() => {
                      setResultsFilter('all');
                      setSearchTerm('');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* ✅ NEW: Enhanced Download Section with HTML Export */}
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                borderRadius: '20px',
                padding: '30px',
                marginTop: '40px',
                textAlign: 'center',
                border: '1px solid #cbd5e1'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '15px'
                }}>
                  📥 Export Your Results
                </h3>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '25px',
                  fontSize: '1rem'
                }}>
                  Download detailed comparison results with all analysis data and advanced formatting
                </p>
                
                <div style={{
                  display: 'flex',
                  gap: '15px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={handleDownloadExcel}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      padding: '16px 32px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      transition: 'all 0.3s ease',
                      minWidth: '180px',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'none';
                      e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    📊 Excel Report
                  </button>
                  
                  <button
                    onClick={handleDownloadCSV}
                    style={{
                      background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                      color: 'white',
                      border: 'none',
                      padding: '16px 32px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      transition: 'all 0.3s ease',
                      minWidth: '180px',
                      boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(14, 165, 233, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'none';
                      e.target.style.boxShadow = '0 4px 15px rgba(14, 165, 233, 0.3)';
                    }}
                  >
                    📄 CSV Data
                  </button>

                  {/* ✅ NEW: HTML Diff Export */}
                  <button
                    onClick={handleDownloadHTMLDiff}
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                      color: 'white',
                      border: 'none',
                      padding: '16px 32px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      transition: 'all 0.3s ease',
                      minWidth: '180px',
                      boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(124, 58, 237, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'none';
                      e.target.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.3)';
                    }}
                  >
                    🌐 HTML Diff Report
                  </button>
                </div>
                
                <div style={{
                  marginTop: '20px',
                  fontSize: '0.9rem',
                  color: '#6b7280'
                }}>
                  <strong>Enhanced Features:</strong> Summary statistics • Side-by-side comparison • Color-coded differences • Character-level highlighting • {ignoreWhitespace ? 'Whitespace ignored' : 'Whitespace considered'}
                </div>
              </div>
            </div>
          )}

          {/* NEW: Excel-Specific FAQ Section */}
          <div style={sectionStyle} className="section-padding">
            <h2 style={sectionTitleStyle} className="section-title">
              Excel Comparison Questions & Answers
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              textAlign: 'center',
              margin: '0 0 35px 0'
            }}>
              Common questions about Excel and CSV file comparison
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '25px',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              <div style={{
                background: '#f8fafc',
                padding: '25px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  📊 Can VeriDiff handle Excel files with formulas and formatting?
                </h3>
                <p style={{ color: '#4b5563', lineHeight: '1.6', margin: 0, fontSize: '0.95rem' }}>
                  Yes, VeriDiff processes Excel files with complex formulas, formatting, and multiple worksheets. It extracts the calculated values for comparison while preserving the data structure. Perfect for comparing budget spreadsheets with embedded calculations.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '25px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  🎯 How accurate is the smart header mapping?
                </h3>
                <p style={{ color: '#4b5563', lineHeight: '1.6', margin: 0, fontSize: '0.95rem' }}>
                  VeriDiff's smart mapping achieves 95%+ accuracy by analyzing column names, data patterns, and context. It successfully maps "Customer_Name" to "Client Name", "Total_Amount" to "Sum", and handles common variations in business spreadsheets.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '25px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  ⚖️ What tolerance settings work best for financial data?
                </h3>
                <p style={{ color: '#4b5563', lineHeight: '1.6', margin: 0, fontSize: '0.95rem' }}>
                  For currency amounts, use ±£0.01 flat tolerance to handle rounding differences. For budget variance analysis, 3-5% percentage tolerance is typical. For transaction reconciliation, ±£0.05 works well for most business scenarios.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '25px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  💾 How are comparison results exported and saved?
                </h3>
                <p style={{ color: '#4b5563', lineHeight: '1.6', margin: 0, fontSize: '0.95rem' }}>
                  Results export to Excel (.xlsx) with summary statistics and detailed comparison data, or CSV format for further analysis. Files include match/difference status, tolerance information, and auto-detected amount fields for audit trails.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '25px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  🔒 Is my Excel data secure during comparison?
                </h3>
                <p style={{ color: '#4b5563', lineHeight: '1.6', margin: 0, fontSize: '0.95rem' }}>
                  Completely secure. All Excel file processing happens locally in your browser - no uploads to our servers. Your sensitive financial data, customer information, and business intelligence never leaves your device.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '25px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  🚀 Why choose VeriDiff over Excel's built-in compare?
                </h3>
                <p style={{ color: '#4b5563', lineHeight: '1.6', margin: 0, fontSize: '0.95rem' }}>
                  Excel's compare is basic and requires identical structures. VeriDiff offers intelligent mapping, tolerance settings, cross-format capability (Excel vs CSV), auto-detection of amount fields, and professional reporting that Excel simply cannot provide.
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced CTA Section */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
            borderRadius: '24px',
            padding: '40px',
            textAlign: 'center',
            border: '1px solid #cbd5e1',
            marginBottom: '30px'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              margin: '0 0 15px 0',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Ready to Transform Your Spreadsheet Workflow?
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              margin: '0 0 25px 0',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Join thousands of finance professionals who've replaced manual Excel comparison with VeriDiff's intelligent automation. 
              Start with free Excel comparison, upgrade to cross-format analysis when needed.
            </p>
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '20px'
            }}>
              <Link href="/compare" style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '1.1rem',
                transition: 'all 0.2s',
                minWidth: '200px',
                display: 'inline-block'
              }}>
                🚀 Try All Comparison Tools
              </Link>
              <Link href="/" style={{
                background: 'white',
                color: '#374151',
                padding: '15px 30px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '1.1rem',
                border: '2px solid #e5e7eb',
                transition: 'all 0.2s',
                minWidth: '180px',
                display: 'inline-block'
              }}>
                View Pricing
              </Link>
            </div>
            
            <div style={{
              fontSize: '0.9rem',
              color: '#9ca3af'
            }}>
              ✓ No credit card required for Excel comparison • ✓ 30-day money-back guarantee on premium
              <div style={{ marginTop: '8px' }}>
                <Link href="/security" style={{ color: '#2563eb', textDecoration: 'none', marginRight: '15px' }}>
                  Security Details
                </Link>
                <Link href="/support" style={{ color: '#2563eb', textDecoration: 'none' }}>
                  Get Support
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* ✅ NEW: Premium Upgrade Modal */}
        <PremiumUpgradeModal />

        <Footer />

        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </AuthGuard>
  );
}

export default ComparePage;
