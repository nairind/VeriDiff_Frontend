// File: utils/pdfFileComparison.js

// Note: This requires pdf-lib or similar library for PDF text extraction
// For now, we'll create the structure and note the dependencies

/**
 * PDF Text Extraction using PDF.js (browser-compatible)
 * This is a simplified version - you'll need to include PDF.js library
 */

// You'll need to add this script tag to your HTML head:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>

/**
 * Extract text content from PDF file
 */
export const extractTextFromPDF = async (file) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if PDF.js is available
      if (typeof pdfjsLib === 'undefined') {
        throw new Error('PDF.js library not loaded. Please include PDF.js in your HTML.');
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      let fullText = '';
      const textByPage = [];

      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .trim();
        
        textByPage.push({
          page: pageNum,
          text: pageText
        });
        
        fullText += pageText + '\n';
      }

      resolve({
        fullText: fullText.trim(),
        pages: textByPage,
        pageCount: pdf.numPages
      });

    } catch (error) {
      reject(new Error(`Failed to extract PDF text: ${error.message}`));
    }
  });
};

/**
 * Parse extracted PDF text into structured data
 * This is where you'd implement business logic for invoices/statements
 */
const parsePDFContent = (extractedData, documentType = 'general') => {
  const { fullText, pages } = extractedData;
  
  // Basic text parsing - you can enhance this based on document structure
  const lines = fullText.split('\n').filter(line => line.trim());
  
  // Create a flattened structure similar to other comparisons
  const structured = {
    'document.type': documentType,
    'document.pageCount': pages.length.toString(),
    'document.fullText': fullText,
  };

  // Extract common patterns (you can customize this based on your needs)
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine) {
      // Look for amount patterns (e.g., $123.45, 123.45, etc.)
      const amountMatch = trimmedLine.match(/\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);
      if (amountMatch) {
        amountMatch.forEach((amount, amountIndex) => {
          structured[`amount.line${index}.${amountIndex}`] = amount.replace(/[$,]/g, '');
        });
      }

      // Look for date patterns (MM/DD/YYYY, DD-MM-YYYY, etc.)
      const dateMatch = trimmedLine.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g);
      if (dateMatch) {
        dateMatch.forEach((date, dateIndex) => {
          structured[`date.line${index}.${dateIndex}`] = date;
        });
      }

      // Store each line for detailed comparison
      structured[`line.${index}`] = trimmedLine;
    }
  });

  return [structured]; // Return as array for consistency
};

/**
 * Main PDF parsing function
 */
export const parsePDFFile = async (file, documentType = 'general') => {
  try {
    const extractedData = await extractTextFromPDF(file);
    return parsePDFContent(extractedData, documentType);
  } catch (error) {
    throw new Error(`Failed to parse PDF file: ${error.message}`);
  }
};

/**
 * Check if value is numeric
 */
function isNumeric(val) {
  return !isNaN(parseFloat(val)) && isFinite(val);
}

/**
 * Tolerance comparison logic
 */
function compareWithTolerance(val1, val2, tolerance, type) {
  const num1 = parseFloat(val1);
  const num2 = parseFloat(val2);
  if (!isNumeric(num1) || !isNumeric(num2)) return false;

  if (type === 'flat') {
    return Math.abs(num1 - num2) <= parseFloat(tolerance);
  } else if (type === '%') {
    const maxVal = Math.max(Math.abs(num1), Math.abs(num2), 1);
    return Math.abs(num1 - num2) / maxVal <= parseFloat(tolerance) / 100;
  }
  return false;
}

/**
 * Compares two arrays of PDF data with tolerance support
 */
const comparePDFData = (data1, data2, finalMappings = []) => {
  // Apply mappings to data2 if provided
  let remappedData2 = data2;
  if (finalMappings.length > 0) {
    remappedData2 = data2.map(row => {
      const remappedRow = {};
      finalMappings.forEach(mapping => {
        if (mapping.file1Header && mapping.file2Header) {
          remappedRow[mapping.file1Header] = row[mapping.file2Header] ?? '';
        }
      });
      return remappedRow;
    });
  }

  const results = [];
  let matches = 0;
  let differences = 0;
  const maxRows = Math.max(data1.length, remappedData2.length);

  for (let i = 0; i < maxRows; i++) {
    const row1 = data1[i] || {};
    const row2 = remappedData2[i] || {};
    const keys = new Set([...Object.keys(row1), ...Object.keys(row2)]);
    const fieldResults = {};

    for (const key of keys) {
      const val1 = row1[key] ?? '';
      const val2 = row2[key] ?? '';
      const mapping = finalMappings.find(m => m.file1Header === key);

      let status = 'difference';
      if (val1 === val2) {
        status = 'match';
      } else if (
        mapping?.isAmountField &&
        mapping?.toleranceType &&
        mapping?.toleranceValue !== '' &&
        compareWithTolerance(val1, val2, mapping.toleranceValue, mapping.toleranceType)
      ) {
        status = 'acceptable';
      }

      fieldResults[key] = {
        val1,
        val2,
        status,
        difference: isNumeric(val1) && isNumeric(val2) ? Math.abs(val1 - val2).toFixed(2) : ''
      };

      if (status === 'match' || status === 'acceptable') {
        matches++;
      } else {
        differences++;
      }
    }

    results.push({
      ID: i + 1,
      fields: fieldResults
    });
  }

  return {
    total_records: results.length,
    differences_found: differences,
    matches_found: matches,
    results
  };
};

/**
 * Main PDF file comparison function
 */
export const comparePDFFiles = async (file1, file2, finalMappings = []) => {
  try {
    // Validate file extensions
    const isPDF1 = file1.name.toLowerCase().endsWith('.pdf');
    const isPDF2 = file2.name.toLowerCase().endsWith('.pdf');
    
    if (!isPDF1 || !isPDF2) {
      throw new Error('Both files must be PDF (.pdf)');
    }

    const [data1, data2] = await Promise.all([
      parsePDFFile(file1, 'document1'),
      parsePDFFile(file2, 'document2')
    ]);

    if (!Array.isArray(data1) || !Array.isArray(data2)) {
      throw new Error('Parsed data missing or invalid');
    }

    return comparePDFData(data1, data2, finalMappings);
  } catch (error) {
    throw new Error(`Failed to compare PDF files: ${error.message}`);
  }
};
