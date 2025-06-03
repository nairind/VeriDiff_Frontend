// utils/pdfFileComparison.js
// Document-specific implementation for documents.js page
// Returns data compatible with PdfResults.js component
// Note: This is a minimal implementation. For full PDF text extraction, integrate PDF.js

// Helper function to safely read file as ArrayBuffer
const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    console.log('📁 Reading PDF file for documents comparison:', file?.name);
    
    if (!file) {
      reject(new Error('No file provided'));
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
        reject(new Error('Failed to process file content'));
      }
    };
    
    reader.onerror = (e) => {
      console.error('❌ FileReader error:', e);
      reject(new Error(`Failed to read file "${file.name}"`));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Helper function to extract basic PDF metadata
const extractPDFMetadata = (arrayBuffer, fileName) => {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    let pdfString = '';
    
    // Read first 2000 bytes to get PDF header and basic info
    const bytesToRead = Math.min(2000, uint8Array.length);
    for (let i = 0; i < bytesToRead; i++) {
      pdfString += String.fromCharCode(uint8Array[i]);
    }
    
    // Check if it's a valid PDF
    if (!pdfString.startsWith('%PDF-')) {
      throw new Error('File is not a valid PDF document');
    }
    
    // Extract PDF version
    const versionMatch = pdfString.match(/%PDF-(\d+\.\d+)/);
    const pdfVersion = versionMatch ? versionMatch[1] : 'Unknown';
    
    // Estimate page count (very rough estimation without proper parsing)
    const pageMatches = pdfString.match(/\/Count\s+(\d+)/);
    const estimatedPages = pageMatches ? parseInt(pageMatches[1]) : 1;
    
    return {
      fileName: fileName,
      fileSize: arrayBuffer.byteLength,
      pdfVersion: pdfVersion,
      estimatedPages: Math.max(1, estimatedPages),
      isValidPDF: true
    };
  } catch (error) {
    throw new Error(`PDF metadata extraction failed: ${error.message}`);
  }
};

// Helper function to generate mock page data (for demonstration)
const generateMockPageData = (metadata, pageNum) => {
  return {
    page_number: pageNum,
    paragraphs: [
      {
        text: `Mock paragraph 1 from ${metadata.fileName} (Page ${pageNum})`,
        paragraph_index: 0
      },
      {
        text: `Mock paragraph 2 from ${metadata.fileName} (Page ${pageNum})`,
        paragraph_index: 1
      },
      {
        text: `This is simulated content. For real PDF text extraction, integrate PDF.js library.`,
        paragraph_index: 2
      }
    ],
    word_count: 25,
    character_count: 150
  };
};

export const parsePDFFile = async (fileContent) => {
  console.log('🔧 parsePDFFile called for documents comparison');
  
  try {
    let arrayBuffer;
    
    // Handle both file objects and ArrayBuffer
    if (fileContent instanceof ArrayBuffer) {
      arrayBuffer = fileContent;
    } else {
      // Validate file type
      if (!fileContent.type.includes('pdf') && !fileContent.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('File is not a PDF document');
      }
      
      arrayBuffer = await readFileAsArrayBuffer(fileContent);
    }
    
    // Extract PDF metadata
    const metadata = extractPDFMetadata(arrayBuffer, fileContent.name || 'document.pdf');
    console.log('📄 PDF metadata:', metadata);
    
    // Generate mock page data (in production, use PDF.js)
    const pages = [];
    for (let i = 1; i <= metadata.estimatedPages; i++) {
      pages.push(generateMockPageData(metadata, i));
    }
    
    console.log('✅ PDF parsed successfully for documents (mock data)');
    console.log('⚠️ Note: Using mock data. For real text extraction, implement PDF.js');
    
    return {
      metadata: metadata,
      pages: pages,
      raw: arrayBuffer
    };
    
  } catch (error) {
    console.error('❌ PDF parsing error:', error);
    throw new Error(`Failed to parse PDF file: ${error.message}`);
  }
};

