    // /utils/wordFileComparison.js - ENHANCED WORD COMPARISON ENGINE WITH SEMANTIC DIFF
import * as mammoth from 'mammoth';

let progressCallback = null;

export const setProgressCallback = (callback) => {
  progressCallback = callback;
};

const updateProgress = (stage, progress, message) => {
  if (progressCallback) {
    progressCallback({ stage, progress, message, isActive: true });
  }
};

// TEXT SIMILARITY CALCULATION - MISSING FUNCTION
const calculateTextSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;
  if (text1 === text2) return 100;
  
  // Simple word-based similarity calculation
  const words1 = text1.toLowerCase().split(/\s+/).filter(word => word.length > 0);
  const words2 = text2.toLowerCase().split(/\s+/).filter(word => word.length > 0);
  
  if (words1.length === 0 && words2.length === 0) return 100;
  if (words1.length === 0 || words2.length === 0) return 0;
  
  // Jaccard similarity: intersection / union
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  const jaccardSimilarity = union.size > 0 ? (intersection.size / union.size) * 100 : 0;
  
  // Also consider length similarity
  const lengthSimilarity = 100 - Math.abs(words1.length - words2.length) / Math.max(words1.length, words2.length) * 100;
  
  // Combined similarity (weighted average)
  return Math.round((jaccardSimilarity * 0.7 + lengthSimilarity * 0.3));
};

