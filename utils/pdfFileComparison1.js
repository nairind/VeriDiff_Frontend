// utils/largePdfFileComparison.js
// ENHANCED PDF.js IMPLEMENTATION FOR LARGE FILES (UP TO 100MB) - WITH CONTENT-AWARE SMARTDIFF

// ==============================================================================
// ENHANCED SMARTDIFF CLASS WITH CONTENT-AWARE ALIGNMENT
// ==============================================================================

/**
 * Enhanced SmartDiff with Content-Aware Alignment for Financial Documents
 * This addresses the issue where "Subtotal" fields should align regardless of position
 */
class EnhancedSmartDiff {
  constructor(options = {}) {
    this.options = {
      ignoreWhitespace: options.ignoreWhitespace ?? true,
      ignoreCase: options.ignoreCase ?? false,
      wordLevel: options.wordLevel ?? true,
      sentenceLevel: options.sentenceLevel ?? true,
      similarity_threshold: options.similarity_threshold ?? 0.8,
      context_lines: options.context_lines ?? 3,
      enableContentAlignment: options.enableContentAlignment ?? true,
      financialDocument: options.financialDocument ?? true,
      ...options
    };

    // Define patterns for content alignment
    this.contentPatterns = {
      // Financial patterns
      subtotal: /subtotal\s*:?\s*\$?[\d,]+\.?\d*/i,
      tax: /tax\s*\(?[\d.%]*\)?\s*:?\s*\$?[\d,]+\.?\d*/i,
      total: /total\s*:?\s*\$?[\d,]+\.?\d*/i,
      discount: /discount\s*:?\s*\$?[\d,]+\.?\d*/i,
      
      // Line items (description + price)
      lineItem: /^(.+?)\s+\$?[\d,]+\.?\d*\s*\$?[\d,]+\.?\d*$/,
      
      // Headers and sections
      header: /^[A-Z\s]+$/,
      section: /^[A-Za-z\s]+:$/,
      
      // Contact/address info
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
      phone: /\(?[\d\s-()]+\)?/,
      address: /\d+\s+[A-Za-z\s,]+/
    };
  }

  /**
   * Classify content type based on patterns
   */
  classifyContent(text) {
    if (!text || typeof text !== 'string') return 'unknown';
    
    const normalizedText = text.trim().toLowerCase();
    
    // Check financial patterns first (most specific)
    if (this.contentPatterns.subtotal.test(normalizedText)) return 'subtotal';
    if (this.contentPatterns.tax.test(normalizedText)) return 'tax';
    if (this.contentPatterns.total.test(normalizedText)) return 'total';
    if (this.contentPatterns.discount.test(normalizedText)) return 'discount';
    
    // Check line items
    if (this.contentPatterns.lineItem.test(text)) return 'line_item';
    
    // Check structural elements
    if (this.contentPatterns.header.test(text)) return 'header';
    if (this.contentPatterns.section.test(text)) return 'section';
    
    // Check contact info
    if (this.contentPatterns.email.test(text)) return 'email';
    if (this.contentPatterns.phone.test(text)) return 'phone';
    if (this.contentPatterns.address.test(text)) return 'address';
    
    // Default classification
    if (normalizedText.length < 10) return 'short_text';
    if (normalizedText.length > 200) return 'long_text';
    
    return 'general_text';
  }

  /**
   * Extract key identifiers for content matching
   */
  extractContentKey(text, contentType) {
    if (!text) return '';
    
    const normalized = text.toLowerCase().trim();
    
    switch (contentType) {
      case 'subtotal':
        return 'subtotal';
      case 'tax':
        return 'tax';
      case 'total':
        return 'total';
      case 'discount':
        return 'discount';
      case 'line_item':
        // Extract the description part (before price)
        const match = text.match(this.contentPatterns.lineItem);
        return match ? match[1].toLowerCase().trim() : normalized;
      case 'email':
        return normalized;
      case 'phone':
        return normalized.replace(/[\s()-]/g, '');
      default:
        return normalized.substring(0, 50); // First 50 chars as key
    }
  }

