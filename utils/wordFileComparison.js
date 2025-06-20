// /utils/wordFileComparison.js - Word Document Comparison Engine
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

const extractTextFromWord = async (fileBuffer, fileName) => {
  try {
    console.log(`📝 Extracting text from ${fileName}...`);
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
    
    // ENHANCED DEBUG - Check ArrayBuffer content
    const uint8Array = new Uint8Array(arrayBuffer);
    const firstBytes = Array.from(uint8Array.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' ');
    console.log(`🔍 File signature (first 8 bytes): ${firstBytes}`);
    
    // Check for common Word file signatures
    const isZipBased = uint8Array[0] === 0x50 && uint8Array[1] === 0x4B; // PK (ZIP-based like .docx)
    const isOldDoc = uint8Array[0] === 0xD0 && uint8Array[1] === 0xCF; // Old .doc format
    console.log(`📋 File format detection: ZIP-based (.docx): ${isZipBased}, Old .doc: ${isOldDoc}`);
    
    // Check if ArrayBuffer is valid
    const isZeroFilled = uint8Array.every(b => b === 0);
    const hasContent = uint8Array.some(b => b !== 0);
    console.log(`🔍 ArrayBuffer analysis:`, {
      isZeroFilled,
      hasContent,
      firstNonZeroByte: uint8Array.findIndex(b => b !== 0),
      totalBytes: uint8Array.length
    });
    
    if (isZeroFilled) {
      throw new Error(`${fileName} contains only zero bytes - file data is corrupted or empty`);
    }
    
    if (!isZipBased && !isOldDoc) {
      console.warn(`⚠️ File signature doesn't match expected Word document formats for ${fileName}`);
    }
    
    // Try mammoth.js with the browser global instead of import
    const mammothLib = window.mammoth || mammoth;
    if (!mammothLib) {
      throw new Error('Mammoth.js library not available. Please ensure mammoth.js is loaded.');
    }
    
    console.log(`🔍 Using mammoth library:`, typeof mammothLib);
    
    // Use mammoth to extract text with proper options
    console.log(`🔍 Calling mammoth.extractRawText for ${fileName}...`);
    
    // METHOD 1: Standard approach
    console.log('🧪 Method 1: Standard mammoth call');
    let result;
    try {
      result = await mammothLib.extractRawText({ arrayBuffer: arrayBuffer });
      console.log(`📝 Method 1 result:`, {
        textLength: result.text?.length || 0,
        textPreview: result.text ? result.text.substring(0, 100) + (result.text.length > 100 ? '...' : '') : 'null',
        messagesCount: result.messages?.length || 0
      });
    } catch (method1Error) {
      console.error('❌ Method 1 failed:', method1Error);
    }
    
    // METHOD 2: Alternative if first method fails
    if (!result?.text || result.text.trim().length === 0) {
      console.log('🧪 Method 2: Alternative mammoth approach');
      try {
        // Create a fresh ArrayBuffer copy
        const freshBuffer = arrayBuffer.slice(0);
        result = await mammothLib.extractRawText({ arrayBuffer: freshBuffer });
        console.log(`📝 Method 2 result:`, {
          textLength: result.text?.length || 0,
          textPreview: result.text ? result.text.substring(0, 100) + (result.text.length > 100 ? '...' : '') : 'null',
          messagesCount: result.messages?.length || 0
        });
      } catch (method2Error) {
        console.error('❌ Method 2 failed:', method2Error);
      }
    }
    
    // METHOD 3: Try HTML extraction if text extraction fails
    if (!result?.text || result.text.trim().length === 0) {
      console.log('🧪 Method 3: HTML extraction fallback');
      try {
        const htmlResult = await mammothLib.convertToHtml({ arrayBuffer: arrayBuffer });
        console.log(`📄 HTML extraction result length: ${htmlResult.value?.length || 0}`);
        console.log(`📄 HTML preview:`, htmlResult.value?.substring(0, 200) || 'empty');
        
        if (htmlResult.value && htmlResult.value.trim().length > 0) {
          // Strip HTML tags to get text
          const textFromHtml = htmlResult.value.replace(/<[^>]*>/g, '').trim();
          if (textFromHtml.length > 0) {
            console.log(`✅ Recovered text from HTML conversion: ${textFromHtml.length} characters`);
            result = {
              text: textFromHtml,
              messages: htmlResult.messages || []
            };
          }
        }
      } catch (htmlError) {
        console.error('❌ HTML extraction also failed:', htmlError);
      }
    }
    
    const text = result?.text || '';
    
    // Log any mammoth warnings/messages
    if (result?.messages && result.messages.length > 0) {
      console.log(`📋 Mammoth processing messages for ${fileName}:`, result.messages);
    }
    
    if (!text || text.trim().length === 0) {
      console.error(`❌ FINAL FAILURE: No text extracted from ${fileName}`);
      console.log('File analysis summary:', {
        hasValidSignature: isZipBased || isOldDoc,
        arrayBufferSize: arrayBuffer.byteLength,
        hasNonZeroContent: hasContent,
        firstBytes: firstBytes
      });
      
      throw new Error(`No text content found in ${fileName}. The document may be empty, corrupted, or in an unsupported format. File size: ${arrayBuffer.byteLength} bytes, Signature: ${firstBytes}`);
    }
    
    console.log(`📝 Successfully extracted ${text.length} characters from ${fileName}`);
    
    // Also get HTML for better structure detection  
    console.log(`🔍 Getting HTML structure for ${fileName}...`);
    let html = '';
    try {
      const htmlResult = await mammothLib.convertToHtml({ arrayBuffer: arrayBuffer });
      html = htmlResult.value || '';
    } catch (htmlError) {
      console.warn(`⚠️ HTML extraction failed for ${fileName}:`, htmlError.message);
    }
    
    return processExtractedText(text, html, fileName, result.messages);
    
  } catch (error) {
    console.error(`❌ Error extracting from ${fileName}:`, error);
    
    // Provide more specific error messages
    if (error.message.includes('zip') || error.message.includes('ZIP')) {
      throw new Error(`Failed to extract text from ${fileName}: Document appears corrupted or is not a valid Word document. Please ensure the file is a proper .docx or .doc file.`);
    } else if (error.message.includes('arrayBuffer') || error.message.includes('ArrayBuffer')) {
      throw new Error(`Failed to extract text from ${fileName}: File data format error. Please try re-uploading the document.`);
    } else if (error.message.includes('mammoth') || error.message.includes('Mammoth')) {
      throw new Error(`Failed to extract text from ${fileName}: Word processing library error. ${error.message}`);
    } else {
      throw new Error(`Failed to extract text from ${fileName}: ${error.message}`);
    }
  }
};

