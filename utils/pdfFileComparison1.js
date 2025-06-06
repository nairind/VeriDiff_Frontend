// utils/pdfFileComparison1.js
// ENHANCED PDF.js IMPLEMENTATION WITH MULTIPLE FALLBACK STRATEGIES

// Enhanced PDF.js availability checker with multiple validation levels
const waitForPDFJS = (maxWaitTime = 25000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let checkCount = 0;
    
    function checkPDFJS() {
      checkCount++;
      console.log(`🔍 PDF.js check attempt ${checkCount}`);
      
      // Enhanced validation - check for all required components
      if (typeof window !== 'undefined' && 
          window.pdfjsLib && 
          window.pdfjsLib.getDocument &&
          window.pdfjsLib.GlobalWorkerOptions &&
          window.pdfJsReady) {
        
        console.log('✅ PDF.js is ready for use');
        
        // Additional validation - test basic functionality
        try {
          const testWorkerSrc = window.pdfjsLib.GlobalWorkerOptions.workerSrc;
          if (!testWorkerSrc) {
            throw new Error('Worker source not configured');
          }
          console.log('✅ PDF.js worker is properly configured');
          resolve(window.pdfjsLib);
          return;
        } catch (testError) {
          console.warn('⚠️ PDF.js loaded but worker configuration issue:', testError);
          // Continue checking...
        }
      }
      
      // Check for error state
      if (window.pdfJsError) {
        reject(new Error(
          'PDF.js library failed to load properly. This could be due to:\n' +
          '• Network connectivity issues\n' +
          '• Ad blockers or browser extensions\n' +
          '• Firewall restrictions\n' +
          '• Content Security Policy restrictions\n\n' +
          'Please try refreshing the page or disabling ad blockers temporarily.'
        ));
        return;
      }
      
      const elapsed = Date.now() - startTime;
      if (elapsed >= maxWaitTime) {
        reject(new Error(
          `PDF.js library not available after ${maxWaitTime/1000} seconds.\n\n` +
          'Possible causes:\n' +
          '• Poor internet connection\n' +
          '• CDN service interruption\n' +
          '• Browser blocking external resources\n' +
          '• Corporate firewall restrictions\n\n' +
          'Solutions:\n' +
          '• Refresh the page and wait for better connectivity\n' +
          '• Try a different browser or incognito mode\n' +
          '• Disable ad blockers temporarily\n' +
          '• Contact support if problem persists'
        ));
        return;
      }
      
      // Progressive backoff with status logging
      const waitTime = Math.min(500 + (checkCount * 100), 2000);
      if (checkCount % 5 === 0) {
        console.log(`⏳ Still waiting for PDF.js... (${Math.round(elapsed/1000)}s elapsed)`);
      }
      setTimeout(checkPDFJS, waitTime);
    }
    
    checkPDFJS();
  });
};

