// File: utils/xmlFileComparison.js

/**
 * Utility to read file contents as text
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Simple XML parser - converts XML to JavaScript object
 * Note: This is a basic parser. For complex XML, consider using a dedicated library
 */
const parseXMLToObject = (xmlString) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      throw new Error('XML parsing error: ' + parserError[0].textContent);
    }
    
    return xmlToObject(xmlDoc.documentElement);
  } catch (error) {
    throw new Error('Failed to parse XML: ' + error.message);
  }
};

/**
 * Convert XML DOM element to JavaScript object
 */
const xmlToObject = (element) => {
  const obj = {};
  
  // Handle attributes
  if (element.attributes && element.attributes.length > 0) {
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      obj[`@${attr.name}`] = attr.value;
    }
  }
  
  // Handle child elements
  const children = element.childNodes;
  let hasTextContent = false;
  
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    
    if (child.nodeType === Node.ELEMENT_NODE) {
      const childName = child.nodeName;
      const childObj = xmlToObject(child);
      
      if (obj[childName]) {
        // If property already exists, convert to array
        if (!Array.isArray(obj[childName])) {
          obj[childName] = [obj[childName]];
        }
        obj[childName].push(childObj);
      } else {
        obj[childName] = childObj;
      }
    } else if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent.trim();
      if (text) {
        hasTextContent = true;
        if (Object.keys(obj).length === 0) {
          return text; // Pure text node
        } else {
          obj['#text'] = text;
        }
      }
    }
  }
  
  // If no child elements and no attributes, return text content
  if (Object.keys(obj).length === 0 && !hasTextContent) {
    return element.textContent || '';
  }
  
  return obj;
};

/**
 * Flattens a nested object using dot notation
 */
const flattenObject = (obj, prefix = '') => {
  const flattened = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value === null || value === undefined) {
        flattened[newKey] = '';
      } else if (Array.isArray(value)) {
        // Handle arrays by converting to JSON string or flattening each item
        if (value.length === 1 && typeof value[0] === 'object') {
          // Single object in array - flatten it directly
          Object.assign(flattened, flattenObject(value[0], newKey));
        } else {
          // Multiple items or simple values - convert to JSON
          flattened[newKey] = JSON.stringify(value);
        }
      } else if (typeof value === 'object') {
        // Recursively flatten nested objects
        Object.assign(flattened, flattenObject(value, newKey));
      } else {
        flattened[newKey] = String(value);
      }
    }
  }
  
  return flattened;
};

/**
 * Loads and parses XML file content
 */
export const parseXMLFile = async (file) => {
  const text = await readFileAsText(file);
  const parsed = parseXMLToObject(text);
  
  // Always return as array for consistency with other comparison functions
  return [flattenObject(parsed)];
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
 * Compares two arrays of XML data row-by-row and field-by-field with tolerance support - FIXED VERSION
 */
const compareXMLData = (data1, data2, finalMappings = []) => {
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
    
    // FIXED: Only process fields that are in the final mappings
    let keysToProcess;
    if (finalMappings.length > 0) {
      // Only process mapped fields
      keysToProcess = new Set(
        finalMappings
          .filter(m => m.file1Header && m.file2Header)
          .map(m => m.file1Header)
      );
    } else {
      // Fallback: process all available keys
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
 * Main XML file comparison function
 */
export const compareXMLFiles = async (file1, file2, finalMappings = []) => {
  try {
    // Validate file extensions
    const isXML1 = file1.name.toLowerCase().endsWith('.xml');
    const isXML2 = file2.name.toLowerCase().endsWith('.xml');
    
    if (!isXML1 || !isXML2) {
      throw new Error('Both files must be XML (.xml)');
    }

    const [data1, data2] = await Promise.all([
      parseXMLFile(file1),
      parseXMLFile(file2)
    ]);

    if (!Array.isArray(data1) || !Array.isArray(data2)) {
      throw new Error('Parsed data missing or invalid');
    }

    return compareXMLData(data1, data2, finalMappings);
  } catch (error) {
    throw new Error(`Failed to compare XML files: ${error.message}`);
  }
};
