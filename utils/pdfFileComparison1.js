// utils/pdfFileComparison1.js
// ENHANCED PDF.js IMPLEMENTATION WITH ROBUST ERROR HANDLING

// Enhanced PDF.js availability checker with better error handling
const waitForPDFJS = (maxWaitTime = 30000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let checkCount = 0;
    
    function checkPDFJS() {
      checkCount++;
      
      if (checkCount <= 3 || checkCount % 5 === 0) {
        console.log(`🔍 PDF.js availability check #${checkCount}`);
      }
      
      // Check for explicit error state first
      if (window.pdfJsError) {
        const errorMsg = window.pdfJsErrorMessage || 'PDF.js library failed to load';
        console.error('❌ PDF.js error state detected:', errorMsg);
        reject(new Error(
          'PDF Processing Engine Unavailable\n\n' +
          'The PDF processing library failed to load properly.\n\n' +
          'This can happen due to:\n' +
          '• Poor internet connection\n' +
          '• Ad blockers or browser extensions blocking resources\n' +
          '• Corporate firewall restrictions\n' +
          '• CDN service interruptions\n\n' +
          'Solutions to try:\n' +
          '• Refresh the page and wait 30-60 seconds\n' +
          '• Disable ad blockers temporarily\n' +
          '• Try a different browser or incognito mode\n' +
          '• Check your internet connection\n' +
          '• Contact support if the problem persists\n\n' +
          'Technical details: ' + errorMsg
        ));
        return;
      }
      
      // Enhanced validation - check for all required components
      if (typeof window !== 'undefined' && 
          window.pdfjsLib && 
          window.pdfjsLib.getDocument &&
          window.pdfjsLib.GlobalWorkerOptions &&
          window.pdfJsReady) {
        
        try {
          // Additional validation - test worker configuration
          const workerSrc = window.pdfjsLib.GlobalWorkerOptions.workerSrc;
          if (!workerSrc) {
            throw new Error('PDF.js worker not configured');
          }
          
          // Test basic functionality
          if (typeof window.pdfjsLib.getDocument !== 'function') {
            throw new Error('PDF.js getDocument function not available');
          }
          
          console.log('✅ PDF.js is ready and functional');
          resolve(window.pdfjsLib);
          return;
          
        } catch (testError) {
          console.warn('⚠️ PDF.js loaded but functionality test failed:', testError);
          // Continue checking rather than failing immediately
        }
      }
      
      const elapsed = Date.now() - startTime;
      if (elapsed >= maxWaitTime) {
        const timeoutMsg = `PDF.js library not available after ${maxWaitTime/1000} seconds`;
        console.error('❌', timeoutMsg);
        
        reject(new Error(
          'PDF Processing Timeout\n\n' +
          'The PDF processing engine did not load within the expected time.\n\n' +
          'This usually indicates:\n' +
          '• Slow internet connection\n' +
          '• Network connectivity issues\n' +
          '• Browser blocking external resources\n' +
          '• High server load\n\n' +
          'Please try:\n' +
          '• Refreshing the page and waiting longer\n' +
          '• Checking your internet connection speed\n' +
          '• Using a different browser\n' +
          '• Trying again in a few minutes\n\n' +
          `Timeout after: ${maxWaitTime/1000} seconds`
        ));
        return;
      }
      
      // Progressive backoff with status updates
      const baseDelay = 200;
      const maxDelay = 2000;
      const delay = Math.min(baseDelay * Math.pow(1.2, checkCount), maxDelay);
      
      if (checkCount % 10 === 0) {
        const remainingTime = Math.round((maxWaitTime - elapsed) / 1000);
        console.log(`⏳ Still waiting for PDF.js... (${remainingTime}s remaining)`);
      }
      
      setTimeout(checkPDFJS, delay);
    }
    
    // Start checking immediately
    checkPDFJS();
  });
};

