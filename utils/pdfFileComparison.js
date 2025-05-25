// Updated parsePDFContent function in utils/pdfFileComparison.js
// Replace the existing parsePDFContent function with this improved version

const parsePDFContent = (extractedData, documentType = 'general') => {
  const { fullText, pages } = extractedData;
  
  // Basic text parsing - you can enhance this based on document structure
  const lines = fullText.split('\n').filter(line => line.trim());
  
  // Create a flattened structure similar to other comparisons
  const structured = {
    'document.type': documentType,
    'document.pageCount': pages.length.toString(),
    // Remove document.fullText to make output cleaner
    // 'document.fullText': fullText,  // REMOVED THIS LINE
  };

  // Extract common patterns with better organization
  let amountCount = 0;
  let dateCount = 0;
  let invoiceNumber = '';
  let totalAmount = '';

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine) {
      
      // Look for invoice number patterns
      const invoiceMatch = trimmedLine.match(/(?:invoice|inv)[#\s]*:?\s*([a-z0-9\-]+)/i);
      if (invoiceMatch && !invoiceNumber) {
        invoiceNumber = invoiceMatch[1];
        structured['invoice.number'] = invoiceNumber;
      }

      // Look for total amount patterns
      const totalMatch = trimmedLine.match(/(?:total|amount due|balance)[:\s]*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
      if (totalMatch) {
        totalAmount = totalMatch[1].replace(/,/g, '');
        structured['total.amount'] = totalAmount;
      }

      // Look for amount patterns (e.g., $123.45, 123.45, etc.) - limit to first 10
      const amountMatch = trimmedLine.match(/\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);
      if (amountMatch && amountCount < 10) {
        amountMatch.forEach((amount, amountIndex) => {
          if (amountCount < 10) {
            const cleanAmount = amount.replace(/[$,]/g, '');
            // Only include amounts over $1 to avoid noise
            if (parseFloat(cleanAmount) >= 1) {
              structured[`amount.${amountCount}`] = cleanAmount;
              amountCount++;
            }
          }
        });
      }

      // Look for date patterns (MM/DD/YYYY, DD-MM-YYYY, etc.) - limit to first 5
      const dateMatch = trimmedLine.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g);
      if (dateMatch && dateCount < 5) {
        dateMatch.forEach((date, dateIndex) => {
          if (dateCount < 5) {
            structured[`date.${dateCount}`] = date;
            dateCount++;
          }
        });
      }

      // Store only important lines (those with amounts, dates, or key terms)
      const importantTerms = /(?:invoice|bill|total|amount|due|tax|subtotal|payment|date|phone|address)/i;
      if (importantTerms.test(trimmedLine) && index < 20) { // Limit to first 20 important lines
        structured[`line.${index}`] = trimmedLine.substring(0, 100); // Limit line length
      }
    }
  });

  return [structured]; // Return as array for consistency
};
