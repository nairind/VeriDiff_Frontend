// File: utils/pdfFileComparison.js

/**
 * Wait for PDF.js to be available
 */
const waitForPDFjs = () => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    const checkPDFjs = () => {
      if (typeof window !== 'undefined' && window.pdfjsLib) {
        resolve(window.pdfjsLib);
      } else if (attempts >= maxAttempts) {
        reject(new Error('PDF.js library not loaded. Please refresh the page.'));
      } else {
        attempts++;
        setTimeout(checkPDFjs, 100);
      }
    };
    
    checkPDFjs();
  });
};

/**
 * Extract text content from PDF file
 */
export const extractTextFromPDF = async (file) => {
  try {
    // Wait for PDF.js to be available
    const pdfjsLib = await waitForPDFjs();
    
    // Configure worker if not set
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
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

    return {
      fullText: fullText.trim(),
      pages: textByPage,
      pageCount: pdf.numPages
    };

  } catch (error) {
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
};

/**
 * Parse extracted PDF text into structured data
 */
const parsePDFContent = (extractedData, documentType = 'general') => {
  const { fullText, pages } = extractedData;
  
  if (!fullText) {
    return [{ 'document.type': documentType, 'document.pageCount': pages.length.toString() }];
  }
  
  const lines = fullText.split('\n').filter(line => line.trim());
  const structured = {
    'document.type': documentType,
    'document.pageCount': pages.length.toString(),
  };

  let amountCount = 0;
  let dateCount = 0;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    // Look for invoice number
    const invoiceMatch = trimmedLine.match(/(?:invoice|inv)[#\s]*:?\s*([a-z0-9\-]+)/i);
    if (invoiceMatch && !structured['invoice.number']) {
      structured['invoice.number'] = invoiceMatch[1];
    }

    // Look for total amount
    const totalMatch = trimmedLine.match(/(?:total|amount due|balance)[:\s]*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
    if (totalMatch && !structured['total.amount']) {
      structured['total.amount'] = totalMatch[1].replace(/,/g, '');
    }

    // Extract amounts (limit to 10)
    const amountMatches = trimmedLine.match(/\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);
    if (amountMatches && amountCount < 10) {
      amountMatches.forEach((amount) => {
        if (amountCount < 10) {
          const cleanAmount = amount.replace(/[$,]/g, '');
          const numAmount = parseFloat(cleanAmount);
          if (numAmount >= 1) {
            structured[`amount.${amountCount}`] = cleanAmount;
            amountCount++;
          }
        }
      });
    }

    // Extract dates (limit to 5)
    const dateMatches = trimmedLine.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g);
    if (dateMatches && dateCount < 5) {
      dateMatches.forEach((date) => {
        if (dateCount < 5) {
          structured[`date.${dateCount}`] = date;
          dateCount++;
        }
      });
    }

    // Store important lines (limit to 15)
    const importantTerms = /(?:invoice|bill|total|amount|due|tax|subtotal|payment|date)/i;
    if (importantTerms.test(trimmedLine) && index < 15) {
      const shortLine = trimmedLine.substring(0, 80);
      structured[`line.${index}`] = shortLine;
    }
  });

  return [structured];
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
 * Compare PDF data with tolerance support - FIXED VERSION
 */
const comparePDFData = (data1, data2, finalMappings = []) => {
  let remappedData2 = data2;
  
  // Apply mappings to data2 if provided
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
    
    // FIXED: Only process fields that are in the final mappings
    // If no mappings provided, process all fields (backward compatibility)
    let keysToProcess;
    if (finalMappings.length > 0) {
      // Only process mapped fields
      keysToProcess = new Set(
        finalMappings
          .filter(m => m.file1Header && m.file2Header) // Only valid mappings
          .map(m => m.file1Header)
      );
    } else {
      // Fallback: process all available keys (original behavior)
      keysToProcess = new Set([...Object.keys(row1), ...Object.keys(row2)]);
    }
    
    const fieldResults = {};

    for (const key of keysToProcess) {
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
 * Main PDF comparison function
 */
export const comparePDFFiles = async (file1, file2, finalMappings = []) => {
  try {
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