  /**
   * Calculate content similarity beyond just text similarity
   */
  calculateContentSimilarity(content1, content2, type1, type2) {
    // If different content types, very low similarity
    if (type1 !== type2) {
      return 0.1;
    }

    // For same content types, use enhanced similarity
    const textSim = this.calculateSimilarity(content1, content2);
    
    // Boost similarity for matching financial content types
    if (['subtotal', 'tax', 'total', 'discount'].includes(type1)) {
      return Math.min(1.0, textSim + 0.3); // Boost by 30%
    }
    
    return textSim;
  }

  /**
   * Create content-aware alignment between two sets of paragraphs
   */
  alignParagraphs(paragraphs1, paragraphs2) {
    console.log('🔄 Creating content-aware alignment...');
    
    if (!this.options.enableContentAlignment) {
      // Fallback to positional alignment
      const maxLength = Math.max(paragraphs1.length, paragraphs2.length);
      const alignments = [];
      for (let i = 0; i < maxLength; i++) {
        alignments.push({
          para1: paragraphs1[i] || null,
          para2: paragraphs2[i] || null,
          index1: i,
          index2: i,
          alignment_type: 'positional',
          confidence: 0.5
        });
      }
      return alignments;
    }

    // Step 1: Classify all paragraphs
    const classified1 = paragraphs1.map((para, index) => ({
      ...para,
      index,
      contentType: this.classifyContent(para.text),
      contentKey: this.extractContentKey(para.text, this.classifyContent(para.text))
    }));

    const classified2 = paragraphs2.map((para, index) => ({
      ...para,
      index,
      contentType: this.classifyContent(para.text),
      contentKey: this.extractContentKey(para.text, this.classifyContent(para.text))
    }));

    console.log('📋 Content classification:');
    console.log('  File 1:', classified1.map(p => `${p.index}: ${p.contentType}`).join(', '));
    console.log('  File 2:', classified2.map(p => `${p.index}: ${p.contentType}`).join(', '));

    // Step 2: Create alignment matrix
    const alignments = [];
    const used1 = new Set();
    const used2 = new Set();

    // Priority 1: Exact content type + key matches
    for (const p1 of classified1) {
      for (const p2 of classified2) {
        if (!used1.has(p1.index) && !used2.has(p2.index)) {
          if (p1.contentType === p2.contentType && p1.contentKey === p2.contentKey) {
            alignments.push({
              para1: p1,
              para2: p2,
              index1: p1.index,
              index2: p2.index,
              alignment_type: 'exact_match',
              confidence: 0.95,
              content_type: p1.contentType
            });
            used1.add(p1.index);
            used2.add(p2.index);
            console.log(`✅ Exact match: "${p1.text.substring(0, 50)}..." ↔ "${p2.text.substring(0, 50)}..."`);
          }
        }
      }
    }

    // Priority 2: Same content type matches
    for (const p1 of classified1) {
      if (!used1.has(p1.index)) {
        let bestMatch = null;
        let bestSimilarity = 0;

        for (const p2 of classified2) {
          if (!used2.has(p2.index) && p1.contentType === p2.contentType) {
            const similarity = this.calculateContentSimilarity(p1.text, p2.text, p1.contentType, p2.contentType);
            if (similarity > bestSimilarity && similarity > 0.3) {
              bestSimilarity = similarity;
              bestMatch = p2;
            }
          }
        }

        if (bestMatch) {
          alignments.push({
            para1: p1,
            para2: bestMatch,
            index1: p1.index,
            index2: bestMatch.index,
            alignment_type: 'content_type_match',
            confidence: bestSimilarity,
            content_type: p1.contentType
          });
          used1.add(p1.index);
          used2.add(bestMatch.index);
          console.log(`🎯 Content match: ${p1.contentType} "${p1.text.substring(0, 30)}..." ↔ "${bestMatch.text.substring(0, 30)}..." (${Math.round(bestSimilarity * 100)}%)`);
        }
      }
    }

    // Priority 3: Handle unmatched paragraphs (additions/deletions)
    for (const p1 of classified1) {
      if (!used1.has(p1.index)) {
        alignments.push({
          para1: p1,
          para2: null,
          index1: p1.index,
          index2: -1,
          alignment_type: 'deleted',
          confidence: 1.0,
          content_type: p1.contentType
        });
        console.log(`➖ Deleted: ${p1.contentType} "${p1.text.substring(0, 50)}..."`);
      }
    }

    for (const p2 of classified2) {
      if (!used2.has(p2.index)) {
        alignments.push({
          para1: null,
          para2: p2,
          index1: -1,
          index2: p2.index,
          alignment_type: 'added',
          confidence: 1.0,
          content_type: p2.contentType
        });
        console.log(`➕ Added: ${p2.contentType} "${p2.text.substring(0, 50)}..."`);
      }
    }

    // Sort alignments by original order (weighted average of positions)
    alignments.sort((a, b) => {
      const pos1 = a.index1 >= 0 ? a.index1 : (a.index2 >= 0 ? a.index2 : 999);
      const pos2 = b.index1 >= 0 ? b.index1 : (b.index2 >= 0 ? b.index2 : 999);
      return pos1 - pos2;
    });

    console.log(`✅ Content-aware alignment complete: ${alignments.length} alignments created`);
    return alignments;
  }

