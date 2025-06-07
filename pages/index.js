import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeaderMapper from '../components/HeaderMapper';
import SheetSelector from '../components/SheetSelector';

// File processing utilities
import { parseCSVFile, compareFiles } from '../utils/simpleCSVComparison';
import { parseExcelFile, compareExcelFiles, getExcelFileInfo } from '../utils/excelFileComparison';
import { compareExcelCSVFiles } from '../utils/excelCSVComparison';
import { mapHeaders } from '../utils/mapHeaders';
import { downloadResultsAsExcel, downloadResultsAsCSV } from '../utils/downloadResults';

export default function Home() {
  // Core file states
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [fileType, setFileType] = useState(null); // Auto-detected
  const [dragActive, setDragActive] = useState({ file1: false, file2: false });

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

  // Results states
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Advanced results display states
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

  // Enhanced scroll position preservation - more robust approach
  const scrollPositionRef = useRef(0);
  const resultsContainerRef = useRef(null);
  const shouldScrollToResults = useRef(false);
  const isUpdatingFilters = useRef(false);
  const scrollLockRef = useRef(false);

  // Capture scroll position before any state updates
  const captureScrollPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      scrollPositionRef.current = window.pageYOffset;
      isUpdatingFilters.current = true;
      scrollLockRef.current = true;
    }
  }, []);

  // More aggressive scroll restoration
  const restoreScrollPosition = useCallback(() => {
    if (typeof window !== 'undefined' && isUpdatingFilters.current && !shouldScrollToResults.current) {
      const targetPosition = scrollPositionRef.current;
      
      // Multiple restoration attempts to handle all scenarios
      const restoreScroll = () => {
        if (scrollLockRef.current) {
          window.scrollTo(0, targetPosition);
        }
      };
      
      // Immediate restoration
      restoreScroll();
      
      // Delayed restorations for different rendering phases
      setTimeout(restoreScroll, 0);
      setTimeout(restoreScroll, 10);
      setTimeout(restoreScroll, 50);
      
      requestAnimationFrame(() => {
        restoreScroll();
        setTimeout(() => {
          restoreScroll();
          scrollLockRef.current = false;
          isUpdatingFilters.current = false;
        }, 100);
      });
    }
  }, []);

  // Effect to restore scroll position after state changes
  useEffect(() => {
    if (isUpdatingFilters.current && !shouldScrollToResults.current) {
      restoreScrollPosition();
    }
  }, [viewMode, resultsFilter, searchTerm, focusMode, fieldGrouping, ignoreWhitespace, showCharacterDiff, expandedGroups, restoreScrollPosition]);

  // Additional scroll event listener to prevent unwanted scrolling during updates
  useEffect(() => {
    const handleScroll = () => {
      if (scrollLockRef.current && isUpdatingFilters.current) {
        window.scrollTo(0, scrollPositionRef.current);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: false });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Analytics tracking function
  const trackAnalytics = async (eventType, data = {}) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          page_url: window.location.href,
          ...data
        })
      });
    } catch (error) {
      console.log('Analytics tracking failed (non-blocking):', error);
    }
  };

  // Track page view on mount
  useEffect(() => {
    trackAnalytics('page_view', { page: 'home' });
  }, []);

  // Detect file type based on file extensions
  const detectFileType = (file1, file2) => {
    const getExtension = (file) => file.name.toLowerCase().split('.').pop();
    
    const ext1 = getExtension(file1);
    const ext2 = getExtension(file2);
    
    const isExcel = (ext) => ['xlsx', 'xls', 'xlsm'].includes(ext);
    const isCSV = (ext) => ext === 'csv';
    
    if (isExcel(ext1) && isExcel(ext2)) {
      return 'excel';
    } else if (isCSV(ext1) && isCSV(ext2)) {
      return 'csv';
    } else if (isExcel(ext1) && isCSV(ext2)) {
      return 'excel_csv';
    } else if (isCSV(ext1) && isExcel(ext2)) {
      // Swap files so Excel is always first
      return 'csv_excel_swapped';
    }
    return 'unknown';
  };

  // File upload handlers
  const handleFileSelect = (fileNumber, event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (fileNumber === 1) {
        setFile1(selectedFile);
      } else {
        setFile2(selectedFile);
      }
      
      // Clear previous states when new file is selected
      setError(null);
      setResults(null);
      setShowResults(false);
      setShowMapper(false);
      setShowSheetSelector(false);
    }
  };

  // Drag and drop handlers
  const handleDrop = (fileNumber, event) => {
    event.preventDefault();
    setDragActive({ ...dragActive, [`file${fileNumber}`]: false });
    
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      if (fileNumber === 1) {
        setFile1(droppedFile);
      } else {
        setFile2(droppedFile);
      }
      
      // Clear previous states
      setError(null);
      setResults(null);
      setShowResults(false);
      setShowMapper(false);
      setShowSheetSelector(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDragEnter = (fileNumber) => {
    setDragActive({ ...dragActive, [`file${fileNumber}`]: true });
  };

  const handleDragLeave = (fileNumber) => {
    setDragActive({ ...dragActive, [`file${fileNumber}`]: false });
  };

  // Main comparison handler
  const handleCompare = async () => {
    if (!file1 || !file2) {
      setError('Please select both files to compare');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingStep('Analyzing files...');

    try {
      // Detect file type
      const detectedType = detectFileType(file1, file2);
      
      if (detectedType === 'unknown') {
        throw new Error('Unsupported file combination. Please use Excel (.xlsx, .xls) or CSV (.csv) files.');
      }

      // Handle file swapping for CSV-Excel
      let processFile1 = file1;
      let processFile2 = file2;
      let processType = detectedType;
      
      if (detectedType === 'csv_excel_swapped') {
        processFile1 = file2;
        processFile2 = file1;
        processType = 'excel_csv';
      }

      setFileType(processType);
      
      // Track analytics
      await trackAnalytics('comparison_started', {
        file_type: processType,
        file1_name: processFile1.name,
        file2_name: processFile2.name,
        file1_size: processFile1.size,
        file2_size: processFile2.size
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
      await trackAnalytics('comparison_error', {
        error_message: err.message,
        file_type: fileType
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Excel file comparison
  const handleExcelComparison = async (file1, file2) => {
    setProcessingStep('Analyzing Excel files...');
    
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
  };

  // Process Excel files after sheet selection
  const processExcelFiles = async (file1, file2, sheet1, sheet2) => {
    setProcessingStep('Parsing Excel data...');
    
    const [result1, result2] = await Promise.all([
      parseExcelFile(file1, sheet1),
      parseExcelFile(file2, sheet2)
    ]);
    
    const data1 = result1.data || result1;
    const data2 = result2.data || result2;
    
    if (!Array.isArray(data1) || !Array.isArray(data2)) {
      throw new Error('Failed to parse Excel data');
    }
    
    setupHeaderMapping(data1, data2, 'excel');
  };

  // CSV file comparison
  const handleCSVComparison = async (file1, file2) => {
    setProcessingStep('Parsing CSV files...');
    
    const [data1, data2] = await Promise.all([
      parseCSVFile(file1),
      parseCSVFile(file2)
    ]);
    
    setupHeaderMapping(data1, data2, 'csv');
  };

  // Excel-CSV comparison
  const handleExcelCSVComparison = async (excelFile, csvFile) => {
    setProcessingStep('Analyzing Excel file...');
    
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
  };

  // Process Excel-CSV after sheet selection
  const processExcelCSVFiles = async (excelFile, csvFile, excelSheet) => {
    setProcessingStep('Parsing files...');
    
    const [excelResult, csvData] = await Promise.all([
      parseExcelFile(excelFile, excelSheet),
      parseCSVFile(csvFile)
    ]);
    
    const excelData = excelResult.data || excelResult;
    
    setupHeaderMapping(excelData, csvData, 'excel_csv');
  };

  // Setup header mapping
  const setupHeaderMapping = (data1, data2, type) => {
    setProcessingStep('Setting up header mapping...');
    
    const h1 = Object.keys(data1[0] || {});
    const h2 = Object.keys(data2[0] || {});
    const suggested = mapHeaders(h1, h2);
    
    setHeaders1(h1);
    setHeaders2(h2);
    setSuggestedMappings(suggested);
    setSampleData1(data1.slice(0, 10));
    setSampleData2(data2.slice(0, 10));
    
    // Auto-default to side-by-side for 10+ columns
    if (h1.length >= 10) {
      setViewMode('side-by-side');
    }
    
    setShowMapper(true);
    setIsProcessing(false);
  };

  // Handle mapping confirmation
  const handleMappingConfirmed = (mappings) => {
    setFinalMappings(mappings);
  };

  // Run actual comparison
  const handleRunComparison = async () => {
    if (!file1 || !file2) {
      setError('Missing files to compare.');
      return;
    }

    // If no mappings yet, let HeaderMapper handle this
    if (finalMappings.length === 0) {
      console.log('No mappings yet, HeaderMapper will auto-run when ready');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Running comparison...');
    setError(null); // Clear any previous errors

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
      
      setResults(result);
      setShowResults(true);
      
      // Track successful comparison
      await trackAnalytics('comparison_completed', {
        file_type: fileType,
        total_records: result.total_records,
        differences_found: result.differences_found,
        match_rate: ((result.total_records - result.differences_found) / result.total_records * 100).toFixed(1)
      });
      
      // Mark that we should scroll to results (this is the only intentional scroll)
      shouldScrollToResults.current = true;
      
      // Scroll to results - this is the ONLY intentional scroll
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        shouldScrollToResults.current = false; // Reset flag after scroll
      }, 100);
      
    } catch (err) {
      console.error('Comparison error:', err);
      setError(err.message);
      await trackAnalytics('comparison_error', {
        error_message: err.message,
        file_type: fileType
      });
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

  // New comparison handler
  const handleNewComparison = () => {
    setFile1(null);
    setFile2(null);
    setFileType(null);
    setResults(null);
    setShowResults(false);
    setShowMapper(false);
    setShowSheetSelector(false);
    setError(null);
    setFinalMappings([]);
    setExpandedRows(new Set());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll-preserving state update handlers
  const handleViewModeChange = useCallback((newMode) => {
    captureScrollPosition();
    setViewMode(newMode);
  }, [captureScrollPosition]);

  const handleFilterChange = useCallback((newFilter) => {
    captureScrollPosition();
    setResultsFilter(newFilter);
  }, [captureScrollPosition]);

  const handleSearchChange = useCallback((newTerm) => {
    captureScrollPosition();
    setSearchTerm(newTerm);
  }, [captureScrollPosition]);

  const handleFocusModeToggle = useCallback((checked) => {
    captureScrollPosition();
    setFocusMode(checked);
  }, [captureScrollPosition]);

  const handleFieldGroupingToggle = useCallback((checked) => {
    captureScrollPosition();
    setFieldGrouping(checked);
  }, [captureScrollPosition]);

  const handleIgnoreWhitespaceToggle = useCallback((checked) => {
    captureScrollPosition();
    setIgnoreWhitespace(checked);
  }, [captureScrollPosition]);

  const handleCharacterDiffToggle = useCallback((checked) => {
    captureScrollPosition();
    setShowCharacterDiff(checked);
  }, [captureScrollPosition]);

  // Advanced results helper functions
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

  const getStatusConfig = (status) => {
    switch (status) {
      case 'match':
        return { 
          color: '#16a34a', 
          bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', 
          border: '#22c55e', 
          icon: '✅', 
          label: 'Perfect Match'
        };
      case 'modified':
        return { 
          color: '#d97706', 
          bg: 'linear-gradient(135deg, #fefce8, #fef3c7)', 
          border: '#f59e0b', 
          icon: '✏️', 
          label: 'Modified'
        };
      case 'acceptable':
        return { 
          color: '#0369a1', 
          bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)', 
          border: '#3b82f6', 
          icon: '⚠️', 
          label: 'Within Tolerance'
        };
      default:
        return { 
          color: '#6b7280', 
          bg: 'linear-gradient(135deg, #f9fafb, #f3f4f6)', 
          border: '#d1d5db', 
          icon: '❓', 
          label: 'Unknown'
        };
    }
  };

  const toggleRowExpansion = (rowIndex) => {
    captureScrollPosition();
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowIndex)) {
      newExpanded.delete(rowIndex);
    } else {
      newExpanded.add(rowIndex);
    }
    setExpandedRows(newExpanded);
  };

  const toggleGroupExpansion = (groupName) => {
    captureScrollPosition();
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  // Field grouping logic
  const groupFields = (fieldNames) => {
    if (!fieldGrouping || fieldNames.length < 8) {
      return [{ name: 'All Fields', fields: fieldNames, isDefault: true }];
    }

    const groups = {
      'Identity': [],
      'Financial': [],
      'Time & Hours': [],
      'Contact': [],
      'Other': []
    };

    fieldNames.forEach(field => {
      const fieldLower = field.toLowerCase();
      
      if (/id|name|employee|person|user|code/.test(fieldLower)) {
        groups['Identity'].push(field);
      } else if (/pay|salary|wage|amount|cost|fee|tax|pension|benefit|bonus|overtime/.test(fieldLower)) {
        groups['Financial'].push(field);
      } else if (/hour|time|date|period|shift|week|month/.test(fieldLower)) {
        groups['Time & Hours'].push(field);
      } else if (/email|phone|address|contact/.test(fieldLower)) {
        groups['Contact'].push(field);
      } else {
        groups['Other'].push(field);
      }
    });

    // Filter out empty groups and convert to array
    return Object.entries(groups)
      .filter(([name, fields]) => fields.length > 0)
      .map(([name, fields]) => ({ name, fields, isDefault: false }));
  };

  const getCharacterDiff = (str1, str2, ignoreWhitespace = false) => {
    if (!str1 || !str2) return { str1: str1 || '', str2: str2 || '', hasChanges: str1 !== str2 };
    
    let s1 = ignoreWhitespace ? str1.replace(/\s+/g, ' ').trim() : str1;
    let s2 = ignoreWhitespace ? str2.replace(/\s+/g, ' ').trim() : str2;
    
    if (s1 === s2) {
      return { str1, str2, hasChanges: false };
    }
    
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

  // Download handlers
  const handleDownloadExcel = async () => {
    try {
      const timestamp = new Date().toISOString().slice(0,10);
      const filename = `veridiff_comparison_${timestamp}.xlsx`;
      downloadResultsAsExcel(results, filename);
      
      await trackAnalytics('export_completed', {
        export_format: 'excel',
        file_type: fileType
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const timestamp = new Date().toISOString().slice(0,10);
      const filename = `veridiff_comparison_${timestamp}.csv`;
      downloadResultsAsCSV(results, filename);
      
      await trackAnalytics('export_completed', {
        export_format: 'csv',
        file_type: fileType
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDownloadHTMLDiff = async () => {
    try {
      if (!results?.results) {
        alert('No comparison results to export');
        return;
      }

      const timestamp = new Date().toISOString().slice(0,10);
      const filename = `veridiff_comparison_${timestamp}.html`;
      
      // Generate comprehensive HTML report
      const filteredResults = getFilteredResults();
      const summary = {
        totalRecords: results.total_records,
        differences: results.differences_found,
        matches: results.total_records - results.differences_found,
        matchRate: (((results.total_records - results.differences_found) / results.total_records) * 100).toFixed(1)
      };

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VeriDiff Comparison Report - ${new Date().toLocaleDateString()}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1f2937; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 2rem; margin-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #e5e7eb; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .summary-card h3 { font-size: 2rem; margin-bottom: 5px; }
        .comparison-table { background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; margin-bottom: 20px; }
        .table-header { background: #f8fafc; padding: 15px; border-bottom: 2px solid #e5e7eb; display: grid; grid-template-columns: 80px 1fr 1fr; gap: 20px; font-weight: 600; }
        .comparison-row { border-bottom: 1px solid #f3f4f6; display: grid; grid-template-columns: 80px 1fr 1fr; gap: 20px; padding: 15px; align-items: center; }
        .status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 6px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; }
        .file-data { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
        .field-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; }
        .field-item { background: white; padding: 8px; border-radius: 6px; border: 1px solid #e5e7eb; }
        .field-label { font-size: 0.75rem; color: #6b7280; margin-bottom: 2px; }
        .field-value { font-weight: 500; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 0.9rem; background: white; border-radius: 12px; border: 1px solid #e5e7eb; }
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
            <div class="summary-card">
                <h3 style="color: #2563eb;">${summary.totalRecords}</h3>
                <p>Total Records</p>
            </div>
            <div class="summary-card">
                <h3 style="color: #dc2626;">${summary.differences}</h3>
                <p>Differences Found</p>
            </div>
            <div class="summary-card">
                <h3 style="color: #16a34a;">${summary.matches}</h3>
                <p>Perfect Matches</p>
            </div>
            <div class="summary-card">
                <h3 style="color: #d97706;">${summary.matchRate}%</h3>
                <p>Match Rate</p>
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
                    <div style="text-align: center;">
                        <div class="status-badge" style="background: white; color: ${config.color}; border: 1px solid ${config.border};">
                            <span>${config.icon}</span>
                            <span>${config.label}</span>
                        </div>
                    </div>
                    
                    <div class="file-data">
                        <div class="field-grid">
                            ${Object.entries(row.fields).map(([fieldName, fieldData]) => `
                                <div class="field-item">
                                    <div class="field-label">${fieldName}</div>
                                    <div class="field-value">${fieldData.val1}</div>
                                    ${fieldData.difference ? `<div style="font-size: 0.8rem; color: #6b7280; margin-top: 4px;">Δ ${fieldData.difference}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="file-data">
                        <div class="field-grid">
                            ${Object.entries(row.fields).map(([fieldName, fieldData]) => `
                                <div class="field-item">
                                    <div class="field-label">${fieldName}</div>
                                    <div class="field-value">${fieldData.val2}</div>
                                    ${fieldData.difference ? `<div style="font-size: 0.8rem; color: #6b7280; margin-top: 4px;">Δ ${fieldData.difference}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
              `;
            }).join('')}
        </div>

        <div class="footer">
            <p>🔒 Generated by VeriDiff - Professional File Comparison Tool</p>
            <p>All processing performed locally in your browser. No data uploaded to external servers.</p>
            <p>Report contains ${filteredResults.length} records | Generated with character-level diff: ${showCharacterDiff ? 'enabled' : 'disabled'}</p>
        </div>
    </div>
</body>
</html>`;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      await trackAnalytics('export_completed', {
        export_format: 'html',
        file_type: fileType
      });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
      <Head>
        <title>VeriDiff - Professional File Comparison Tool | Excel, CSV, Cross-Format Analysis</title>
        <meta name="description" content="Compare Excel, CSV, and mixed file formats with advanced features. Smart header mapping, tolerance settings, character-level diff, and professional reporting. All processing done locally in your browser." />
        <meta name="keywords" content="file comparison, excel comparison, csv comparison, data analysis, file diff, spreadsheet comparison, data validation, professional tools" />
        <meta name="robots" content="index, follow" />
        
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            .upload-container { flex-direction: column !important; gap: 1rem !important; }
            .upload-zone { min-height: 120px !important; }
            .compare-button { width: 100% !important; margin-top: 1rem !important; }
            .results-controls { grid-template-columns: 1fr !important; }
            
            /* Mobile table responsiveness */
            .unified-table { overflow-x: auto !important; }
            .unified-table table { min-width: 600px !important; }
            .unified-table th, .unified-table td { min-width: 80px !important; padding: 8px !important; }
            
            /* Stack field groups on mobile */
            .field-group-grid { grid-template-columns: 1fr !important; }
            
            /* Mobile side-by-side view */
            .side-by-side-grid { grid-template-columns: 1fr !important; }
            .side-by-side-row { grid-template-columns: 1fr !important; gap: 10px !important; }
            .file-column { margin-bottom: 15px !important; }
          }
          
          @media (max-width: 480px) {
            .upload-zone { min-height: 100px !important; font-size: 0.875rem !important; }
            .results-controls { grid-template-columns: 1fr !important; gap: 10px !important; }
            
            /* Very small screens */
            .unified-table th, .unified-table td { min-width: 60px !important; padding: 6px !important; font-size: 0.8rem !important; }
            .field-value { font-size: 0.85rem !important; }
            .status-badge { font-size: 0.7rem !important; padding: 3px 6px !important; }
          }
          
          .upload-zone {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .upload-zone:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(37, 99, 235, 0.15);
          }
          
          .upload-zone.drag-active {
            border-color: #2563eb !important;
            background-color: #eff6ff !important;
          }
          
          /* Focus mode animations */
          .focus-mode-row {
            transition: opacity 0.3s ease, transform 0.2s ease;
          }
          
          .focus-mode-row:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          /* Field grouping animations */
          .field-group {
            transition: all 0.3s ease;
          }
          
          .field-group.expanded {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
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

        {/* Trust Banner */}
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
              🔒 All file processing happens locally in your browser - your data never leaves your device
            </p>
          </div>
        </div>

        {/* Hero Section with Upload Interface */}
        <section style={{
          background: 'linear-gradient(135deg, #eff6ff, #f8fafc)',
          padding: '3rem 0',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            
            <h1 style={{ 
              fontSize: '3.5rem', 
              fontWeight: '700', 
              marginBottom: '1rem', 
              lineHeight: '1.2', 
              color: '#1f2937' 
            }}>
              Professional File Comparison
              <span style={{ 
                display: 'block', 
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                backgroundClip: 'text' 
              }}>
                Made Simple
              </span>
            </h1>
            
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#6b7280', 
              marginBottom: '3rem', 
              maxWidth: '600px', 
              marginLeft: 'auto', 
              marginRight: 'auto',
              lineHeight: '1.6'
            }}>
              Compare Excel, CSV, and mixed file formats with enterprise-grade features. Smart mapping, tolerance settings, and detailed analysis.
            </p>

            {/* Upload Interface */}
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }} className="upload-container">
                
                {/* File 1 Upload */}
                <div
                  className={`upload-zone ${dragActive.file1 ? 'drag-active' : ''}`}
                  style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '0.75rem',
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: file1 ? '#f0fdf4' : '#fafafa',
                    borderColor: file1 ? '#10b981' : '#d1d5db',
                    minHeight: '140px',
                    minWidth: '250px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                  onDrop={(e) => handleDrop(1, e)}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleDragEnter(1)}
                  onDragLeave={() => handleDragLeave(1)}
                  onClick={() => document.getElementById('file1').click()}
                >
                  <input
                    id="file1"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => handleFileSelect(1, e)}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {file1 ? '✅' : '📊'}
                  </div>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    {file1 ? file1.name : 'First File'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {file1 ? 'Ready to compare' : 'Excel (.xlsx, .xls) or CSV'}
                  </div>
                </div>

                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  color: '#2563eb',
                  padding: '0 1rem'
                }}>
                  VS
                </div>

                {/* File 2 Upload */}
                <div
                  className={`upload-zone ${dragActive.file2 ? 'drag-active' : ''}`}
                  style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '0.75rem',
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: file2 ? '#f0fdf4' : '#fafafa',
                    borderColor: file2 ? '#10b981' : '#d1d5db',
                    minHeight: '140px',
                    minWidth: '250px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                  onDrop={(e) => handleDrop(2, e)}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleDragEnter(2)}
                  onDragLeave={() => handleDragLeave(2)}
                  onClick={() => document.getElementById('file2').click()}
                >
                  <input
                    id="file2"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => handleFileSelect(2, e)}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {file2 ? '✅' : '📊'}
                  </div>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    {file2 ? file2.name : 'Second File'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {file2 ? 'Ready to compare' : 'Excel (.xlsx, .xls) or CSV'}
                  </div>
                </div>
              </div>

              <button
                className="compare-button"
                onClick={handleCompare}
                disabled={!file1 || !file2 || isProcessing}
                style={{
                  background: (!file1 || !file2 || isProcessing) ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 3rem',
                  borderRadius: '0.75rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  cursor: (!file1 || !file2 || isProcessing) ? 'not-allowed' : 'pointer',
                  marginTop: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  margin: '1.5rem auto 0',
                  transition: 'all 0.3s ease'
                }}
              >
                {isProcessing ? (
                  <>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    {processingStep || 'Processing...'}
                  </>
                ) : (
                  <>🔍 Compare Files</>
                )}
              </button>

              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                marginTop: '1rem',
                marginBottom: 0
              }}>
                Supports: Excel ↔ Excel • CSV ↔ CSV • Excel ↔ CSV cross-format
              </p>
            </div>
          </div>
        </section>

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

        {/* Results Section */}
        {showResults && results && (
          <section id="results-section" style={{ 
            padding: '3rem 0',
            background: '#f0fdf4',
            borderTop: '1px solid #bbf7d0'
          }} ref={resultsContainerRef}>
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
                </div>

                {/* Matches Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  border: '2px solid #22c55e',
                  borderRadius: '20px',
                  padding: '30px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✨</div>
                  <div style={{ 
                    fontSize: '3rem', 
                    fontWeight: '700', 
                    color: '#16a34a',
                    marginBottom: '8px'
                  }}>
                    {results.total_records - results.differences_found}
                  </div>
                  <div style={{ 
                    color: '#16a34a', 
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>
                    Perfect Matches
                  </div>
                </div>

                {/* Match Rate Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #fefce8, #fef3c7)',
                  border: '2px solid #f59e0b',
                  borderRadius: '20px',
                  padding: '30px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎯</div>
                  <div style={{ 
                    fontSize: '3rem', 
                    fontWeight: '700', 
                    color: '#d97706',
                    marginBottom: '8px'
                  }}>
                    {(((results.total_records - results.differences_found) / results.total_records) * 100).toFixed(1)}%
                  </div>
                  <div style={{ 
                    color: '#d97706', 
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>
                    Match Rate
                  </div>
                </div>
              </div>

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

              {/* Advanced Controls Bar */}
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
                }} className="results-controls">
                  
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
                        onClick={() => handleViewModeChange('unified')}
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
                        onClick={() => handleViewModeChange('side-by-side')}
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
                      onChange={(e) => handleFilterChange(e.target.value)}
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
                      placeholder="Search values, IDs..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        transition: 'border-color 0.2s ease'
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
                          checked={focusMode}
                          onChange={(e) => handleFocusModeToggle(e.target.checked)}
                          style={{ accentColor: '#2563eb' }}
                        />
                        Focus Mode (highlight changes only)
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
                          checked={fieldGrouping}
                          onChange={(e) => handleFieldGroupingToggle(e.target.checked)}
                          style={{ accentColor: '#2563eb' }}
                        />
                        Group Similar Fields
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
                          checked={ignoreWhitespace}
                          onChange={(e) => handleIgnoreWhitespaceToggle(e.target.checked)}
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
                          onChange={(e) => handleCharacterDiffToggle(e.target.checked)}
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

              {/* Results Display */}
              {getFilteredResults().length > 0 ? (
                viewMode === 'side-by-side' ? (
                  // Side-by-Side View
                  <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                  }} className="side-by-side-grid">
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
                      }} className="side-by-side-row">
                        <div style={{ textAlign: 'center' }}>Status</div>
                        <div style={{ textAlign: 'center', color: '#2563eb' }} className="file-column">
                          📄 File 1 ({file1?.name || 'Original'})
                        </div>
                        <div style={{ textAlign: 'center', color: '#16a34a' }} className="file-column">
                          📄 File 2 ({file2?.name || 'Comparison'})
                        </div>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      {getFilteredResults().map((row, rowIndex) => {
                        const status = getRecordStatus(row);
                        const config = getStatusConfig(status);
                        
                        if (focusMode && status === 'match') {
                          return null; // Hide perfect matches in focus mode
                        }
                        
                        return (
                          <div key={rowIndex} style={{
                            borderBottom: '1px solid #f3f4f6',
                            borderLeft: `4px solid ${config.border}`,
                            background: config.bg,
                            opacity: focusMode && status === 'match' ? 0.4 : 1
                          }} className="focus-mode-row">
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '100px 1fr 1fr',
                              gap: '20px',
                              padding: '20px',
                              minHeight: '120px',
                              alignItems: 'center'
                            }} className="side-by-side-row">
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
                                }} className="status-badge">
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
                              }} className="file-column">
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                  gap: '10px'
                                }} className="field-group-grid">
                                  {Object.entries(row.fields).map(([fieldName, fieldData]) => {
                                    const isChanged = fieldData.status === 'difference';
                                    const diffResult = getCharacterDiff(String(fieldData.val1), String(fieldData.val2), ignoreWhitespace);
                                    
                                    return (
                                      <div key={fieldName} style={{
                                        background: isChanged ? '#fee2e2' : '#f9fafb',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: isChanged ? '2px solid #fca5a5' : '1px solid #e5e7eb'
                                      }} className="field-value">
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
                              }} className="file-column">
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                  gap: '10px'
                                }} className="field-group-grid">
                                  {Object.entries(row.fields).map(([fieldName, fieldData]) => {
                                    const isChanged = fieldData.status === 'difference';
                                    const diffResult = getCharacterDiff(String(fieldData.val1), String(fieldData.val2), ignoreWhitespace);
                                    
                                    return (
                                      <div key={fieldName} style={{
                                        background: isChanged ? '#d1fae5' : '#f9fafb',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: isChanged ? '2px solid #86efac' : '1px solid #e5e7eb'
                                      }} className="field-value">
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
                                          {fieldData.val2}
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
                ) : (
                  // Professional Unified Table View
                  <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                  }} className="unified-table">
                    {/* Table Header */}
                    <div style={{
                      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                      padding: '20px',
                      borderBottom: '2px solid #e5e7eb',
                      overflowX: 'auto'
                    }}>
                      <table style={{
                        width: '100%',
                        minWidth: fieldGrouping ? '800px' : `${Math.max(800, Object.keys(results.results[0].fields).length * 120)}px`,
                        borderCollapse: 'collapse'
                      }}>
                        <thead>
                          <tr>
                            <th style={{
                              padding: '12px 16px',
                              textAlign: 'left',
                              fontWeight: '700',
                              color: '#1f2937',
                              fontSize: '1rem',
                              borderRight: '1px solid #e5e7eb',
                              minWidth: '100px'
                            }}>
                              Record ID
                            </th>
                            {fieldGrouping && Object.keys(results.results[0].fields).length >= 8 ? (
                              // Grouped Headers
                              groupFields(Object.keys(results.results[0].fields)).map((group) => (
                                <th key={group.name} style={{
                                  padding: '12px 16px',
                                  textAlign: 'center',
                                  fontWeight: '700',
                                  color: '#1f2937',
                                  fontSize: '1rem',
                                  borderRight: '1px solid #e5e7eb',
                                  background: group.isDefault ? 'transparent' : 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                                  cursor: group.isDefault ? 'default' : 'pointer',
                                  minWidth: `${Math.max(120, group.fields.length * 80)}px`
                                }}
                                onClick={() => !group.isDefault && toggleGroupExpansion(group.name)}
                                className="field-group"
                                >
                                  {group.isDefault ? (
                                    <div style={{ 
                                      display: 'grid',
                                      gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                                      gap: '8px'
                                    }} className="field-group-grid">
                                      {group.fields.map(field => (
                                        <div key={field} style={{ 
                                          fontSize: '0.9rem',
                                          padding: '4px'
                                        }}>
                                          {field}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                      <span>{group.name}</span>
                                      <span style={{ fontSize: '0.8rem', opacity: '0.7' }}>
                                        ({group.fields.length} fields)
                                      </span>
                                      <span style={{ fontSize: '0.8rem' }}>
                                        {expandedGroups.has(group.name) ? '▼' : '▶'}
                                      </span>
                                    </div>
                                  )}
                                </th>
                              ))
                            ) : (
                              // Individual Field Headers
                              Object.keys(results.results[0].fields).map((field, idx) => (
                                <th key={idx} style={{
                                  padding: '12px 16px',
                                  textAlign: 'center',
                                  fontWeight: '700',
                                  color: '#1f2937',
                                  fontSize: '1rem',
                                  borderRight: '1px solid #e5e7eb',
                                  cursor: 'pointer',
                                  minWidth: '120px'
                                }}
                                onClick={() => {
                                  captureScrollPosition();
                                  if (sortField === field) {
                                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                  } else {
                                    setSortField(field);
                                    setSortDirection('asc');
                                  }
                                }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                    {field}
                                    {sortField === field && (
                                      <span style={{ fontSize: '0.8rem' }}>
                                        {sortDirection === 'asc' ? '↑' : '↓'}
                                      </span>
                                    )}
                                  </div>
                                </th>
                              ))
                            )}
                            <th style={{
                              padding: '12px 16px',
                              textAlign: 'center',
                              fontWeight: '700',
                              color: '#1f2937',
                              fontSize: '1rem',
                              minWidth: '80px'
                            }}>
                              Status
                            </th>
                          </tr>
                        </thead>
                      </table>
                    </div>

                    {/* Table Body */}
                    <div style={{ 
                      maxHeight: '600px', 
                      overflowY: 'auto',
                      overflowX: 'auto'
                    }}>
                      <table style={{
                        width: '100%',
                        minWidth: fieldGrouping ? '800px' : `${Math.max(800, Object.keys(results.results[0].fields).length * 120)}px`,
                        borderCollapse: 'collapse'
                      }}>
                        <tbody>
                          {getFilteredResults().map((row, rowIndex) => {
                            const hasAnyDifference = Object.values(row.fields).some(field => field.status === 'difference');
                            const isHighlighted = focusMode ? hasAnyDifference : true;
                            
                            if (focusMode && !hasAnyDifference) {
                              return null; // Hide perfect matches in focus mode
                            }
                            
                            return (
                              <tr key={rowIndex} style={{
                                background: hasAnyDifference 
                                  ? 'linear-gradient(135deg, #fef2f2, #fefefe)' 
                                  : (rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb'),
                                borderLeft: hasAnyDifference ? '4px solid #ef4444' : '4px solid transparent',
                                opacity: focusMode && !hasAnyDifference ? 0.4 : 1,
                                transition: 'all 0.2s ease'
                              }} className="focus-mode-row">
                                {/* Record ID */}
                                <td style={{
                                  padding: '16px',
                                  borderRight: '1px solid #e5e7eb',
                                  borderBottom: '1px solid #f3f4f6',
                                  fontWeight: '600',
                                  color: '#1f2937',
                                  fontSize: '1rem',
                                  textAlign: 'center'
                                }}>
                                  {row.ID}
                                </td>

                                {/* Field Values */}
                                {fieldGrouping && Object.keys(results.results[0].fields).length >= 8 ? (
                                  // Grouped Field Display
                                  groupFields(Object.keys(row.fields)).map((group) => (
                                    <td key={group.name} style={{
                                      padding: '12px',
                                      borderRight: '1px solid #e5e7eb',
                                      borderBottom: '1px solid #f3f4f6',
                                      verticalAlign: 'top'
                                    }}>
                                      {group.isDefault || expandedGroups.has(group.name) ? (
                                        // Show individual fields
                                        <div style={{
                                          display: 'grid',
                                          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                                          gap: '8px'
                                        }} className="field-group-grid">
                                          {group.fields.map(fieldName => {
                                            const fieldData = row.fields[fieldName];
                                            const isMatch = fieldData.val1 === fieldData.val2;
                                            const isDifference = fieldData.status === 'difference';
                                            
                                            return (
                                              <div key={fieldName} style={{
                                                background: isDifference ? '#fee2e2' : (isMatch ? '#f9fafb' : '#fef3c7'),
                                                border: `1px solid ${isDifference ? '#fca5a5' : (isMatch ? '#e5e7eb' : '#fcd34d')}`,
                                                borderRadius: '6px',
                                                padding: '8px',
                                                fontSize: '0.9rem'
                                              }} className="field-value">
                                                <div style={{
                                                  fontSize: '0.75rem',
                                                  color: '#6b7280',
                                                  marginBottom: '4px',
                                                  fontWeight: '500'
                                                }}>
                                                  {fieldName}
                                                </div>
                                                {isMatch ? (
                                                  <div style={{
                                                    color: '#374151',
                                                    fontWeight: '500'
                                                  }}>
                                                    {fieldData.val1}
                                                  </div>
                                                ) : (
                                                  <div style={{ fontSize: '0.85rem' }}>
                                                    <div style={{
                                                      color: '#dc2626',
                                                      textDecoration: 'line-through',
                                                      opacity: 0.7
                                                    }}>
                                                      {fieldData.val1}
                                                    </div>
                                                    <div style={{
                                                      color: '#16a34a',
                                                      fontWeight: '600',
                                                      marginTop: '2px'
                                                    }}>
                                                      {fieldData.val2}
                                                    </div>
                                                    {fieldData.difference && (
                                                      <div style={{
                                                        fontSize: '0.7rem',
                                                        color: '#f59e0b',
                                                        marginTop: '2px',
                                                        fontWeight: '600'
                                                      }}>
                                                        Δ {fieldData.difference}
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        // Show group summary
                                        <div style={{
                                          textAlign: 'center',
                                          padding: '12px',
                                          color: '#6b7280',
                                          fontSize: '0.9rem'
                                        }}>
                                          <div style={{ marginBottom: '4px', fontWeight: '600' }}>
                                            {group.fields.filter(f => row.fields[f].status === 'difference').length} differences
                                          </div>
                                          <button
                                            onClick={() => toggleGroupExpansion(group.name)}
                                            style={{
                                              background: 'transparent',
                                              border: '1px solid #d1d5db',
                                              borderRadius: '4px',
                                              padding: '4px 8px',
                                              fontSize: '0.8rem',
                                              cursor: 'pointer',
                                              color: '#374151'
                                            }}
                                          >
                                            Show Details
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  ))
                                ) : (
                                  // Individual Field Display
                                  Object.entries(row.fields).map(([fieldName, fieldData], idx) => {
                                    const isMatch = fieldData.val1 === fieldData.val2;
                                    const isDifference = fieldData.status === 'difference';
                                    
                                    return (
                                      <td key={idx} style={{
                                        padding: '12px 16px',
                                        borderRight: '1px solid #e5e7eb',
                                        borderBottom: '1px solid #f3f4f6',
                                        fontSize: '0.95rem',
                                        textAlign: 'center',
                                        background: isDifference ? '#fef2f2' : 'transparent'
                                      }} className="field-value">
                                        {isMatch ? (
                                          <div style={{
                                            color: '#374151',
                                            fontWeight: '500'
                                          }}>
                                            {fieldData.val1}
                                          </div>
                                        ) : (
                                          <div>
                                            <div style={{
                                              color: '#dc2626',
                                              fontSize: '0.85rem',
                                              textDecoration: 'line-through',
                                              opacity: 0.7,
                                              marginBottom: '2px'
                                            }}>
                                              {fieldData.val1}
                                            </div>
                                            <div style={{
                                              color: '#16a34a',
                                              fontWeight: '600',
                                              fontSize: '0.9rem'
                                            }}>
                                              {fieldData.val2}
                                            </div>
                                            {fieldData.difference && (
                                              <div style={{
                                                fontSize: '0.75rem',
                                                color: '#f59e0b',
                                                marginTop: '4px',
                                                fontWeight: '600'
                                              }}>
                                                Δ {fieldData.difference}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </td>
                                    );
                                  })
                                )}

                                {/* Status */}
                                <td style={{
                                  padding: '12px 16px',
                                  borderBottom: '1px solid #f3f4f6',
                                  textAlign: 'center'
                                }}>
                                  <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    background: hasAnyDifference ? '#fef2f2' : '#f0fdf4',
                                    color: hasAnyDifference ? '#dc2626' : '#16a34a',
                                    border: `1px solid ${hasAnyDifference ? '#fca5a5' : '#bbf7d0'}`
                                  }} className="status-badge">
                                    {hasAnyDifference ? '❌' : '✅'}
                                    <span style={{ marginLeft: '2px' }}>
                                      {hasAnyDifference ? 'Diff' : 'Match'}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
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
                      captureScrollPosition();
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

              {/* Enhanced Download Section */}
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
                  >
                    📄 CSV Data
                  </button>

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
                  >
                    🌐 HTML Diff Report
                  </button>
                </div>
                
                <div style={{
                  marginTop: '20px',
                  fontSize: '0.9rem',
                  color: '#6b7280'
                }}>
                  <strong>Enhanced Features:</strong> Summary statistics • Side-by-side comparison • Color-coded differences • Character-level highlighting • Professional formatting
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section id="features" style={{
          padding: '4rem 0',
          background: 'white'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: '2.25rem',
                fontWeight: '700',
                marginBottom: '1rem',
                color: '#1f2937'
              }}>
                Enterprise-Grade Features
              </h2>
              <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>
                Professional file comparison with advanced analysis capabilities
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem'
                }}>
                  🎯
                </div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }}>
                  Smart Header Mapping
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
                  Automatically matches similar column headers across files, even with different naming conventions.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem'
                }}>
                  ⚖️
                </div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }}>
                  Tolerance Settings
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
                  Set acceptable variance levels for financial data and amounts with flat or percentage tolerances.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem'
                }}>
                  🔒
                </div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }}>
                  Complete Privacy
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
                  All processing happens locally in your browser. Your sensitive data never leaves your device.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem'
                }}>
                  🔄
                </div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }}>
                  Cross-Format Support
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
                  Compare Excel to Excel, CSV to CSV, or mixed Excel-CSV files with intelligent format handling.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem'
                }}>
                  🤖
                </div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }}>
                  AI Auto-Detection
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
                  Automatically identifies amount fields and applies smart tolerance settings for financial data.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem'
                }}>
                  📊
                </div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }}>
                  Advanced Analytics
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
                  Detailed comparison results with filtering, search, character-level diff, and professional reporting.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" style={{
          padding: '4rem 0',
          background: '#f8fafc'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: '700',
              marginBottom: '1rem',
              color: '#1f2937'
            }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '3rem' }}>
              Professional file comparison tools, completely free
            </p>

            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '3rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: '#10b981',
                marginBottom: '1rem'
              }}>
                FREE
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '2rem'
              }}>
                Complete File Comparison Suite
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
                textAlign: 'left'
              }}>
                <div style={{ color: '#374151' }}>
                  ✅ Excel ↔ Excel comparison<br/>
                  ✅ CSV ↔ CSV comparison<br/>
                  ✅ Excel ↔ CSV cross-format
                </div>
                <div style={{ color: '#374151' }}>
                  ✅ Smart header mapping<br/>
                  ✅ Tolerance settings<br/>
                  ✅ AI auto-detection
                </div>
                <div style={{ color: '#374151' }}>
                  ✅ Advanced analytics<br/>
                  ✅ Multiple export formats<br/>
                  ✅ Complete privacy protection
                </div>
              </div>

              <div style={{
                background: '#f0fdf4',
                border: '2px solid #22c55e',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#166534',
                  marginBottom: '0.5rem'
                }}>
                  🎉 Launch Special - Everything Free
                </div>
                <div style={{ color: '#15803d', fontSize: '0.95rem' }}>
                  No usage limits • No feature restrictions • No credit card required
                </div>
              </div>

              <button
                onClick={handleCompare}
                disabled={!file1 || !file2}
                style={{
                  background: (!file1 || !file2) 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 3rem',
                  borderRadius: '0.75rem',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  cursor: (!file1 || !file2) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {!file1 || !file2 ? 'Upload Files Above to Start' : '🚀 Start Comparing Now'}
              </button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
