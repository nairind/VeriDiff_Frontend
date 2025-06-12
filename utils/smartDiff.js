// Enhanced smartDiff implementation for PDF comparison integrity
// This provides more accurate change detection and better handles formatting differences

/**
 * SmartDiff - Advanced text comparison with intelligent change detection
 * Handles whitespace, formatting, and provides granular diff information
 */
export class SmartDiff {
  constructor(options = {}) {
    this.options = {
      ignoreWhitespace: options.ignoreWhitespace ?? true,
      ignoreCase: options.ignoreCase ?? false,
      wordLevel: options.wordLevel ?? true,
      sentenceLevel: options.sentenceLevel ?? true,
      similarity_threshold: options.similarity_threshold ?? 0.8,
      context_lines: options.context_lines ?? 3,
      ...options
    };
  }

  /**
   * Calculate Levenshtein distance for similarity scoring
   */
  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1,     // deletion
          matrix[j - 1][i - 1] + cost // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate similarity score between two texts
   */
  calculateSimilarity(text1, text2) {
    if (text1 === text2) return 1.0;
    if (!text1 || !text2) return 0.0;
    
    const maxLength = Math.max(text1.length, text2.length);
    const distance = this.levenshteinDistance(text1, text2);
    return Math.max(0, (maxLength - distance) / maxLength);
  }

  /**
   * Normalize text based on options
   */
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

  /**
   * Split text into meaningful units for comparison
   */
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

