// utils/pdfFileComparison1.js
// ROBUST PDF.js IMPLEMENTATION WITH ENHANCED ERROR HANDLING AND FIXED LOADING

// Enhanced PDF.js availability checker with better retry logic
const waitForPDFJS = (maxWaitTime = 15000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let checkCount = 0;
    
    function checkPDFJS() {
      checkCount++;
      console.log(`🔍 PDF.js check attempt ${checkCount}`);
      
      if (typeof window !== 'undefined' && window.pdfjsLib && window.pdfJsReady) {
        console.log('✅ PDF.js is ready for use');
        resolve(window.pdfjsLib);
        return;
      }
      
      // Check for error state
      if (window.pdfJsError) {
        reject(new Error(
          'PDF.js library failed to load properly. Please refresh the page and try again. ' +
          'If the problem persists, check your internet connection or disable ad blockers.'
        ));
        return;
      }
      
      const elapsed = Date.now() - startTime;
      if (elapsed >= maxWaitTime) {
        reject(new Error(
          `PDF.js library not available after ${maxWaitTime/1000} seconds. ` +
          'This could be due to network issues, ad blockers, or firewall restrictions. ' +
          'Please refresh the page and try again.'
        ));
        return;
      }
      
      // Wait and try again with exponential backoff
      const waitTime = Math.min(500 + (checkCount * 200), 2000);
      setTimeout(checkPDFJS, waitTime);
    }
    
    checkPDFJS();
  });
};

// Helper function to safely read file as ArrayBuffer
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
        
        // Validate that it's actually a PDF by checking magic bytes
        const bytes = new Uint8Array(arrayBuffer);
        if (bytes.length < 4 || 
            bytes[0] !== 37 || bytes[1] !== 80 || bytes[2] !== 68 || bytes[3] !== 70) {
          reject(new Error('File is not a valid PDF document. Please select a proper PDF file.'));
          return;
        }
        
        console.log('✅ PDF file read successfully, size:', arrayBuffer.byteLength);
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