  /**
   * Enhanced paragraph comparison with content awareness
   */
  compareAlignedParagraphs(alignment) {
    const { para1, para2, alignment_type, confidence, content_type } = alignment;

    if (!para1 && para2) {
      return {
        type: 'added',
        similarity: 0,
        confidence: 'high',
        alignment_type: alignment_type,
        content_type: content_type,
        changes: [{
          type: 'insert',
          content: para2.text,
          position: 0
        }],
        metadata: {
          char_count_1: 0,
          char_count_2: para2.text.length
        }
      };
    }

    if (para1 && !para2) {
      return {
        type: 'removed',
        similarity: 0,
        confidence: 'high',
        alignment_type: alignment_type,
        content_type: content_type,
        changes: [{
          type: 'delete',
          content: para1.text,
          position: 0
        }],
        metadata: {
          char_count_1: para1.text.length,
          char_count_2: 0
        }
      };
    }

    if (para1 && para2) {
      const result = this.computeSmartDiff(para1.text, para2.text);
      
      // Enhance with alignment information
      return {
        ...result,
        alignment_type: alignment_type,
        content_type: content_type,
        alignment_confidence: confidence,
        metadata: {
          char_count_1: para1.text.length,
          char_count_2: para2.text.length,
          position_1: para1.y_position || 0,
          position_2: para2.y_position || 0,
          original_index_1: alignment.index1,
          original_index_2: alignment.index2
        }
      };
    }

    return {
      type: 'error',
      similarity: 0,
      confidence: 'low',
      changes: [],
      metadata: {}
    };
  }

  // Include all the original SmartDiff methods
  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  calculateSimilarity(text1, text2) {
    if (text1 === text2) return 1.0;
    if (!text1 || !text2) return 0.0;
    
    const maxLength = Math.max(text1.length, text2.length);
    const distance = this.levenshteinDistance(text1, text2);
    return Math.max(0, (maxLength - distance) / maxLength);
  }

  normalizeText(text) {
    if (!text) return '';
    
    let normalized = text;
    
    if (this.options.ignoreWhitespace) {
      normalized = normalized.replace(/\s+/g, ' ').trim();
    }
    
    if (this.options.ignoreCase) {
      normalized = normalized.toLowerCase();
    }
    
    return normalized;
  }

  tokenizeText(text, level = 'word') {
    if (!text) return [];
    
    switch (level) {
      case 'character':
        return text.split('');
      case 'word':
        return text.split(/\s+/).filter(word => word.length > 0);
      case 'sentence':
        return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
      case 'line':
        return text.split(/\n/).filter(line => line.trim().length > 0);
      default:
        return [text];
    }
  }