  /**
   * Advanced diff algorithm using dynamic programming
   */
  computeSmartDiff(text1, text2) {
    const norm1 = this.normalizeText(text1);
    const norm2 = this.normalizeText(text2);
    
    // Quick exact match check
    if (norm1 === norm2) {
      return {
        type: 'unchanged',
        similarity: 1.0,
        changes: [],
        confidence: 'high'
      };
    }

    // Calculate overall similarity
    const similarity = this.calculateSimilarity(norm1, norm2);
    
    // If similarity is very low, treat as complete replacement
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

    // Perform word-level diff for moderate changes
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

  /**
   * Compare two arrays and return diff operations
   */
  diffArrays(arr1, arr2) {
    const changes = [];
    const m = arr1.length;
    const n = arr2.length;
    
    // Create LCS matrix
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
    
    // Backtrack to find changes
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

  /**
   * Analyze word-level changes for better insights
   */
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

  /**
   * Compare paragraphs with context awareness
   */
  compareParagraphs(para1, para2, context = {}) {
    const result = this.computeSmartDiff(para1.text, para2.text);
    
    return {
      ...result,
      paragraph1: para1,
      paragraph2: para2,
      context: context,
      metadata: {
        char_count_1: para1.text.length,
        char_count_2: para2.text.length,
        position_1: para1.y_position || 0,
        position_2: para2.y_position || 0
      }
    };
  }
}

/**
 * Enhanced PDF comparison with SmartDiff integration
 */
export const compareWithSmartDiff = async (pdf1, pdf2, options = {}) => {
  console.log('🧠 Starting SmartDiff-enhanced PDF comparison');
  
  const smartDiff = new SmartDiff({
    ignoreWhitespace: options.ignoreWhitespace ?? true,
    ignoreCase: options.ignoreCase ?? false,
    similarity_threshold: options.similarity_threshold ?? 0.8,
    ...options
  });
  
  try {
    updateProgress('SmartDiff', 0, 'Initializing enhanced comparison...');
    
    // Parse both PDFs (reuse existing function)
    updateProgress('SmartDiff', 10, 'Parsing PDFs with SmartDiff...');
    const data1 = await parseLargePDFFile(pdf1);
    const data2 = await parseLargePDFFile(pdf2);
    
    updateProgress('SmartDiff', 40, 'Starting intelligent comparison...');
    
    const smart_changes = [];
    const page_analysis = [];
    let total_similarity = 0;
    let compared_elements = 0;
    
    const maxPages = Math.max(data1.pages.length, data2.pages.length);
    
    for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
      const page1 = data1.pages[pageIndex];
      const page2 = data2.pages[pageIndex];
      const pageNum = pageIndex + 1;
      
      if (pageNum % 50 === 0) {
        updateProgress('SmartDiff', 40 + (pageNum / maxPages) * 50, 
          `SmartDiff analyzing page ${pageNum}/${maxPages}...`);
      }
      
      let page_similarity_sum = 0;
      let page_comparisons = 0;
      const page_changes = [];
      
      if (!page1 && page2) {
        // Page added
        page2.paragraphs.forEach((para, idx) => {
          smart_changes.push({
            page: pageNum,
            paragraph: idx,
            type: 'page_added',
            change_type: 'addition',
            content: para.text,
            confidence: 'high',
            metadata: { char_count: para.text.length }
          });
        });
        page_changes.push({ type: 'page_added', confidence: 'high' });
        
      } else if (page1 && !page2) {
        // Page removed
        page1.paragraphs.forEach((para, idx) => {
          smart_changes.push({
            page: pageNum,
            paragraph: idx,
            type: 'page_removed',
            change_type: 'deletion',
            content: para.text,
            confidence: 'high',
            metadata: { char_count: para.text.length }
          });
        });
        page_changes.push({ type: 'page_removed', confidence: 'high' });
        
      } else if (page1 && page2) {
        // Compare paragraphs with SmartDiff
        const maxParas = Math.max(page1.paragraphs.length, page2.paragraphs.length);
        
        for (let paraIndex = 0; paraIndex < maxParas; paraIndex++) {
          const para1 = page1.paragraphs[paraIndex];
          const para2 = page2.paragraphs[paraIndex];
          
          if (!para1 && para2) {
            smart_changes.push({
              page: pageNum,
              paragraph: paraIndex,
              type: 'paragraph_added',
              change_type: 'addition',
              content: para2.text,
              confidence: 'high',
              similarity: 0,
              metadata: { char_count: para2.text.length }
            });
            
          } else if (para1 && !para2) {
            smart_changes.push({
              page: pageNum,
              paragraph: paraIndex,
              type: 'paragraph_removed',
              change_type: 'deletion',
              content: para1.text,
              confidence: 'high',
              similarity: 0,
              metadata: { char_count: para1.text.length }
            });
            
          } else if (para1 && para2) {
            const comparison = smartDiff.compareParagraphs(para1, para2, {
              page: pageNum,
              paragraph: paraIndex
            });
            
            page_similarity_sum += comparison.similarity;
            page_comparisons++;
            compared_elements++;
            total_similarity += comparison.similarity;
            
            if (comparison.type !== 'unchanged') {
              smart_changes.push({
                page: pageNum,
                paragraph: paraIndex,
                type: comparison.type,
                change_type: comparison.type === 'replaced' ? 'major_change' : 'modification',
                similarity: comparison.similarity,
                confidence: comparison.confidence,
                changes: comparison.changes,
                word_analysis: comparison.word_changes,
                old_content: para1.text,
                new_content: para2.text,
                metadata: comparison.metadata
              });
            }
          }
        }
      }
      
      const page_similarity = page_comparisons > 0 ? page_similarity_sum / page_comparisons : 1.0;
      
      page_analysis.push({
        page_number: pageNum,
        similarity: page_similarity,
        changes_count: page_changes.length,
        paragraphs_compared: page_comparisons,
        has_major_changes: page_changes.some(c => c.confidence === 'high'),
        summary: `Page ${pageNum}: ${Math.round(page_similarity * 100)}% similar, ${page_changes.length} changes`
      });
    }
    
    updateProgress('SmartDiff', 90, 'Finalizing SmartDiff analysis...');
    
    // Calculate overall metrics
    const overall_similarity = compared_elements > 0 ? total_similarity / compared_elements : 1.0;
    
    const change_summary = {
      total_changes: smart_changes.length,
      major_changes: smart_changes.filter(c => c.change_type === 'major_change').length,
      additions: smart_changes.filter(c => c.change_type === 'addition').length,
      deletions: smart_changes.filter(c => c.change_type === 'deletion').length,
      modifications: smart_changes.filter(c => c.change_type === 'modification').length,
      high_confidence: smart_changes.filter(c => c.confidence === 'high').length,
      medium_confidence: smart_changes.filter(c => c.confidence === 'medium').length
    };
    
    const results = {
      // Enhanced SmartDiff results
      smart_changes: smart_changes,
      page_analysis: page_analysis,
      change_summary: change_summary,
      overall_similarity: Math.round(overall_similarity * 100),
      
      // Integration with existing format
      differences_found: smart_changes.length,
      similarity_score: Math.round(overall_similarity * 100),
      total_pages: maxPages,
      
      // Metadata
      comparison_method: 'SmartDiff Enhanced',
      diff_algorithm: 'Levenshtein + LCS + Context Analysis',
      confidence_scoring: true,
      processing_date: new Date().toISOString(),
      
      // Original data for compatibility
      file1_metadata: data1.metadata,
      file2_metadata: data2.metadata,
      file1_pages: data1.pages,
      file2_pages: data2.pages
    };
    
    updateProgress('SmartDiff', 100, 'SmartDiff comparison completed!');
    
    console.log('✅ SmartDiff comparison completed:');
    console.log(`  🧠 Algorithm: Enhanced SmartDiff with confidence scoring`);
    console.log(`  📊 Overall Similarity: ${results.overall_similarity}%`);
    console.log(`  🔍 Total Changes: ${results.differences_found}`);
    console.log(`  ⚡ High Confidence: ${change_summary.high_confidence}`);
    console.log(`  📝 Change Types: ${change_summary.additions} added, ${change_summary.deletions} deleted, ${change_summary.modifications} modified`);
    
    return results;
    
  } catch (error) {
    console.error('❌ SmartDiff comparison failed:', error);
    throw error;
  }
};

// Update the main comparison function to use SmartDiff by default
export const compareLargePDFFilesWithSmartDiff = async (pdf1, pdf2, options = {}) => {
  const useSmartDiff = options.useSmartDiff !== false; // Default to true
  
  if (useSmartDiff) {
    return await compareWithSmartDiff(pdf1, pdf2, options);
  } else {
    // Fallback to original comparison
    return await compareLargePDFFiles(pdf1, pdf2, options);
  }
};