// Enhanced file reading with validation
const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    console.log('📁 Reading PDF file:', file?.name);
    
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (file.size === 0) {
      reject(new Error('PDF file is empty'));
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit for PDFs
      reject(new Error(`PDF file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 100MB.`));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        
        // Enhanced PDF validation - check for PDF signature
        const bytes = new Uint8Array(arrayBuffer);
        if (bytes.length < 8) {
          reject(new Error('File is too small to be a valid PDF document.'));
          return;
        }
        
        // Check for PDF magic bytes (%PDF)
        if (bytes[0] !== 37 || bytes[1] !== 80 || bytes[2] !== 68 || bytes[3] !== 70) {
          reject(new Error(
            'File is not a valid PDF document. The file header is missing or corrupted.\n\n' +
            'Please ensure you have selected a proper PDF file.'
          ));
          return;
        }
        
        // Check for PDF version in header
        let versionFound = false;
        for (let i = 4; i < Math.min(16, bytes.length); i++) {
          if (bytes[i] === 45) { // hyphen character
            versionFound = true;
            break;
          }
        }
        
        if (!versionFound) {
          console.warn('⚠️ PDF version information not found in expected location, but proceeding...');
        }
        
        console.log('✅ PDF file read successfully, size:', arrayBuffer.byteLength);
        resolve(arrayBuffer);
      } catch (error) {
        console.error('❌ PDF file reading error:', error);
        reject(new Error('Failed to process PDF file content: ' + error.message));
      }
    };
    
    reader.onerror = (e) => {
      console.error('❌ FileReader error:', e);
      reject(new Error(`Failed to read PDF file "${file.name}". The file may be corrupted or in use by another application.`));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Enhanced PDF text extraction with comprehensive error handling and recovery
const extractTextFromPDF = async (arrayBuffer, fileName) => {
  try {
    console.log('🔍 Starting PDF text extraction for:', fileName);
    
    // Wait for PDF.js to be ready with extended timeout for complex documents
    const pdfjsLib = await waitForPDFJS(30000);
    
    // Load PDF document with comprehensive configuration
    let pdf;
    try {
      console.log('📚 Loading PDF document...');
      
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0, // Reduce console noise
        maxImageSize: 1024 * 1024, // 1MB max for images
        disableFontFace: true, // Improve performance and compatibility
        disableRange: false, // Allow range requests for large files
        disableStream: false, // Allow streaming for better performance
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
        enableXfa: false, // Disable XFA forms for better compatibility
        useSystemFonts: false // Use embedded fonts
      });
      
      // Enhanced timeout handling with progress tracking
      const loadTimeout = setTimeout(() => {
        try {
          loadingTask.destroy();
        } catch (destroyError) {
          console.warn('⚠️ Error destroying loading task:', destroyError);
        }
        throw new Error(
          'PDF loading timed out after 45 seconds.\n\n' +
          'This usually happens with:\n' +
          '• Very large PDF files (try a smaller file)\n' +
          '• Heavily encrypted or protected PDFs\n' +
          '• PDFs with complex graphics or forms\n' +
          '• Network connectivity issues\n\n' +
          'Please try with a simpler PDF file or check your connection.'
        );
      }, 45000);
      
      pdf = await loadingTask.promise;
      clearTimeout(loadTimeout);
      
    } catch (loadError) {
      console.error('❌ PDF loading error:', loadError);
      
      if (loadError.message.includes('Invalid PDF')) {
        throw new Error(
          'Invalid PDF file format detected.\n\n' +
          'This could be caused by:\n' +
          '• Corrupted PDF file\n' +
          '• Partially downloaded file\n' +
          '• File saved in wrong format\n' +
          '• Non-standard PDF structure\n\n' +
          'Please try re-downloading or re-saving the PDF file.'
        );
      } else if (loadError.message.includes('password') || loadError.message.includes('encrypted')) {
        throw new Error(
          'Password-protected PDF detected.\n\n' +
          'Our comparison tool cannot process password-protected or encrypted PDF files.\n' +
          'Please provide an unprotected version of the document.'
        );
      } else if (loadError.message.includes('timed out')) {
        throw new Error(loadError.message); // Pass through enhanced timeout message
      } else {
        throw new Error(`Failed to load PDF document: ${loadError.message}`);
      }
    }
    
    console.log(`📄 PDF loaded successfully. Pages: ${pdf.numPages}`);
    
    if (pdf.numPages === 0) {
      throw new Error('PDF contains no pages or all pages are corrupted.');
    }
    
    if (pdf.numPages > 1000) {
      console.warn(`⚠️ Very large PDF detected (${pdf.numPages} pages). This may take several minutes to process.`);
    }
    
    const pages = [];
    let totalCharacters = 0;
    let totalWords = 0;
    let successfulPages = 0;
    let failedPages = 0;
    const startTime = Date.now();
    
    // Extract text from each page with enhanced error recovery
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        if (pageNum % 10 === 0 || pageNum === 1 || pageNum === pdf.numPages) {
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          console.log(`📃 Processing page ${pageNum}/${pdf.numPages} (${elapsed}s elapsed)...`);
        }
        
        const page = await pdf.getPage(pageNum);
        
        // Enhanced text content extraction with multiple strategies
        let textContent;
        try {
          // Primary extraction strategy
          const pagePromise = page.getTextContent({
            normalizeWhitespace: true,
            disableCombineTextItems: false,
            includeMarkedContent: false
          });
          
          const pageTimeout = setTimeout(() => {
            throw new Error(`Page ${pageNum} processing timed out after 15 seconds`);
          }, 15000);
          
          textContent = await pagePromise;
          clearTimeout(pageTimeout);
          
        } catch (pageExtractionError) {
          console.warn(`⚠️ Primary extraction failed for page ${pageNum}, trying fallback...`);
          
          // Fallback extraction strategy
          try {
            textContent = await page.getTextContent({
              normalizeWhitespace: false,
              disableCombineTextItems: true
            });
          } catch (fallbackError) {
            throw new Error(`Both primary and fallback extraction failed: ${pageExtractionError.message}`);
          }
        }
        
        // Enhanced text processing with better paragraph detection
        let pageText = '';
        let currentY = null;
        let paragraphs = [];
        let currentParagraph = '';
        const lineThreshold = 8; // Increased threshold for better paragraph detection
        
        if (textContent.items && textContent.items.length > 0) {
          // Sort items by Y position (top to bottom) then X position (left to right)
          const sortedItems = textContent.items.sort((a, b) => {
            const yDiff = b.transform[5] - a.transform[5]; // Y coordinate (inverted)
            if (Math.abs(yDiff) > lineThreshold) {
              return yDiff;
            }
            return a.transform[4] - b.transform[4]; // X coordinate
          });
          
          sortedItems.forEach((item, index) => {
            const text = item.str.trim();
            if (!text) return;
            
            const itemY = item.transform[5];
            
            // Detect paragraph breaks based on Y position changes
            if (currentY !== null && Math.abs(itemY - currentY) > lineThreshold) {
              // New line/paragraph detected
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
            
            // Add space between words if needed
            const needsSpace = currentParagraph && 
                              !currentParagraph.endsWith(' ') && 
                              !currentParagraph.endsWith('\n') &&
                              !text.startsWith(' ');
            currentParagraph += (needsSpace ? ' ' : '') + text;
            currentY = itemY;
            pageText += text + ' ';
          });
          
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
        
        // Enhanced fallback handling for empty pages
        if (paragraphs.length === 0) {
          if (pageText.trim()) {
            paragraphs.push({
              text: pageText.trim(),
              paragraph_index: 0,
              y_position: 0,
              char_count: pageText.trim().length
            });
          } else {
            // Check if page might contain images or other non-text content
            try {
              const annotations = await page.getAnnotations();
              const hasAnnotations = annotations && annotations.length > 0;
              const hasImages = textContent.items && textContent.items.some(item => item.hasEOL);
              
              paragraphs.push({
                text: hasAnnotations || hasImages ? 
                  '[This page contains non-text content like images, forms, or annotations]' :
                  '[This page appears to be empty or contains only whitespace]',
                paragraph_index: 0,
                y_position: 0,
                char_count: 0
              });
            } catch (annotationError) {
              paragraphs.push({
                text: '[This page appears to be empty or contains only images]',
                paragraph_index: 0,
                y_position: 0,
                char_count: 0
              });
            }
          }
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
            text: `[Error extracting text from page ${pageNum}: ${pageError.message}]`,
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
    
    // Clean up PDF document resources
    try {
      pdf.destroy();
    } catch (cleanupError) {
      console.warn('⚠️ PDF cleanup error:', cleanupError);
    }
    
    const processingTime = Date.now() - startTime;
    const metadata = {
      fileName: fileName,
      fileSize: arrayBuffer.byteLength,
      totalPages: pdf.numPages,
      successfulPages: successfulPages,
      failedPages: failedPages,
      totalWords: totalWords,
      totalCharacters: totalCharacters,
      isValidPDF: true,
      extractionMethod: 'PDF.js Enhanced',
      processingDate: new Date().toISOString(),
      processingTimeMs: processingTime,
      averageWordsPerPage: successfulPages > 0 ? Math.round(totalWords / successfulPages) : 0,
      successRate: Math.round((successfulPages / pdf.numPages) * 100)
    };
    
    console.log('✅ PDF text extraction complete:', {
      pages: pages.length,
      successfulPages,
      failedPages,
      totalWords,
      totalCharacters,
      avgWordsPerPage: metadata.averageWordsPerPage,
      processingTimeMs: processingTime,
      successRate: metadata.successRate + '%'
    });
    
    // Quality warnings
    if (failedPages > successfulPages * 0.1) { // More than 10% failed
      console.warn(`⚠️ High page failure rate: ${failedPages}/${pdf.numPages} pages failed to process`);
    }
    
    if (totalWords === 0) {
      console.warn('⚠️ No extractable text found in PDF. This may be an image-only PDF.');
    }
    
    return {
      metadata: metadata,
      pages: pages,
      raw: arrayBuffer
    };
    
  } catch (error) {
    console.error('❌ PDF text extraction error:', error);
    throw error;
  }
};

// Main PDF parsing function with enhanced error handling
export const parsePDFFile = async (file) => {
  console.log('🔧 parsePDFFile called with enhanced error handling for:', file?.name);
  
  try {
    // Enhanced file type validation
    if (file.type && !file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error(
        'File type validation failed.\n\n' +
        'Please ensure you have selected a valid PDF file (.pdf extension).'
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
    
    console.log('✅ PDF parsed successfully with enhanced text extraction');
    return result;
    
  } catch (error) {
    console.error('❌ PDF parsing error:', error);
    
    // Enhanced error message categorization with user-friendly guidance
    if (error.message.includes('PDF.js library failed to load') || 
        error.message.includes('PDF.js library not available')) {
      throw new Error(
        'PDF Processing Service Unavailable\n\n' +
        'The PDF processing engine failed to load properly.\n\n' +
        'Quick fixes to try:\n' +
        '• Refresh the page and wait 30 seconds\n' +
        '• Check your internet connection\n' +
        '• Disable ad blockers temporarily\n' +
        '• Try using a different browser\n' +
        '• Clear browser cache and cookies\n\n' +
        'If the problem persists, please contact support.'
      );
    } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
      throw new Error(
        'PDF Processing Timeout\n\n' +
        'The PDF file took too long to process.\n\n' +
        'This usually happens with:\n' +
        '• Very large files (try files under 50MB)\n' +
        '• Complex PDFs with many images or forms\n' +
        '• Poor internet connection\n\n' +
        'Suggestions:\n' +
        '• Try a smaller or simpler PDF file\n' +
        '• Ensure stable internet connection\n' +
        '• Split large documents into smaller sections'
      );
    } else if (error.message.includes('Invalid PDF') || error.message.includes('not a valid PDF')) {
      throw new Error(
        'Invalid PDF File\n\n' +
        'The selected file is not a valid PDF document or is corrupted.\n\n' +
        'Please try:\n' +
        '• Re-downloading the PDF file\n' +
        '• Opening and re-saving the PDF in a PDF viewer\n' +
        '• Converting from another format to PDF\n' +
        '• Using a different PDF file for testing'
      );
    } else if (error.message.includes('password') || error.message.includes('encrypted')) {
      throw new Error(
        'Password-Protected PDF\n\n' +
        'This PDF file requires a password or contains encryption.\n\n' +
        'Our service cannot process protected PDFs.\n' +
        'Please provide an unprotected version of the document.'
      );
    }
    
    // Pass through enhanced error messages, or wrap generic ones
    throw error;
  }
};

// Enhanced PDF comparison with improved error handling and performance monitoring
export const comparePDFFiles = async (pdf1, pdf2, options = {}) => {
  console.log('🔄 comparePDFFiles called with enhanced implementation');
  console.log('🎛️ Options:', options);
  
  const {
    compareMode = 'text',
    ignoreFormatting = true,
    pageByPage = true,
    includeImages = false
  } = options;
  
  try {
    // Parse both PDFs with enhanced progress indication
    console.log('📖 Parsing PDF files with enhanced error handling...');
    
    const startTime = Date.now();
    
    const [data1, data2] = await Promise.all([
      parsePDFFile(pdf1).catch(error => {
        throw new Error(`First PDF processing failed:\n${error.message}`);
      }),
      parsePDFFile(pdf2).catch(error => {
        throw new Error(`Second PDF processing failed:\n${error.message}`);
      })
    ]);
    
    const parseTime = Date.now() - startTime;
    console.log(`📊 PDF parsing completed in ${parseTime}ms`);
    console.log(`  File 1: ${data1.pages.length} pages, ${data1.metadata.totalWords} words (${data1.metadata.successRate}% success)`);
    console.log(`  File 2: ${data2.pages.length} pages, ${data2.metadata.totalWords} words (${data2.metadata.successRate}% success)`);
    
    // Quality checks before comparison
    if (data1.metadata.totalWords === 0 && data2.metadata.totalWords === 0) {
      console.warn('⚠️ Both PDFs appear to contain no extractable text. Comparison will be limited.');
    }
    
    // Start comparison process with enhanced analysis
    console.log('🔍 Starting enhanced PDF comparison...');
    const comparisonStartTime = Date.now();
    
    const text_changes = [];
    const page_differences = [];
    let totalParagraphs = 0;
    let differences = 0;
    let matches = 0;
    
    const maxPages = Math.max(data1.pages.length, data2.pages.length);
    
    for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
      const page1 = data1.pages[pageIndex];
      const page2 = data2.pages[pageIndex];
      const pageNum = pageIndex + 1;
      
      let pageChanges = 0;
      
      if (!page1 && page2) {
        // Page added in second document
        pageChanges = page2.paragraphs.length;
        differences += pageChanges;
        totalParagraphs += page2.paragraphs.length;
        
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
        // Page removed from second document
        pageChanges = page1.paragraphs.length;
        differences += pageChanges;
        totalParagraphs += page1.paragraphs.length;
        
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
        // Compare existing pages with enhanced logic
        const maxParas = Math.max(page1.paragraphs.length, page2.paragraphs.length);
        totalParagraphs += maxParas;
        
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
            // Enhanced text comparison with multiple strategies
            let text1 = para1.text;
            let text2 = para2.text;
            
            if (ignoreFormatting) {
              text1 = text1.replace(/\s+/g, ' ').trim();
              text2 = text2.replace(/\s+/g, ' ').trim();
            }
            
            // Skip comparing error messages from failed page extractions
            const isErrorText1 = text1.startsWith('[Error extracting text from page');
            const isErrorText2 = text2.startsWith('[Error extracting text from page');
            
            if (isErrorText1 && isErrorText2) {
              // Both are error messages, consider them matching
              matches++;
            } else if (isErrorText1 || isErrorText2) {
              // One is error, one is not - this is a difference
              pageChanges++;
              differences++;
              text_changes.push({
                page: pageNum,
                paragraph: paraIndex,
                type: 'modified',
                text: `"${para1.text}" → "${para2.text}"`,
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
                text: `"${para1.text}" → "${para2.text}"`,
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
          summary: `${pageChanges} change${pageChanges > 1 ? 's' : ''} on page ${pageNum}`,
          page1_paragraphs: page1?.paragraphs.length || 0,
          page2_paragraphs: page2?.paragraphs.length || 0
        });
      }
    }
    
    const comparisonTime = Date.now() - comparisonStartTime;
    console.log(`🔍 Comparison completed in ${comparisonTime}ms`);
    
    // Calculate enhanced similarity metrics
    const totalComparisons = differences + matches;
    const similarity_score = totalComparisons > 0 ? Math.round((matches / totalComparisons) * 100) : 100;
    
    // Calculate word-level changes with enhanced analysis
    const wordChanges = {
      file1_words: data1.metadata.totalWords,
      file2_words: data2.metadata.totalWords,
      word_difference: Math.abs(data1.metadata.totalWords - data2.metadata.totalWords),
      word_change_percentage: data1.metadata.totalWords > 0 ? 
        Math.round((Math.abs(data1.metadata.totalWords - data2.metadata.totalWords) / data1.metadata.totalWords) * 100) : 0
    };
    
    const results = {
      // Core comparison metrics
      differences_found: differences,
      matches_found: matches,
      total_pages: maxPages,
      total_paragraphs: totalParagraphs,
      similarity_score: similarity_score,
      
      // Detailed change analysis
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
      processing_note: 'Enhanced PDF text extraction using PDF.js with multiple fallback strategies',
      processing_time: {
        parse_time_ms: parseTime,
        comparison_time_ms: comparisonTime,
        total_time_ms: parseTime + comparisonTime
      },
      
      // Quality indicators
      quality_metrics: {
        file1_success_rate: data1.metadata.successfulPages / data1.metadata.totalPages,
        file2_success_rate: data2.metadata.successfulPages / data2.metadata.totalPages,
        overall_success_rate: (data1.metadata.successfulPages + data2.metadata.successfulPages) / 
                             (data1.metadata.totalPages + data2.metadata.totalPages),
        file1_text_extraction_rate: data1.metadata.totalWords > 0 ? 1 : 0,
        file2_text_extraction_rate: data2.metadata.totalWords > 0 ? 1 : 0
      }
    };
    
    console.log('✅ Enhanced PDF document comparison complete:');
    console.log('  - Total pages:', results.total_pages);
    console.log('  - Differences:', results.differences_found);
    console.log('  - Similarity:', results.similarity_score + '%');
    console.log('  - Processing time:', results.processing_time.total_time_ms + 'ms');
    console.log('  - Overall quality:', Math.round(results.quality_metrics.overall_success_rate * 100) + '%');
    
    return results;
    
  } catch (error) {
    console.error('❌ Enhanced PDF document comparison error:', error);
    
    // Enhanced error messages for specific failure cases
    if (error.message.includes('First PDF processing failed')) {
      throw new Error(`First PDF Error:\n${error.message.replace('First PDF processing failed:\n', '')}`);
    } else if (error.message.includes('Second PDF processing failed')) {
      throw new Error(`Second PDF Error:\n${error.message.replace('Second PDF processing failed:\n', '')}`);
    }
    
    throw error;
  }
};
