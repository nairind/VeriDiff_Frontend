import { SmartDiff, compareWithSmartDiff } from './smartDiff.js';
// utils/largePdfFileComparison.js
// ENHANCED PDF.js IMPLEMENTATION FOR LARGE FILES (UP TO 100MB) - FIXED VERSION

// Progress callback system for large file processing
let progressCallback = null;

export const setProgressCallback = (callback) => {
  progressCallback = callback;
};

const updateProgress = (stage, progress, message) => {
  if (progressCallback) {
    progressCallback({ stage, progress, message });
  }
  console.log('📊 ' + stage + ': ' + progress + '% - ' + message);
};

// FIXED: Enhanced PDF.js availability checker with proper version handling
const waitForPDFJS = (maxWaitTime = 60000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let checkCount = 0;
    
    function checkPDFJS() {
      checkCount++;
      
      if (checkCount <= 3 || checkCount % 5 === 0) {
        console.log('🔍 PDF.js availability check #' + checkCount);
      }
      
      // Check for explicit error state
      if (window.pdfJsError) {
        const errorMsg = window.pdfJsErrorMessage || 'PDF.js library failed to load';
        console.error('❌ PDF.js error state detected:', errorMsg);
        reject(new Error(
          'PDF Processing Engine Unavailable\\n\\n' +
          'The PDF processing library failed to load.\\n\\n' +
          'Common causes in Edge browser:\\n' +
          '• Network timeout during library loading\\n' +
          '• Browser security restrictions\\n' +
          '• Ad blockers blocking PDF processing resources\\n' +
          '• Insufficient memory for large file processing\\n\\n' +
          'Solutions for large file processing:\\n' +
          '• Refresh page and wait 60+ seconds\\n' +
          '• Close other browser tabs to free memory\\n' +
          '• Disable ad blockers and extensions\\n' +
          '• Ensure stable internet connection\\n' +
          '• Try using Chrome or Firefox as alternative\\n' +
          '• Clear browser cache and cookies\\n\\n' +
          'Technical details: ' + errorMsg
        ));
        return;
      }
      
      // FIXED: Enhanced validation with proper library detection
      if (typeof window !== 'undefined' && 
          window.pdfjsLib && 
          window.pdfjsLib.getDocument &&
          window.pdfjsLib.GlobalWorkerOptions) {
        
        try {
          // Test worker configuration with version detection
          const workerSrc = window.pdfjsLib.GlobalWorkerOptions.workerSrc;
          if (!workerSrc) {
            console.warn('⚠️ PDF.js worker not configured, setting fallback...');
            // Set fallback worker for any version
            const version = window.pdfjsLib.version || '2.6.347';
            if (version.startsWith('4.') || version.startsWith('3.')) {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
                'https://cdn.jsdelivr.net/npm/pdfjs-dist@' + version + '/build/pdf.worker.min.js';
            } else {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';
            }
            console.log('🔧 Fallback worker configured:', window.pdfjsLib.GlobalWorkerOptions.workerSrc);
          }
          
          // Test basic functionality
          if (typeof window.pdfjsLib.getDocument !== 'function') {
            throw new Error('PDF.js core functions not available');
          }
          
          console.log('✅ PDF.js ready for large file processing');
          console.log('📋 Version:', window.pdfjsLib.version || 'unknown');
          console.log('🔧 Worker:', window.pdfjsLib.GlobalWorkerOptions.workerSrc);
          
          resolve(window.pdfjsLib);
          return;
          
        } catch (testError) {
          console.warn('⚠️ PDF.js loaded but functionality test failed:', testError);
          // Continue checking as this might be a temporary issue
        }
      }
      
      const elapsed = Date.now() - startTime;
      if (elapsed >= maxWaitTime) {
        reject(new Error(
          'PDF Processing Timeout\\n\\n' +
          'The PDF processing engine did not load within the expected time.\\n\\n' +
          'For large file processing, this may indicate:\\n' +
          '• Slow internet connection affecting library download\\n' +
          '• Browser memory limitations\\n' +
          '• Network restrictions blocking external resources\\n' +
          '• Edge browser compatibility issues\\n\\n' +
          'Please try:\\n' +
          '• Refreshing and waiting 2+ minutes\\n' +
          '• Closing other applications to free memory\\n' +
          '• Using a different browser (Chrome/Firefox recommended)\\n' +
          '• Ensuring stable, fast internet connection\\n' +
          '• Clearing browser cache and trying again\\n\\n' +
          'Timeout after: ' + (maxWaitTime/1000) + ' seconds'
        ));
        return;
      }
      
      // Adaptive delay for large file processing
      const delay = Math.min(200 * Math.pow(1.3, checkCount), 3000);
      
      if (checkCount % 10 === 0) {
        const remainingTime = Math.round((maxWaitTime - elapsed) / 1000);
        console.log('⏳ Large file PDF.js loading... (' + remainingTime + 's remaining)');
      }
      
      setTimeout(checkPDFJS, delay);
    }
    
    checkPDFJS();
  });
};

