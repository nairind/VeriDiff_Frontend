// File: utils/pdfFileComparison.js - COMPLETE ENHANCED VERSION

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
 * NEW: Detect document type based on content
 */
const detectDocumentType = (fullText) => {
  const text = fullText.toLowerCase();
  
  // Invoice detection
  if (text.includes('invoice') || text.includes('bill to') || text.includes('invoice number') || text.includes('inv #')) {
    return 'invoice';
  }
  
  // Receipt detection
  if (text.includes('receipt') || text.includes('thank you for your purchase') || text.includes('transaction receipt') || text.includes('sales receipt')) {
    return 'receipt';
  }
  
  // Statement detection
  if (text.includes('statement') || text.includes('account summary') || text.includes('monthly statement') || text.includes('billing statement')) {
    return 'statement';
  }
  
  // Quote/Estimate detection
  if (text.includes('quote') || text.includes('estimate') || text.includes('quotation') || text.includes('proposal')) {
    return 'quote';
  }
  
  // Purchase Order detection
  if (text.includes('purchase order') || text.includes('po #') || text.includes('p.o.')) {
    return 'purchase_order';
  }
  
  // Contract detection
  if (text.includes('contract') || text.includes('agreement') || text.includes('terms and conditions')) {
    return 'contract';
  }
  
  // Report detection
  if (text.includes('report') || text.includes('summary report') || text.includes('financial report')) {
    return 'report';
  }
  
  // Default fallback
  return 'document';
};

/**
 * NEW: Enhanced field extraction based on document type
 */
const getDocumentSpecificFields = (documentType, fullText) => {
  const fields = {};
  
  switch (documentType) {
    case 'invoice':
      // Invoice-specific field extraction
      const invoiceFields = {
        'invoice.number': /(?:invoice|inv)[#\s]*:?\s*([a-z0-9\-]+)/i,
        'invoice.date': /(?:invoice date|date)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
        'due.date': /(?:due date|payment due)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
        'customer.number': /(?:customer|account)[#\s]*:?\s*([a-z0-9\-]+)/i,
        'total.amount': /(?:total|amount due|balance due)[:\s]*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
        'subtotal.amount': /(?:subtotal|sub total)[:\s]*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
        'tax.amount': /(?:tax|sales tax|vat)[:\s]*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i
      };
      
      Object.entries(invoiceFields).forEach(([fieldName, pattern]) => {
        const match = fullText.match(pattern);
        if (match) {
          fields[fieldName] = match[1].replace(/,/g, '');
        }
      });
      break;
      
    case 'receipt':
      // Receipt-specific field extraction
      const receiptFields = {
        'receipt.number': /(?:receipt|transaction)[#\s]*:?\s*([a-z0-9\-]+)/i,
        'store.number': /(?:store|location)[#\s]*:?\s*([a-z0-9\-]+)/i,
        'total.paid': /(?:total|amount paid|paid)[:\s]*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
        'payment.method': /(?:paid by|payment|method)[:\s]*([a-z\s]+)/i
      };
      
      Object.entries(receiptFields).forEach(([fieldName, pattern]) => {
        const match = fullText.match(pattern);
        if (match) {
          fields[fieldName] = match[1].replace(/,/g, '');
        }
      });
      break;
      
    case 'statement':
      // Statement-specific field extraction
      const statementFields = {
        'account.number': /(?:account|acct)[#\s]*:?\s*([a-z0-9\-]+)/i,
        'statement.date': /(?:statement date|as of)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
        'previous.balance': /(?:previous balance|prior balance)[:\s]*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
        'current.balance': /(?:current balance|new balance)[:\s]*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i
      };
      
      Object.entries(statementFields).forEach(([fieldName, pattern]) => {
        const match = fullText.match(pattern);
        if (match) {
          fields[fieldName] = match[1].replace(/,/g, '');
        }
      });
      break;
      
    default:
      // Generic document - no specific fields
      break;
  }
  
  return fields;
};

/**
 * ENHANCED: Parse extracted PDF text into structured data with document type detection
 */
const parsePDFContent = (extractedData, documentType = 'auto') => {
  const { fullText, pages } = extractedData;
  
  if (!fullText) {
    return [{ 'document.type': 'empty', 'document.pageCount': pages.length.toString() }];
  }
  
  // AUTO-DETECT document type if not specified
  const detectedType = documentType === 'auto' ? detectDocumentType(fullText) : documentType;
  
  const lines = fullText.split('\n').filter(line => line.trim());
  const structured = {
    'document.type': detectedType,
    'document.pageCount': pages.length.toString(),
  };

  // Get document-specific fields first
  const specificFields = getDocumentSpecificFields(detectedType, fullText);
  Object.assign(structured, specificFields);

  // Continue with original logic for additional data extraction
  let amountCount = 0;
  let dateCount = 0;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    // Original invoice number logic (fallback if specific extraction didn't work)
    if (!structured['invoice.number']) {
      const invoiceMatch = trimmedLine.match(/(?:invoice|inv)[#\s]*:?\s*([a-z0-9\-]+)/i);
      if (invoiceMatch) {
        structured['invoice.number'] = invoiceMatch[1];
      }
    }

    // Original total amount logic (fallback if specific extraction didn't work)
    if (!structured['total.amount']) {
      const totalMatch = trimmedLine.match(/(?:total|amount due|balance)[:\s]*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
      if (totalMatch) {
        structured['total.amount'] = totalMatch[1].replace(/,/g, '');
      }
    }

    // Extract additional amounts (limit to 10)
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

    // Extract additional dates (limit to 5)
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
 * ENHANCED: Main PDF parsing function with auto-detection
 */
export const parsePDFFile = async (file, documentType = 'auto') => {
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
      parsePDFFile(file1, 'auto'), // Now uses auto-detection
      parsePDFFile(file2, 'auto')  // Now uses auto-detection
    ]);

    if (!Array.isArray(data1) || !Array.isArray(data2)) {
      throw new Error('Parsed data missing or invalid');
    }

    return comparePDFData(data1, data2, finalMappings);
  } catch (error) {
    throw new Error(`Failed to compare PDF files: ${error.message}`);
  }
};