// Enhanced file reading with comprehensive validation
const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    console.log('📁 Reading PDF file:', file?.name);
    
    // Basic file validation
    if (!file) {
      reject(new Error('No file provided for PDF processing'));
      return;
    }

    if (file.size === 0) {
      reject(new Error('PDF file is empty (0 bytes)'));
      return;
    }

    if (file.size > 200 * 1024 * 1024) { // 200MB limit
      reject(new Error(
        `PDF file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB).\n\n` +
        'Maximum supported size is 200MB.\n' +
        'Please try:\n' +
        '• Compressing the PDF file\n' +
        '• Splitting large documents into smaller files\n' +
        '• Using a PDF optimization tool'
      ));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        
        // Enhanced PDF validation
        const bytes = new Uint8Array(arrayBuffer);
        if (bytes.length < 8) {
          reject(new Error('File is too small to be a valid PDF document (less than 8 bytes)'));
          return;
        }
        
        // Check for PDF magic bytes (%PDF)
        if (bytes[0] !== 37 || bytes[1] !== 80 || bytes[2] !== 68 || bytes[3] !== 70) {
          reject(new Error(
            'Invalid PDF File Format\n\n' +
            'The selected file does not appear to be a valid PDF document.\n' +
            'The file header is missing the required PDF signature.\n\n' +
            'Please ensure:\n' +
            '• The file has a .pdf extension\n' +
            '• The file was not corrupted during download/transfer\n' +
            '• The file is actually a PDF and not renamed from another format\n' +
            '• Try opening the file in a PDF viewer to verify it works'
          ));
          return;
        }
        
        // Validate PDF version (optional but helpful)
        const headerStr = new TextDecoder().decode(bytes.slice(0, Math.min(32, bytes.length)));
        if (!headerStr.includes('PDF-')) {
          console.warn('⚠️ PDF version information not found in expected location');
        }
        
        console.log('✅ PDF file validated and read successfully');
        console.log(`📊 File size: ${(arrayBuffer.byteLength / 1024).toFixed(1)}KB`);
        resolve(arrayBuffer);
        
      } catch (error) {
        console.error('❌ PDF file processing error:', error);
        reject(new Error(`Failed to process PDF file: ${error.message}`));
      }
    };
    
    reader.onerror = (e) => {
      console.error('❌ FileReader error:', e);
      reject(new Error(
        `Failed to read PDF file "${file.name}"\n\n` +
        'This could be caused by:\n' +
        '• File corruption\n' +
        '• Insufficient memory\n' +
        '• File being used by another application\n' +
        '• Browser security restrictions\n\n' +
        'Please try:\n' +
        '• Closing other applications\n' +
        '• Using a smaller PDF file\n' +
        '• Restarting your browser'
      ));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Enhanced PDF text extraction with comprehensive error handling
const extractTextFromPDF = async (arrayBuffer, fileName) => {
  let pdf = null;
  
  try {
    console.log('🔍 Starting enhanced PDF text extraction for:', fileName);
    
    // Wait for PDF.js with enhanced error handling
    const pdfjsLib = await waitForPDFJS(45000); // Increased timeout
    
    // Load PDF document with enhanced configuration
    try {
      console.log('📚 Loading PDF document with enhanced settings...');
      
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0, // Reduce console noise
        maxImageSize: 2 * 1024 * 1024, // 2MB max for images
        disableFontFace: true, // Better compatibility
        disableRange: false, // Allow range requests
        disableStream: false, // Allow streaming
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
        enableXfa: false, // Disable XFA forms
        useSystemFonts: false, // Use embedded fonts
        useWorkerFetch: false, // Better compatibility
        isEvalSupported: false, // Security
        fontExtraProperties: false // Performance
      });
      
      // Enhanced timeout with progress tracking
      const loadTimeout = setTimeout(() => {
        try {
          loadingTask.destroy();
        } catch (destroyError) {
          console.warn('⚠️ Error destroying PDF loading task:', destroyError);
        }
        throw new Error(
          'PDF Document Loading Timeout\n\n' +
          'The PDF document took too long to load (60+ seconds).\n\n' +
          'This usually happens with:\n' +
          '• Very large PDF files (try files under 50MB)\n' +
          '• Complex PDFs with many images or forms\n' +
          '• Heavily encrypted or secured PDFs\n' +
          '• Network connectivity issues\n\n' +
          'Suggestions:\n' +
          '• Try a smaller or simpler PDF file\n' +
          '• Ensure stable internet connection\n' +
          '• Split large documents into smaller sections\n' +
          '• Try a different PDF if possible'
        );
      }, 60000);
      
      pdf = await loadingTask.promise;
      clearTimeout(loadTimeout);
      
    } catch (loadError) {
      console.error('❌ PDF loading error:', loadError);
      
      // Enhanced error categorization
      const errorMsg = loadError.message.toLowerCase();
      
      if (errorMsg.includes('invalid pdf') || errorMsg.includes('not a pdf')) {
        throw new Error(
          'Invalid PDF Document\n\n' +
          'The file appears to be corrupted or is not a valid PDF.\n\n' +
          'Possible causes:\n' +
          '• File was corrupted during download or transfer\n' +
          '• File is not actually a PDF (wrong file type)\n' +
          '• PDF was created with non-standard tools\n' +
          '• File is incomplete or truncated\n\n' +
          'Solutions:\n' +
          '• Try re-downloading the original PDF\n' +
          '• Open the file in a PDF viewer to verify it works\n' +
          '• Try converting the file to PDF again\n' +
          '• Use a different PDF file for testing'
        );
      } else if (errorMsg.includes('password') || errorMsg.includes('encrypted')) {
        throw new Error(
          'Password-Protected PDF\n\n' +
          'This PDF requires a password or contains encryption that prevents processing.\n\n' +
          'Our comparison tool cannot process:\n' +
          '• Password-protected PDFs\n' +
          '• Encrypted PDF documents\n' +
          '• Digitally signed PDFs with restrictions\n\n' +
          'Please provide an unprotected version of the document or remove the password protection.'
        );
      } else if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
        throw new Error(loadError.message); // Pass through enhanced timeout message
      } else {
        throw new Error(
          `PDF Loading Failed\n\n` +
          `The PDF document could not be loaded due to: ${loadError.message}\n\n` +
          'This might be caused by:\n' +
          '• Unsupported PDF version or features\n' +
          '• Corrupted PDF structure\n' +
          '• Browser compatibility issues\n' +
          '• Memory limitations\n\n' +
          'Please try:\n' +
          '• Using a different PDF file\n' +
          '• Converting the PDF to a newer format\n' +
          '• Reducing the PDF file size\n' +
          '• Refreshing the page and trying again'
        );
      }
    }
    
    console.log(`📄 PDF loaded successfully. Pages: ${pdf.numPages}`);
    
    // Validate PDF structure
    if (pdf.numPages === 0) {
      throw new Error('PDF contains no pages or all pages are inaccessible');
    }
    
    if (pdf.numPages > 2000) {
      throw new Error(
        `PDF Too Large\n\n` +
        `This PDF has ${pdf.numPages} pages, which exceeds our processing limit of 2000 pages.\n\n` +
        'For large documents, please consider:\n' +
        '• Splitting the PDF into smaller sections\n' +
        '• Comparing specific page ranges\n' +
        '• Using a document management system for bulk comparisons'
      );
    }
    
    if (pdf.numPages > 500) {
      console.warn(`⚠️ Large PDF detected (${pdf.numPages} pages). Processing may take 5-10 minutes.`);
    }
    
    // Extract text from all pages
    const pages = [];
    let totalCharacters = 0;
    let totalWords = 0;
    let successfulPages = 0;
    let failedPages = 0;
    const startTime = Date.now();
    
    console.log(`📃 Starting text extraction from ${pdf.numPages} pages...`);
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        // Progress logging for large documents
        if (pageNum % 25 === 0 || pageNum === 1 || pageNum === pdf.numPages) {
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          const progress = Math.round((pageNum / pdf.numPages) * 100);
          console.log(`📃 Processing page ${pageNum}/${pdf.numPages} (${progress}% - ${elapsed}s elapsed)`);
        }
        
        const page = await pdf.getPage(pageNum);
        
        // Enhanced text extraction with multiple fallback strategies
        let textContent;
        try {
          // Primary extraction strategy with timeout
          const extractionPromise = page.getTextContent({
            normalizeWhitespace: true,
            disableCombineTextItems: false,
            includeMarkedContent: false
          });
          
          const pageTimeout = setTimeout(() => {
            throw new Error(`Page ${pageNum} text extraction timed out`);
          }, 30000); // 30 second timeout per page
          
          textContent = await extractionPromise;
          clearTimeout(pageTimeout);
          
        } catch (pageExtractionError) {
          console.warn(`⚠️ Primary extraction failed for page ${pageNum}, trying fallback...`);
          
          // Fallback extraction strategy
          try {
            textContent = await page.getTextContent({
              normalizeWhitespace: false,
              disableCombineTextItems: true,
              includeMarkedContent: true
            });
          } catch (fallbackError) {
            throw new Error(`Text extraction failed: ${pageExtractionError.message}`);
          }
        }
        
        // Enhanced text processing with improved paragraph detection
        let pageText = '';
        let paragraphs = [];
        let currentParagraph = '';
        const lineThreshold = 10; // Threshold for paragraph detection
        let currentY = null;
        
        if (textContent.items && textContent.items.length > 0) {
          // Sort items by position for proper reading order
          const sortedItems = textContent.items.sort((a, b) => {
            const yDiff = b.transform[5] - a.transform[5]; // Y coordinate (top to bottom)
            if (Math.abs(yDiff) > lineThreshold) {
              return yDiff;
            }
            return a.transform[4] - b.transform[4]; // X coordinate (left to right)
          });
          
          for (const item of sortedItems) {
            const text = item.str.trim();
            if (!text) continue;
            
            const itemY = item.transform[5];
            
            // Detect paragraph breaks
            if (currentY !== null && Math.abs(itemY - currentY) > lineThreshold) {
              if (currentParagraph.trim()) {
                paragraphs.push({
                  text: currentParagraph.trim(),
                  paragraph_index: paragraphs.length,
                  y_position: currentY,
                  char_count: currentParagraph.trim().length
                });
                currentParagraph = '';
              }
            }
            
            // Add text with appropriate spacing
            const needsSpace = currentParagraph && 
                              !currentParagraph.endsWith(' ') && 
                              !currentParagraph.endsWith('\n') &&
                              !text.startsWith(' ');
            currentParagraph += (needsSpace ? ' ' : '') + text;
            currentY = itemY;
            pageText += text + ' ';
          }
          
          // Add final paragraph
          if (currentParagraph.trim()) {
            paragraphs.push({
              text: currentParagraph.trim(),
              paragraph_index: paragraphs.length,
              y_position: currentY,
              char_count: currentParagraph.trim().length
            });
          }
        }
        
        // Handle empty pages gracefully
        if (paragraphs.length === 0) {
          paragraphs.push({
            text: pageText.trim() || '[This page appears to be empty or contains only images/graphics]',
            paragraph_index: 0,
            y_position: 0,
            char_count: pageText.trim().length
          });
        }
        
        const words = pageText.trim().split(/\s+/).filter(w => w.length > 0);
        totalWords += words.length;
        totalCharacters += pageText.length;
        successfulPages++;
        
        pages.push({
          page_number: pageNum,
          paragraphs: paragraphs,
          word_count: words.length,
          character_count: pageText.length,
          raw_text: pageText.trim(),
          processing_status: 'success'
        });
        
      } catch (pageError) {
        console.warn(`⚠️ Error processing page ${pageNum}:`, pageError.message);
        failedPages++;
        
        // Add error page to maintain page numbering
        pages.push({
          page_number: pageNum,
          paragraphs: [{
            text: `[Error processing page ${pageNum}: ${pageError.message}]`,
            paragraph_index: 0,
            y_position: 0,
            char_count: 0
          }],
          word_count: 0,
          character_count: 0,
          raw_text: '',
          processing_status: 'error',
          error_message: pageError.message
        });
      }
    }
    
    const processingTime = Date.now() - startTime;
    
    // Generate comprehensive metadata
    const metadata = {
      fileName: fileName,
      fileSize: arrayBuffer.byteLength,
      totalPages: pdf.numPages,
      successfulPages: successfulPages,
      failedPages: failedPages,
      totalWords: totalWords,
      totalCharacters: totalCharacters,
      isValidPDF: true,
      extractionMethod: 'PDF.js Enhanced v3.11.174',
      processingDate: new Date().toISOString(),
      processingTimeMs: processingTime,
      averageWordsPerPage: successfulPages > 0 ? Math.round(totalWords / successfulPages) : 0,
      successRate: Math.round((successfulPages / pdf.numPages) * 100),
      processingSpeed: Math.round(pdf.numPages / (processingTime / 1000)) // pages per second
    };
    
    console.log('✅ PDF text extraction completed successfully:');
    console.log(`  📊 Pages: ${pages.length} (${successfulPages} successful, ${failedPages} failed)`);
    console.log(`  📝 Words: ${totalWords.toLocaleString()}`);
    console.log(`  🔤 Characters: ${totalCharacters.toLocaleString()}`);
    console.log(`  ⚡ Speed: ${metadata.processingSpeed} pages/second`);
    console.log(`  ✅ Success Rate: ${metadata.successRate}%`);
    console.log(`  ⏱️ Total Time: ${(processingTime/1000).toFixed(1)}s`);
    
    // Quality warnings
    if (failedPages > pdf.numPages * 0.2) { // More than 20% failed
      console.warn(`⚠️ High page failure rate: ${failedPages}/${pdf.numPages} pages failed`);
    }
    
    if (totalWords === 0) {
      console.warn('⚠️ No text content found. This may be an image-only PDF.');
    }
    
    return {
      metadata: metadata,
      pages: pages,
      raw: arrayBuffer
    };
    
  } catch (error) {
    console.error('❌ PDF text extraction failed:', error);
    throw error;
  } finally {
    // Clean up PDF resources
    if (pdf) {
      try {
        pdf.destroy();
        console.log('🧹 PDF resources cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️ PDF cleanup warning:', cleanupError);
      }
    }
  }
};