export const comparePDFFiles = async (pdf1, pdf2, options = {}) => {
  console.log('🔄 comparePDFFiles called for documents comparison');
  console.log('🎛️ Options:', options);
  
  try {
    // Parse both inputs
    const data1 = typeof pdf1 === 'string' ? await parsePDFFile(pdf1) : pdf1;
    const data2 = typeof pdf2 === 'string' ? await parsePDFFile(pdf2) : pdf2;
    
    console.log('📊 Comparing PDF documents...');
    
    // Compare basic metadata
    const metadataChanges = [];
    if (data1.metadata.pdfVersion !== data2.metadata.pdfVersion) {
      metadataChanges.push({
        type: 'version_difference',
        oldValue: data1.metadata.pdfVersion,
        newValue: data2.metadata.pdfVersion
      });
    }
    
    // Compare page counts
    const totalPages = Math.max(data1.pages.length, data2.pages.length);
    const pageCountDiff = Math.abs(data1.pages.length - data2.pages.length);
    
    // Mock text comparison (in production, use actual text from PDF.js)
    const text_changes = [];
    const page_differences = [];
    
    let totalParagraphs = 0;
    let differences = 0;
    let matches = 0;
    
    for (let i = 0; i < totalPages; i++) {
      const page1 = data1.pages[i];
      const page2 = data2.pages[i];
      
      let pageChanges = 0;
      
      if (!page1) {
        pageChanges = page2.paragraphs.length;
        differences += pageChanges;
        text_changes.push({
          page: i + 1,
          type: 'added',
          text: `Page ${i + 1} added in second document`,
          paragraph: 0
        });
      } else if (!page2) {
        pageChanges = page1.paragraphs.length;
        differences += pageChanges;
        text_changes.push({
          page: i + 1,
          type: 'removed',
          text: `Page ${i + 1} removed from second document`,
          paragraph: 0
        });
      } else {
        // Compare paragraphs on this page
        const maxParas = Math.max(page1.paragraphs.length, page2.paragraphs.length);
        totalParagraphs += maxParas;
        
        for (let j = 0; j < maxParas; j++) {
          const para1 = page1.paragraphs[j];
          const para2 = page2.paragraphs[j];
          
          if (!para1) {
            pageChanges++;
            differences++;
            text_changes.push({
              page: i + 1,
              paragraph: j,
              type: 'added',
              text: para2.text,
              file: 'file2'
            });
          } else if (!para2) {
            pageChanges++;
            differences++;
            text_changes.push({
              page: i + 1,
              paragraph: j,
              type: 'removed',
              text: para1.text,
              file: 'file1'
            });
          } else if (para1.text !== para2.text) {
            pageChanges++;
            differences++;
            text_changes.push({
              page: i + 1,
              paragraph: j,
              type: 'modified',
              text: `Modified: "${para1.text}" → "${para2.text}"`,
              file: 'both'
            });
          } else {
            matches++;
          }
        }
      }
      
      if (pageChanges > 0) {
        page_differences.push({
          page_number: i + 1,
          changes_count: pageChanges,
          summary: `${pageChanges} change${pageChanges > 1 ? 's' : ''} on page ${i + 1}`
        });
      }
    }
    
    // Calculate similarity score
    const totalComparisons = differences + matches;
    const similarity_score = totalComparisons > 0 ? Math.round((matches / totalComparisons) * 100) : 100;
    
    const results = {
      // Core statistics expected by PdfResults.js
      differences_found: differences,
      matches_found: matches,
      total_pages: totalPages,
      total_paragraphs: totalParagraphs,
      similarity_score: similarity_score,
      
      // Change details
      text_changes: text_changes,
      page_differences: page_differences,
      
      // Page data for display
      file1_pages: data1.pages,
      file2_pages: data2.pages,
      
      // Additional metadata
      file1_metadata: data1.metadata,
      file2_metadata: data2.metadata,
      comparison_type: 'pdf_document',
      
      // Processing notes
      processing_note: 'Mock PDF comparison. For real text extraction, integrate PDF.js library',
      metadata_changes: metadataChanges,
      
      // Summary by change type
      added_count: text_changes.filter(c => c.type === 'added').length,
      removed_count: text_changes.filter(c => c.type === 'removed').length,
      modified_count: text_changes.filter(c => c.type === 'modified').length
    };
    
    console.log('✅ PDF document comparison complete:');
    console.log('  - Total pages:', results.total_pages);
    console.log('  - Total paragraphs:', results.total_paragraphs);
    console.log('  - Differences:', results.differences_found);
    console.log('  - Matches:', results.matches_found);
    console.log('  - Similarity:', results.similarity_score + '%');
    console.log('⚠️ Note: Using mock data. For real PDF comparison, implement PDF.js');
    
    return results;
    
  } catch (error) {
    console.error('❌ PDF document comparison error:', error);
    throw new Error(`PDF comparison failed: ${error.message}`);
  }
};

/* 
TODO: For full PDF text extraction, integrate PDF.js like this:

import * as pdfjsLib from 'pdfjs-dist';

export const parsePDFFileWithPDFJS = async (file) => {
  try {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const pages = [];
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const text = textContent.items.map(item => item.str).join(' ');
      const paragraphs = text.split('\n\n').filter(p => p.trim()).map((paragraph, index) => ({
        text: paragraph.trim(),
        paragraph_index: index
      }));
      
      pages.push({
        page_number: pageNum,
        paragraphs: paragraphs,
        word_count: text.split(/\s+/).length,
        character_count: text.length
      });
    }
    
    return {
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        totalPages: pdf.numPages,
        isValidPDF: true
      },
      pages: pages,
      raw: arrayBuffer
    };
  } catch (error) {
    throw new Error(`PDF parsing with PDF.js failed: ${error.message}`);
  }
};
*/