// Enhanced sentence and word tokenization
const tokenizeText = (text) => {
  // Split into sentences using multiple delimiters
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  // Split into words with better tokenization
  const words = text
    .toLowerCase()
    .replace(/[^\w\s\$\%\-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);
  
  return { sentences, words };
};

// Advanced diff algorithm for word-level changes - ENHANCED FOR LARGE TEXTS
const computeWordLevelDiff = (text1, text2) => {
  // For very large texts, break into sentence chunks first
  if (text1.length > 1000 || text2.length > 1000) {
    return computeChunkedDiff(text1, text2);
  }
  
  const words1 = text1.split(/(\s+)/).filter(w => w.length > 0);
  const words2 = text2.split(/(\s+)/).filter(w => w.length > 0);
  
  // Simple LCS-based diff (Longest Common Subsequence)
  const diff = [];
  let i = 0, j = 0;
  
  while (i < words1.length || j < words2.length) {
    if (i >= words1.length) {
      // Remaining words in text2 are additions
      diff.push({ type: 'added', text: words2[j] });
      j++;
    } else if (j >= words2.length) {
      // Remaining words in text1 are deletions
      diff.push({ type: 'removed', text: words1[i] });
      i++;
    } else if (words1[i] === words2[j]) {
      // Words match
      diff.push({ type: 'unchanged', text: words1[i] });
      i++;
      j++;
    } else {
      // Look ahead to find the best match
      let found = false;
      
      // Check if word1[i] appears later in words2
      for (let k = j + 1; k < Math.min(j + 10, words2.length); k++) {
        if (words1[i] === words2[k]) {
          // Add words from j to k-1 as additions
          for (let l = j; l < k; l++) {
            diff.push({ type: 'added', text: words2[l] });
          }
          diff.push({ type: 'unchanged', text: words1[i] });
          i++;
          j = k + 1;
          found = true;
          break;
        }
      }
      
      if (!found) {
        // Check if word2[j] appears later in words1
        for (let k = i + 1; k < Math.min(i + 10, words1.length); k++) {
          if (words2[j] === words1[k]) {
            // Add words from i to k-1 as deletions
            for (let l = i; l < k; l++) {
              diff.push({ type: 'removed', text: words1[l] });
            }
            diff.push({ type: 'unchanged', text: words2[j] });
            i = k + 1;
            j++;
            found = true;
            break;
          }
        }
      }
      
      if (!found) {
        // No match found, treat as modification
        diff.push({ type: 'removed', text: words1[i] });
        diff.push({ type: 'added', text: words2[j] });
        i++;
        j++;
      }
    }
  }
  
  return diff;
};

// NEW: Chunked diff for large texts
const computeChunkedDiff = (text1, text2) => {
  console.log(`🔍 Computing chunked diff for large texts (${text1.length} vs ${text2.length} chars)`);
  
  // Split into sentences first
  const sentences1 = text1.match(/[^.!?]+[.!?]+/g) || [text1];
  const sentences2 = text2.match(/[^.!?]+[.!?]+/g) || [text2];
  
  const diff = [];
  let i = 0, j = 0;
  
  while (i < sentences1.length || j < sentences2.length) {
    if (i >= sentences1.length) {
      // Remaining sentences in text2 are additions
      const words = sentences2[j].split(/(\s+)/).filter(w => w.trim().length > 0);
      words.forEach(word => diff.push({ type: 'added', text: word }));
      j++;
    } else if (j >= sentences2.length) {
      // Remaining sentences in text1 are deletions
      const words = sentences1[i].split(/(\s+)/).filter(w => w.trim().length > 0);
      words.forEach(word => diff.push({ type: 'removed', text: word }));
      i++;
    } else {
      // Compare sentences
      const sent1 = sentences1[i].trim();
      const sent2 = sentences2[j].trim();
      
      if (sent1 === sent2) {
        // Sentences match exactly
        const words = sent1.split(/(\s+)/).filter(w => w.length > 0);
        words.forEach(word => diff.push({ type: 'unchanged', text: word }));
        i++;
        j++;
      } else {
        // Check similarity
        const similarity = calculateTextSimilarity(sent1, sent2);
        
        if (similarity > 50) {
          // Similar sentences - do word-level diff
          const sentDiff = computeWordLevelDiff(sent1, sent2);
          diff.push(...sentDiff);
          i++;
          j++;
        } else {
          // Different sentences - treat as replace
          const words1 = sent1.split(/(\s+)/).filter(w => w.trim().length > 0);
          const words2 = sent2.split(/(\s+)/).filter(w => w.trim().length > 0);
          
          words1.forEach(word => diff.push({ type: 'removed', text: word }));
          words2.forEach(word => diff.push({ type: 'added', text: word }));
          i++;
          j++;
        }
      }
    }
  }
  
  console.log(`✅ Chunked diff completed: ${diff.length} word changes`);
  return diff;
};

// Semantic change detection
const classifyChange = (oldText, newText) => {
  const financial_pattern = /\$[\d,.]+(k|m|b|million|billion|thousand)?/i;
  const percentage_pattern = /\d+(\.\d+)?%/;
  const number_pattern = /\b\d+(\.\d+)?\b/;
  const date_pattern = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{2,4}\b/i;
  
  if (financial_pattern.test(oldText) && financial_pattern.test(newText)) {
    const oldAmount = extractFinancialValue(oldText);
    const newAmount = extractFinancialValue(newText);
    const change = newAmount - oldAmount;
    
    return {
      type: 'financial',
      category: 'Financial Change',
      annotation: change > 0 ? `💰 +${formatCurrency(change)}` : `💰 ${formatCurrency(change)}`,
      severity: Math.abs(change) > 100000 ? 'high' : Math.abs(change) > 10000 ? 'medium' : 'low',
      metadata: { oldAmount, newAmount, change }
    };
  }
  
  if (percentage_pattern.test(oldText) && percentage_pattern.test(newText)) {
    const oldPercent = parseFloat(oldText.match(/\d+(\.\d+)?/)[0]);
    const newPercent = parseFloat(newText.match(/\d+(\.\d+)?/)[0]);
    const change = newPercent - oldPercent;
    
    return {
      type: 'percentage',
      category: 'Percentage Change',
      annotation: change > 0 ? `📈 +${change.toFixed(1)}%` : `📉 ${change.toFixed(1)}%`,
      severity: Math.abs(change) > 10 ? 'high' : Math.abs(change) > 5 ? 'medium' : 'low',
      metadata: { oldPercent, newPercent, change }
    };
  }
  
  if (number_pattern.test(oldText) && number_pattern.test(newText)) {
    const oldNum = parseFloat(oldText.match(/\d+(\.\d+)?/)[0]);
    const newNum = parseFloat(newText.match(/\d+(\.\d+)?/)[0]);
    const change = newNum - oldNum;
    
    return {
      type: 'quantitative',
      category: 'Number Change',
      annotation: change > 0 ? `📊 +${change}` : `📊 ${change}`,
      severity: Math.abs(change) > 100 ? 'high' : Math.abs(change) > 10 ? 'medium' : 'low',
      metadata: { oldNum, newNum, change }
    };
  }
  
  if (date_pattern.test(oldText) && date_pattern.test(newText)) {
    return {
      type: 'temporal',
      category: 'Date Change',
      annotation: '📅 Date updated',
      severity: 'medium',
      metadata: { oldDate: oldText, newDate: newText }
    };
  }
  
  // Qualitative text changes
  const intensityWords = {
    low: ['okay', 'fair', 'decent', 'adequate', 'satisfactory'],
    medium: ['good', 'solid', 'strong', 'positive', 'effective'],
    high: ['excellent', 'outstanding', 'exceptional', 'remarkable', 'extraordinary']
  };
  
  const getIntensity = (text) => {
    const lowerText = text.toLowerCase();
    for (const [level, words] of Object.entries(intensityWords)) {
      if (words.some(word => lowerText.includes(word))) {
        return level;
      }
    }
    return null;
  };
  
  const oldIntensity = getIntensity(oldText);
  const newIntensity = getIntensity(newText);
  
  if (oldIntensity && newIntensity && oldIntensity !== newIntensity) {
    const intensityLevels = { low: 1, medium: 2, high: 3 };
    const change = intensityLevels[newIntensity] - intensityLevels[oldIntensity];
    
    return {
      type: 'qualitative',
      category: 'Tone Change',
      annotation: change > 0 ? '📈 Tone improved' : '📉 Tone softened',
      severity: Math.abs(change) > 1 ? 'high' : 'medium',
      metadata: { oldIntensity, newIntensity, change }
    };
  }
  
  // Default text modification
  return {
    type: 'textual',
    category: 'Text Change',
    annotation: '✏️ Text modified',
    severity: 'low',
    metadata: { oldText, newText }
  };
};

// Helper functions for financial parsing
const extractFinancialValue = (text) => {
  const match = text.match(/\$?([\d,]+(?:\.\d+)?)\s*(k|m|b|million|billion|thousand)?/i);
  if (!match) return 0;
  
  let value = parseFloat(match[1].replace(/,/g, ''));
  const unit = match[2]?.toLowerCase();
  
  const multipliers = {
    'k': 1000,
    'thousand': 1000,
    'm': 1000000,
    'million': 1000000,
    'b': 1000000000,
    'billion': 1000000000
  };
  
  if (unit && multipliers[unit]) {
    value *= multipliers[unit];
  }
  
  return value;
};

const formatCurrency = (amount) => {
  if (Math.abs(amount) >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  } else if (Math.abs(amount) >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  } else {
    return `$${amount.toFixed(0)}`;
  }
};

// Enhanced paragraph processing with section detection
const processDocumentStructure = (text, html) => {
  // Detect sections using headers and formatting
  const sections = [];
  let currentSection = null;
  
  // Split text into paragraphs with better detection
  const rawParagraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  rawParagraphs.forEach((paragraph, index) => {
    const trimmed = paragraph.trim();
    
    // Detect if this is a header/section title
    const isHeader = 
      trimmed.length < 100 && 
      (trimmed.match(/^[A-Z\s]{3,}$/) || // ALL CAPS
       trimmed.match(/^[A-Z][a-z\s]*$/) && trimmed.split(' ').length <= 5 || // Title Case, short
       trimmed.endsWith(':') || // Ends with colon
       /^(chapter|section|\d+\.|\d+\s)/i.test(trimmed)); // Numbered sections
    
    if (isHeader && trimmed.length > 0) {
      // Start new section
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: trimmed,
        index: index,
        paragraphs: [],
        type: 'section'
      };
    } else {
      // Add to current section or create default section
      if (!currentSection) {
        currentSection = {
          title: 'Introduction',
          index: 0,
          paragraphs: [],
          type: 'section'
        };
      }
      
      currentSection.paragraphs.push({
        index: index,
        text: trimmed,
        wordCount: trimmed.split(/\s+/).filter(w => w.length > 0).length,
        type: 'paragraph'
      });
    }
  });
  
  // Add final section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections.length > 0 ? sections : [{
    title: 'Document Content',
    index: 0,
    paragraphs: rawParagraphs.map((p, i) => ({
      index: i,
      text: p.trim(),
      wordCount: p.trim().split(/\s+/).filter(w => w.length > 0).length,
      type: 'paragraph'
    })),
    type: 'section'
  }];
};