// Main PDF parsing function with comprehensive error handling
export const parsePDFFile = async (file) => {
  console.log('🔧 Starting enhanced PDF parsing for:', file?.name);
  
  try {
    // Enhanced file type validation
    if (file.type && !file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error(
        'Invalid File Type\n\n' +
        'Please select a valid PDF file with .pdf extension.\n' +
        `Selected file type: ${file.type || 'unknown'}\n` +
        `File name: ${file.name}`
      );
    }
    
    let arrayBuffer;
    
    if (file instanceof ArrayBuffer) {
      arrayBuffer = file;
    } else {
      arrayBuffer = await readFileAsArrayBuffer(file);
    }
    
    // Extract text using enhanced PDF.js implementation
    const result = await extractTextFromPDF(arrayBuffer, file.name || 'document.pdf');
    
    console.log('✅ PDF parsing completed successfully');
    return result;
    
  } catch (error) {
    console.error('❌ PDF parsing failed:', error);
    throw error; // Re-throw the detailed error messages
  }
};

// Enhanced PDF comparison with improved error handling
export const comparePDFFiles = async (pdf1, pdf2, options = {}) => {
  console.log('🔄 Starting enhanced PDF comparison');
  console.log('🎛️ Comparison options:', options);
  
  const {
    compareMode = 'text',
    ignoreFormatting = true,
    pageByPage = true,
    includeImages = false
  } = options;
  
  try {
    console.log('📖 Parsing both PDF files...');
    const startTime = Date.now();
    
    // Parse both PDFs with enhanced progress indication
    const [data1, data2] = await Promise.all([
      parsePDFFile(pdf1).catch(error => {
        throw new Error(`First PDF Error:\n${error.message}`);
      }),
      parsePDFFile(pdf2).catch(error => {
        throw new Error(`Second PDF Error:\n${error.message}`);
      })
    ]);
    
    const parseTime = Date.now() - startTime;
    console.log(`📊 Both PDFs parsed successfully in ${(parseTime/1000).toFixed(1)}s`);
    console.log(`  File 1: ${data1.pages.length} pages, ${data1.metadata.totalWords} words`);
    console.log(`  File 2: ${data2.pages.length} pages, ${data2.metadata.totalWords} words`);
    
    // Quality checks
    if (data1.metadata.totalWords === 0 && data2.metadata.totalWords === 0) {
      console.warn('⚠️ Both PDFs contain no extractable text');
    }
    
    // Start detailed comparison
    console.log('🔍 Starting detailed content comparison...');
    const comparisonStartTime = Date.now();
    
    const text_changes = [];
    const page_differences = [];
    let totalElements = 0;
    let differences = 0;
    let matches = 0;
    
    const maxPages = Math.max(data1.pages.length, data2.pages.length);
    
    // Page-by-page comparison with enhanced logic
    for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
      const page1 = data1.pages[pageIndex];
      const page2 = data2.pages[pageIndex];
      const pageNum = pageIndex + 1;
      
      let pageChanges = 0;
      
      if (!page1 && page2) {
        // Page added in second document
        pageChanges = page2.paragraphs.length;
        differences += pageChanges;
        totalElements += page2.paragraphs.length;
        
        page2.paragraphs.forEach((para, paraIndex) => {
          text_changes.push({
            page: pageNum,
            paragraph: paraIndex,
            type: 'added',
            text: para.text,
            file: 'file2',
            char_count: para.char_count || para.text.length
          });
        });
        
      } else if (page1 && !page2) {
        // Page removed in second document
        pageChanges = page1.paragraphs.length;
        differences += pageChanges;
        totalElements += page1.paragraphs.length;
        
        page1.paragraphs.forEach((para, paraIndex) => {
          text_changes.push({
            page: pageNum,
            paragraph: paraIndex,
            type: 'removed',
            text: para.text,
            file: 'file1',
            char_count: para.char_count || para.text.length
          });
        });
        
      } else if (page1 && page2) {
        // Compare existing pages
        const maxParas = Math.max(page1.paragraphs.length, page2.paragraphs.length);
        totalElements += maxParas;
        
        for (let paraIndex = 0; paraIndex < maxParas; paraIndex++) {
          const para1 = page1.paragraphs[paraIndex];
          const para2 = page2.paragraphs[paraIndex];
          
          if (!para1 && para2) {
            pageChanges++;
            differences++;
            text_changes.push({
              page: pageNum,
              paragraph: paraIndex,
              type: 'added',
              text: para2.text,
              file: 'file2',
              char_count: para2.char_count || para2.text.length
            });
          } else if (para1 && !para2) {
            pageChanges++;
            differences++;
            text_changes.push({
              page: pageNum,
              paragraph: paraIndex,
              type: 'removed',
              text: para1.text,
              file: 'file1',
              char_count: para1.char_count || para1.text.length
            });
          } else if (para1 && para2) {
            // Enhanced text comparison
            let text1 = para1.text;
            let text2 = para2.text;
            
            if (ignoreFormatting) {
              text1 = text1.replace(/\s+/g, ' ').trim();
              text2 = text2.replace(/\s+/g, ' ').trim();
            }
            
            // Skip error messages in comparison
            const isError1 = text1.startsWith('[Error') || text1.startsWith('[This page appears');
            const isError2 = text2.startsWith('[Error') || text2.startsWith('[This page appears');
            
            if (isError1 && isError2) {
              matches++; // Both are placeholders, consider them matching
            } else if (isError1 || isError2) {
              pageChanges++;
              differences++;
              text_changes.push({
                page: pageNum,
                paragraph: paraIndex,
                type: 'modified',
                old_text: para1.text,
                new_text: para2.text,
                file: 'both',
                char_count_old: para1.char_count || para1.text.length,
                char_count_new: para2.char_count || para2.text.length
              });
            } else if (text1 !== text2) {
              pageChanges++;
              differences++;
              text_changes.push({
                page: pageNum,
                paragraph: paraIndex,
                type: 'modified',
                old_text: para1.text,
                new_text: para2.text,
                file: 'both',
                char_count_old: para1.char_count || para1.text.length,
                char_count_new: para2.char_count || para2.text.length
              });
            } else {
              matches++;
            }
          }
        }
      }
      
      if (pageChanges > 0) {
        page_differences.push({
          page_number: pageNum,
          changes_count: pageChanges,
          summary: `${pageChanges} change${pageChanges > 1 ? 's' : ''} detected`,
          page1_paragraphs: page1?.paragraphs.length || 0,
          page2_paragraphs: page2?.paragraphs.length || 0
        });
      }
    }
    
    const comparisonTime = Date.now() - comparisonStartTime;
    const totalTime = parseTime + comparisonTime;
    
    // Calculate enhanced similarity metrics
    const totalComparisons = differences + matches;
    const similarity_score = totalComparisons > 0 ? Math.round((matches / totalComparisons) * 100) : 100;
    
    // Word-level analysis
    const wordChanges = {
      file1_words: data1.metadata.totalWords,
      file2_words: data2.metadata.totalWords,
      word_difference: Math.abs(data1.metadata.totalWords - data2.metadata.totalWords),
      word_change_percentage: data1.metadata.totalWords > 0 ? 
        Math.round((Math.abs(data1.metadata.totalWords - data2.metadata.totalWords) / data1.metadata.totalWords) * 100) : 0
    };
    
    // Comprehensive results
    const results = {
      // Core metrics
      differences_found: differences,
      matches_found: matches,
      total_pages: maxPages,
      total_elements: totalElements,
      similarity_score: similarity_score,
      
      // Detailed changes
      text_changes: text_changes,
      page_differences: page_differences,
      
      // File data
      file1_pages: data1.pages,
      file2_pages: data2.pages,
      file1_metadata: data1.metadata,
      file2_metadata: data2.metadata,
      
      // Change type counts
      added_count: text_changes.filter(c => c.type === 'added').length,
      removed_count: text_changes.filter(c => c.type === 'removed').length,
      modified_count: text_changes.filter(c => c.type === 'modified').length,
      
      // Word analysis
      word_changes: wordChanges,
      
      // Enhanced metadata
      comparison_type: 'pdf_document',
      comparison_options: options,
      processing_note: `Enhanced PDF comparison using PDF.js v3.11.174 with ${data1.metadata.successRate}%/${data2.metadata.successRate}% success rates`,
      processing_time: {
        parse_time_ms: parseTime,
        comparison_time_ms: comparisonTime,
        total_time_ms: totalTime
      },
      
      // Quality metrics
      quality_metrics: {
        file1_success_rate: data1.metadata.successfulPages / data1.metadata.totalPages,
        file2_success_rate: data2.metadata.successfulPages / data2.metadata.totalPages,
        overall_success_rate: (data1.metadata.successfulPages + data2.metadata.successfulPages) / 
                             (data1.metadata.totalPages + data2.metadata.totalPages),
        processing_speed_pages_per_second: Math.round((data1.metadata.totalPages + data2.metadata.totalPages) / (totalTime / 1000))
      }
    };
    
    console.log('✅ PDF comparison completed successfully:');
    console.log(`  📊 Similarity: ${results.similarity_score}%`);
    console.log(`  🔍 Changes: ${results.differences_found}`);
    console.log(`  ✅ Matches: ${results.matches_found}`);
    console.log(`  ⏱️ Total Time: ${(totalTime/1000).toFixed(1)}s`);
    console.log(`  🚀 Speed: ${results.quality_metrics.processing_speed_pages_per_second} pages/s`);
    
    return results;
    
  } catch (error) {
    console.error('❌ PDF comparison failed:', error);
    throw error; // Re-throw with enhanced error details
  }
};
