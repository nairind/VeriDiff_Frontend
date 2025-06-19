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
    
    // Use mammoth to extract text with paragraph structure
    const result = await mammoth.extractRawText(fileBuffer);
    const text = result.text;
    
    // Also get HTML for better structure detection
    const htmlResult = await mammoth.convertToHtml(fileBuffer);
    const html = htmlResult.value;
    
    // Parse into paragraphs (split by double newlines and filter empty)
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // Extract metadata from HTML structure
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    
    console.log(`✅ Extracted ${paragraphs.length} paragraphs, ${wordCount} words from ${fileName}`);
    
    return {
      text: text,
      html: html,
      paragraphs: paragraphs.map((paragraph, index) => ({
        index: index,
        text: paragraph.trim(),
        word_count: paragraph.trim().split(/\s+/).length
      })),
      metadata: {
        totalWords: wordCount,
        totalParagraphs: paragraphs.length,
        fileName: fileName
      },
      warnings: result.messages || []
    };
    
  } catch (error) {
    console.error(`❌ Error extracting from ${fileName}:`, error);
    throw new Error(`Failed to extract text from ${fileName}: ${error.message}`);
  }
};

const calculateTextSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;
  
  // Simple similarity calculation
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
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
    updateProgress('Initialization', 5, 'Starting Word document analysis...');
    
    // Extract text and structure from both documents
    updateProgress('Text Extraction', 20, 'Extracting text from first document...');
    const doc1 = await extractTextFromWord(file1Buffer, 'Document 1');
    
    updateProgress('Text Extraction', 40, 'Extracting text from second document...');
    const doc2 = await extractTextFromWord(file2Buffer, 'Document 2');
    
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
      processingTime: processingTime
    });
    
    return results;
    
  } catch (error) {
    console.error('❌ Word comparison failed:', error);
    throw new Error(`Word document comparison failed: ${error.message}`);
  }
};