  computeSmartDiff(text1, text2) {
    const norm1 = this.normalizeText(text1);
    const norm2 = this.normalizeText(text2);
    
    if (norm1 === norm2) {
      return {
        type: 'unchanged',
        similarity: 1.0,
        changes: [],
        confidence: 'high'
      };
    }

    const similarity = this.calculateSimilarity(norm1, norm2);
    
    if (similarity < this.options.similarity_threshold) {
      return {
        type: 'replaced',
        similarity: similarity,
        changes: [{
          type: 'delete',
          content: text1,
          position: 0
        }, {
          type: 'insert',
          content: text2,
          position: 0
        }],
        confidence: similarity < 0.3 ? 'high' : 'medium'
      };
    }

    const words1 = this.tokenizeText(norm1, 'word');
    const words2 = this.tokenizeText(norm2, 'word');
    const wordDiff = this.diffArrays(words1, words2);
    
    return {
      type: 'modified',
      similarity: similarity,
      changes: wordDiff,
      confidence: similarity > 0.7 ? 'high' : 'medium',
      word_changes: this.analyzeWordChanges(wordDiff)
    };
  }

  diffArrays(arr1, arr2) {
    const changes = [];
    const m = arr1.length;
    const n = arr2.length;
    
    const lcs = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (arr1[i - 1] === arr2[j - 1]) {
          lcs[i][j] = lcs[i - 1][j - 1] + 1;
        } else {
          lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
        }
      }
    }
    
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && arr1[i - 1] === arr2[j - 1]) {
        i--; j--;
      } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
        changes.unshift({
          type: 'insert',
          content: arr2[j - 1],
          position: j - 1
        });
        j--;
      } else if (i > 0) {
        changes.unshift({
          type: 'delete',
          content: arr1[i - 1],
          position: i - 1
        });
        i--;
      }
    }
    
    return changes;
  }

  analyzeWordChanges(changes) {
    const analysis = {
      insertions: 0,
      deletions: 0,
      total_changes: changes.length,
      change_density: 0,
      common_patterns: []
    };
    
    changes.forEach(change => {
      if (change.type === 'insert') analysis.insertions++;
      if (change.type === 'delete') analysis.deletions++;
    });
    
    return analysis;
  }
}

// ==============================================================================
// ORIGINAL PDF PROCESSING CODE 
// ==============================================================================

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
      extractionMethod: 'PDF.js Large File Optimized with Enhanced SmartDiff',
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

// ==============================================================================
// ENHANCED PDF COMPARISON WITH CONTENT-AWARE ALIGNMENT
// ==============================================================================

