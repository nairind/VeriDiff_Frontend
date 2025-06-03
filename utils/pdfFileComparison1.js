// utils/pdfFileComparison1.js
// COMPLETE PDF.JS IMPLEMENTATION FOR VERIDIFF
// Real PDF text extraction and comparison - replaces mock implementation

// Configure PDF.js worker (will be set after PDF.js loads)
let pdfjsLib = null;

// Initialize PDF.js when available
const initializePDFJS = () => {
  if (typeof window !== 'undefined' && window.pdfjsLib) {
    pdfjsLib = window.pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.269/pdf.worker.min.js';
    console.log('✅ PDF.js initialized successfully');
    return true;
  }
  console.warn('⚠️ PDF.js not loaded yet');
  return false;
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

// Enhanced PDF text extraction using PDF.js
const extractTextFromPDF = async (arrayBuffer, fileName) => {
  try {
    console.log('🔍 Extracting text from PDF using PDF.js...');
    
    // Ensure PDF.js is loaded
    if (!initializePDFJS()) {
      throw new Error('PDF.js library not loaded. Please ensure PDF.js is included in your HTML.');
    }

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    console.log(`📄 PDF loaded successfully. Pages: ${pdf.numPages}`);
    
    const pages = [];
    let totalCharacters = 0;
    let totalWords = 0;
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`📃 Processing page ${pageNum}/${pdf.numPages}...`);
      
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items into paragraphs
      let pageText = '';
      let currentY = null;
      let paragraphs = [];
      let currentParagraph = '';
      
      textContent.items.forEach((item) => {
        const text = item.str.trim();
        if (!text) return;
        
        // Detect paragraph breaks based on Y position changes
        if (currentY !== null && Math.abs(item.transform[5] - currentY) > 5) {
          // New line/paragraph detected
          if (currentParagraph.trim()) {
            paragraphs.push({
              text: currentParagraph.trim(),
              paragraph_index: paragraphs.length,
              y_position: currentY
            });
            currentParagraph = '';
          }
        }
        
        currentParagraph += (currentParagraph ? ' ' : '') + text;
        currentY = item.transform[5];
        pageText += text + ' ';
      });
      
      // Add final paragraph
      if (currentParagraph.trim()) {
        paragraphs.push({
          text: currentParagraph.trim(),
          paragraph_index: paragraphs.length,
          y_position: currentY
        });
      }
      
      // If no paragraphs detected, create one from all text
      if (paragraphs.length === 0 && pageText.trim()) {
        paragraphs.push({
          text: pageText.trim(),
          paragraph_index: 0,
          y_position: 0
        });
      }
      
      const words = pageText.trim().split(/\s+/).filter(w => w.length > 0);
      totalWords += words.length;
      totalCharacters += pageText.length;
      
      pages.push({
        page_number: pageNum,
        paragraphs: paragraphs,
        word_count: words.length,
        character_count: pageText.length,
        raw_text: pageText.trim()
      });
    }
    
    const metadata = {
      fileName: fileName,
      fileSize: arrayBuffer.byteLength,
      totalPages: pdf.numPages,
      totalWords: totalWords,
      totalCharacters: totalCharacters,
      isValidPDF: true,
      extractionMethod: 'PDF.js'
    };
    
    console.log('✅ PDF text extraction complete:', {
      pages: pages.length,
      totalWords,
      totalCharacters,
      avgWordsPerPage: Math.round(totalWords / pages.length) || 0
    });
    
    return {
      metadata: metadata,
      pages: pages,
      raw: arrayBuffer
    };
    
  } catch (error) {
    console.error('❌ PDF text extraction error:', error);
    
    // Provide specific error messages
    if (error.message.includes('Invalid PDF')) {
      throw new Error('Invalid PDF file format. Please ensure the file is a valid PDF document.');
    } else if (error.message.includes('password')) {
      throw new Error('Password-protected PDF files are not supported. Please provide an unprotected PDF.');
    } else if (error.message.includes('PDF.js')) {
      throw new Error('PDF processing library not available. Please refresh the page and try again.');
    } else {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }
};

// Advanced text comparison with word-level diffing
const compareTexts = (text1, text2, options = {}) => {
  const {
    ignoreCase = false,
    ignoreWhitespace = false,
    wordLevel = true
  } = options;
  
  // Normalize texts based on options
  let normalizedText1 = text1;
  let normalizedText2 = text2;
  
  if (ignoreCase) {
    normalizedText1 = normalizedText1.toLowerCase();
    normalizedText2 = normalizedText2.toLowerCase();
  }
  
  if (ignoreWhitespace) {
    normalizedText1 = normalizedText1.replace(/\s+/g, ' ').trim();
    normalizedText2 = normalizedText2.replace(/\s+/g, ' ').trim();
  }
  
  if (wordLevel) {
    // Word-level comparison
    const words1 = normalizedText1.split(/\s+/);
    const words2 = normalizedText2.split(/\s+/);
    
    return {
      isEqual: normalizedText1 === normalizedText2,
      similarity: calculateSimilarity(words1, words2),
      changes: calculateWordChanges(words1, words2)
    };
  } else {
    // Character-level comparison
    return {
      isEqual: normalizedText1 === normalizedText2,
      similarity: calculateSimilarity(normalizedText1.split(''), normalizedText2.split('')),
      changes: []
    };
  }
};

