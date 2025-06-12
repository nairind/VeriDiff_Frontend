import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeaderMapper from '../components/HeaderMapper';
import SheetSelector from '../components/SheetSelector';
import { detectFileType } from '../utils/fileDetection';

// Import your existing utility functions
import { parseCSVFile, compareFiles } from '../utils/simpleCSVComparison';
import { parseExcelFile, compareExcelFiles, getExcelFileInfo } from '../utils/excelFileComparison';
import { compareExcelCSVFiles } from '../utils/excelCSVComparison';
import { mapHeaders } from '../utils/mapHeaders';

export default function Comparison() {
  const router = useRouter();
  
  // Core file states
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [fileType, setFileType] = useState(null);

  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState(null);

  // Header mapping states
  const [showMapper, setShowMapper] = useState(false);
  const [headers1, setHeaders1] = useState([]);
  const [headers2, setHeaders2] = useState([]);
  const [suggestedMappings, setSuggestedMappings] = useState([]);
  const [finalMappings, setFinalMappings] = useState([]);
  const [sampleData1, setSampleData1] = useState(null);
  const [sampleData2, setSampleData2] = useState(null);

  // Sheet selection states (for Excel files)
  const [showSheetSelector, setShowSheetSelector] = useState(false);
  const [file1Info, setFile1Info] = useState(null);
  const [file2Info, setFile2Info] = useState(null);
  const [selectedSheet1, setSelectedSheet1] = useState(null);
  const [selectedSheet2, setSelectedSheet2] = useState(null);

  useEffect(() => {
    // Restore files from sessionStorage
    const restoreFiles = async () => {
      try {
        const file1Info = JSON.parse(sessionStorage.getItem('veridiff_file1_info'));
        const file2Info = JSON.parse(sessionStorage.getItem('veridiff_file2_info'));
        const file1Data = sessionStorage.getItem('veridiff_file1_data');
        const file2Data = sessionStorage.getItem('veridiff_file2_data');

        if (!file1Info || !file2Info || !file1Data || !file2Data) {
          console.error('Missing file data in sessionStorage');
          router.push('/');
          return;
        }

        // Convert base64 back to File objects
        const base64ToBlob = (base64, mimeType) => {
          const byteCharacters = atob(base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          return new Blob([byteArray], { type: mimeType });
        };

        const blob1 = base64ToBlob(file1Data, file1Info.type);
        const blob2 = base64ToBlob(file2Data, file2Info.type);
        
        const f1 = new File([blob1], file1Info.name, {
          type: file1Info.type,
          lastModified: file1Info.lastModified
        });
        const f2 = new File([blob2], file2Info.name, {
          type: file2Info.type,
          lastModified: file2Info.lastModified
        });

        console.log('Files restored successfully:', f1.name, f2.name);
        
        setFile1(f1);
        setFile2(f2);

        // Start comparison process
        await handleCompare(f1, f2);
      } catch (error) {
        console.error('Error restoring files:', error);
        setError('Error loading files. Please try uploading again.');
        setTimeout(() => router.push('/'), 3000);
      }
    };

    restoreFiles();
  }, [router]);

  const handleCompare = async (f1 = file1, f2 = file2) => {
    if (!f1 || !f2) {
      setError('Please select both files to compare');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingStep('Analyzing files...');

    try {
      // Detect file type
      const detectedType = detectFileType(f1, f2);
      
      if (detectedType === 'unknown') {
        throw new Error('Unsupported file combination. Please use Excel (.xlsx, .xls) or CSV (.csv) files.');
      }

      // Handle file swapping for CSV-Excel
      let processFile1 = f1;
      let processFile2 = f2;
      let processType = detectedType;
      
      if (detectedType === 'csv_excel_swapped') {
        processFile1 = f2;
        processFile2 = f1;
        processType = 'excel_csv';
      }

      setFileType(processType);
      
      // Simple analytics
      console.log('Comparison started:', {
        file_type: processType,
        file1_name: processFile1.name,
        file2_name: processFile2.name
      });

      setProcessingStep('Processing files...');

      // Process files based on type
      if (processType === 'excel') {
        await handleExcelComparison(processFile1, processFile2);
      } else if (processType === 'csv') {
        await handleCSVComparison(processFile1, processFile2);
      } else if (processType === 'excel_csv') {
        await handleExcelCSVComparison(processFile1, processFile2);
      }

    } catch (err) {
      console.error('Comparison error:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Excel file comparison
  const handleExcelComparison = async (file1, file2) => {
    setProcessingStep('Analyzing Excel files...');
    
    try {
      // Get file info for both Excel files
      const [info1, info2] = await Promise.all([
        getExcelFileInfo(file1),
        getExcelFileInfo(file2)
      ]);
      
      setFile1Info(info1);
      setFile2Info(info2);
      
      // Check if either file has multiple sheets
      const needsSheetSelection = info1.sheets.length > 1 || info2.sheets.length > 1;
      
      if (needsSheetSelection) {
        setShowSheetSelector(true);
        setIsProcessing(false);
        return;
      }
      
      // Process with default sheets
      await processExcelFiles(file1, file2, info1.defaultSheet, info2.defaultSheet);
    } catch (error) {
      throw new Error(`Excel analysis failed: ${error.message}`);
    }
  };

  // Process Excel files after sheet selection
  const processExcelFiles = async (file1, file2, sheet1, sheet2) => {
    setProcessingStep('Parsing Excel data...');
    
    try {
      const [result1, result2] = await Promise.all([
        parseExcelFile(file1, sheet1),
        parseExcelFile(file2, sheet2)
      ]);
      
      // Extract data from your file structure
      const data1 = result1.data || result1;
      const data2 = result2.data || result2;
      
      if (!Array.isArray(data1) || !Array.isArray(data2)) {
        throw new Error('Failed to parse Excel data - invalid format');
      }
      
      if (data1.length === 0 || data2.length === 0) {
        throw new Error('One or both Excel files contain no data');
      }
      
      setupHeaderMapping(data1, data2, 'excel');
    } catch (error) {
      throw new Error(`Excel parsing failed: ${error.message}`);
    }
  };

  // CSV file comparison
  const handleCSVComparison = async (file1, file2) => {
    setProcessingStep('Parsing CSV files...');
    
    try {
      const [data1, data2] = await Promise.all([
        parseCSVFile(file1),
        parseCSVFile(file2)
      ]);
      
      if (!Array.isArray(data1) || !Array.isArray(data2)) {
        throw new Error('Failed to parse CSV data - invalid format');
      }
      
      if (data1.length === 0 || data2.length === 0) {
        throw new Error('One or both CSV files contain no data');
      }
      
      setupHeaderMapping(data1, data2, 'csv');
    } catch (error) {
      throw new Error(`CSV parsing failed: ${error.message}`);
    }
  };

  // Excel-CSV comparison
  const handleExcelCSVComparison = async (excelFile, csvFile) => {
    setProcessingStep('Analyzing Excel file...');
    
    try {
      // Get Excel file info
      const excelInfo = await getExcelFileInfo(excelFile);
      setFile1Info(excelInfo);
      
      // Check if Excel has multiple sheets
      if (excelInfo.sheets.length > 1) {
        setFile2Info({ fileName: csvFile.name, sheets: [{ name: 'CSV Data', hasData: true }] });
        setShowSheetSelector(true);
        setIsProcessing(false);
        return;
      }
      
      // Process with default sheet
      await processExcelCSVFiles(excelFile, csvFile, excelInfo.defaultSheet);
    } catch (error) {
      throw new Error(`Excel-CSV analysis failed: ${error.message}`);
    }
  };

  // Process Excel-CSV after sheet selection
  const processExcelCSVFiles = async (excelFile, csvFile, excelSheet) => {
    setProcessingStep('Parsing files...');
    
    try {
      const [excelResult, csvData] = await Promise.all([
        parseExcelFile(excelFile, excelSheet),
        parseCSVFile(csvFile)
      ]);
      
      // Extract data from your file structure
      const excelData = excelResult.data || excelResult;
      
      if (!Array.isArray(excelData) || !Array.isArray(csvData)) {
        throw new Error('Failed to parse file data - invalid format');
      }
      
      if (excelData.length === 0 || csvData.length === 0) {
        throw new Error('One or both files contain no data');
      }
      
      setupHeaderMapping(excelData, csvData, 'excel_csv');
    } catch (error) {
      throw new Error(`Excel-CSV parsing failed: ${error.message}`);
    }
  };

  // Setup header mapping
  const setupHeaderMapping = (data1, data2, type) => {
    setProcessingStep('Setting up header mapping...');
    
    try {
      if (!data1 || !data2 || data1.length === 0 || data2.length === 0) {
        throw new Error('No data found in files');
      }
      
      const h1 = Object.keys(data1[0] || {});
      const h2 = Object.keys(data2[0] || {});
      
      if (h1.length === 0 || h2.length === 0) {
        throw new Error('No headers found in files');
      }
      
      const suggested = mapHeaders(h1, h2);
      
      setHeaders1(h1);
      setHeaders2(h2);
      setSuggestedMappings(suggested);
      setSampleData1(data1.slice(0, 10));
      setSampleData2(data2.slice(0, 10));
      
      setShowMapper(true);
      console.log('Header mapping setup complete with', suggested.length, 'suggestions');
    } catch (error) {
      throw new Error(`Header mapping failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle mapping confirmation
  const handleMappingConfirmed = (mappings) => {
    setFinalMappings(mappings);
    console.log('Mappings confirmed:', mappings.length, 'mappings');
  };

  // Clean Excel/CSV Feedback Popup Function (matches PDF approach)
  const showExcelCsvFeedbackPopup = () => {
    // Get current count from localStorage
    const currentCount = localStorage.getItem('excel_csv_comparison_count') || '3';
    
    // Create popup container
    const popupContainer = document.createElement('div');
    popupContainer.id = 'excel-csv-feedback-popup';
    popupContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    // Create popup content
    popupContainer.innerHTML = `
      <div style="
        background: white;
        border-radius: 12px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow: auto;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
      ">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="font-size: 3rem; margin-bottom: 15px;">📊</div>
          <h2 style="
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
          ">
            Help us improve VeriDiff Excel/CSV Comparison!
          </h2>
          <p style="color: #6b7280; line-height: 1.6;">
            You've completed ${currentCount} Excel/CSV comparisons! Your feedback helps us make the tool better for everyone.
          </p>
        </div>

        <div style="margin-bottom: 25px;">
          <label style="
            display: block;
            font-size: 0.9rem;
            font-weight: 500;
            color: #374151;
            margin-bottom: 8px;
          ">
            How would you rate your Excel/CSV comparison experience?
          </label>
          <div style="
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-bottom: 20px;
          " id="excel-star-rating">
            <button onclick="selectExcelRating(1)" style="font-size: 1.5rem; background: none; border: none; cursor: pointer; padding: 5px;" data-rating="1">⭐</button>
            <button onclick="selectExcelRating(2)" style="font-size: 1.5rem; background: none; border: none; cursor: pointer; padding: 5px;" data-rating="2">⭐</button>
            <button onclick="selectExcelRating(3)" style="font-size: 1.5rem; background: none; border: none; cursor: pointer; padding: 5px;" data-rating="3">⭐</button>
            <button onclick="selectExcelRating(4)" style="font-size: 1.5rem; background: none; border: none; cursor: pointer; padding: 5px;" data-rating="4">⭐</button>
            <button onclick="selectExcelRating(5)" style="font-size: 1.5rem; background: none; border: none; cursor: pointer; padding: 5px;" data-rating="5">⭐</button>
          </div>

          <label style="
            display: block;
            font-size: 0.9rem;
            font-weight: 500;
            color: #374151;
            margin-bottom: 8px;
          ">
            Any suggestions for Excel/CSV comparison features? (Optional)
          </label>
          <textarea
            id="excel-csv-feedback-comments"
            placeholder="Tell us what you think about our Excel/CSV comparison tool..."
            style="
              width: 100%;
              min-height: 80px;
              padding: 12px;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              font-size: 0.9rem;
              resize: vertical;
              box-sizing: border-box;
            "
          ></textarea>
        </div>

        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button
            onclick="closeExcelCsvFeedback(false)"
            style="
              padding: 10px 20px;
              border: 2px solid #e5e7eb;
              background: white;
              color: #6b7280;
              border-radius: 8px;
              font-size: 0.9rem;
              font-weight: 500;
              cursor: pointer;
            "
          >
            Maybe Later
          </button>
          <button
            onclick="submitExcelCsvFeedback()"
            style="
              padding: 10px 20px;
              border: none;
              background: linear-gradient(135deg, #2563eb, #7c3aed);
              color: white;
              border-radius: 8px;
              font-size: 0.9rem;
              font-weight: 500;
              cursor: pointer;
            "
          >
            📊 Help Us Improve
          </button>
        </div>
      </div>
    `;

    // Add to page
    document.body.appendChild(popupContainer);

    // Global functions for popup interaction
    window.selectedExcelRating = 0;
    
    window.selectExcelRating = (rating) => {
      window.selectedExcelRating = rating;
      // Update star display
      const stars = document.querySelectorAll('#excel-star-rating button');
      stars.forEach((star, index) => {
        star.style.opacity = index < rating ? '1' : '0.3';
      });
    };

    window.closeExcelCsvFeedback = (submitted = false) => {
      console.log('📊 EXCEL/CSV FEEDBACK: Closing popup, submitted:', submitted);
      
      // LAUNCH STRATEGY: Only set flag if actually submitted, not if skipped
      if (submitted) {
        localStorage.setItem('excel_csv_feedback_submitted', 'true');
        console.log('📊 EXCEL/CSV FEEDBACK: Marked as submitted - won\'t ask again');
      } else {
        console.log('📊 EXCEL/CSV FEEDBACK: User skipped - will ask again next time');
      }
      
      // Remove popup
      const popup = document.getElementById('excel-csv-feedback-popup');
      if (popup) {
        popup.remove();
      }
    };

    window.submitExcelCsvFeedback = async () => {
      const rating = window.selectedExcelRating || 0;
      const comments = document.getElementById('excel-csv-feedback-comments')?.value || '';
      const excelCsvCount = parseInt(localStorage.getItem('excel_csv_comparison_count') || '3');
      
      console.log('📊 EXCEL/CSV FEEDBACK: Submitting feedback:', { rating, comments, excelCsvCount });
      
      try {
        // Prepare feedback text with rating and Excel/CSV context
        const feedbackText = rating > 0 
          ? `Excel/CSV Comparison Feedback (${rating}/5 stars): ${comments}`.trim()
          : `Excel/CSV Comparison Feedback: ${comments}`.trim();

        // Send to your existing feedback API with all required fields
        const response = await fetch('/api/feedback/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            feedback_text: feedbackText,
            comparisonCount: excelCsvCount,
            email: null, // No email collected in Excel/CSV feedback
            selected_reasons: [] // Empty array for Excel/CSV feedback
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('📊 EXCEL/CSV FEEDBACK: Successfully submitted to dashboard:', result);
          alert('Thank you for your feedback! This helps us improve VeriDiff for everyone. 🙏');
        } else {
          const errorData = await response.json();
          console.error('📊 EXCEL/CSV FEEDBACK: API error:', response.status, errorData);
          alert('Thank you for your feedback! (Note: There was an issue saving to our system, but we appreciate your input)');
        }
      } catch (error) {
        console.error('📊 EXCEL/CSV FEEDBACK: Submit error:', error);
        alert('Thank you for your feedback! (Note: There was an issue saving to our system, but we appreciate your input)');
      }
      
      // Mark as submitted and close
      window.closeExcelCsvFeedback(true);
    };
  };

  // Run actual comparison
  const handleRunComparison = async () => {
    if (!file1 || !file2) {
      setError('Missing files to compare.');
      return;
    }

    if (finalMappings.length === 0) {
      console.log('No mappings yet, HeaderMapper will auto-run when ready');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Running comparison...');
    setError(null);

    try {
      let result;
      
      if (fileType === 'excel') {
        result = await compareExcelFiles(file1, file2, finalMappings, {
          sheet1: selectedSheet1,
          sheet2: selectedSheet2,
          autoDetectAmounts: true
        });
      } else if (fileType === 'csv') {
        result = await compareFiles(file1, file2, finalMappings);
      } else if (fileType === 'excel_csv') {
        result = await compareExcelCSVFiles(file1, file2, finalMappings, {
          selectedExcelSheet: selectedSheet1,
          autoDetectAmounts: true
        });
      }
      
      if (!result) {
        throw new Error('Comparison returned no results');
      }
      
      // Store results and navigate to track-comparison page
      sessionStorage.setItem('veridiff_results', JSON.stringify(result));
      sessionStorage.setItem('veridiff_file_type', fileType);

      // LAUNCH-OPTIMIZED EXCEL/CSV FEEDBACK SYSTEM
      console.log('📊 EXCEL/CSV FEEDBACK: Checking if feedback should be shown...');

      // Get current Excel/CSV comparison count
      let excelCsvComparisonCount = parseInt(localStorage.getItem('excel_csv_comparison_count') || '0');
      console.log('📊 EXCEL/CSV FEEDBACK: Current Excel/CSV comparison count:', excelCsvComparisonCount);

      // Increment the count
      excelCsvComparisonCount += 1;
      localStorage.setItem('excel_csv_comparison_count', excelCsvComparisonCount.toString());
      console.log('📊 EXCEL/CSV FEEDBACK: Updated Excel/CSV comparison count to:', excelCsvComparisonCount);

      // CHECK: Has user actually SUBMITTED feedback? (not just seen popup)
      const hasSubmittedExcelCsvFeedback = localStorage.getItem('excel_csv_feedback_submitted') === 'true';
      console.log('📊 EXCEL/CSV FEEDBACK: Has submitted feedback before:', hasSubmittedExcelCsvFeedback);

      // LAUNCH STRATEGY: Ask on every comparison after 3rd until they submit feedback
      if (excelCsvComparisonCount >= 3 && !hasSubmittedExcelCsvFeedback) {
        console.log('📊 EXCEL/CSV FEEDBACK: Showing feedback popup - count:', excelCsvComparisonCount, 'submitted:', hasSubmittedExcelCsvFeedback);
        
        // Small delay to ensure page is ready
        setTimeout(() => {
          showExcelCsvFeedbackPopup();
        }, 1000);
      } else {
        console.log('📊 EXCEL/CSV FEEDBACK: Not showing feedback - Count:', excelCsvComparisonCount, 'Already submitted:', hasSubmittedExcelCsvFeedback);
      }
      
      console.log('Comparison completed:', {
        total_records: result.total_records,
        differences_found: result.differences_found
      });
      
      router.push('/track-comparison');
      
    } catch (err) {
      console.error('Comparison error:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Sheet selection handler
  const handleSheetSelect = (sheet1, sheet2) => {
    setSelectedSheet1(sheet1);
    setSelectedSheet2(sheet2);
  };

  // Proceed with selected sheets
  const handleProceedWithSheets = async () => {
    if (!selectedSheet1 || (fileType === 'excel' && !selectedSheet2)) {
      setError('Please select sheets for both files.');
      return;
    }

    setIsProcessing(true);
    setShowSheetSelector(false);

    try {
      if (fileType === 'excel') {
        await processExcelFiles(file1, file2, selectedSheet1, selectedSheet2);
      } else if (fileType === 'excel_csv') {
        await processExcelCSVFiles(file1, file2, selectedSheet1);
      }
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Head>
        <title>File Comparison Setup - VeriDiff</title>
        <meta name="description" content="Set up your file comparison with advanced mapping and tolerance settings." />
        
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
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

        {/* Processing Status */}
        {isProcessing && (
          <section style={{
            padding: '2rem 0',
            background: '#eff6ff',
            borderTop: '1px solid #bfdbfe'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 20px',
              textAlign: 'center'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '2px solid #2563eb'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  border: '4px solid #e5e7eb',
                  borderTop: '4px solid #2563eb',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem'
                }}></div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2563eb',
                  marginBottom: '0.5rem'
                }}>
                  {processingStep || 'Processing Files...'}
                </h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '1rem'
                }}>
                  Please wait while we analyze your files
                </p>
              </div>
            </div>
          </section>
        )}

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

        {/* Sheet Selector */}
        {showSheetSelector && (
          <section style={{
            padding: '2rem 0',
            background: 'white'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 20px'
            }}>
              <SheetSelector
                file1Info={file1Info}
                file2Info={file2Info}
                onSheetSelect={handleSheetSelect}
                fileType={fileType}
              />
              <div style={{ textAlign: 'center', marginTop: '25px' }}>
                <button 
                  type="button"
                  onClick={handleProceedWithSheets} 
                  disabled={isProcessing || !selectedSheet1 || (fileType === 'excel' && !selectedSheet2)}
                  style={{
                    background: isProcessing || !selectedSheet1 || (fileType === 'excel' && !selectedSheet2)
                      ? '#9ca3af' 
                      : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    color: 'white',
                    border: 'none',
                    padding: '14px 30px',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: isProcessing || !selectedSheet1 || (fileType === 'excel' && !selectedSheet2) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isProcessing ? 'Processing...' : 'Proceed with Selected Sheets'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Header Mapper */}
        {showMapper && (
          <section style={{
            padding: '2rem 0',
            background: 'white'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 20px'
            }}>
              <HeaderMapper
                file1Headers={headers1}
                file2Headers={headers2}
                suggestedMappings={suggestedMappings}
                sampleData1={sampleData1}
                sampleData2={sampleData2}
                onConfirm={handleMappingConfirmed}
                onRun={handleRunComparison}
                isProcessing={isProcessing}
              />
            </div>
          </section>
        )}

        <Footer />
      </div>
    </>
  );
}