const processExtractedText = (text, html, fileName, messages) => {
  // Parse into paragraphs (split by double newlines and filter empty)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  // If no paragraphs found through splitting, try splitting by single newlines
  if (paragraphs.length === 0) {
    const singleLineParagraphs = text.split(/\n/).filter(p => p.trim().length > 0);
    paragraphs.push(...singleLineParagraphs);
  }
  
  // If still no paragraphs, treat the entire text as one paragraph
  if (paragraphs.length === 0 && text.trim().length > 0) {
    paragraphs.push(text.trim());
  }
  
  // Extract metadata from HTML structure
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  
  console.log(`✅ Processed ${paragraphs.length} paragraphs, ${wordCount} words from ${fileName}`);
  
  return {
    text: text,
    html: html,
    paragraphs: paragraphs.map((paragraph, index) => ({
      index: index,
      text: paragraph.trim(),
      word_count: paragraph.trim().split(/\s+/).filter(word => word.length > 0).length
    })),
    metadata: {
      totalWords: wordCount,
      totalParagraphs: paragraphs.length,
      fileName: fileName
    },
    warnings: messages || []
  };
};

const calculateTextSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;
  
  // Simple similarity calculation
  const words1 = text1.toLowerCase().split(/\s+/).filter(word => word.length > 0);
  const words2 = text2.toLowerCase().split(/\s+/).filter(word => word.length > 0);
  
  if (words1.length === 0 && words2.length === 0) return 100;
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
};