// Enhanced text extraction with structure preservation - BULLETPROOF VERSION
const extractTextFromWord = async (fileBuffer, fileName) => {
  try {
    console.log(`📝 Enhanced extraction from ${fileName}...`);
    console.log(`📊 File buffer type: ${typeof fileBuffer}, length: ${fileBuffer?.byteLength || 'unknown'}`);
    
    // Ensure we have a proper ArrayBuffer
    let arrayBuffer;
    if (fileBuffer instanceof ArrayBuffer) {
      arrayBuffer = fileBuffer;
    } else if (fileBuffer.buffer instanceof ArrayBuffer) {
      arrayBuffer = fileBuffer.buffer;
    } else {
      throw new Error(`Invalid file buffer format for ${fileName}. Expected ArrayBuffer.`);
    }
    
    console.log(`📊 ArrayBuffer size: ${arrayBuffer.byteLength} bytes`);
    
    // Use mammoth.js - PRIORITIZE HTML EXTRACTION
    const mammothLib = window.mammoth || mammoth;
    if (!mammothLib) {
      throw new Error('Mammoth.js library not available. Please ensure mammoth.js is loaded.');
    }
    
    let finalText = '';
    let html = '';
    let extractionMethod = '';
    
    // TRY HTML EXTRACTION FIRST (more reliable for your documents)
    console.log(`🔍 Trying HTML extraction first for ${fileName}...`);
    try {
      const htmlResult = await mammothLib.convertToHtml({ arrayBuffer: arrayBuffer });
      html = htmlResult.value || '';
      console.log(`📄 HTML result length: ${html.length}`);
      
      if (html && html.trim().length > 0) {
        // Strip HTML tags to get clean text
        finalText = html
          .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
          .replace(/&nbsp;/g, ' ')   // Replace &nbsp; with spaces
          .replace(/&amp;/g, '&')    // Replace &amp; with &
          .replace(/&lt;/g, '<')     // Replace &lt; with <
          .replace(/&gt;/g, '>')     // Replace &gt; with >
          .replace(/\s+/g, ' ')      // Normalize whitespace
          .trim();
        
        if (finalText.length > 0) {
          console.log(`✅ HTML extraction successful: ${finalText.length} characters`);
          extractionMethod = 'HTML';
        }
      }
    } catch (htmlError) {
      console.warn(`⚠️ HTML extraction failed for ${fileName}:`, htmlError.message);
    }
    
    // FALLBACK: Try text extraction if HTML didn't work
    if (!finalText || finalText.length === 0) {
      console.log(`🔍 Trying text extraction fallback for ${fileName}...`);
      try {
        const textResult = await mammothLib.extractRawText({ arrayBuffer: arrayBuffer });
        finalText = textResult.text || '';
        console.log(`📝 Text extraction result: ${finalText.length} characters`);
        if (finalText.length > 0) {
          extractionMethod = 'TEXT';
        }
      } catch (textError) {
        console.warn(`⚠️ Text extraction also failed for ${fileName}:`, textError.message);
      }
    }
    
    // VALIDATE final result
    if (!finalText || finalText.trim().length === 0) {
      throw new Error(`No text content could be extracted from ${fileName}. The document may be empty, corrupted, or in an unsupported format.`);
    }
    
    console.log(`✅ Successfully extracted ${finalText.length} characters from ${fileName} using ${extractionMethod} method`);
    
    // PROCESS TEXT INTO STRUCTURE - ENHANCED PARAGRAPH DETECTION
    console.log(`🔍 Processing document structure for ${fileName}...`);
    
    // STEP 1: Better paragraph splitting for business documents
    let paragraphs = [];
    
    // Try multiple splitting strategies
    const strategies = [
      // Strategy 1: Double newlines
      () => finalText.split(/\n\s*\n/).filter(p => p.trim().length > 10),
      // Strategy 2: Single newlines with sentence detection
      () => finalText.split(/\n/).filter(p => p.trim().length > 10),
      // Strategy 3: Sentence-based splitting for dense text
      () => finalText.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(p => p.trim().length > 20),
      // Strategy 4: Section headers + content
      () => finalText.split(/(?=^[A-Z][a-zA-Z\s]{2,50}$)/m).filter(p => p.trim().length > 10)
    ];
    
    for (const strategy of strategies) {
      paragraphs = strategy();
      console.log(`📊 Strategy yielded ${paragraphs.length} paragraphs`);
      if (paragraphs.length > 1 && paragraphs.length < 100) {
        break; // Good paragraph count
      }
    }
    
    // Fallback: If still one massive block, force split by sentences
    if (paragraphs.length === 1 && finalText.length > 1000) {
      console.log(`🔧 Forcing sentence-based split for large single block...`);
      const sentences = finalText.match(/[^.!?]+[.!?]+/g) || [];
      if (sentences.length > 5) {
        // Group sentences into logical paragraphs
        paragraphs = [];
        for (let i = 0; i < sentences.length; i += 3) {
          const paragraphText = sentences.slice(i, i + 3).join(' ').trim();
          if (paragraphText.length > 20) {
            paragraphs.push(paragraphText);
          }
        }
      }
    }
    
    // Final fallback
    if (paragraphs.length === 0) {
      paragraphs = [finalText.trim()];
    }
    
    console.log(`✅ Final paragraph count: ${paragraphs.length}`);
    
    const wordCount = finalText.split(/\s+/).filter(word => word.length > 0).length;
    
    // STEP 2: ENHANCED SECTION DETECTION for business documents
    const sections = [];
    let currentSection = null;
    
    paragraphs.forEach((paragraph, index) => {
      const trimmed = paragraph.trim();
      
      // Enhanced header detection for business reports
      const isHeader = trimmed.length < 150 && (
        // Common business report headers
        /^(executive summary|financial overview|revenue performance|expense management|profit margins|departmental performance|sales department|marketing department|product development|human resources|market analysis|competitive landscape|customer satisfaction|challenges and risks|future outlook|strategic initiatives|conclusion)$/i.test(trimmed) ||
        // General patterns
        trimmed.match(/^[A-Z][a-zA-Z\s]{2,50}$/) && !trimmed.match(/\d/) ||
        trimmed.endsWith(':') && trimmed.length < 80 ||
        /^Q\d{1,2}\s+\d{4}/i.test(trimmed) || // Quarter references
        /^\d+\.\s*[A-Z]/.test(trimmed) // Numbered sections
      );
      
      if (isHeader && trimmed.length > 0 && trimmed.length < 150) {
        // Start new section
        if (currentSection && currentSection.paragraphs.length > 0) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmed,
          index: sections.length,
          paragraphs: [],
          type: 'section'
        };
        console.log(`📂 Detected section: "${trimmed}"`);
      } else {
        // Add to current section
        if (!currentSection) {
          currentSection = {
            title: 'Executive Summary',
            index: 0,
            paragraphs: [],
            type: 'section'
          };
        }
        
        currentSection.paragraphs.push({
          index: index,
          text: trimmed,
          wordCount: trimmed.split(/\s+/).filter(w => w.length > 0).length,
          type: 'paragraph'
        });
      }
    });
    
    // Add final section
    if (currentSection && currentSection.paragraphs.length > 0) {
      sections.push(currentSection);
    }
    
    // Ensure we have reasonable sections
    if (sections.length === 0 || (sections.length === 1 && sections[0].paragraphs.length > 20)) {
      console.log(`🔧 Reorganizing into smaller sections...`);
      
      // Split large sections into smaller ones
      const allParagraphs = sections.length > 0 ? sections[0].paragraphs : 
        paragraphs.map((p, i) => ({
          index: i,
          text: p.trim(),
          wordCount: p.trim().split(/\s+/).filter(w => w.length > 0).length,
          type: 'paragraph'
        }));
      
      const reorganizedSections = [];
      const chunkSize = Math.max(3, Math.ceil(allParagraphs.length / 5)); // Aim for ~5 sections
      
      for (let i = 0; i < allParagraphs.length; i += chunkSize) {
        const chunk = allParagraphs.slice(i, i + chunkSize);
        const sectionTitle = i === 0 ? 'Executive Summary' :
          i < allParagraphs.length / 2 ? 'Financial Performance' :
          'Strategic Outlook';
        
        reorganizedSections.push({
          title: `${sectionTitle} (Part ${Math.floor(i / chunkSize) + 1})`,
          index: reorganizedSections.length,
          paragraphs: chunk,
          type: 'section'
        });
      }
      
      sections.splice(0, sections.length, ...reorganizedSections);
    }
    
    console.log(`✅ Processed ${paragraphs.length} paragraphs into ${sections.length} sections, ${wordCount} words from ${fileName}`);
    
    // RETURN COMPLETE STRUCTURE
    return {
      text: finalText,
      html: html,
      sections: sections,
      paragraphs: paragraphs.map((paragraph, index) => ({
        index: index,
        text: paragraph.trim(),
        word_count: paragraph.trim().split(/\s+/).filter(word => word.length > 0).length
      })),
      metadata: {
        totalWords: wordCount,
        totalParagraphs: paragraphs.length,
        totalSections: sections.length,
        fileName: fileName,
        extractionMethod: extractionMethod
      },
      warnings: []
    };
    
  } catch (error) {
    console.error(`❌ Enhanced extraction error for ${fileName}:`, error);
    throw new Error(`Failed to extract text from ${fileName}: ${error.message}`);
  }
};