// Enhanced file reading with support for large files up to 100MB
const readLargePDFFile = (file) => {
  return new Promise((resolve, reject) => {
    console.log('📁 Reading large PDF file:', file?.name, '(' + (file.size/1024/1024).toFixed(1) + 'MB)');
    
    updateProgress('File Reading', 0, 'Starting to read ' + file.name + ' (' + (file.size/1024/1024).toFixed(1) + 'MB)');
    
    // Enhanced validation for large files
    if (!file) {
      reject(new Error('No file provided for large PDF processing'));
      return;
    }

    if (file.size === 0) {
      reject(new Error('PDF file is empty (0 bytes)'));
      return;
    }

    // Increased limit to 100MB with detailed guidance
    if (file.size > 100 * 1024 * 1024) {
      reject(new Error(
        'PDF File Too Large (' + (file.size / 1024 / 1024).toFixed(1) + 'MB)\\n\\n' +
        'Maximum supported size is 100MB for optimal performance.\\n\\n' +
        'For files larger than 100MB, consider:\\n' +
        '• Splitting the PDF into smaller sections (recommended: 20-50MB each)\\n' +
        '• Using PDF compression tools to reduce file size\\n' +
        '• Comparing specific page ranges instead of entire documents\\n' +
        '• Using specialized document management software for bulk comparisons\\n\\n' +
        'Large file processing tips:\\n' +
        '• Ensure 8GB+ RAM available\\n' +
        '• Close other browser tabs and applications\\n' +
        '• Use latest Chrome or Firefox for best performance\\n' +
        '• Allow 10-30 minutes for very large files'
      ));
      return;
    }

    // Memory check for large files
    if (file.size > 50 * 1024 * 1024) {
      console.warn('⚠️ Large PDF detected (' + (file.size/1024/1024).toFixed(1) + 'MB). Ensuring sufficient memory...');
      
      // Basic memory check (approximate)
      if (navigator.deviceMemory && navigator.deviceMemory < 4) {
        console.warn('⚠️ Low device memory detected. Large file processing may be slow.');
      }
    }

    const reader = new FileReader();
    
    // Progress tracking for large files
    let lastProgressUpdate = 0;
    
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        
        // Update progress every 5% to avoid too many updates
        if (progress - lastProgressUpdate >= 5) {
          updateProgress('File Reading', progress, 'Reading file data... ' + (e.loaded/1024/1024).toFixed(1) + 'MB / ' + (e.total/1024/1024).toFixed(1) + 'MB');
          lastProgressUpdate = progress;
        }
      }
    };
    
    reader.onload = (e) => {
      try {
        updateProgress('File Reading', 95, 'Validating PDF structure...');
        
        const arrayBuffer = e.target.result;
        
        // Enhanced PDF validation for large files
        const bytes = new Uint8Array(arrayBuffer);
        if (bytes.length < 8) {
          reject(new Error('File is too small to be a valid PDF document (less than 8 bytes)'));
          return;
        }
        
        // Check PDF magic bytes
        if (bytes[0] !== 37 || bytes[1] !== 80 || bytes[2] !== 68 || bytes[3] !== 70) {
          reject(new Error(
            'Invalid PDF File Format\\n\\n' +
            'The file does not appear to be a valid PDF document.\\n' +
            'Please ensure:\\n' +
            '• File has .pdf extension\\n' +
            '• File is not corrupted\\n' +
            '• File was not renamed from another format\\n' +
            '• Try opening in a PDF viewer to verify it works'
          ));
          return;
        }
        
        // Advanced structure validation for large files
        const headerStr = new TextDecoder().decode(bytes.slice(0, Math.min(64, bytes.length)));
        if (!headerStr.includes('PDF-')) {
          console.warn('⚠️ PDF version information not found in expected location');
        }
        
        // Check for potential issues with large files
        if (arrayBuffer.byteLength > 75 * 1024 * 1024) {
          console.warn('⚠️ Very large PDF file. Processing may take 15-30 minutes.');
        }
        
        updateProgress('File Reading', 100, 'PDF file validated (' + (arrayBuffer.byteLength/1024/1024).toFixed(1) + 'MB)');
        
        console.log('✅ Large PDF file validated and read successfully');
        resolve(arrayBuffer);
        
      } catch (error) {
        console.error('❌ Large PDF file processing error:', error);
        reject(new Error('Failed to process large PDF file: ' + error.message));
      }
    };
    
    reader.onerror = (e) => {
      console.error('❌ FileReader error for large file:', e);
      reject(new Error(
        'Failed to read large PDF file "' + file.name + '"\\n\\n' +
        'Large file reading can fail due to:\\n' +
        '• Insufficient memory (need 4GB+ available)\\n' +
        '• File corruption during transfer\\n' +
        '• Browser limitations with very large files\\n' +
        '• File being used by another application\\n\\n' +
        'Solutions:\\n' +
        '• Close other applications to free memory\\n' +
        '• Try with a smaller file first\\n' +
        '• Restart browser and try again\\n' +
        '• Use a different browser (Chrome/Firefox recommended)'
      ));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// FIXED: Enhanced PDF text extraction optimized for large files with proper version handling
const extractTextFromLargePDF = async (arrayBuffer, fileName) => {
  let pdf = null;
  
  try {
    const fileSizeMB = (arrayBuffer.byteLength / 1024 / 1024).toFixed(1);
    console.log('🔍 Starting large PDF text extraction for: ' + fileName + ' (' + fileSizeMB + 'MB)');
    
    updateProgress('PDF Loading', 0, 'Initializing PDF processing for ' + fileSizeMB + 'MB file...');
    
    // Wait for PDF.js with extended timeout for large files
    const pdfjsLib = await waitForPDFJS(90000); // Extended timeout for Edge browser
    
    updateProgress('PDF Loading', 10, 'PDF.js engine ready, loading document...');
    
    // FIXED: Load PDF document with optimized settings for different PDF.js versions
    try {
      console.log('📚 Loading large PDF document with optimized settings...');
      
      const version = pdfjsLib.version || '2.6.347';
      console.log('📋 PDF.js version:', version);
      
      // FIXED: Version-specific configuration
      let loadingTaskConfig;
      
      if (version.startsWith('4.') || version.startsWith('3.')) {
        // Modern PDF.js (v3+) configuration
        loadingTaskConfig = { 
          data: arrayBuffer,
          verbosity: 0,
          maxImageSize: 1024 * 1024,
          disableFontFace: true,
          disableRange: false, // Better for newer versions
          disableStream: false,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@' + version + '/cmaps/',
          cMapPacked: true,
          enableXfa: false,
          useSystemFonts: false,
          useWorkerFetch: true,
          isEvalSupported: false,
          fontExtraProperties: false,
          standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@' + version + '/standard_fonts/',
        };
      } else {
        // Legacy PDF.js (v2.x) configuration
        loadingTaskConfig = { 
          data: arrayBuffer,
          verbosity: 0,
          maxImageSize: 1024 * 1024,
          disableFontFace: true,
          disableRange: true,
          disableStream: true,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + version + '/cmaps/',
          cMapPacked: true,
          enableXfa: false,
          useSystemFonts: false,
        };
      }
      
      const loadingTask = pdfjsLib.getDocument(loadingTaskConfig);
      
      // Enhanced timeout for large files (up to 10 minutes for very large files)
      const timeoutDuration = Math.min(600000, Math.max(180000, fileSizeMB * 4000)); // 3-10 minutes based on file size
      const loadTimeout = setTimeout(() => {
        try {
          loadingTask.destroy();
        } catch (destroyError) {
          console.warn('⚠️ Error destroying large PDF loading task:', destroyError);
        }
        throw new Error(
          'Large PDF Loading Timeout\\n\\n' +
          'The large PDF document (' + fileSizeMB + 'MB) took too long to load.\\n\\n' +
          'This usually happens with:\\n' +
          '• Very complex PDFs with many images or forms\\n' +
          '• Files approaching the 100MB limit\\n' +
          '• Insufficient available memory\\n' +
          '• Network connectivity issues\\n\\n' +
          'Suggestions for large files:\\n' +
          '• Ensure 8GB+ system RAM available\\n' +
          '• Close other browser tabs and applications\\n' +
          '• Try splitting the PDF into smaller sections\\n' +
          '• Use a machine with better specifications\\n' +
          '• Allow up to 30 minutes for very large files'
        );
      }, timeoutDuration);
      
      // FIXED: Handle both promise and direct return based on PDF.js version
      let loadingPromise = loadingTask.promise || loadingTask;
      pdf = await loadingPromise;
      clearTimeout(loadTimeout);
      
      updateProgress('PDF Loading', 30, 'PDF loaded successfully - ' + pdf.numPages + ' pages detected');
      
    } catch (loadError) {
      console.error('❌ Large PDF loading error:', loadError);
      
      const errorMsg = loadError.message.toLowerCase();
      
      if (errorMsg.includes('invalid pdf') || errorMsg.includes('not a pdf')) {
        throw new Error(
          'Invalid Large PDF Document\\n\\n' +
          'The large file appears to be corrupted or is not a valid PDF.\\n\\n' +
          'Common issues with large PDFs:\\n' +
          '• File was corrupted during upload/transfer\\n' +
          '• PDF was created with non-standard tools\\n' +
          '• File is incomplete or truncated\\n' +
          '• PDF contains unsupported features\\n\\n' +
          'Solutions:\\n' +
          '• Try re-downloading the original PDF\\n' +
          '• Use PDF repair tools if available\\n' +
          '• Split into smaller sections and test each\\n' +
          '• Try a different PDF for testing'
        );
      } else if (errorMsg.includes('memory') || errorMsg.includes('out of memory')) {
        throw new Error(
          'Insufficient Memory for Large PDF\\n\\n' +
          'The ' + fileSizeMB + 'MB PDF requires more memory than available.\\n\\n' +
          'Memory requirements:\\n' +
          '• 50MB+ PDFs need 8GB+ system RAM\\n' +
          '• 75MB+ PDFs need 16GB+ system RAM\\n' +
          '• Browser needs 4GB+ available memory\\n\\n' +
          'Solutions:\\n' +
          '• Close other applications and browser tabs\\n' +
          '• Restart browser to clear memory\\n' +
          '• Use a machine with more RAM\\n' +
          '• Split PDF into smaller sections (20-30MB each)\\n' +
          '• Try during off-peak hours when system is less busy'
        );
      } else if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
        throw new Error(loadError.message);
      } else {
        throw new Error(
          'Large PDF Loading Failed\\n\\n' +
          'Error processing ' + fileSizeMB + 'MB PDF: ' + loadError.message + '\\n\\n' +
          'Large file specific issues:\\n' +
          '• PDF structure too complex for browser processing\\n' +
          '• Memory limitations during processing\\n' +
          '• Browser compatibility with large files\\n\\n' +
          'Recommendations:\\n' +
          '• Try with smaller file first to test system\\n' +
          '• Use latest Chrome or Firefox\\n' +
          '• Ensure stable internet connection\\n' +
          '• Consider PDF optimization tools'
        );
      }
    }
    
    console.log('📄 Large PDF loaded successfully. Pages: ' + pdf.numPages);
    
    // Validate PDF structure for large files
    if (pdf.numPages === 0) {
      throw new Error('Large PDF contains no pages or all pages are inaccessible');
    }
    
    if (pdf.numPages > 3000) {
      throw new Error(
        'PDF Too Large (' + pdf.numPages + ' pages)\\n\\n' +
        'PDFs with more than 3000 pages exceed processing limits.\\n\\n' +
        'For very large documents:\\n' +
        '• Split into sections of 500-1000 pages each\\n' +
        '• Compare specific page ranges\\n' +
        '• Use specialized document management tools\\n' +
        '• Consider server-based processing solutions'
      );
    }
    
    if (pdf.numPages > 1000) {
      console.warn('⚠️ Very large PDF detected (' + pdf.numPages + ' pages). Processing may take 20-60 minutes.');
      updateProgress('PDF Loading', 35, 'Large document: ' + pdf.numPages + ' pages. This will take 20-60 minutes...');
    }
    
    // Extract text from all pages with progress tracking
    const pages = [];
    let totalCharacters = 0;
    let totalWords = 0;
    let successfulPages = 0;
    let failedPages = 0;
    const startTime = Date.now();
    
    console.log('📃 Starting text extraction from ' + pdf.numPages + ' pages...');
    updateProgress('Text Extraction', 40, 'Starting extraction from ' + pdf.numPages + ' pages...');
    
    // Process pages in batches for large files to manage memory
    const batchSize = pdf.numPages > 500 ? 25 : 50; // Smaller batches for very large files
    let processedPages = 0;
    
    for (let batch = 0; batch * batchSize < pdf.numPages; batch++) {
      const batchStart = batch * batchSize + 1;
      const batchEnd = Math.min((batch + 1) * batchSize, pdf.numPages);
      
      console.log('📦 Processing batch ' + (batch + 1) + ': pages ' + batchStart + '-' + batchEnd);
      updateProgress('Text Extraction', 40 + (processedPages / pdf.numPages) * 50, 
        'Processing pages ' + batchStart + '-' + batchEnd + ' of ' + pdf.numPages + '...');
      
      // Process batch with memory management
      for (let pageNum = batchStart; pageNum <= batchEnd; pageNum++) {
        try {
          // Progress update for large documents
          if (pageNum % 100 === 0 || pageNum === 1 || pageNum === pdf.numPages) {
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            const progress = Math.round((pageNum / pdf.numPages) * 100);
            const estimatedTotal = Math.round((elapsed / pageNum) * pdf.numPages);
            const remaining = Math.round(estimatedTotal - elapsed);
            
            console.log('📃 Page ' + pageNum + '/' + pdf.numPages + ' (' + progress + '% - ' + 
              Math.floor(elapsed/60) + ':' + (elapsed%60).toString().padStart(2,'0') + ' elapsed, ~' + 
              Math.floor(remaining/60) + ':' + (remaining%60).toString().padStart(2,'0') + ' remaining)');
            updateProgress('Text Extraction', 40 + (pageNum / pdf.numPages) * 50, 
              'Page ' + pageNum + '/' + pdf.numPages + ' - ' + Math.floor(elapsed/60) + ':' + (elapsed%60).toString().padStart(2,'0') + ' elapsed');
          }
          
          const page = await pdf.getPage(pageNum);
          
          // Enhanced text extraction with timeout for each page
          let textContent;
          try {
            const extractionPromise = page.getTextContent({
              normalizeWhitespace: true,
              disableCombineTextItems: false,
              includeMarkedContent: false
            });
            
            const pageTimeout = setTimeout(() => {
              throw new Error('Page ' + pageNum + ' extraction timeout');
            }, 60000); // 60 second timeout per page for large files
            
            textContent = await extractionPromise;
            clearTimeout(pageTimeout);
            
          } catch (pageExtractionError) {
            console.warn('⚠️ Primary extraction failed for page ' + pageNum + ', trying fallback...');
            
            try {
              textContent = await page.getTextContent({
                normalizeWhitespace: false,
                disableCombineTextItems: true,
                includeMarkedContent: true
              });
            } catch (fallbackError) {
              throw new Error('Text extraction failed: ' + pageExtractionError.message);
            }
          }
          
          // Enhanced text processing
          let pageText = '';
          let paragraphs = [];
          let currentParagraph = '';
          const lineThreshold = 12; // Slightly larger threshold for large files
          let currentY = null;
          
          if (textContent.items && textContent.items.length > 0) {
            const sortedItems = textContent.items.sort((a, b) => {
              const yDiff = b.transform[5] - a.transform[5];
              if (Math.abs(yDiff) > lineThreshold) {
                return yDiff;
              }
              return a.transform[4] - b.transform[4];
            });
            
            for (const item of sortedItems) {
              const text = item.str.trim();
              if (!text) continue;
              
              const itemY = item.transform[5];
              
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
              
              const needsSpace = currentParagraph && 
                                !currentParagraph.endsWith(' ') && 
                                !currentParagraph.endsWith('\\n') &&
                                !text.startsWith(' ');
              currentParagraph += (needsSpace ? ' ' : '') + text;
              currentY = itemY;
              pageText += text + ' ';
            }
            
            if (currentParagraph.trim()) {
              paragraphs.push({
                text: currentParagraph.trim(),
                paragraph_index: paragraphs.length,
                y_position: currentY,
                char_count: currentParagraph.trim().length
              });
            }
          }
          
          if (paragraphs.length === 0) {
            paragraphs.push({
              text: pageText.trim() || '[This page appears to be empty or contains only images/graphics]',
              paragraph_index: 0,
              y_position: 0,
              char_count: pageText.trim().length
            });
          }
          
          const words = pageText.trim().split(/\\s+/).filter(w => w.length > 0);
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
          
          // Cleanup page to manage memory for large files
          try {
            if (page.cleanup) {
              page.cleanup();
            }
          } catch (cleanupError) {
            // Ignore cleanup errors
          }
          
        } catch (pageError) {
          console.warn('⚠️ Error processing page ' + pageNum + ':', pageError.message);
          failedPages++;
          
          pages.push({
            page_number: pageNum,
            paragraphs: [{
              text: '[Error processing page ' + pageNum + ': ' + pageError.message + ']',
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
        
        processedPages++;
      }
      
      // Memory management between batches for large files
      if (pdf.numPages > 500) {
        // Force garbage collection hint
        if (typeof global !== 'undefined' && global.gc) {
          global.gc();
        }
        
        // Small delay to allow memory cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    const processingTime = Date.now() - startTime;
    
    updateProgress('Text Extraction', 90, 'Finalizing extraction results...');
    
    const metadata = {
      fileName: fileName,
      fileSize: arrayBuffer.byteLength,
      totalPages: pdf.numPages,
      successfulPages: successfulPages,
      failedPages: failedPages,
      totalWords: totalWords,
      totalCharacters: totalCharacters,
      isValidPDF: true,
      extractionMethod: 'PDF.js Large File Optimized (Fixed)',
      pdfJsVersion: window.pdfjsLib?.version || 'unknown',
      processingDate: new Date().toISOString(),
      processingTimeMs: processingTime,
      averageWordsPerPage: successfulPages > 0 ? Math.round(totalWords / successfulPages) : 0,
      successRate: Math.round((successfulPages / pdf.numPages) * 100),
      processingSpeed: Math.round(pdf.numPages / (processingTime / 1000)),
      isLargeFile: arrayBuffer.byteLength > 50 * 1024 * 1024,
      memoryUsage: Math.round(arrayBuffer.byteLength / 1024 / 1024) + 'MB'
    };
    
    updateProgress('Text Extraction', 100, 'Large PDF processing completed successfully!');
    
    console.log('✅ Large PDF text extraction completed successfully:');
    console.log('  📊 File Size: ' + (arrayBuffer.byteLength/1024/1024).toFixed(1) + 'MB');
    console.log('  📄 Pages: ' + pages.length + ' (' + successfulPages + ' successful, ' + failedPages + ' failed)');
    console.log('  📝 Words: ' + totalWords.toLocaleString());
    console.log('  🔤 Characters: ' + totalCharacters.toLocaleString());
    console.log('  ⚡ Speed: ' + metadata.processingSpeed + ' pages/second');
    console.log('  ✅ Success Rate: ' + metadata.successRate + '%');
    console.log('  ⏱️ Total Time: ' + Math.floor(processingTime/60000) + ':' + ((processingTime%60000)/1000).toFixed(0).padStart(2,'0'));
    
    // Quality warnings for large files
    if (failedPages > pdf.numPages * 0.1) {
      console.warn('⚠️ High page failure rate in large file: ' + failedPages + '/' + pdf.numPages + ' pages failed');
    }
    
    if (totalWords === 0) {
      console.warn('⚠️ No text content found in large PDF. This may be an image-only PDF.');
    }
    
    return {
      metadata: metadata,
      pages: pages,
      raw: arrayBuffer
    };
    
  } catch (error) {
    console.error('❌ Large PDF text extraction failed:', error);
    throw error;
  } finally {
    // Enhanced cleanup for large files
    if (pdf) {
      try {
        pdf.destroy();
        console.log('🧹 Large PDF resources cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️ Large PDF cleanup warning:', cleanupError);
      }
    }
    
    // Additional memory cleanup for large files
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
  }
};

// Enhanced PDF parsing for large files
export const parseLargePDFFile = async (file) => {
  console.log('🔧 Starting large PDF parsing for:', file?.name, '(' + (file.size/1024/1024).toFixed(1) + 'MB)');
  
  try {
    // Enhanced validation for large files
    if (file.type && !file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error(
        'Invalid File Type\\n\\n' +
        'Please select a valid PDF file with .pdf extension.\\n' +
        'Selected file type: ' + (file.type || 'unknown') + '\\n' +
        'File name: ' + file.name + '\\n' +
        'File size: ' + (file.size/1024/1024).toFixed(1) + 'MB'
      );
    }
    
    let arrayBuffer;
    
    if (file instanceof ArrayBuffer) {
      arrayBuffer = file;
    } else {
      arrayBuffer = await readLargePDFFile(file);
    }
    
    // Extract text using large file optimized implementation
    const result = await extractTextFromLargePDF(arrayBuffer, file.name || 'large-document.pdf');
    
    console.log('✅ Large PDF parsing completed successfully');
    return result;
    
  } catch (error) {
    console.error('❌ Large PDF parsing failed:', error);
    throw error;
  }
};

// Enhanced PDF comparison optimized for large files
export const compareLargePDFFiles = async (pdf1, pdf2, options = {}) => {
  console.log('🔄 Starting large PDF comparison');
  
  const pdf1Size = (pdf1.byteLength / 1024 / 1024).toFixed(1);
  const pdf2Size = (pdf2.byteLength / 1024 / 1024).toFixed(1);
  console.log('📊 File sizes: ' + pdf1Size + 'MB vs ' + pdf2Size + 'MB');
  
  const {
    compareMode = 'text',
    ignoreFormatting = true,
    pageByPage = true,
    includeImages = false
  } = options;
  
  try {
    updateProgress('Comparison', 0, 'Starting comparison of ' + pdf1Size + 'MB and ' + pdf2Size + 'MB PDFs...');
    
    console.log('📖 Parsing both large PDF files...');
    const startTime = Date.now();
    
    // Parse both PDFs with progress tracking
    updateProgress('Comparison', 5, 'Parsing first PDF file...');
    const data1 = await parseLargePDFFile(pdf1).catch(error => {
      throw new Error('First PDF Error:\\n' + error.message);
    });
    
    updateProgress('Comparison', 35, 'Parsing second PDF file...');
    const data2 = await parseLargePDFFile(pdf2).catch(error => {
      throw new Error('Second PDF Error:\\n' + error.message);
    });
    
    const parseTime = Date.now() - startTime;
    console.log('📊 Both large PDFs parsed successfully in ' + Math.floor(parseTime/60000) + ':' + ((parseTime%60000)/1000).toFixed(0).padStart(2,'0'));
    console.log('  File 1: ' + data1.pages.length + ' pages, ' + data1.metadata.totalWords.toLocaleString() + ' words');
    console.log('  File 2: ' + data2.pages.length + ' pages, ' + data2.metadata.totalWords.toLocaleString() + ' words');
    
    updateProgress('Comparison', 70, 'Starting detailed content comparison...');
    
    // Start detailed comparison with progress tracking
    const comparisonStartTime = Date.now();
    
    const text_changes = [];
    const page_differences = [];
    let totalElements = 0;
    let differences = 0;
    let matches = 0;
    
    const maxPages = Math.max(data1.pages.length, data2.pages.length);
    
    console.log('🔍 Comparing ' + maxPages + ' pages...');
    
    // Page-by-page comparison with progress updates for large files
    for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
      const page1 = data1.pages[pageIndex];
      const page2 = data2.pages[pageIndex];
      const pageNum = pageIndex + 1;
      
      // Progress updates every 100 pages for large documents
      if (pageNum % 100 === 0 || pageNum === maxPages) {
        const comparisonProgress = 70 + (pageNum / maxPages) * 25;
        updateProgress('Comparison', comparisonProgress, 'Comparing page ' + pageNum + ' of ' + maxPages + '...');
      }
      
      let pageChanges = 0;
      
      if (!page1 && page2) {
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
            let text1 = para1.text;
            let text2 = para2.text;
            
            if (ignoreFormatting) {
              text1 = text1.replace(/\\s+/g, ' ').trim();
              text2 = text2.replace(/\\s+/g, ' ').trim();
            }
            
            const isError1 = text1.startsWith('[Error') || text1.startsWith('[This page appears');
            const isError2 = text2.startsWith('[Error') || text2.startsWith('[This page appears');
            
            if (isError1 && isError2) {
              matches++;
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
          summary: pageChanges + ' change' + (pageChanges > 1 ? 's' : '') + ' detected',
          page1_paragraphs: page1?.paragraphs.length || 0,
          page2_paragraphs: page2?.paragraphs.length || 0
        });
      }
    }
    
    const comparisonTime = Date.now() - comparisonStartTime;
    const totalTime = parseTime + comparisonTime;
    
    updateProgress('Comparison', 95, 'Finalizing comparison results...');
    
    // Calculate metrics
    const totalComparisons = differences + matches;
    const similarity_score = totalComparisons > 0 ? Math.round((matches / totalComparisons) * 100) : 100;
    
    const wordChanges = {
      file1_words: data1.metadata.totalWords,
      file2_words: data2.metadata.totalWords,
      word_difference: Math.abs(data1.metadata.totalWords - data2.metadata.totalWords),
      word_change_percentage: data1.metadata.totalWords > 0 ? 
        Math.round((Math.abs(data1.metadata.totalWords - data2.metadata.totalWords) / data1.metadata.totalWords) * 100) : 0
    };
    
    const results = {
      differences_found: differences,
      matches_found: matches,
      total_pages: maxPages,
      total_elements: totalElements,
      similarity_score: similarity_score,
      
      text_changes: text_changes,
      page_differences: page_differences,
      
      file1_pages: data1.pages,
      file2_pages: data2.pages,
      file1_metadata: data1.metadata,
      file2_metadata: data2.metadata,
      
      added_count: text_changes.filter(c => c.type === 'added').length,
      removed_count: text_changes.filter(c => c.type === 'removed').length,
      modified_count: text_changes.filter(c => c.type === 'modified').length,
      
      word_changes: wordChanges,
      
      comparison_type: 'large_pdf_document',
      comparison_options: options,
      processing_note: 'Large PDF comparison (' + pdf1Size + 'MB + ' + pdf2Size + 'MB) using optimized PDF.js processing (FIXED)',
      processing_time: {
        parse_time_ms: parseTime,
        comparison_time_ms: comparisonTime,
        total_time_ms: totalTime
      },
      
      quality_metrics: {
        file1_success_rate: data1.metadata.successfulPages / data1.metadata.totalPages,
        file2_success_rate: data2.metadata.successfulPages / data2.metadata.totalPages,
        overall_success_rate: (data1.metadata.successfulPages + data2.metadata.successfulPages) / 
                             (data1.metadata.totalPages + data2.metadata.totalPages),
        processing_speed_pages_per_second: Math.round((data1.metadata.totalPages + data2.metadata.totalPages) / (totalTime / 1000)),
        memory_usage: pdf1Size + 'MB + ' + pdf2Size + 'MB processed',
        pdf_js_version: data1.metadata.pdfJsVersion
      }
    };
    
    updateProgress('Comparison', 100, 'Large PDF comparison completed successfully!');
    
    const totalTimeFormatted = Math.floor(totalTime/60000) + ':' + ((totalTime%60000)/1000).toFixed(0).padStart(2,'0');
    
    console.log('✅ Large PDF comparison completed successfully:');
    console.log('  📊 Similarity: ' + results.similarity_score + '%');
    console.log('  🔍 Changes: ' + results.differences_found.toLocaleString());
    console.log('  ✅ Matches: ' + results.matches_found.toLocaleString());
    console.log('  📄 Total Pages: ' + results.total_pages.toLocaleString());
    console.log('  ⏱️ Total Time: ' + totalTimeFormatted);
    console.log('  🚀 Speed: ' + results.quality_metrics.processing_speed_pages_per_second + ' pages/s');
    console.log('  💾 Memory: ' + results.quality_metrics.memory_usage);
    console.log('  📋 PDF.js: ' + results.quality_metrics.pdf_js_version);
    
    return results;
    
  } catch (error) {
    console.error('❌ Large PDF comparison failed:', error);
    throw error;
  }
};

// Export the enhanced functions
export const compareLargePDFFiles = compareWithSmartDiff;
export { parseLargePDFFile as parsePDFFile };

