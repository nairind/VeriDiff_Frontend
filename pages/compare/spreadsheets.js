import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import AuthGuard from '../../components/auth/AuthGuard';

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
  FLEXIBLE_CROSS_FORMAT: true   // NEW: Use flexible cross-format comparison
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ✅ Processing protection state
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ NEW: Premium modal state (replaces showPremiumUpgrade)
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [userTier, setUserTier] = useState('free');

  // ✅ NEW: Header state management
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

  // ✅ NEW: Navigation handlers from index page
  const handleSignIn = () => {
    window.location.href = '/api/auth/signin';
  };

  const handleSignOut = () => {
    signOut();
    setUserMenuOpen(false);
  };

  const handleDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleAccountSettings = () => {
    window.location.href = '/account';
  };

  const scrollToSection = (sectionId) => {
    // For compare page, redirect to homepage with section
    window.location.href = `/#${sectionId}`;
    setMobileMenuOpen(false);
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

  // ✅ NEW: Header styles from index.js
  const headerStyle = {
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const headerContainerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  };

  const headerContentStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px'
  };

  const logoStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    cursor: 'pointer',
    textDecoration: 'none'
  };

  const desktopNavStyle = {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center'
  };

  const navButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#374151',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    transition: 'color 0.2s'
  };

  const navLinkStyle = {
    textDecoration: 'none',
    color: '#374151',
    fontWeight: '500',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    transition: 'color 0.2s',
    display: 'block'
  };

  const mobileNavButtonStyle = {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    color: '#374151'
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
      .desktop-nav { display: none !important; }
      .mobile-nav-button { display: block !important; }
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
      .footer-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
    
    @media (max-width: 480px) {
      .main-container { padding: 15px !important; }
      .hero-section { padding: 30px 20px !important; }
      .load-button { 
        min-width: 280px !important; 
        font-size: 1.1rem !important;
        padding: 14px 30px !important;
      }
      .footer-grid { grid-template-columns: 1fr !important; }
    }
  `;

  return (
    <AuthGuard>
      <div style={containerStyle}>
        <Head>
          <title>VeriDiff - Spreadsheet Comparison Tool</title>
          <style>{mediaQueries}</style>
        </Head>

        {/* ✅ NEW: Professional Header from index.js */}
        <header style={headerStyle}>
          <div style={headerContainerStyle}>
            <div style={headerContentStyle}>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <span style={logoStyle}>VeriDiff</span>
              </Link>
              
              <nav style={desktopNavStyle} className="desktop-nav">
                <button onClick={() => scrollToSection('features')} style={navButtonStyle}>
                  Features
                </button>
                <button onClick={() => scrollToSection('pricing')} style={navButtonStyle}>
                  Pricing
                </button>
                <a href="/faq" style={navLinkStyle}>
                  FAQ
                </a>
                
                <Link href="/compare" style={{ ...navLinkStyle, textDecoration: 'none' }}>
                  ← Back to Comparison Engine
                </Link>
                
                {session ? (
                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderRadius: '0.25rem',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#2563eb',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {userMenuOpen && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        minWidth: '200px',
                        marginTop: '0.5rem',
                        zIndex: 1000
                      }}>
                        <div style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                          <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{session.user?.name}</div>
                          <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{session.user?.email}</div>
                        </div>
                        <div style={{ padding: '0.5rem' }}>
                          <button onClick={handleDashboard} style={{ 
                            width: '100%',
                            textAlign: 'left',
                            display: 'block',
                            padding: '0.5rem',
                            color: '#374151',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '0.25rem',
                            transition: 'background 0.2s'
                          }}>
                            Dashboard
                          </button>
                          <button onClick={handleAccountSettings} style={{ 
                            width: '100%',
                            textAlign: 'left',
                            display: 'block',
                            padding: '0.5rem',
                            color: '#374151',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '0.25rem',
                            transition: 'background 0.2s'
                          }}>
                            Account Settings
                          </button>
                          <button onClick={handleSignOut} style={{ 
                            width: '100%',
                            textAlign: 'left',
                            padding: '0.5rem',
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            borderRadius: '0.25rem',
                            transition: 'background 0.2s'
                          }}>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <button onClick={handleSignIn} style={{ ...navButtonStyle, background: 'transparent' }}>
                      Sign In
                    </button>
                    <Link href="/" style={{ 
                      padding: '0.5rem 1rem', 
                      border: 'none', 
                      borderRadius: '0.5rem', 
                      fontWeight: '500', 
                      cursor: 'pointer', 
                      background: '#2563eb', 
                      color: 'white',
                      transition: 'all 0.2s',
                      textDecoration: 'none'
                    }}>
                      Try Free Demo
                    </Link>
                  </>
                )}
              </nav>

              <button 
                style={mobileNavButtonStyle}
                className="mobile-nav-button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
              <div style={{
                borderTop: '1px solid #e5e7eb',
                padding: '1rem 0',
                background: 'white'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button onClick={() => scrollToSection('features')} style={{ ...navButtonStyle, textAlign: 'left' }}>
                    Features
                  </button>
                  <button onClick={() => scrollToSection('pricing')} style={{ ...navButtonStyle, textAlign: 'left' }}>
                    Pricing
                  </button>
                  <a href="/faq" style={{ ...navLinkStyle, textAlign: 'left' }}>
                    FAQ
                  </a>
                  {session ? (
                    <>
                      <button onClick={handleDashboard} style={{ ...navButtonStyle, textAlign: 'left' }}>
                        Dashboard
                      </button>
                      <button onClick={handleSignOut} style={{ ...navButtonStyle, textAlign: 'left', color: '#dc2626' }}>
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleSignIn} style={{ ...navButtonStyle, textAlign: 'left' }}>
                        Sign In
                      </button>
                      <Link href="/" style={{ 
                        padding: '0.75rem 1rem', 
                        border: 'none', 
                        borderRadius: '0.5rem', 
                        fontWeight: '500', 
                        cursor: 'pointer', 
                        background: '#2563eb', 
                        color: 'white',
                        width: '100%',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'block'
                      }}>
                        Try Free Demo
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Security Trust Banner */}
        <div style={{
          background: '#dcfce7',
          borderBottom: '1px solid #bbf7d0',
          padding: '0.75rem 0',
          textAlign: 'center'
        }}>
          <div style={headerContainerStyle}>
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

          {/* Hero Section */}
          <div style={heroStyle} className="hero-section">
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '700',
              margin: '0 0 15px 0',
              lineHeight: '1.2'
            }} className="hero-title">
              VeriDiff
            </h1>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '400',
              margin: '0 0 20px 0',
              opacity: '0.9'
            }}>
              Smart Spreadsheet Comparison
            </h2>
            <p style={{
              fontSize: '1.1rem',
              opacity: '0.9',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Compare Excel and CSV files with precision and confidence. Excel comparisons are free forever for all users. 
              Premium features unlock advanced formats with professional-grade accuracy.
            </p>
          </div>

          {/* File Type Selection */}
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
            
            {/* ✅ FIXED: Updated comparison type selection with green highlighting */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              {[
                { value: 'excel', label: 'Excel–Excel', description: 'FREE for signed-in users ✨', free: true },
                { value: 'excel_csv', label: 'Excel–CSV', description: 'Premium format comparison', free: false },
                { value: 'csv', label: 'CSV–CSV', description: 'Advanced CSV analysis', free: false }
              ].map((option) => {
                const isSelected = fileType === option.value;
                
                return (
                  <label
                    key={option.value}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '20px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      minWidth: '250px',
                      textAlign: 'center',
                      // ✅ FIXED: Green border for selected items, gray for unselected
                      background: isSelected 
                        ? (option.free ? '#f0fdf4' : '#eff6ff')
                        : 'white',
                      border: isSelected 
                        ? '3px solid #22c55e' 
                        : '2px solid #e5e7eb',
                      transition: 'all 0.2s',
                      boxShadow: isSelected 
                        ? '0 4px 12px rgba(34, 197, 94, 0.15)' 
                        : 'none'
                    }}
                  >
                    <input
                      type="radio"
                      name="comparisonType"
                      value={option.value}
                      checked={isSelected}
                      onChange={handleFileTypeChange}
                      style={{ accentColor: '#22c55e', transform: 'scale(1.2)' }}
                    />
                    <div>
                      <div style={{
                        fontSize: '1.1rem',
                        fontWeight: isSelected ? '700' : '600',
                        color: isSelected ? '#1f2937' : '#6b7280',
                        marginBottom: '4px'
                      }}>
                        {option.label}
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: isSelected ? '#059669' : '#9ca3af',
                        fontWeight: '500'
                      }}>
                        {option.description}
                      </div>
                      {option.free && (
                        <span style={{
                          marginTop: '8px',
                          fontSize: '0.75em',
                          background: '#dcfce7',
                          color: '#166534',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: '600',
                          display: 'inline-block'
                        }}>
                          FREE
                        </span>
                      )}
                      {!option.free && isSelected && (
                        <span style={{
                          marginTop: '8px',
                          fontSize: '0.75em',
                          background: '#dbeafe',
                          color: '#1e40af',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: '600',
                          display: 'inline-block'
                        }}>
                          PREMIUM
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* File Upload Section - Show for all allowed formats */}
          {(fileType === 'excel' || userTier === 'premium') && (
            <div style={sectionStyle} className="section-padding">
              <h2 style={sectionTitleStyle} className="section-title">
                Upload Your Files
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
                {/* ✅ FIXED: File 1 Upload with key prop for clearing */}
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
                          : 'File 1'}
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
                    key={`file1-${fileType}`}
                    type="file"
                    onChange={(e) => handleFileChange(e, 1)}
                    accept={fileType === 'excel_csv' ? '.xlsx,.xls,.xlsm' : undefined}
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
                
                {/* ✅ FIXED: File 2 Upload with key prop for clearing */}
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
                          : 'File 2'}
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
                    key={`file2-${fileType}`}
                    type="file"
                    onChange={(e) => handleFileChange(e, 2)}
                    accept={fileType === 'excel_csv' ? '.csv' : undefined}
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
                      {loading ? 'Processing Files...' : 'Comparison Running...'}
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
              <strong>{loading ? 'Processing...' : 'Running Comparison...'}</strong> Please wait while we {loading ? 'load and analyze' : 'compare'} your files...
            </div>
          )}

          {/* Results */}
          {results && (
            <div style={sectionStyle}>
              <h2 style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '2rem',
                fontWeight: '700',
                margin: '0 0 25px 0',
                textAlign: 'center'
              }}>
                Comparison Results
              </h2>
              
              {fileType === 'excel' && (
                <div style={{
                  background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                  border: '2px solid #22c55e',
                  borderRadius: '12px',
                  padding: '15px',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  <strong style={{ color: '#166534' }}>🎉 Free Excel Comparison Complete!</strong>
                  <span style={{ color: '#16a34a', marginLeft: '8px' }}>
                    No usage limits for signed-in users. Enjoy unlimited Excel comparisons!
                  </span>
                </div>
              )}
              
              <div style={{
                margin: '25px 0',
                padding: '25px',
                background: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: '12px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '20px',
                  marginBottom: '25px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>
                      {results.total_records}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Records</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626' }}>
                      {results.differences_found}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Differences Found</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#16a34a' }}>
                      {results.matches_found}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Matches Found</div>
                  </div>
                </div>
                
                {FEATURES.AUTO_DETECTION && results.autoDetectedFields && results.autoDetectedFields.length > 0 && (
                  <div style={{
                    background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                    border: '1px solid #22c55e',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '20px',
                    textAlign: 'center'
                  }}>
                    <strong style={{ color: '#166534' }}>🤖 Auto-detected Amount Fields:</strong>
                    <span style={{ color: '#16a34a', marginLeft: '8px' }}>
                      {results.autoDetectedFields.join(', ')}
                    </span>
                  </div>
                )}
                
                <div style={{
                  display: 'flex',
                  gap: '15px',
                  justifyContent: 'center',
                }}>
                  <button
                    onClick={handleDownloadExcel}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'none';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    📊 Download Excel
                  </button>
                  <button
                    onClick={handleDownloadCSV}
                    style={{
                      background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 15px rgba(14, 165, 233, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'none';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    📄 Download CSV
                  </button>
                </div>
              </div>
              
              {results.results && results.results.length > 0 && (
                <div style={{
                  overflowX: 'auto',
                  marginTop: '30px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.9rem',
                    minWidth: '600px'
                  }}>
                    <thead>
                      <tr style={{
                        background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)'
                      }}>
                        <th style={{
                          border: '1px solid #e5e7eb',
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          color: '#1f2937'
                        }}>
                          ID
                        </th>
                        {Object.keys(results.results[0].fields).map((field, idx) => (
                          <th key={idx} style={{
                            border: '1px solid #e5e7eb',
                            padding: '16px 12px',
                            textAlign: 'left',
                            fontWeight: '600',
                            color: '#1f2937'
                          }}>
                            {field}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.results.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td style={{
                            border: '1px solid #e5e7eb',
                            padding: '12px',
                            verticalAlign: 'top',
                            background: 'white'
                          }}>
                            {row.ID}
                          </td>
                          {Object.entries(row.fields).map(([key, value], idx) => (
                            <td
                              key={idx}
                              style={{
                                border: '1px solid #e5e7eb',
                                padding: '12px',
                                verticalAlign: 'top',
                                background: value.status === 'difference' ? '#fef2f2' 
                                          : value.status === 'acceptable' ? '#fefce8' 
                                          : '#f0fdf4'
                              }}
                            >
                              <div>
                                <strong>{value.val1} / {value.val2}</strong>
                                {FEATURES.AUTO_DETECTION && value.isAutoDetectedAmount && (
                                  <span style={{
                                    marginLeft: '5px',
                                    fontSize: '0.8em'
                                  }}>
                                    🤖
                                  </span>
                                )}
                              </div>
                              <small style={{
                                color: '#6b7280',
                                display: 'block',
                                marginTop: '4px'
                              }}>
                                {value.status}
                                {value.difference && ` (Δ ${value.difference})`}
                              </small>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>

        {/* ✅ NEW: Premium Upgrade Modal */}
        <PremiumUpgradeModal />

        {/* ✅ NEW: Professional Footer from index.js */}
        <footer style={{ 
          background: '#111827', 
          color: 'white', 
          padding: '3rem 0' 
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '2rem', 
              marginBottom: '2rem' 
            }} className="footer-grid">
              <div>
                <span style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent', 
                  backgroundClip: 'text', 
                  marginBottom: '1rem', 
                  display: 'block' 
                }}>
                  VeriDiff
                </span>
                <p style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
                  Precision-engineered in London for global business professionals. Your data never leaves your browser.
                </p>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '500', marginBottom: '1rem' }}>Product</h4>
                <div>
                  <button onClick={() => scrollToSection('features')} style={{ 
                    color: '#d1d5db', 
                    fontSize: '0.875rem', 
                    cursor: 'pointer', 
                    background: 'none', 
                    border: 'none', 
                    padding: '0.25rem 0', 
                    textAlign: 'left', 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    width: '100%'
                  }}>
                    Features
                  </button>
                  <button onClick={() => scrollToSection('pricing')} style={{ 
                    color: '#d1d5db', 
                    fontSize: '0.875rem', 
                    cursor: 'pointer', 
                    background: 'none', 
                    border: 'none', 
                    padding: '0.25rem 0', 
                    textAlign: 'left', 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    width: '100%'
                  }}>
                    Pricing
                  </button>
                </div>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '500', marginBottom: '1rem' }}>Support</h4>
                <div>
                  <a href="mailto:sales@veridiff.com" style={{ 
                    color: '#d1d5db', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    padding: '0.25rem 0', 
                    marginBottom: '0.5rem' 
                  }}>
                    Contact Us
                  </a>
                </div>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '500', marginBottom: '1rem' }}>Legal</h4>
                <div>
                  <a href="/privacy" style={{ 
                    color: '#d1d5db', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    padding: '0.25rem 0', 
                    marginBottom: '0.5rem' 
                  }}>
                    Privacy Policy
                  </a>
                  <a href="/terms" style={{ 
                    color: '#d1d5db', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    padding: '0.25rem 0', 
                    marginBottom: '0.5rem' 
                  }}>
                    Terms of Service
                  </a>
                  <a href="/cookies" style={{ 
                    color: '#d1d5db', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    padding: '0.25rem 0', 
                    marginBottom: '0.5rem' 
                  }}>
                    Cookie Policy
                  </a>
                  <a href="/gdpr" style={{ 
                    color: '#d1d5db', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    padding: '0.25rem 0', 
                    marginBottom: '0.5rem' 
                  }}>
                    GDPR Rights
                  </a>
                </div>
              </div>
            </div>
            
            <div style={{ 
              borderTop: '1px solid #374151', 
              paddingTop: '2rem', 
              textAlign: 'center', 
              color: '#9ca3af', 
              fontSize: '0.875rem' 
            }}>
              <p>&copy; 2025 VeriDiff. All rights reserved. Precision-engineered in London for global professionals.</p>
            </div>
          </div>
        </footer>

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
