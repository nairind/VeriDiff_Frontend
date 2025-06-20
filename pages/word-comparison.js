// /pages/word-comparison.js - WORD DOCUMENT COMPARISON SETUP PAGE
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { compareWordFiles, setProgressCallback } from '../utils/wordFileComparison';

export default function WordComparison() {
  const router = useRouter();
  const [fileInfo, setFileInfo] = useState({ file1: null, file2: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Word specific state
  const [isLargeFile, setIsLargeFile] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({
    stage: '',
    progress: 0,
    message: '',
    isActive: false
  });
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [wordOptions, setWordOptions] = useState({
    compareMode: 'text',
    ignoreFormatting: true,
    paragraphLevel: true,
    includeMetadata: false
  });

  useEffect(() => {
    loadFileData();
    
    // Set up progress callback for Word processing
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

      // Check if files are large (25MB+)
      const totalSize = (file1Info.size + file2Info.size) / 1024 / 1024;
      const isLarge = totalSize > 25 || file1Info.size > 15 * 1024 * 1024 || file2Info.size > 15 * 1024 * 1024;
      setIsLargeFile(isLarge);

      if (isLarge) {
        // Estimate processing time for large files
        const estimatedMinutes = Math.ceil(totalSize / 5); // Rough estimate: 5MB per minute
        setEstimatedTime(estimatedMinutes);
      }

      setIsLoading(false);

    } catch (error) {
      console.error('Error loading Word file data:', error);
      setError('Failed to load Word file data. Please try uploading again.');
      setIsLoading(false);
    }
  };

  // Word Feedback Popup Function (mirroring PDF version)
  const showWordFeedbackPopup = () => {
    const currentCount = localStorage.getItem('word_comparison_count') || '3';
    
    const popupContainer = document.createElement('div');
    popupContainer.id = 'word-feedback-popup';
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
        border-radius: 12px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow: auto;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
      ">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="font-size: 3rem; margin-bottom: 15px;">📝</div>
          <h2 style="
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
          ">
            Help us improve VeriDiff Word Comparison!
          </h2>
          <p style="color: #6b7280; line-height: 1.6;">
            You've completed ${currentCount} Word comparisons! Your feedback helps us make the tool better for everyone.
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
            How would you rate your Word comparison experience?
          </label>
          <div style="
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-bottom: 20px;
          " id="star-rating">
            <button onclick="selectRating(1)" style="font-size: 1.5rem; background: none; border: none; cursor: pointer; padding: 5px;" data-rating="1">⭐</button>
            <button onclick="selectRating(2)" style="font-size: 1.5rem; background: none; border: none; cursor: pointer; padding: 5px;" data-rating="2">⭐</button>
            <button onclick="selectRating(3)" style="font-size: 1.5rem; background: none; border: none; cursor: pointer; padding: 5px;" data-rating="3">⭐</button>
            <button onclick="selectRating(4)" style="font-size: 1.5rem; background: none; border: none; cursor: pointer; padding: 5px;" data-rating="4">⭐</button>
            <button onclick="selectRating(5)" style="font-size: 1.5rem; background: none; border: none; cursor: pointer; padding: 5px;" data-rating="5">⭐</button>
          </div>

          <label style="
            display: block;
            font-size: 0.9rem;
            font-weight: 500;
            color: #374151;
            margin-bottom: 8px;
          ">
            Any suggestions for Word comparison features? (Optional)
          </label>
          <textarea
            id="word-feedback-comments"
            placeholder="Tell us what you think about our Word comparison tool..."
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
            onclick="closeWordFeedback(false)"
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
            onclick="submitWordFeedback()"
            style="
              padding: 10px 20px;
              border: none;
              background: linear-gradient(135deg, #059669, #047857);
              color: white;
              border-radius: 8px;
              font-size: 0.9rem;
              font-weight: 500;
              cursor: pointer;
            "
          >
            📝 Help Us Improve
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(popupContainer);

    // Global functions for popup interaction
    window.selectedWordRating = 0;
    
    window.selectRating = (rating) => {
      window.selectedWordRating = rating;
      const stars = document.querySelectorAll('#star-rating button');
      stars.forEach((star, index) => {
        star.style.opacity = index < rating ? '1' : '0.3';
      });
    };

    window.closeWordFeedback = (submitted = false) => {
      if (submitted) {
        localStorage.setItem('word_feedback_submitted', 'true');
      }
      const popup = document.getElementById('word-feedback-popup');
      if (popup) {
        popup.remove();
      }
    };

    window.submitWordFeedback = async () => {
      const rating = window.selectedWordRating || 0;
      const comments = document.getElementById('word-feedback-comments')?.value || '';
      const wordCount = parseInt(localStorage.getItem('word_comparison_count') || '3');
      
      try {
        const feedbackText = rating > 0 
          ? `Word Comparison Feedback (${rating}/5 stars): ${comments}`.trim()
          : `Word Comparison Feedback: ${comments}`.trim();

        const response = await fetch('/api/feedback/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            feedback_text: feedbackText,
            comparisonCount: wordCount,
            email: null,
            selected_reasons: []
          })
        });

        if (response.ok) {
          alert('Thank you for your feedback! This helps us improve VeriDiff for everyone. 🙏');
        } else {
          alert('Thank you for your feedback! (Note: There was an issue saving to our system, but we appreciate your input)');
        }
      } catch (error) {
        alert('Thank you for your feedback! (Note: There was an issue saving to our system, but we appreciate your input)');
      }
      
      window.closeWordFeedback(true);
    };
  };

  const handleWordComparison = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setProcessingProgress({
        stage: 'Initialization',
        progress: 0,
        message: 'Preparing for Word document comparison...',
        isActive: true
      });

      console.log('🔍 Starting Word document comparison process...');

      // Check mammoth.js availability
      if (typeof window === 'undefined') {
        throw new Error('Word processing is only available in browser environment');
      }

      // Load Word file data with enhanced debugging
      console.log('📁 Loading file data from sessionStorage...');
      const file1Data = sessionStorage.getItem('veridiff_file1_data');
      const file2Data = sessionStorage.getItem('veridiff_file2_data');

      console.log('📊 SessionStorage data check:', {
        file1DataExists: !!file1Data,
        file2DataExists: !!file2Data,
        file1DataLength: file1Data?.length || 0,
        file2DataLength: file2Data?.length || 0,
        file1DataPreview: file1Data ? file1Data.substring(0, 50) + '...' : 'null',
        file2DataPreview: file2Data ? file2Data.substring(0, 50) + '...' : 'null'
      });

      if (!file1Data || !file2Data) {
        throw new Error(
          'Word File Data Missing\n\n' +
          'The uploaded Word files are no longer available in memory.\n\n' +
          'For large files (25MB+), this can happen due to:\n' +
          '• Browser memory limitations\n' +
          '• Session timeout\n' +
          '• File size exceeding browser storage limits\n\n' +
          'Please return to upload page and try:\n' +
          '• Uploading smaller files (under 25MB each)\n' +
          '• Closing other browser tabs before uploading'
        );
      }

      console.log('📁 Converting Word file data for processing...');
      setProcessingProgress({
        stage: 'File Preparation',
        progress: 5,
        message: 'Converting file data for processing...',
        isActive: true
      });

      let file1Binary, file2Binary;

      try {
        console.log('🔄 Converting base64 to binary data...');
        
        // ENHANCED DEBUGGING - Check base64 data quality
        console.log('📊 Detailed File Analysis:');
        console.log('File 1 base64 length:', file1Data.length);
        console.log('File 2 base64 length:', file2Data.length);
        
        // Check if base64 looks valid
        const file1StartsCorrect = file1Data.startsWith('UEsD') || file1Data.startsWith('UEs');
        const file2StartsCorrect = file2Data.startsWith('UEsD') || file2Data.startsWith('UEs');
        console.log('Base64 starts with Word signature:', { file1StartsCorrect, file2StartsCorrect });
        
        // Clean base64 and convert
        const file1Base64Clean = file1Data.replace(/[^A-Za-z0-9+/=]/g, '');
        const file2Base64Clean = file2Data.replace(/[^A-Za-z0-9+/=]/g, '');
        
        console.log('Cleaned base64 lengths:', { 
          file1: file1Base64Clean.length, 
          file2: file2Base64Clean.length 
        });
        
        file1Binary = Uint8Array.from(atob(file1Base64Clean), c => c.charCodeAt(0));
        file2Binary = Uint8Array.from(atob(file2Base64Clean), c => c.charCodeAt(0));
        
        // CRITICAL DEBUG - Check file signatures
        const file1Signature = Array.from(file1Binary.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' ');
        const file2Signature = Array.from(file2Binary.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' ');
        
        console.log('🔍 CRITICAL - File Signatures:');
        console.log('File 1 signature:', file1Signature, '(should be: 50 4b 03 04)');
        console.log('File 2 signature:', file2Signature, '(should be: 50 4b 03 04)');
        
        const file1IsValidWord = file1Binary[0] === 0x50 && file1Binary[1] === 0x4B;
        const file2IsValidWord = file2Binary[0] === 0x50 && file2Binary[1] === 0x4B;
        
        console.log('Valid Word signatures:', { file1IsValidWord, file2IsValidWord });
        
        // If signatures are wrong, this is the problem
        if (!file1IsValidWord || !file2IsValidWord) {
          console.error('❌ FOUND THE ISSUE: Invalid file signatures!');
          console.log('Expected: 50 4b (PK) for .docx files');
          console.log('This means the files are not valid Word documents or the upload/storage process corrupted them');
          
          // Let's check what the files actually are
          const file1Chars = Array.from(file1Binary.slice(0, 8)).map(b => String.fromCharCode(b)).join('');
          const file2Chars = Array.from(file2Binary.slice(0, 8)).map(b => String.fromCharCode(b)).join('');
          console.log('File 1 starts with chars:', file1Chars);
          console.log('File 2 starts with chars:', file2Chars);
        }
        
        const size1 = (file1Binary.length/1024/1024).toFixed(1);
        const size2 = (file2Binary.length/1024/1024).toFixed(1);
        console.log(`📊 Word file sizes: ${size1}MB, ${size2}MB`);
        
        setProcessingProgress({
          stage: 'File Preparation',
          progress: 10,
          message: `Files ready: ${size1}MB + ${size2}MB. Starting Word engine...`,
          isActive: true
        });
        
      } catch (conversionError) {
        console.error('❌ File conversion error:', conversionError);
        throw new Error(
          'Word File Data Conversion Error\n\n' +
          'Failed to process the uploaded Word files.\n\n' +
          `Technical details: ${conversionError.message}`
        );
      }

      // ENHANCED MAMMOTH TESTING
      console.log('🧪 Testing mammoth.js with file data...');

      // Test if mammoth is available
      if (!window.mammoth) {
        console.error('❌ mammoth.js not available on window object');
        throw new Error('Mammoth.js library not loaded');
      }

      // Test with File 1
      console.log('🧪 Testing File 1 with mammoth...');
      try {
        const arrayBuffer1 = file1Binary.buffer;
        console.log('ArrayBuffer 1 details:', {
          byteLength: arrayBuffer1.byteLength,
          constructor: arrayBuffer1.constructor.name
        });
        
        const mammothResult1 = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer1 });
        console.log('🧪 Mammoth File 1 result:', {
          textLength: mammothResult1.text?.length || 0,
          hasText: !!mammothResult1.text,
          textPreview: mammothResult1.text ? mammothResult1.text.substring(0, 100) : 'NO TEXT',
          messagesCount: mammothResult1.messages?.length || 0,
          messages: mammothResult1.messages
        });
        
        if (!mammothResult1.text || mammothResult1.text.trim().length === 0) {
          console.error('❌ MAMMOTH FAILED - No text extracted from File 1');
          console.log('This suggests the file is not a valid Word document or is corrupted');
        }
        
      } catch (mammothError1) {
        console.error('❌ Mammoth test failed for File 1:', mammothError1);
      }

      // Test with File 2
      console.log('🧪 Testing File 2 with mammoth...');
      try {
        const arrayBuffer2 = file2Binary.buffer;
        const mammothResult2 = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer2 });
        console.log('🧪 Mammoth File 2 result:', {
          textLength: mammothResult2.text?.length || 0,
          hasText: !!mammothResult2.text,
          textPreview: mammothResult2.text ? mammothResult2.text.substring(0, 100) : 'NO TEXT',
          messagesCount: mammothResult2.messages?.length || 0,
          messages: mammothResult2.messages
        });
        
      } catch (mammothError2) {
        console.error('❌ Mammoth test failed for File 2:', mammothError2);
      }

      // Start the comparison process
      console.log('⚙️ Starting Word comparison engine...');
      
      const comparisonResults = await compareWordFiles(
        file1Binary.buffer, 
        file2Binary.buffer, 
        wordOptions
      );

      console.log('✅ Word comparison completed successfully');

      // Store results
      sessionStorage.setItem('veridiff_word_results', JSON.stringify(comparisonResults));
      sessionStorage.setItem('veridiff_comparison_type', 'word');
      sessionStorage.setItem('veridiff_word_options', JSON.stringify(wordOptions));

      // Word feedback system
      console.log('📝 Word FEEDBACK: Checking if feedback should be shown...');
      
      let wordComparisonCount = parseInt(localStorage.getItem('word_comparison_count') || '0');
      wordComparisonCount += 1;
      localStorage.setItem('word_comparison_count', wordComparisonCount.toString());
      
      const hasSubmittedFeedback = localStorage.getItem('word_feedback_submitted') === 'true';
      
      if (wordComparisonCount >= 3 && !hasSubmittedFeedback) {
        setTimeout(() => {
          showWordFeedbackPopup();
        }, 1000);
      }

      setProcessingProgress({
        stage: 'Complete',
        progress: 100,
        message: 'Comparison completed! Redirecting to results...',
        isActive: false
      });

      // Navigate to Word results
      setTimeout(() => {
        router.push('/word-results');
      }, 1500);

    } catch (error) {
      console.error('❌ Word comparison error:', error);
      
      let userMessage = error.message;
      
      if (error.message.includes('mammoth')) {
        userMessage = error.message + '\n\n⚠️ Technical Note: Word processing library issue.';
      } else if (error.message.includes('memory') || error.message.includes('Memory')) {
        userMessage = error.message + '\n\n💡 Suggestion: Try closing other applications and browser tabs.';
      }
      
      setError(userMessage);
      setIsLoading(false);
      setProcessingProgress({
        stage: 'Error',
        progress: 0,
        message: 'Processing failed',
        isActive: false
      });
    }
  };

  const renderLargeWordWarning = () => {
    if (!isLargeFile) return null;

    return (
      <div style={{
        background: '#f0fdf4',
        border: '2px solid #22c55e',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
          <div style={{ fontSize: '2rem' }}>📝</div>
          <div>
            <h3 style={{ margin: 0, color: '#166534', fontSize: '1.2rem', fontWeight: '600' }}>
              Large Word Documents Detected
            </h3>
            <p style={{ margin: '5px 0 0 0', color: '#166534', fontSize: '0.95rem' }}>
              Total size: {((fileInfo.file1?.size + fileInfo.file2?.size) / 1024 / 1024).toFixed(1)}MB
            </p>
          </div>
        </div>
        
        <div style={{ fontSize: '0.9rem', color: '#166534', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '12px' }}>
            <strong>Processing Information:</strong>
          </div>
          <ul style={{ margin: '0 0 15px 20px', padding: 0 }}>
            <li>Estimated processing time: <strong>{estimatedTime} - {estimatedTime * 2} minutes</strong></li>
            <li>Word documents process efficiently with mammoth.js</li>
            <li>Keep browser tab active during processing</li>
            <li>Large documents may contain complex formatting</li>
          </ul>
          
          <div style={{ marginBottom: '12px' }}>
            <strong>Optimization Tips:</strong>
          </div>
          <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
            <li>Close other browser tabs for better performance</li>
            <li>Use latest version of Chrome or Firefox</li>
            <li>Consider splitting very large documents (30MB+)</li>
            <li>Ensure sufficient system memory</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderProgressIndicator = () => {
    if (!processingProgress.isActive && processingProgress.progress === 0) return null;

    return (
      <div style={{
        background: 'white',
        border: '2px solid #059669',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '20px'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ margin: '0 0 5px 0', color: '#047857', fontSize: '1.2rem' }}>
            📝 {processingProgress.stage}
          </h3>
          <p style={{ margin: 0, color: '#059669', fontSize: '0.95rem' }}>
            {processingProgress.message}
          </p>
        </div>
        
        <div style={{
          background: '#d1fae5',
          borderRadius: '10px',
          height: '12px',
          overflow: 'hidden',
          marginBottom: '10px'
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #059669, #047857)',
            height: '100%',
            width: `${processingProgress.progress}%`,
            transition: 'width 0.3s ease',
            borderRadius: '10px'
          }} />
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.85rem',
          color: '#047857'
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
            marginTop: '15px',
            padding: '10px',
            background: '#ecfdf5',
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: '#047857'
          }}>
            📝 <strong>Large Document Processing:</strong> Please keep this tab active. 
            Large Word documents may take several minutes to process completely.
          </div>
        )}
      </div>
    );
  };

  const renderWordOptions = () => {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: '600',
          marginBottom: '20px',
          color: '#1f2937'
        }}>
          📝 Word Document Comparison Options
        </h3>

        {/* Progress Indicator */}
        {renderProgressIndicator()}

        {/* Large File Warning */}
        {renderLargeWordWarning()}

        {/* Word Options */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '25px'
        }}>
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.95rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '15px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={wordOptions.ignoreFormatting}
                onChange={(e) => setWordOptions(prev => ({
                  ...prev,
                  ignoreFormatting: e.target.checked
                }))}
                style={{ transform: 'scale(1.2)' }}
              />
              Ignore Formatting Differences
            </label>
            <p style={{
              fontSize: '0.85rem',
              color: '#6b7280',
              margin: '0 0 0 30px',
              lineHeight: '1.4'
            }}>
              Focus on text content changes rather than formatting like bold, italic, or font styles.
            </p>
          </div>

          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.95rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '15px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={wordOptions.paragraphLevel}
                onChange={(e) => setWordOptions(prev => ({
                  ...prev,
                  paragraphLevel: e.target.checked
                }))}
                style={{ transform: 'scale(1.2)' }}
              />
              Paragraph-Level Analysis
            </label>
            <p style={{
              fontSize: '0.85rem',
              color: '#6b7280',
              margin: '0 0 0 30px',
              lineHeight: '1.4'
            }}>
              Compare documents paragraph-by-paragraph for detailed analysis and better organization.
            </p>
          </div>
        </div>

        {/* Document Information */}
        <div style={{
          background: '#f8fafc',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#1f2937'
          }}>
            📝 Document Information
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            fontSize: '0.9rem'
          }}>
            <div>
              <strong>File 1:</strong> {fileInfo.file1?.name}
              <br />
              <span style={{ color: '#6b7280' }}>
                Size: {fileInfo.file1 ? (fileInfo.file1.size / 1024 / 1024).toFixed(1) : 0}MB
                {fileInfo.file1 && fileInfo.file1.size > 25 * 1024 * 1024 && 
                  <span style={{ color: '#059669', fontWeight: '600' }}> (Large)</span>
                }
              </span>
            </div>
            <div>
              <strong>File 2:</strong> {fileInfo.file2?.name}
              <br />
              <span style={{ color: '#6b7280' }}>
                Size: {fileInfo.file2 ? (fileInfo.file2.size / 1024 / 1024).toFixed(1) : 0}MB
                {fileInfo.file2 && fileInfo.file2.size > 25 * 1024 * 1024 && 
                  <span style={{ color: '#059669', fontWeight: '600' }}> (Large)</span>
                }
              </span>
            </div>
          </div>
          
          {isLargeFile && (
            <div style={{
              marginTop: '10px',
              padding: '8px',
              background: '#ecfdf5',
              borderRadius: '4px',
              fontSize: '0.85rem',
              color: '#047857'
            }}>
              📝 Large documents detected. Processing may take {estimatedTime}-{estimatedTime * 2} minutes.
            </div>
          )}
        </div>

        {/* Compare Button */}
        <button
          onClick={handleWordComparison}
          disabled={isLoading || processingProgress.isActive}
          style={{
            background: (isLoading || processingProgress.isActive) 
              ? '#9ca3af' 
              : isLargeFile 
                ? 'linear-gradient(135deg, #059669, #047857)'
                : 'linear-gradient(135deg, #059669, #047857)',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: (isLoading || processingProgress.isActive) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto'
          }}
        >
          {processingProgress.isActive ? (
            <>
              <span>⏳</span>
              Processing Word Documents...
            </>
          ) : isLoading ? (
            <>
              <span>⏳</span>
              Initializing...
            </>
          ) : (
            <>
              <span>{isLargeFile ? '📝' : '📄'}</span>
              {isLargeFile ? 'Start Large Document Comparison' : 'Compare Word Documents'}
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
          <title>Word Comparison Error - VeriDiff</title>
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
              borderRadius: '12px',
              padding: '40px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>❌</div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#dc2626',
                marginBottom: '15px'
              }}>
                Word Comparison Error
              </h1>
              <p style={{
                color: '#6b7280',
                marginBottom: '25px',
                lineHeight: '1.6',
                whiteSpace: 'pre-line'
              }}>
                {error}
              </p>
              <button
                onClick={() => router.push('/')}
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
        <title>Word Document Comparison Setup - VeriDiff</title>
        <meta name="description" content="Configure your Word document comparison settings and options" />
      </Head>
      
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Header />
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px'
        }}>
          {/* Header Section */}
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
              {isLargeFile ? '📝 Large Word Document Comparison' : '📝 Word Document Comparison'}
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              {isLargeFile
                ? 'Configure your large Word document comparison settings'
                : 'Configure your Word document comparison settings'
              }
            </p>
          </div>

          {/* Loading State */}
          {isLoading && !processingProgress.isActive && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                marginBottom: '10px',
                color: '#1f2937'
              }}>
                {isLargeFile ? 'Preparing Large Document Processing...' : 'Processing Word Documents...'}
              </h3>
              <p style={{ color: '#6b7280' }}>
                {isLargeFile 
                  ? 'Initializing large document processing and checking system resources...'
                  : 'Analyzing document structure and extracting text content'
                }
              </p>
            </div>
          )}

          {/* Word Options */}
          {!isLoading && renderWordOptions()}
        </div>
        
        <Footer />
      </div>
    </>
  );
}