// Calculate similarity percentage using Longest Common Subsequence
const calculateSimilarity = (arr1, arr2) => {
  if (arr1.length === 0 && arr2.length === 0) return 100;
  if (arr1.length === 0 || arr2.length === 0) return 0;
  
  const lcs = longestCommonSubsequence(arr1, arr2);
  const maxLength = Math.max(arr1.length, arr2.length);
  return Math.round((lcs.length / maxLength) * 100);
};

// Find longest common subsequence
const longestCommonSubsequence = (arr1, arr2) => {
  const dp = Array(arr1.length + 1).fill(null).map(() => Array(arr2.length + 1).fill(0));
  
  for (let i = 1; i <= arr1.length; i++) {
    for (let j = 1; j <= arr2.length; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // Reconstruct LCS
  const lcs = [];
  let i = arr1.length, j = arr2.length;
  while (i > 0 && j > 0) {
    if (arr1[i - 1] === arr2[j - 1]) {
      lcs.unshift(arr1[i - 1]);
      i--; j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  return lcs;
};

// Calculate word-level changes
const calculateWordChanges = (words1, words2) => {
  const changes = [];
  const lcs = longestCommonSubsequence(words1, words2);
  
  let i = 0, j = 0, lcsIndex = 0;
  let position = 0;
  
  while (i < words1.length || j < words2.length) {
    if (lcsIndex < lcs.length && 
        i < words1.length && 
        words1[i] === lcs[lcsIndex]) {
      // Match found
      i++; j++; lcsIndex++;
      position += words1[i - 1].length + 1;
    } else if (i < words1.length && 
               (j >= words2.length || words1[i] !== (words2[j] || ''))) {
      // Deletion
      changes.push({
        type: 'removed',
        text: words1[i],
        start: position,
        end: position + words1[i].length
      });
      position += words1[i].length + 1;
      i++;
    } else if (j < words2.length) {
      // Addition
      changes.push({
        type: 'added',
        text: words2[j],
        start: position,
        end: position + words2[j].length
      });
      j++;
    }
  }
  
  return changes;
};

// Main PDF parsing function
export const parsePDFFile = async (file) => {
  console.log('🔧 parsePDFFile called with PDF.js implementation');
  
  try {
    // Validate file type
    if (file.type && !file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('File is not a PDF document. Please select a valid PDF file.');
    }
    
    let arrayBuffer;
    
    if (file instanceof ArrayBuffer) {
      arrayBuffer = file;
    } else {
      arrayBuffer = await readFileAsArrayBuffer(file);
    }
    
    // Extract text using PDF.js
    const result = await extractTextFromPDF(arrayBuffer, file.name || 'document.pdf');
    
    console.log('✅ PDF parsed successfully with real text extraction');
    return result;
    
  } catch (error) {
    console.error('❌ PDF parsing error:', error);
    throw error;
  }
};

// Main PDF comparison function
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
    // Parse both PDFs
    console.log('📖 Parsing PDF files...');
    const data1 = await parsePDFFile(pdf1);
    const data2 = await parsePDFFile(pdf2);
    
    console.log('📊 Comparing PDF documents...');
    console.log(`  File 1: ${data1.pages.length} pages, ${data1.metadata.totalWords} words`);
    console.log(`  File 2: ${data2.pages.length} pages, ${data2.metadata.totalWords} words`);
    
    // Initialize comparison results
    const text_changes = [];
    const page_differences = [];
    let totalParagraphs = 0;
    let differences = 0;
    let matches = 0;
    
    // Compare metadata
    const metadataChanges = [];
    if (data1.metadata.totalPages !== data2.metadata.totalPages) {
      metadataChanges.push({
        type: 'page_count_difference',
        oldValue: data1.metadata.totalPages,
        newValue: data2.metadata.totalPages
      });
    }
    
    // Page-by-page comparison
    const maxPages = Math.max(data1.pages.length, data2.pages.length);
    
    for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
      const page1 = data1.pages[pageIndex];
      const page2 = data2.pages[pageIndex];
      const pageNum = pageIndex + 1;
      
      let pageChanges = 0;
      
      if (!page1) {
        // Page only exists in document 2
        pageChanges = page2.paragraphs.length;
        differences += pageChanges;
        totalParagraphs += page2.paragraphs.length;
        
        page2.paragraphs.forEach((para, paraIndex) => {
          text_changes.push({
            page: pageNum,
            paragraph: paraIndex,
            type: 'added',
            text: para.text,
            file: 'file2'
          });
        });
        
      } else if (!page2) {
        // Page only exists in document 1
        pageChanges = page1.paragraphs.length;
        differences += pageChanges;
        totalParagraphs += page1.paragraphs.length;
        
        page1.paragraphs.forEach((para, paraIndex) => {
          text_changes.push({
            page: pageNum,
            paragraph: paraIndex,
            type: 'removed',
            text: para.text,
            file: 'file1'
          });
        });
        
      } else {
        // Both pages exist - compare paragraphs
        const maxParas = Math.max(page1.paragraphs.length, page2.paragraphs.length);
        totalParagraphs += maxParas;
        
        for (let paraIndex = 0; paraIndex < maxParas; paraIndex++) {
          const para1 = page1.paragraphs[paraIndex];
          const para2 = page2.paragraphs[paraIndex];
          
          if (!para1) {
            // Paragraph added in document 2
            pageChanges++;
            differences++;
            text_changes.push({
              page: pageNum,
              paragraph: paraIndex,
              type: 'added',
              text: para2.text,
              file: 'file2'
            });
          } else if (!para2) {
            // Paragraph removed from document 2
            pageChanges++;
            differences++;
            text_changes.push({
              page: pageNum,
              paragraph: paraIndex,
              type: 'removed',
              text: para1.text,
              file: 'file1'
            });
          } else {
            // Compare paragraph content
            const comparison = compareTexts(para1.text, para2.text, {
              ignoreCase: false,
              ignoreWhitespace: ignoreFormatting,
              wordLevel: true
            });
            
            if (!comparison.isEqual) {
              pageChanges++;
              differences++;
              text_changes.push({
                page: pageNum,
                paragraph: paraIndex,
                type: 'modified',
                text: `"${para1.text}" → "${para2.text}"`,
                file: 'both',
                similarity: comparison.similarity,
                changes: comparison.changes
              });
            } else {
              matches++;
            }
          }
        }
      }
      
      // Record page-level changes
      if (pageChanges > 0) {
        page_differences.push({
          page_number: pageNum,
          changes_count: pageChanges,
          summary: `${pageChanges} change${pageChanges > 1 ? 's' : ''} on page ${pageNum}`,
          change_types: text_changes
            .filter(c => c.page === pageNum)
            .map(c => c.type)
            .reduce((acc, type) => {
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            }, {})
        });
      }
    }
    
    // Calculate overall similarity
    const totalComparisons = differences + matches;
    const similarity_score = totalComparisons > 0 ? Math.round((matches / totalComparisons) * 100) : 100;
    
    // Prepare final results
    const results = {
      // Core statistics expected by PdfResults.js
      differences_found: differences,
      matches_found: matches,
      total_pages: maxPages,
      total_paragraphs: totalParagraphs,
      similarity_score: similarity_score,
      
      // Change details
      text_changes: text_changes,
      page_differences: page_differences,
      
      // Page data for display
      file1_pages: data1.pages,
      file2_pages: data2.pages,
      
      // Enhanced metadata
      file1_metadata: data1.metadata,
      file2_metadata: data2.metadata,
      comparison_type: 'pdf_document',
      comparison_options: options,
      
      // Processing information
      processing_note: 'Real PDF text extraction using PDF.js',
      metadata_changes: metadataChanges,
      
      // Summary by change type
      added_count: text_changes.filter(c => c.type === 'added').length,
      removed_count: text_changes.filter(c => c.type === 'removed').length,
      modified_count: text_changes.filter(c => c.type === 'modified').length,
      
      // Additional statistics
      word_changes: {
        file1_words: data1.metadata.totalWords,
        file2_words: data2.metadata.totalWords,
        word_difference: Math.abs(data1.metadata.totalWords - data2.metadata.totalWords)
      }
    };
    
    console.log('✅ PDF document comparison complete with real text analysis:');
    console.log('  - Total pages:', results.total_pages);
    console.log('  - Total paragraphs:', results.total_paragraphs);
    console.log('  - Differences:', results.differences_found);
    console.log('  - Matches:', results.matches_found);
    console.log('  - Similarity:', results.similarity_score + '%');
    console.log('  - Word changes:', results.word_changes);
    
    return results;
    
  } catch (error) {
    console.error('❌ PDF document comparison error:', error);
    throw error;
  }
};

// Export additional utilities for testing
export const extractTextFromPDFFile = extractTextFromPDF;
export const compareTextContent = compareTexts;