const compareParagraphs = (paragraphs1, paragraphs2) => {
  const changes = [];
  const maxLength = Math.max(paragraphs1.length, paragraphs2.length);
  
  for (let i = 0; i < maxLength; i++) {
    const para1 = paragraphs1[i];
    const para2 = paragraphs2[i];
    
    if (!para1 && para2) {
      // Paragraph added in document 2
      changes.push({
        type: 'added',
        paragraph: i,
        text: para2.text,
        file: 'file2',
        word_count: para2.word_count
      });
    } else if (para1 && !para2) {
      // Paragraph removed in document 2
      changes.push({
        type: 'removed',
        paragraph: i,
        text: para1.text,
        file: 'file1',
        word_count: para1.word_count
      });
    } else if (para1 && para2) {
      // Both paragraphs exist, check if they're different
      if (para1.text !== para2.text) {
        const similarity = calculateTextSimilarity(para1.text, para2.text);
        
        changes.push({
          type: 'modified',
          paragraph: i,
          old_text: para1.text,
          new_text: para2.text,
          file: 'both',
          similarity: similarity,
          word_count_old: para1.word_count,
          word_count_new: para2.word_count
        });
      }
    }
  }
  
  return changes;
};

const generateSmartChanges = (doc1, doc2, textChanges) => {
  console.log('🧠 Generating SmartDiff-style changes for Word documents...');
  
  const smartChanges = [];
  
  textChanges.forEach((change, index) => {
    const baseChange = {
      id: `word_change_${index}`,
      paragraph: change.paragraph,
      type: change.type,
      change_type: change.type === 'modified' ? 'modification' : change.type === 'added' ? 'addition' : 'deletion',
      confidence: 'high',
      similarity: change.similarity || (change.type === 'modified' ? 0.3 : 0),
      content_type: 'paragraph_text',
      alignment_type: 'positional_match',
      metadata: {
        original_position_1: change.type !== 'added' ? change.paragraph : undefined,
        original_position_2: change.type !== 'removed' ? change.paragraph : undefined,
        word_count_1: change.word_count_old || change.word_count || 0,
        word_count_2: change.word_count_new || change.word_count || 0
      }
    };
    
    if (change.type === 'modified') {
      smartChanges.push({
        ...baseChange,
        old_content: change.old_text,
        new_content: change.new_text
      });
    } else if (change.type === 'added') {
      smartChanges.push({
        ...baseChange,
        content: change.text,
        new_content: change.text
      });
    } else if (change.type === 'removed') {
      smartChanges.push({
        ...baseChange,
        content: change.text,
        old_content: change.text
      });
    }
  });
  
  console.log(`✅ Generated ${smartChanges.length} SmartDiff-style changes`);
  return smartChanges;
};

