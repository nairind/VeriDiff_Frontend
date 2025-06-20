// /pages/word-comparison.js - ENHANCED WORD DOCUMENT COMPARISON SETUP PAGE
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { compareWordFiles, setProgressCallback } from '../utils/wordFileComparison';

export default function EnhancedWordComparison() {
  const router = useRouter();
  const [fileInfo, setFileInfo] = useState({ file1: null, file2: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enhanced Word specific state
  const [isLargeFile, setIsLargeFile] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({
    stage: '',
    progress: 0,
    message: '',
    isActive: false
  });
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [enhancedWordOptions, setEnhancedWordOptions] = useState({
    compareMode: 'enhanced_semantic',
    ignoreFormatting: true,
    paragraphLevel: true,
    sectionDetection: true,
    semanticAnalysis: true,
    includeMetadata: false,
    wordLevelDiff: true,
    changeClassification: true
  });

  useEffect(() => {
    loadFileData();
    
    // Set up enhanced progress callback for Word processing
    setProgressCallback((progressData) => {
      setProcessingProgress({
        ...progressData,
        isActive: true
      });
    });

    // Cleanup progress callback on unmount
    return () => {
      setProgressCallback(null);
    };
  }, []);

  const loadFileData = async () => {
    try {
      const file1Info = JSON.parse(sessionStorage.getItem('veridiff_file1_info') || 'null');
      const file2Info = JSON.parse(sessionStorage.getItem('veridiff_file2_info') || 'null');

      if (!file1Info || !file2Info) {
        router.push('/');
        return;
      }

      // Verify these are Word files
      const isWordFile = (fileName) => {
        const ext = fileName.toLowerCase();
        return ext.endsWith('.docx') || ext.endsWith('.doc');
      };

      if (!isWordFile(file1Info.name) || !isWordFile(file2Info.name)) {
        setError('This page is for Word document comparison only. Please upload Word (.docx or .doc) files.');
        setIsLoading(false);
        return;
      }

      setFileInfo({ file1: file1Info, file2: file2Info });

      // Enhanced file size analysis for processing optimization
      const totalSize = (file1Info.size + file2Info.size) / 1024 / 1024;
      const isLarge = totalSize > 25 || file1Info.size > 15 * 1024 * 1024 || file2Info.size > 15 * 1024 * 1024;
      setIsLargeFile(isLarge);

      if (isLarge) {
        // Enhanced estimation for semantic analysis
        const baseTime = Math.ceil(totalSize / 8); // Faster due to enhanced processing
        const semanticOverhead = enhancedWordOptions.semanticAnalysis ? 0.3 : 0;
        setEstimatedTime(Math.ceil(baseTime * (1 + semanticOverhead)));
      }

      setIsLoading(false);

    } catch (error) {
      console.error('Error loading enhanced Word file data:', error);
      setError('Failed to load Word file data. Please try uploading again.');
      setIsLoading(false);
    }
  };

  // Enhanced Word Feedback Popup Function
  const showEnhancedWordFeedbackPopup = () => {
    const currentCount = localStorage.getItem('enhanced_word_comparison_count') || '3';
    
    const popupContainer = document.createElement('div');
    popupContainer.id = 'enhanced-word-feedback-popup';
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

    popupContainer.innerHTML = `
      <div style="
        background: white;
        border-radius: 16px;
        padding: 35px;
        max-width: 550px;
        width: 90%;
        max-height: 80vh;
        overflow: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        border: 2px solid #059669;
      ">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 3.5rem; margin-bottom: 20px;">🧠</div>
          <h2 style="
            font-size: 1.6rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 15px;
          ">
            How was your Enhanced Word Analysis?
          </h2>
          <p style="color: #6b7280; line-height: 1.6; font-size: 1.05rem;">
            You've completed ${currentCount} enhanced comparisons! Help us perfect our semantic analysis technology.
          </p>
        </div>

        <div style="margin-bottom: 25px;">
          <label style="
            display: block;
            font-size: 1rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 12px;
          ">
            Rate the enhanced semantic analysis quality:
          </label>
          <div style="
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-bottom: 25px;
          " id="enhanced-star-rating">
            <button onclick="selectEnhancedRating(1)" style="font-size: 1.8rem; background: none; border: none; cursor: pointer; padding: 8px;" data-rating="1">⭐</button>
            <button onclick="selectEnhancedRating(2)" style="font-size: 1.8rem; background: none; border: none; cursor: pointer; padding: 8px;" data-rating="2">⭐</button>
            <button onclick="selectEnhancedRating(3)" style="font-size: 1.8rem; background: none; border: none; cursor: pointer; padding: 8px;" data-rating="3">⭐</button>
            <button onclick="selectEnhancedRating(4)" style="font-size: 1.8rem; background: none; border: none; cursor: pointer; padding: 8px;" data-rating="4">⭐</button>
            <button onclick="selectEnhancedRating(5)" style="font-size: 1.8rem; background: none; border: none; cursor: pointer; padding: 8px;" data-rating="5">⭐</button>
          </div>

          <label style="
            display: block;
            font-size: 1rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 12px;
          ">
            Feedback on semantic analysis features: (Optional)
          </label>
          <textarea
            id="enhanced-word-feedback-comments"
            placeholder="How did the word-level changes, financial/data detection, and section analysis work for you?"
            style="
              width: 100%;
              min-height: 100px;
              padding: 15px;
              border: 2px solid #e5e7eb;
              border-radius: 10px;
              font-size: 1rem;
              resize: vertical;
              box-sizing: border-box;
              font-family: inherit;
            "
          ></textarea>
        </div>

        <div style="display: flex; gap: 15px; justify-content: flex-end;">
          <button
            onclick="closeEnhancedWordFeedback(false)"
            style="
              padding: 12px 24px;
              border: 2px solid #e5e7eb;
              background: white;
              color: #6b7280;
              border-radius: 10px;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
            "
          >
            Maybe Later
          </button>
          <button
            onclick="submitEnhancedWordFeedback()"
            style="
              padding: 12px 24px;
              border: none;
              background: linear-gradient(135deg, #059669, #047857);
              color: white;
              border-radius: 10px;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
            "
          >
            🚀 Help Improve VeriDiff
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(popupContainer);

    // Global functions for enhanced popup interaction
    window.selectedEnhancedWordRating = 0;
    
    window.selectEnhancedRating = (rating) => {
      window.selectedEnhancedWordRating = rating;
      const stars = document.querySelectorAll('#enhanced-star-rating button');
      stars.forEach((star, index) => {
        star.style.opacity = index < rating ? '1' : '0.3';
      });
    };

    window.closeEnhancedWordFeedback = (submitted = false) => {
      if (submitted) {
        localStorage.setItem('enhanced_word_feedback_submitted', 'true');
      }
      const popup = document.getElementById('enhanced-word-feedback-popup');
      if (popup) {
        popup.remove();
      }
    };

    window.submitEnhancedWordFeedback = async () => {
      const rating = window.selectedEnhancedWordRating || 0;
      const comments = document.getElementById('enhanced-word-feedback-comments')?.value || '';
      const wordCount = parseInt(localStorage.getItem('enhanced_word_comparison_count') || '3');
      
      try {
        const feedbackText = rating > 0 
          ? `Enhanced Word Comparison Feedback (${rating}/5 stars): ${comments}`.trim()
          : `Enhanced Word Comparison Feedback: ${comments}`.trim();

        const response = await fetch('/api/feedback/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            feedback_text: feedbackText,
            comparisonCount: wordCount,
            email: null,
            selected_reasons: ['enhanced_semantic_analysis'],
            enhancement_type: 'word_semantic_comparison'
          })
        });

        if (response.ok) {
          alert('Thank you for your enhanced Word analysis feedback! This helps us improve our semantic comparison technology. 🚀');
        } else {
          alert('Thank you for your feedback! (Note: There was an issue saving to our system, but we appreciate your input)');
        }
      } catch (error) {
        alert('Thank you for your feedback! (Note: There was an issue saving to our system, but we appreciate your input)');
      }
      
      window.closeEnhancedWordFeedback(true);
    };
  };

  const handleEnhancedWordComparison = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setProcessingProgress({
        stage: 'Enhanced Initialization',
        progress: 0,
        message: 'Preparing enhanced Word document comparison with semantic analysis...',
        isActive: true
      });

      console.log('🧠 Starting enhanced Word document comparison process...');

      // Enhanced validation and setup
      if (typeof window === 'undefined') {
        throw new Error('Enhanced Word processing is only available in browser environment');
      }

      // Load enhanced Word file data with improved debugging
      console.log('📁 Loading enhanced file data from sessionStorage...');
      const file1Data = sessionStorage.getItem('veridiff_file1_data');
      const file2Data = sessionStorage.getItem('veridiff_file2_data');

      console.log('📊 Enhanced sessionStorage data check:', {
        file1DataExists: !!file1Data,
        file2DataExists: !!file2Data,
        file1DataLength: file1Data?.length || 0,
        file2DataLength: file2Data?.length || 0,
        enhancedMode: enhancedWordOptions.semanticAnalysis
      });

      if (!file1Data || !file2Data) {
        throw new Error(
          'Enhanced Word File Data Missing\n\n' +
          'The uploaded Word files are no longer available in memory.\n\n' +
          'For enhanced semantic analysis with large files, this can happen due to:\n' +
          '• Browser memory limitations during processing\n' +
          '• Session timeout during upload\n' +
          '• File size exceeding browser storage limits\n\n' +
          'Please return to upload page and try:\n' +
          '• Uploading smaller files (under 25MB each)\n' +
          '• Closing other browser tabs before uploading\n' +
          '• Temporarily disabling semantic analysis for very large files'
        );
      }

      console.log('📁 Converting enhanced Word file data for processing...');
      setProcessingProgress({
        stage: 'Enhanced File Preparation',
        progress: 8,
        message: 'Converting files for enhanced semantic analysis...',
        isActive: true
      });

      let file1Binary, file2Binary;

      try {
        console.log('🔄 Converting to enhanced binary format...');
        
        // Enhanced debugging for file conversion
        const file1Base64Clean = file1Data.replace(/[^A-Za-z0-9+/=]/g, '');
        const file2Base64Clean = file2Data.replace(/[^A-Za-z0-9+/=]/g, '');
        
        file1Binary = Uint8Array.from(atob(file1Base64Clean), c => c.charCodeAt(0));
        file2Binary = Uint8Array.from(atob(file2Base64Clean), c => c.charCodeAt(0));
        
        // Enhanced validation
        const file1IsValid = file1Binary[0] === 0x50 && file1Binary[1] === 0x4B;
        const file2IsValid = file2Binary[0] === 0x50 && file2Binary[1] === 0x4B;
        
        console.log('🔍 Enhanced file validation:', { 
          file1IsValid, 
          file2IsValid,
          file1Size: (file1Binary.length/1024/1024).toFixed(1) + 'MB',
          file2Size: (file2Binary.length/1024/1024).toFixed(1) + 'MB'
        });
        
        if (!file1IsValid || !file2IsValid) {
          throw new Error('Invalid Word document format detected. Enhanced analysis requires valid .docx files.');
        }
        
        setProcessingProgress({
          stage: 'Enhanced File Preparation',
          progress: 15,
          message: `Files validated for enhanced processing: ${(file1Binary.length/1024/1024).toFixed(1)}MB + ${(file2Binary.length/1024/1024).toFixed(1)}MB`,
          isActive: true
        });
        
      } catch (conversionError) {
        console.error('❌ Enhanced file conversion error:', conversionError);
        throw new Error(
          'Enhanced Word File Processing Error\n\n' +
          'Failed to process the uploaded Word files for semantic analysis.\n\n' +
          `Technical details: ${conversionError.message}`
        );
      }

      // Enhanced mammoth.js testing with semantic features
      console.log('🧠 Testing enhanced mammoth.js with semantic processing...');

      if (!window.mammoth) {
        console.error('❌ mammoth.js not available for enhanced processing');
        throw new Error('Enhanced processing requires mammoth.js library');
      }

      setProcessingProgress({
        stage: 'Enhanced Text Extraction',
        progress: 25,
        message: 'Extracting text with enhanced structure analysis...',
        isActive: true
      });

      // Start the enhanced comparison process
      console.log('⚙️ Starting enhanced Word comparison engine with semantic analysis...');
      
      const enhancedComparisonResults = await compareWordFiles(
        file1Binary.buffer, 
        file2Binary.buffer, 
        enhancedWordOptions
      );

      console.log('✅ Enhanced Word comparison completed successfully');
      console.log('🧠 Enhanced results overview:', {
        similarityScore: enhancedComparisonResults.similarity_score,
        enhancedChanges: enhancedComparisonResults.enhanced_changes?.length || 0,
        semanticBreakdown: enhancedComparisonResults.change_statistics?.semantic_breakdown,
        processingMethod: enhancedComparisonResults.comparison_method
      });

      // Store enhanced results
      sessionStorage.setItem('veridiff_word_results', JSON.stringify(enhancedComparisonResults));
      sessionStorage.setItem('veridiff_comparison_type', 'enhanced_word');
      sessionStorage.setItem('veridiff_word_options', JSON.stringify(enhancedWordOptions));

      // Enhanced Word feedback system
      console.log('🧠 Enhanced FEEDBACK: Checking if enhanced feedback should be shown...');
      
      let enhancedWordComparisonCount = parseInt(localStorage.getItem('enhanced_word_comparison_count') || '0');
      enhancedWordComparisonCount += 1;
      localStorage.setItem('enhanced_word_comparison_count', enhancedWordComparisonCount.toString());
      
      const hasSubmittedEnhancedFeedback = localStorage.getItem('enhanced_word_feedback_submitted') === 'true';
      
      if (enhancedWordComparisonCount >= 3 && !hasSubmittedEnhancedFeedback) {
        setTimeout(() => {
          showEnhancedWordFeedbackPopup();
        }, 1500);
      }

      setProcessingProgress({
        stage: 'Enhanced Complete',
        progress: 100,
        message: 'Enhanced semantic comparison completed! Redirecting to results...',
        isActive: false
      });

      // Navigate to enhanced Word results
      setTimeout(() => {
        router.push('/word-results');
      }, 2000);

    } catch (error) {
      console.error('❌ Enhanced Word comparison error:', error);
      
      let userMessage = error.message;
      
      if (error.message.includes('mammoth')) {
        userMessage = error.message + '\n\n⚠️ Enhanced Note: Advanced semantic analysis library issue.';
      } else if (error.message.includes('memory') || error.message.includes('Memory')) {
        userMessage = error.message + '\n\n💡 Enhanced Suggestion: Try disabling semantic analysis for very large files.';
      }
      
      setError(userMessage);
      setIsLoading(false);
      setProcessingProgress({
        stage: 'Enhanced Error',
        progress: 0,
        message: 'Enhanced processing failed',
        isActive: false
      });
    }
  };

  const renderEnhancedLargeWordWarning = () => {
    if (!isLargeFile) return null;

    return (
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
        border: '2px solid #22c55e',
        borderRadius: '16px',
        padding: '25px',
        marginBottom: '25px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <div style={{ fontSize: '2.5rem' }}>🧠</div>
          <div>
            <h3 style={{ margin: 0, color: '#166534', fontSize: '1.3rem', fontWeight: '700' }}>
              Large Documents + Enhanced Semantic Analysis
            </h3>
            <p style={{ margin: '5px 0 0 0', color: '#166534', fontSize: '1rem' }}>
              Total size: {((fileInfo.file1?.size + fileInfo.file2?.size) / 1024 / 1024).toFixed(1)}MB
            </p>
          </div>
        </div>
        
        <div style={{ fontSize: '0.95rem', color: '#166534', lineHeight: '1.7' }}>
          <div style={{ marginBottom: '15px' }}>
            <strong>Enhanced Processing Information:</strong>
          </div>
          <ul style={{ margin: '0 0 20px 20px', padding: 0 }}>
            <li>Estimated processing time: <strong>{estimatedTime} - {estimatedTime * 2} minutes</strong></li>
            <li>Advanced semantic analysis for financial, numerical, and qualitative changes</li>
            <li>Word-level diff with intelligent change classification</li>
            <li>Section detection and margin annotations</li>
            <li>Professional-grade comparison results</li>
          </ul>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Performance Optimization:</strong>
          </div>
          <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
            <li>Enhanced processing uses optimized algorithms for faster analysis</li>
            <li>Semantic analysis may add 20-30% to processing time</li>
            <li>Keep browser tab active during enhanced processing</li>
            <li>Consider temporarily disabling semantic analysis for files over 50MB</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderEnhancedProgressIndicator = () => {
    if (!processingProgress.isActive && processingProgress.progress === 0) return null;

    return (
      <div style={{
        background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
        border: '2px solid #059669',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '25px',
        boxShadow: '0 8px 25px rgba(5, 150, 105, 0.15)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#047857', fontSize: '1.3rem', fontWeight: '700' }}>
            🧠 {processingProgress.stage}
          </h3>
          <p style={{ margin: 0, color: '#059669', fontSize: '1rem', lineHeight: '1.5' }}>
            {processingProgress.message}
          </p>
        </div>
        
        <div style={{
          background: '#e6fffa',
          borderRadius: '12px',
          height: '16px',
          overflow: 'hidden',
          marginBottom: '15px',
          border: '1px solid #a7f3d0'
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #059669, #047857, #065f46)',
            height: '100%',
            width: `${processingProgress.progress}%`,
            transition: 'width 0.4s ease',
            borderRadius: '12px',
            boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.3)'
          }} />
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.9rem',
          color: '#047857',
          fontWeight: '600'
        }}>
          <span>{processingProgress.progress}% Complete</span>
          {isLargeFile && estimatedTime && processingProgress.progress > 0 && (
            <span>
              Est. remaining: {Math.round((100 - processingProgress.progress) * estimatedTime / 100)} min
            </span>
          )}
        </div>
        
        {isLargeFile && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#ecfdf5',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#047857',
            border: '1px solid #a7f3d0'
          }}>
            🧠 <strong>Enhanced Large Document Processing:</strong> Please keep this tab active. 
            Large Word documents with semantic analysis may take several minutes to process completely.
          </div>
        )}
      </div>
    );
  };

  const renderEnhancedWordOptions = () => {
    return (
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '25px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
        border: '2px solid #e5e7eb'
      }}>
        <h3 style={{
          fontSize: '1.4rem',
          fontWeight: '700',
          marginBottom: '25px',
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          🧠 Enhanced Word Document Comparison
          <span style={{
            background: 'linear-gradient(135deg, #059669, #047857)',
            color: 'white',
            fontSize: '0.7rem',
            padding: '3px 8px',
            borderRadius: '12px',
            fontWeight: '600'
          }}>
            SEMANTIC AI
          </span>
        </h3>

        {/* Enhanced Progress Indicator */}
        {renderEnhancedProgressIndicator()}

        {/* Enhanced Large File Warning */}
        {renderEnhancedLargeWordWarning()}

        {/* Enhanced Word Options */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '25px',
          marginBottom: '30px'
        }}>
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '18px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={enhancedWordOptions.semanticAnalysis}
                onChange={(e) => setEnhancedWordOptions(prev => ({
                  ...prev,
                  semanticAnalysis: e.target.checked
                }))}
                style={{ transform: 'scale(1.3)' }}
              />
              🧠 Enhanced Semantic Analysis
              <span style={{
                background: '#059669',
                color: 'white',
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '8px'
              }}>
                AI
              </span>
            </label>
            <p style={{
              fontSize: '0.9rem',
              color: '#6b7280',
              margin: '0 0 0 35px',
              lineHeight: '1.5'
            }}>
              Automatically detect and classify financial amounts, percentages, dates, and qualitative changes with intelligent annotations.
            </p>
          </div>

          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '18px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={enhancedWordOptions.wordLevelDiff}
                onChange={(e) => setEnhancedWordOptions(prev => ({
                  ...prev,
                  wordLevelDiff: e.target.checked
                }))}
                style={{ transform: 'scale(1.3)' }}
              />
              📝 Word-Level Precision
            </label>
            <p style={{
              fontSize: '0.9rem',
              color: '#6b7280',
              margin: '0 0 0 35px',
              lineHeight: '1.5'
            }}>
              Highlight exact word changes instead of showing entire paragraphs as modified. Perfect for tracking specific edits.
            </p>
          </div>

          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '18px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={enhancedWordOptions.sectionDetection}
                onChange={(e) => setEnhancedWordOptions(prev => ({
                  ...prev,
                  sectionDetection: e.target.checked
                }))}
                style={{ transform: 'scale(1.3)' }}
              />
              📂 Smart Section Detection
            </label>
            <p style={{
              fontSize: '0.9rem',
              color: '#6b7280',
              margin: '0 0 0 35px',
              lineHeight: '1.5'
            }}>
              Automatically identify document sections, headers, and organizational structure for better change navigation.
            </p>
          </div>

          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '18px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={enhancedWordOptions.ignoreFormatting}
                onChange={(e) => setEnhancedWordOptions(prev => ({
                  ...prev,
                  ignoreFormatting: e.target.checked
                }))}
                style={{ transform: 'scale(1.3)' }}
              />
              🎨 Ignore Formatting Changes
            </label>
            <p style={{
              fontSize: '0.9rem',
              color: '#6b7280',
              margin: '0 0 0 35px',
              lineHeight: '1.5'
            }}>
              Focus on content changes rather than formatting like bold, italic, fonts, or colors.
            </p>
          </div>
        </div>

        {/* Enhanced Document Information */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '25px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            marginBottom: '15px',
            color: '#1f2937'
          }}>
            📊 Enhanced Analysis Preview
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            fontSize: '0.95rem'
          }}>
            <div>
              <strong>File 1:</strong> {fileInfo.file1?.name}
              <br />
              <span style={{ color: '#6b7280' }}>
                Size: {fileInfo.file1 ? (fileInfo.file1.size / 1024 / 1024).toFixed(1) : 0}MB
                {fileInfo.file1 && fileInfo.file1.size > 25 * 1024 * 1024 && 
                  <span style={{ color: '#059669', fontWeight: '600' }}> (Large - Enhanced Processing)</span>
                }
              </span>
            </div>
            <div>
              <strong>File 2:</strong> {fileInfo.file2?.name}
              <br />
              <span style={{ color: '#6b7280' }}>
                Size: {fileInfo.file2 ? (fileInfo.file2.size / 1024 / 1024).toFixed(1) : 0}MB
                {fileInfo.file2 && fileInfo.file2.size > 25 * 1024 * 1024 && 
                  <span style={{ color: '#059669', fontWeight: '600' }}> (Large - Enhanced Processing)</span>
                }
              </span>
            </div>
          </div>
          
          <div style={{
            marginTop: '15px',
            padding: '12px',
            background: '#ecfdf5',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#047857',
            border: '1px solid #a7f3d0'
          }}>
            🧠 <strong>Enhanced Features Active:</strong> {
              [
                enhancedWordOptions.semanticAnalysis && 'Semantic AI Analysis',
                enhancedWordOptions.wordLevelDiff && 'Word-Level Precision',
                enhancedWordOptions.sectionDetection && 'Section Detection',
                enhancedWordOptions.changeClassification && 'Change Classification'
              ].filter(Boolean).join(' • ') || 'Basic Analysis'
            }
          </div>
          
          {isLargeFile && (
            <div style={{
              marginTop: '12px',
              padding: '10px',
              background: '#fef3c7',
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: '#92400e',
              border: '1px solid #fbbf24'
            }}>
              ⏱️ Large documents with enhanced analysis may take {estimatedTime}-{estimatedTime * 2} minutes.
            </div>
          )}
        </div>

        {/* Enhanced Compare Button */}
        <button
          onClick={handleEnhancedWordComparison}
          disabled={isLoading || processingProgress.isActive}
          style={{
            background: (isLoading || processingProgress.isActive) 
              ? '#9ca3af' 
              : 'linear-gradient(135deg, #059669, #047857)',
            color: 'white',
            border: 'none',
            padding: '16px 40px',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: (isLoading || processingProgress.isActive) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
            maxWidth: '500px',
            margin: '0 auto',
            boxShadow: (isLoading || processingProgress.isActive) ? 'none' : '0 8px 20px rgba(5, 150, 105, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          {processingProgress.isActive ? (
            <>
              <span>🧠</span>
              Enhanced Processing...
            </>
          ) : isLoading ? (
            <>
              <span>⏳</span>
              Initializing Enhanced Engine...
            </>
          ) : (
            <>
              <span>{isLargeFile ? '🧠' : '🚀'}</span>
              {isLargeFile ? 'Start Enhanced Large Document Analysis' : 'Start Enhanced Word Comparison'}
            </>
          )}
        </button>
      </div>
    );
  };

  if (error) {
    return (
      <>
        <Head>
          <title>Enhanced Word Comparison Error - VeriDiff</title>
        </Head>
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
          <Header />
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '50px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '25px' }}>❌</div>
              <h1 style={{
                fontSize: '1.6rem',
                fontWeight: '700',
                color: '#dc2626',
                marginBottom: '20px'
              }}>
                Enhanced Word Comparison Error
              </h1>
              <p style={{
                color: '#6b7280',
                marginBottom: '30px',
                lineHeight: '1.6',
                whiteSpace: 'pre-line',
                fontSize: '1.05rem'
              }}>
                {error}
              </p>
              <button
                onClick={() => router.push('/')}
                style={{
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🏠 Return Home
              </button>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Enhanced Word Document Comparison - VeriDiff</title>
        <meta name="description" content="Configure your enhanced Word document comparison with semantic analysis and professional features" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.2/mammoth.browser.min.js"></script>
      </Head>
      
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Header />
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px'
        }}>
          {/* Enhanced Header Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '35px'
          }}>
            <h1 style={{
              fontSize: '2.8rem',
              fontWeight: '800',
              marginBottom: '15px',
              background: 'linear-gradient(135deg, #059669, #047857)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {isLargeFile ? '🧠 Enhanced Large Document Analysis' : '🧠 Enhanced Word Document Comparison'}
            </h1>
            <p style={{
              fontSize: '1.2rem',
              color: '#6b7280',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              {isLargeFile
                ? 'Professional semantic analysis for large Word documents with AI-powered change detection'
                : 'Professional semantic analysis with word-level precision and intelligent change classification'
              }
            </p>
          </div>

          {/* Enhanced Loading State */}
          {isLoading && !processingProgress.isActive && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '50px',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '25px' }}>🧠</div>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '700',
                marginBottom: '15px',
                color: '#1f2937'
              }}>
                {isLargeFile ? 'Preparing Enhanced Large Document Processing...' : 'Initializing Enhanced Processing...'}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '1.05rem' }}>
                {isLargeFile 
                  ? 'Initializing enhanced semantic analysis for large documents and optimizing system resources...'
                  : 'Loading enhanced comparison engine with semantic analysis capabilities'
                }
              </p>
            </div>
          )}

          {/* Enhanced Word Options */}
          {!isLoading && renderEnhancedWordOptions()}
        </div>
        
        <Footer />
      </div>
    </>
  );
}