// Enhanced comparison with semantic analysis
const compareDocumentSections = (doc1, doc2) => {
  const changes = [];
  const stats = {
    additions: 0,
    deletions: 0,
    modifications: 0,
    unchanged: 0,
    financial: 0,
    quantitative: 0,
    qualitative: 0
  };
  
  // Compare sections
  const maxSections = Math.max(doc1.sections.length, doc2.sections.length);
  
  for (let sectionIndex = 0; sectionIndex < maxSections; sectionIndex++) {
    const section1 = doc1.sections[sectionIndex];
    const section2 = doc2.sections[sectionIndex];
    
    if (!section1 && section2) {
      // Section added
      changes.push({
        type: 'section_added',
        sectionIndex,
        sectionTitle: section2.title,
        content: section2,
        annotation: '➕ New section',
        severity: 'high'
      });
      stats.additions++;
    } else if (section1 && !section2) {
      // Section removed
      changes.push({
        type: 'section_removed',
        sectionIndex,
        sectionTitle: section1.title,
        content: section1,
        annotation: '🗑️ Section removed',
        severity: 'high'
      });
      stats.deletions++;
    } else if (section1 && section2) {
      // Compare section content
      const sectionChanges = compareSectionParagraphs(section1, section2, sectionIndex);
      changes.push(...sectionChanges);
      
      // Update stats
      sectionChanges.forEach(change => {
        if (change.semantic?.type === 'financial') stats.financial++;
        if (change.semantic?.type === 'quantitative') stats.quantitative++;
        if (change.semantic?.type === 'qualitative') stats.qualitative++;
        
        if (change.type.includes('added')) stats.additions++;
        else if (change.type.includes('removed')) stats.deletions++;
        else if (change.type.includes('modified')) stats.modifications++;
        else stats.unchanged++;
      });
    }
  }
  
  return { changes, stats };
};