// Enhanced PDF text extraction with comprehensive error handling
const extractTextFromPDF = async (arrayBuffer, fileName) => {
  try {
    console.log('🔍 Starting PDF text extraction for:', fileName);
    
    // Wait for PDF.js to be ready with longer timeout for complex pages
    const pdfjsLib = await waitForPDFJS(20000);
    
    // Load PDF document with comprehensive error handling
    let pdf;
    try {
      console.log('📚 Loading PDF document...');
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0, // Reduce console noise
        maxImageSize: 1024 * 1024, // 1MB max for images
        disableFontFace: true, // Improve performance
        disableRange: false, // Allow range requests for large files
        disableStream: false // Allow streaming
      });
      
      // Add timeout for PDF loading
      const loadTimeout = setTimeout(() => {
        loadingTask.destroy();
        throw new Error('PDF loading timed out. The file may be too large or corrupted.');
      }, 30000);
      
      pdf = await loadingTask.promise;
      clearTimeout(loadTimeout);
      
    } catch (loadError) {
      console.error('❌ PDF loading error:', loadError);
      
      if (loadError.message.includes('Invalid PDF')) {
        throw new Error('Invalid PDF file format. The file may be corrupted or not a valid PDF document.');
      } else if (loadError.message.includes('password') || loadError.message.includes('encrypted')) {
        throw new Error('Password-protected PDF files are not supported. Please provide an unprotected PDF.');
      } else if (loadError.message.includes('timed out')) {
        throw new Error('PDF file is too large or complex to process. Please try with a smaller file.');
      } else {
        throw new Error(`Failed to load PDF: ${loadError.message}`);
      }
    }
    
    console.log(`📄 PDF loaded successfully. Pages: ${pdf.numPages}`);
    
    if (pdf.numPages === 0) {
      throw new Error('PDF contains no pages.');
    }
    
    if (pdf.numPages > 500) {
      console.warn(`⚠️ Large PDF detected (${pdf.numPages} pages). Processing may take longer.`);
    }
    
    const pages = [];
    let totalCharacters = 0;
    let totalWords = 0;
    let successfulPages = 0;
    let failedPages = 0;
    
    // Extract text from each page with progress logging and error recovery
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        if (pageNum % 10 === 0 || pageNum === 1) {
          console.log(`📃 Processing page ${pageNum}/${pdf.numPages}...`);
        }
        
        const page = await pdf.getPage(pageNum);
        
        // Set timeout for page processing
        const pagePromise = page.getTextContent({
          normalizeWhitespace: true,
          disableCombineTextItems: false
        });
        
        const pageTimeout = setTimeout(() => {
          throw new Error(`Page ${pageNum} processing timed out`);
        }, 10000);
        
        const textContent = await pagePromise;
        clearTimeout(pageTimeout);
        
        // Combine text items into paragraphs with better logic
        let pageText = '';
        let currentY = null;
        let paragraphs = [];
        let currentParagraph = '';
        const lineThreshold = 5; // Y-position difference to detect new lines
        
        if (textContent.items && textContent.items.length > 0) {
          textContent.items.forEach((item, index) => {
            const text = item.str.trim();
            if (!text) return;
            
            // Detect paragraph breaks based on Y position changes
            if (currentY !== null && Math.abs(item.transform[5] - currentY) > lineThreshold) {
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
            const needsSpace = currentParagraph && !currentParagraph.endsWith(' ') && !text.startsWith(' ');
            currentParagraph += (needsSpace ? ' ' : '') + text;
            currentY = item.transform[5];
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
        
        // If no paragraphs detected but we have text, create one from all text
        if (paragraphs.length === 0 && pageText.trim()) {
          paragraphs.push({
            text: pageText.trim(),
            paragraph_index: 0,
            y_position: 0,
            char_count: pageText.trim().length
          });
        }
        
        // Handle completely empty pages
        if (paragraphs.length === 0) {
          paragraphs.push({
            text: '[This page appears to be empty or contains only images]',
            paragraph_index: 0,
            y_position: 0,
            char_count: 0
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
    
    // Clean up PDF document
    try {
      pdf.destroy();
    } catch (cleanupError) {
      console.warn('⚠️ PDF cleanup error:', cleanupError);
    }
    
    const metadata = {
      fileName: fileName,
      fileSize: arrayBuffer.byteLength,
      totalPages: pdf.numPages,
      successfulPages: successfulPages,
      failedPages: failedPages,
      totalWords: totalWords,
      totalCharacters: totalCharacters,
      isValidPDF: true,
      extractionMethod: 'PDF.js',
      processingDate: new Date().toISOString(),
      averageWordsPerPage: successfulPages > 0 ? Math.round(totalWords / successfulPages) : 0
    };
    
    console.log('✅ PDF text extraction complete:', {
      pages: pages.length,
      successfulPages,
      failedPages,
      totalWords,
      totalCharacters,
      avgWordsPerPage: metadata.averageWordsPerPage
    });
    
    // Warn if many pages failed
    if (failedPages > successfulPages * 0.1) { // More than 10% failed
      console.warn(`⚠️ High page failure rate: ${failedPages}/${pdf.numPages} pages failed to process`);
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
    // Validate file type more thoroughly
    if (file.type && !file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('File is not a PDF document. Please select a valid PDF file.');
    }
    
    let arrayBuffer;
    
    if (file instanceof ArrayBuffer) {
      arrayBuffer = file;
    } else {
      arrayBuffer = await readFileAsArrayBuffer(file);
    }
    
    // Extract text using PDF.js with enhanced error handling
    const result = await extractTextFromPDF(arrayBuffer, file.name || 'document.pdf');
    
    console.log('✅ PDF parsed successfully with real text extraction');
    return result;
    
  } catch (error) {
    console.error('❌ PDF parsing error:', error);
    
    // Enhance error messages for better user experience
    if (error.message.includes('PDF.js library failed to load') || 
        error.message.includes('PDF.js library not available')) {
      throw new Error(
        'PDF processing service is temporarily unavailable. ' +
        'Please refresh the page and try again. If the problem persists, ' +
        'check your internet connection or disable ad blockers.'
      );
    } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
      throw new Error(
        'PDF processing timed out. The file may be too large or complex. ' +
        'Please try with a smaller PDF file (under 50MB recommended).'
      );
    } else if (error.message.includes('Invalid PDF') || error.message.includes('not a valid PDF')) {
      throw new Error(
        'The selected file is not a valid PDF document. ' +
        'Please ensure you have selected a proper PDF file.'
      );
    } else if (error.message.includes('password') || error.message.includes('encrypted')) {
      throw new Error(
        'Password-protected PDF files are not supported. ' +
        'Please remove the password protection and try again.'
      );
    }
    
    throw error;
  }
};

// Enhanced PDF comparison with better error handling and progress tracking
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
    // Parse both PDFs with progress indication
    console.log('📖 Parsing PDF files...');
    
    const startTime = Date.now();
    
    const [data1, data2] = await Promise.all([
      parsePDFFile(pdf1).catch(error => {
        throw new Error(`Error processing first PDF: ${error.message}`);
      }),
      parsePDFFile(pdf2).catch(error => {
        throw new Error(`Error processing second PDF: ${error.message}`);
      })
    ]);
    
    const parseTime = Date.now() - startTime;
    console.log(`📊 PDF parsing completed in ${parseTime}ms`);
    console.log(`  File 1: ${data1.pages.length} pages, ${data1.metadata.totalWords} words`);
    console.log(`  File 2: ${data2.pages.length} pages, ${data2.metadata.totalWords} words`);
    
    // Start comparison process
    console.log('🔍 Starting PDF comparison...');
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
        // Compare existing pages
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
            // Compare text content with formatting options
            let text1 = para1.text;
            let text2 = para2.text;
            
            if (ignoreFormatting) {
              text1 = text1.replace(/\s+/g, ' ').trim();
              text2 = text2.replace(/\s+/g, ' ').trim();
            }
            
            if (text1 !== text2) {
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
    
    // Calculate word-level changes
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
      
      // Metadata
      comparison_type: 'pdf_document',
      comparison_options: options,
      processing_note: 'Real PDF text extraction using PDF.js',
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
                             (data1.metadata.totalPages + data2.metadata.totalPages)
      }
    };
    
    console.log('✅ PDF document comparison complete:');
    console.log('  - Total pages:', results.total_pages);
    console.log('  - Differences:', results.differences_found);
    console.log('  - Similarity:', results.similarity_score + '%');
    console.log('  - Processing time:', results.processing_time.total_time_ms + 'ms');
    
    return results;
    
  } catch (error) {
    console.error('❌ PDF document comparison error:', error);
    
    // Enhanced error messages for specific failure cases
    if (error.message.includes('Error processing first PDF')) {
      throw new Error(`First PDF file error: ${error.message.replace('Error processing first PDF: ', '')}`);
    } else if (error.message.includes('Error processing second PDF')) {
      throw new Error(`Second PDF file error: ${error.message.replace('Error processing second PDF: ', '')}`);
    }
    
    throw error;
  }
};