export const compareLargePDFFiles = async (pdf1, pdf2, options = {}) => {
  console.log('🧠 Starting Enhanced SmartDiff PDF comparison with Content Alignment');
  
  const pdf1Size = (pdf1.byteLength / 1024 / 1024).toFixed(1);
  const pdf2Size = (pdf2.byteLength / 1024 / 1024).toFixed(1);
  console.log('📊 File sizes: ' + pdf1Size + 'MB vs ' + pdf2Size + 'MB');
  
  const {
    compareMode = 'text',
    ignoreFormatting = true,
    pageByPage = true,
    includeImages = false,
    useSmartDiff = true,
    similarity_threshold = 0.8,
    ignoreWhitespace = true,
    ignoreCase = false,
    enableContentAlignment = true,  // Enable content-aware alignment
    financialDocument = true        // Enable financial document patterns
  } = options;
  
  // Initialize Enhanced SmartDiff with content alignment
  const smartDiff = new EnhancedSmartDiff({
    ignoreWhitespace: ignoreWhitespace,
    ignoreCase: ignoreCase,
    similarity_threshold: similarity_threshold,
    wordLevel: true,
    sentenceLevel: true,
    enableContentAlignment: enableContentAlignment,
    financialDocument: financialDocument
  });
  
  try {
    updateProgress('Enhanced SmartDiff', 0, 'Starting content-aware comparison...');
    
    console.log('📖 Parsing both large PDF files...');
    const startTime = Date.now();
    
    // Parse both PDFs with progress tracking
    updateProgress('Enhanced SmartDiff', 5, 'Parsing first PDF file...');
    const data1 = await parseLargePDFFile(pdf1).catch(error => {
      throw new Error('First PDF Error:\\n' + error.message);
    });
    
    updateProgress('Enhanced SmartDiff', 35, 'Parsing second PDF file...');
    const data2 = await parseLargePDFFile(pdf2).catch(error => {
      throw new Error('Second PDF Error:\\n' + error.message);
    });
    
    const parseTime = Date.now() - startTime;
    console.log('📊 Both large PDFs parsed successfully in ' + Math.floor(parseTime/60000) + ':' + ((parseTime%60000)/1000).toFixed(0).padStart(2,'0'));
    console.log('  File 1: ' + data1.pages.length + ' pages, ' + data1.metadata.totalWords.toLocaleString() + ' words');
    console.log('  File 2: ' + data2.pages.length + ' pages, ' + data2.metadata.totalWords.toLocaleString() + ' words');
    
    updateProgress('Enhanced SmartDiff', 60, 'Starting content-aware alignment and comparison...');
    
    // Start detailed comparison with Enhanced SmartDiff
    const comparisonStartTime = Date.now();
    
    const smart_changes = [];
    const text_changes = [];
    const page_differences = [];
    let total_similarity = 0;
    let compared_elements = 0;
    let totalElements = 0;
    let differences = 0;
    let matches = 0;
    
    const maxPages = Math.max(data1.pages.length, data2.pages.length);
    
    console.log('🧠 Enhanced SmartDiff comparing ' + maxPages + ' pages with content alignment...');
    
    // Page-by-page comparison with Enhanced SmartDiff
    for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
      const page1 = data1.pages[pageIndex];
      const page2 = data2.pages[pageIndex];
      const pageNum = pageIndex + 1;
      
      // Progress updates every 50 pages for large documents
      if (pageNum % 50 === 0 || pageNum === maxPages) {
        const comparisonProgress = 60 + (pageNum / maxPages) * 35;
        updateProgress('Enhanced SmartDiff', comparisonProgress, 'Content-aware analysis of page ' + pageNum + ' of ' + maxPages + '...');
      }
      
      let pageChanges = 0;
      let page_similarity_sum = 0;
      let page_comparisons = 0;
      
      if (!page1 && page2) {
        // Entire page added
        pageChanges = page2.paragraphs.length;
        differences += pageChanges;
        totalElements += page2.paragraphs.length;
        
        page2.paragraphs.forEach((para, paraIndex) => {
          const contentType = smartDiff.classifyContent(para.text);
          
          smart_changes.push({
            page: pageNum,
            paragraph: paraIndex,
            type: 'page_added',
            change_type: 'addition',
            content: para.text,
            confidence: 'high',
            similarity: 0,
            content_type: contentType,
            alignment_type: 'page_added',
            metadata: { char_count: para.text.length }
          });
          
          text_changes.push({
            page: pageNum,
            paragraph: paraIndex,
            type: 'added',
            text: para.text,
            file: 'file2',
            char_count: para.char_count || para.text.length,
            confidence: 'high',
            content_type: contentType
          });
        });
        
      } else if (page1 && !page2) {
        // Entire page removed
        pageChanges = page1.paragraphs.length;
        differences += pageChanges;
        totalElements += page1.paragraphs.length;
        
        page1.paragraphs.forEach((para, paraIndex) => {
          const contentType = smartDiff.classifyContent(para.text);
          
          smart_changes.push({
            page: pageNum,
            paragraph: paraIndex,
            type: 'page_removed',
            change_type: 'deletion',
            content: para.text,
            confidence: 'high',
            similarity: 0,
            content_type: contentType,
            alignment_type: 'page_removed',
            metadata: { char_count: para.text.length }
          });
          
          text_changes.push({
            page: pageNum,
            paragraph: paraIndex,
            type: 'removed',
            text: para.text,
            file: 'file1',
            char_count: para.char_count || para.text.length,
            confidence: 'high',
            content_type: contentType
          });
        });
        
      } else if (page1 && page2) {
        // **KEY ENHANCEMENT**: Use content-aware alignment instead of positional
        console.log(`🔄 Page ${pageNum}: Creating content-aware alignment...`);
        const alignments = smartDiff.alignParagraphs(page1.paragraphs, page2.paragraphs);
        
        totalElements += alignments.length;
        
        // Process each alignment
        for (const alignment of alignments) {
          const comparison = smartDiff.compareAlignedParagraphs(alignment);
          
          if (comparison.similarity !== undefined) {
            page_similarity_sum += comparison.similarity;
            page_comparisons++;
            compared_elements++;
            total_similarity += comparison.similarity;
          }
          
          if (comparison.type !== 'unchanged') {
            pageChanges++;
            differences++;
            
            // Create enhanced change record
            const changeRecord = {
              page: pageNum,
              paragraph: alignment.index1 >= 0 ? alignment.index1 : alignment.index2,
              type: comparison.type,
              change_type: comparison.type === 'replaced' ? 'major_change' : 
                          comparison.type === 'added' ? 'addition' :
                          comparison.type === 'removed' ? 'deletion' : 'modification',
              similarity: comparison.similarity || 0,
              confidence: comparison.confidence,
              alignment_type: comparison.alignment_type,
              content_type: comparison.content_type,
              alignment_confidence: comparison.alignment_confidence,
              changes: comparison.changes,
              word_analysis: comparison.word_changes,
              old_content: alignment.para1?.text || '',
              new_content: alignment.para2?.text || '',
              metadata: {
                ...comparison.metadata,
                original_position_1: alignment.index1,
                original_position_2: alignment.index2
              }
            };
            
            smart_changes.push(changeRecord);
            
            // Create compatible text change record
            const textChangeRecord = {
              page: pageNum,
              paragraph: alignment.index1 >= 0 ? alignment.index1 : alignment.index2,
              type: comparison.type === 'added' ? 'added' :
                    comparison.type === 'removed' ? 'removed' : 'modified',
              file: comparison.type === 'added' ? 'file2' :
                    comparison.type === 'removed' ? 'file1' : 'both',
              confidence: comparison.confidence,
              content_type: comparison.content_type,
              alignment_type: comparison.alignment_type,
              smart_analysis: comparison.changes
            };
            
            if (comparison.type === 'modified') {
              textChangeRecord.old_text = alignment.para1?.text || '';
              textChangeRecord.new_text = alignment.para2?.text || '';
              textChangeRecord.char_count_old = alignment.para1?.text.length || 0;
              textChangeRecord.char_count_new = alignment.para2?.text.length || 0;
              textChangeRecord.similarity = Math.round((comparison.similarity || 0) * 100);
            } else {
              textChangeRecord.text = (alignment.para1?.text || alignment.para2?.text || '');
              textChangeRecord.char_count = textChangeRecord.text.length;
            }
            
            text_changes.push(textChangeRecord);
            
          } else {
            matches++;
          }
        }
        
        // Log alignment results for this page
        const exactMatches = alignments.filter(a => a.alignment_type === 'exact_match').length;
        const contentMatches = alignments.filter(a => a.alignment_type === 'content_type_match').length;
        const additions = alignments.filter(a => a.alignment_type === 'added').length;
        const deletions = alignments.filter(a => a.alignment_type === 'deleted').length;
        
        console.log(`📋 Page ${pageNum} alignment: ${exactMatches} exact, ${contentMatches} content-type, ${additions} added, ${deletions} deleted`);
      }
      
      // Record page analysis
      if (pageChanges > 0) {
        const page_similarity = page_comparisons > 0 ? page_similarity_sum / page_comparisons : 0;
        page_differences.push({
          page_number: pageNum,
          changes_count: pageChanges,
          similarity: Math.round(page_similarity * 100),
          summary: pageChanges + ' change' + (pageChanges > 1 ? 's' : '') + ' detected (' + Math.round(page_similarity * 100) + '% similar)',
          page1_paragraphs: page1?.paragraphs.length || 0,
          page2_paragraphs: page2?.paragraphs.length || 0,
          alignment_used: 'content_aware'
        });
      }
    }
    
    const comparisonTime = Date.now() - comparisonStartTime;
    const totalTime = parseTime + comparisonTime;
    
    updateProgress('Enhanced SmartDiff', 95, 'Finalizing content-aware comparison results...');
    
    // Calculate enhanced metrics
    const overall_similarity = compared_elements > 0 ? total_similarity / compared_elements : 
                              (matches / (matches + differences)) || 1.0;
    const similarity_score = Math.round(overall_similarity * 100);
    
    // Enhanced change summary with alignment information
    const change_summary = {
      total_changes: smart_changes.length,
      major_changes: smart_changes.filter(c => c.change_type === 'major_change').length,
      additions: smart_changes.filter(c => c.change_type === 'addition').length,
      deletions: smart_changes.filter(c => c.change_type === 'deletion').length,
      modifications: smart_changes.filter(c => c.change_type === 'modification').length,
      high_confidence: smart_changes.filter(c => c.confidence === 'high').length,
      medium_confidence: smart_changes.filter(c => c.confidence === 'medium').length,
      
      // Alignment statistics
      exact_alignments: smart_changes.filter(c => c.alignment_type === 'exact_match').length,
      content_alignments: smart_changes.filter(c => c.alignment_type === 'content_type_match').length,
      positional_alignments: smart_changes.filter(c => c.alignment_type === 'positional').length,
      
      // Content type breakdown
      content_types: {}
    };
    
    // Analyze content types
    smart_changes.forEach(change => {
      if (change.content_type) {
        change_summary.content_types[change.content_type] = 
          (change_summary.content_types[change.content_type] || 0) + 1;
      }
    });
    
    const wordChanges = {
      file1_words: data1.metadata.totalWords,
      file2_words: data2.metadata.totalWords,
      word_difference: Math.abs(data1.metadata.totalWords - data2.metadata.totalWords),
      word_change_percentage: data1.metadata.totalWords > 0 ? 
        Math.round((Math.abs(data1.metadata.totalWords - data2.metadata.totalWords) / data1.metadata.totalWords) * 100) : 0
    };
    
    const results = {
      // Enhanced SmartDiff results with alignment
      smart_changes: smart_changes,
      change_summary: change_summary,
      overall_similarity: similarity_score,
      
      // Original format compatibility
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
      
      comparison_type: 'enhanced_smartdiff_content_aware',
      comparison_method: 'Enhanced SmartDiff with Content-Aware Alignment',
      comparison_options: options,
      processing_note: 'Large PDF comparison (' + pdf1Size + 'MB + ' + pdf2Size + 'MB) using content-aware alignment for financial documents',
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
        pdf_js_version: data1.metadata.pdfJsVersion,
        smartdiff_enabled: useSmartDiff,
        content_alignment_enabled: enableContentAlignment,
        confidence_scoring: true
      }
    };
    
    updateProgress('Enhanced SmartDiff', 100, 'Content-aware SmartDiff comparison completed!');
    
    const totalTimeFormatted = Math.floor(totalTime/60000) + ':' + ((totalTime%60000)/1000).toFixed(0).padStart(2,'0');
    
    console.log('✅ Enhanced SmartDiff comparison with content alignment completed:');
    console.log('  🧠 Method: ' + results.comparison_method);
    console.log('  📊 Similarity: ' + results.similarity_score + '%');
    console.log('  🔍 Changes: ' + results.differences_found.toLocaleString());
    console.log('  ✅ Matches: ' + results.matches_found.toLocaleString());
    console.log('  📄 Total Pages: ' + results.total_pages.toLocaleString());
    console.log('  ⏱️ Total Time: ' + totalTimeFormatted);
    console.log('  🚀 Speed: ' + results.quality_metrics.processing_speed_pages_per_second + ' pages/s');
    console.log('  🎯 High Confidence: ' + change_summary.high_confidence + '/' + smart_changes.length + ' changes');
    console.log('  🔗 Exact Alignments: ' + change_summary.exact_alignments);
    console.log('  📋 Content Alignments: ' + change_summary.content_alignments);
    console.log('  📈 Change Types: ' + change_summary.additions + ' added, ' + change_summary.deletions + ' deleted, ' + change_summary.modifications + ' modified');
    console.log('  💰 Content Types Found: ' + Object.keys(change_summary.content_types).join(', '));
    
    return results;
    
  } catch (error) {
    console.error('❌ Enhanced PDF comparison failed:', error);
    throw error;
  }
};

// Export the enhanced functions with proper naming
export const comparePDFFiles = compareLargePDFFiles;
export const parsePDFFile = parseLargePDFFile;