const compareSectionParagraphs = (section1, section2, sectionIndex) => {
  const changes = [];
  const maxParagraphs = Math.max(section1.paragraphs.length, section2.paragraphs.length);
  
  console.log(`🔍 Comparing section "${section1.title}" - ${section1.paragraphs.length} vs ${section2.paragraphs.length} paragraphs`);
  
  for (let paragraphIndex = 0; paragraphIndex < maxParagraphs; paragraphIndex++) {
    const para1 = section1.paragraphs[paragraphIndex];
    const para2 = section2.paragraphs[paragraphIndex];
    
    if (!para1 && para2) {
      changes.push({
        type: 'paragraph_added',
        sectionIndex,
        sectionTitle: section2.title,
        paragraphIndex,
        content: para2.text,
        annotation: '➕ Added',
        severity: 'medium',
        wordCount: para2.wordCount
      });
    } else if (para1 && !para2) {
      changes.push({
        type: 'paragraph_removed',
        sectionIndex,
        sectionTitle: section1.title,
        paragraphIndex,
        content: para1.text,
        annotation: '🗑️ Removed',
        severity: 'medium',
        wordCount: para1.wordCount
      });
    } else if (para1 && para2 && para1.text !== para2.text) {
      // ENHANCED: Check if paragraphs are similar enough for word-level diff
      const similarity = calculateTextSimilarity(para1.text, para2.text);
      
      if (similarity > 30) {
        // Similar enough - do word-level diff
        console.log(`📝 Word-level diff for paragraph ${paragraphIndex} (similarity: ${similarity}%)`);
        const wordDiff = computeWordLevelDiff(para1.text, para2.text);
        const semantic = classifyChange(para1.text, para2.text);
        
        changes.push({
          type: 'paragraph_modified',
          sectionIndex,
          sectionTitle: section1.title,
          paragraphIndex,
          oldContent: para1.text,
          newContent: para2.text,
          wordDiff,
          semantic,
          annotation: semantic.annotation,
          severity: semantic.severity,
          wordCount: {
            old: para1.wordCount,
            new: para2.wordCount,
            change: para2.wordCount - para1.wordCount
          },
          similarity: similarity
        });
      } else {
        // Too different - treat as remove + add
        changes.push({
          type: 'paragraph_removed',
          sectionIndex,
          sectionTitle: section1.title,
          paragraphIndex,
          content: para1.text,
          annotation: '🔄 Replaced (Old)',
          severity: 'high',
          wordCount: para1.wordCount
        });
        
        changes.push({
          type: 'paragraph_added',
          sectionIndex,
          sectionTitle: section2.title,
          paragraphIndex,
          content: para2.text,
          annotation: '🔄 Replaced (New)',
          severity: 'high',
          wordCount: para2.wordCount
        });
      }
    }
  }
  
  console.log(`✅ Section comparison completed: ${changes.length} changes found`);
  return changes;
};