export const compareWordFiles = async (file1Buffer, file2Buffer, options = {}) => {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting Word document comparison...');
    console.log('📊 Input buffer details:', {
      file1Type: typeof file1Buffer,
      file2Type: typeof file2Buffer,
      file1Size: file1Buffer?.byteLength || 'unknown',
      file2Size: file2Buffer?.byteLength || 'unknown'
    });
    
    updateProgress('Initialization', 5, 'Starting Word document analysis...');
    
    // Validate input buffers
    if (!file1Buffer || !file2Buffer) {
      throw new Error('Invalid file data: Both documents must be provided');
    }
    
    // Extract text and structure from both documents
    updateProgress('Text Extraction', 20, 'Extracting text from first document...');
    const doc1 = await extractTextFromWord(file1Buffer, 'Document 1');
    
    updateProgress('Text Extraction', 40, 'Extracting text from second document...');
    const doc2 = await extractTextFromWord(file2Buffer, 'Document 2');
    
    // Validate extraction results
    if (!doc1.text || !doc2.text) {
      throw new Error('Text extraction failed: One or both documents appear to be empty or corrupted');
    }
    
    updateProgress('Analysis', 60, 'Comparing document structures...');
    
    // Calculate overall document similarity
    const overallSimilarity = calculateTextSimilarity(doc1.text, doc2.text);
    
    // Compare paragraphs
    updateProgress('Analysis', 75, 'Analyzing paragraph-level changes...');
    const textChanges = compareParagraphs(doc1.paragraphs, doc2.paragraphs);
    
    // Generate SmartDiff-style results
    updateProgress('Processing', 85, 'Generating smart comparison results...');
    const smartChanges = generateSmartChanges(doc1, doc2, textChanges);
    
    // Calculate statistics
    const addedCount = textChanges.filter(c => c.type === 'added').length;
    const removedCount = textChanges.filter(c => c.type === 'removed').length;
    const modifiedCount = textChanges.filter(c => c.type === 'modified').length;
    const unchangedCount = Math.max(doc1.paragraphs.length, doc2.paragraphs.length) - textChanges.length;
    
    updateProgress('Finalization', 95, 'Compiling results...');
    
    const processingTime = Date.now() - startTime;
    
    const results = {
      // Main results structure (mirrors PDF format)
      comparison_method: 'word_document_comparison',
      similarity_score: Math.round(overallSimilarity),
      overall_similarity: Math.round(overallSimilarity),
      differences_found: textChanges.length,
      matches_found: unchangedCount,
      total_paragraphs: Math.max(doc1.paragraphs.length, doc2.paragraphs.length),
      
      // Document-specific data
      document1_data: {
        paragraphs: doc1.paragraphs.map((para, index) => ({
          paragraph_number: index + 1,
          text: para.text,
          word_count: para.word_count
        })),
        metadata: doc1.metadata
      },
      
      document2_data: {
        paragraphs: doc2.paragraphs.map((para, index) => ({
          paragraph_number: index + 1,
          text: para.text,
          word_count: para.word_count
        })),
        metadata: doc2.metadata
      },
      
      // Changes data
      text_changes: textChanges,
      smart_changes: smartChanges,
      
      // Statistics
      added_count: addedCount,
      removed_count: removedCount,
      modified_count: modifiedCount,
      unchanged_count: unchangedCount,
      
      // Word analysis
      word_changes: {
        file1_words: doc1.metadata.totalWords,
        file2_words: doc2.metadata.totalWords,
        word_difference: doc2.metadata.totalWords - doc1.metadata.totalWords,
        word_change_percentage: doc1.metadata.totalWords > 0 
          ? Math.round(Math.abs(doc2.metadata.totalWords - doc1.metadata.totalWords) / doc1.metadata.totalWords * 100)
          : 0
      },
      
      // Summary for display
      paragraph_differences: textChanges.length > 0 ? [
        {
          paragraph_number: 'Summary',
          changes_count: textChanges.length,
          summary: `${addedCount} added, ${removedCount} removed, ${modifiedCount} modified`,
          doc1_paragraphs: doc1.paragraphs.length,
          doc2_paragraphs: doc2.paragraphs.length
        }
      ] : [],
      
      // Processing metadata
      processing_time: {
        total_time_ms: processingTime
      },
      
      quality_metrics: {
        overall_success_rate: 1.0,
        file1_success_rate: 1.0,
        file2_success_rate: 1.0
      },
      
      processing_note: `Word document comparison completed. Processed ${doc1.paragraphs.length} and ${doc2.paragraphs.length} paragraphs.`,
      comparison_type: 'Word Document',
      
      // Change summary for SmartDiff display
      change_summary: {
        exact_alignments: unchangedCount,
        content_alignments: modifiedCount,
        high_confidence: textChanges.filter(c => c.similarity && c.similarity > 70).length,
        total_changes: textChanges.length
      }
    };
    
    updateProgress('Complete', 100, 'Word document comparison completed!');
    
    console.log('✅ Word comparison completed:', {
      similarity: results.similarity_score,
      changes: results.differences_found,
      processingTime: processingTime,
      doc1Paragraphs: doc1.paragraphs.length,
      doc2Paragraphs: doc2.paragraphs.length
    });
    
    return results;
    
  } catch (error) {
    console.error('❌ Word comparison failed:', error);
    
    // Provide better error context
    if (error.message.includes('mammoth')) {
      throw new Error(`Word processing library error: ${error.message}. Please ensure you're uploading valid Word documents (.docx/.doc files).`);
    } else if (error.message.includes('memory') || error.message.includes('buffer')) {
      throw new Error(`Memory or file processing error: ${error.message}. Try using smaller files or refresh the page and try again.`);
    } else {
      throw new Error(`Word document comparison failed: ${error.message}`);
    }
  }
};