// Main comparison function
export const compareWordFiles = async (file1Buffer, file2Buffer, options = {}) => {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting enhanced Word document comparison...');
    
    updateProgress('Initialization', 5, 'Starting enhanced analysis...');
    
    // Enhanced text extraction
    updateProgress('Text Extraction', 20, 'Extracting structured content from Document 1...');
    const doc1 = await extractTextFromWord(file1Buffer, 'Document 1');
    
    updateProgress('Text Extraction', 40, 'Extracting structured content from Document 2...');
    const doc2 = await extractTextFromWord(file2Buffer, 'Document 2');
    
    updateProgress('Analysis', 60, 'Performing semantic comparison...');
    
    // Enhanced comparison
    const { changes, stats } = compareDocumentSections(doc1, doc2);
    
    updateProgress('Processing', 80, 'Generating professional analysis...');
    
    // Calculate overall similarity with better algorithm
    const totalWords1 = doc1.metadata.totalWords;
    const totalWords2 = doc2.metadata.totalWords;
    const changedWords = changes.reduce((acc, change) => {
      if (change.wordCount) {
        return acc + (typeof change.wordCount === 'object' 
          ? Math.max(change.wordCount.old || 0, change.wordCount.new || 0)
          : change.wordCount);
      }
      return acc;
    }, 0);
    
    const maxWords = Math.max(totalWords1, totalWords2);
    const similarityScore = maxWords > 0 ? Math.round((1 - changedWords / maxWords) * 100) : 100;
    
    updateProgress('Finalization', 95, 'Compiling enhanced results...');
    
    const processingTime = Date.now() - startTime;
    
    const results = {
      // Enhanced metadata
      comparison_method: 'enhanced_word_semantic_comparison',
      similarity_score: similarityScore,
      overall_similarity: similarityScore,
      processing_time: { total_time_ms: processingTime },
      
      // Document structure
      document1_structure: {
        sections: doc1.sections.map((section, index) => ({
          sectionIndex: index,
          title: section.title,
          paragraphCount: section.paragraphs.length,
          wordCount: section.paragraphs.reduce((acc, p) => acc + p.wordCount, 0)
        })),
        metadata: doc1.metadata
      },
      
      document2_structure: {
        sections: doc2.sections.map((section, index) => ({
          sectionIndex: index,
          title: section.title,
          paragraphCount: section.paragraphs.length,
          wordCount: section.paragraphs.reduce((acc, p) => acc + p.wordCount, 0)
        })),
        metadata: doc2.metadata
      },
      
      // Enhanced changes with semantic analysis
      enhanced_changes: changes,
      change_statistics: {
        total_changes: changes.length,
        additions: stats.additions,
        deletions: stats.deletions,
        modifications: stats.modifications,
        unchanged: stats.unchanged,
        semantic_breakdown: {
          financial: stats.financial,
          quantitative: stats.quantitative,
          qualitative: stats.qualitative,
          textual: changes.length - (stats.financial + stats.quantitative + stats.qualitative)
        }
      },
      
      // Navigation data
      navigation: {
        total_sections: Math.max(doc1.sections.length, doc2.sections.length),
        sections_with_changes: [...new Set(changes.map(c => c.sectionIndex))].length,
        major_changes: changes.filter(c => c.severity === 'high').length,
        change_density: changes.length / Math.max(doc1.metadata.totalParagraphs, doc2.metadata.totalParagraphs)
      },
      
      // Export data for professional reports
      export_data: {
        document_titles: {
          doc1: doc1.metadata.fileName,
          doc2: doc2.metadata.fileName
        },
        summary: {
          total_changes: changes.length,
          similarity_percentage: similarityScore,
          word_change_percentage: maxWords > 0 ? Math.round((changedWords / maxWords) * 100) : 0
        }
      },
      
      // Performance metrics
      quality_metrics: {
        overall_success_rate: 1.0,
        semantic_analysis_coverage: (stats.financial + stats.quantitative + stats.qualitative) / Math.max(changes.length, 1),
        processing_efficiency: processingTime < 5000 ? 1.0 : Math.max(0.5, 5000 / processingTime)
      },
      
      // Legacy compatibility
      text_changes: changes.map(change => ({
        type: change.type.replace('paragraph_', '').replace('section_', ''),
        paragraph: change.paragraphIndex || 0,
        section: change.sectionIndex || 0,
        old_text: change.oldContent || change.content || '',
        new_text: change.newContent || change.content || '',
        annotation: change.annotation
      })),
      
      comparison_type: 'Enhanced Word Document Analysis',
      processing_note: `Enhanced semantic comparison completed. Analyzed ${doc1.sections.length} and ${doc2.sections.length} sections with ${changes.length} changes detected.`
    };
    
    updateProgress('Complete', 100, 'Enhanced comparison completed!');
    
    console.log('✅ Enhanced Word comparison completed:', {
      similarity: results.similarity_score,
      changes: results.enhanced_changes.length,
      sections: results.navigation.total_sections,
      semanticCoverage: results.quality_metrics.semantic_analysis_coverage,
      processingTime: processingTime
    });
    
    return results;
    
  } catch (error) {
    console.error('❌ Enhanced Word comparison failed:', error);
    throw new Error(`Enhanced Word document comparison failed: ${error.message}`);
  }
};
