// utils/jsonFileComparison1.js
// FIXED Document-specific implementation for documents.js page
// Returns data compatible with JsonResults.js component

// Helper function to safely read file content
const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    console.log('📁 Reading JSON file for documents comparison:', file?.name);
    
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        console.log('✅ JSON file read successfully, length:', content?.length);
        resolve(content);
      } catch (error) {
        console.error('❌ JSON file reading error:', error);
        reject(new Error('Failed to process file content'));
      }
    };
    
    reader.onerror = (e) => {
      console.error('❌ FileReader error:', e);
      reject(new Error(`Failed to read file "${file.name}"`));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
};

// Helper function to compare values with detailed logging
const compareValues = (val1, val2, path) => {
  console.log(`🔍 Comparing at ${path}:`, { val1, val2, type1: typeof val1, type2: typeof val2 });
  
  // Handle null/undefined
  if (val1 === null && val2 === null) return { isEqual: true };
  if (val1 === undefined && val2 === undefined) return { isEqual: true };
  if ((val1 === null || val1 === undefined) !== (val2 === null || val2 === undefined)) {
    return { isEqual: false, reason: 'null/undefined mismatch' };
  }
  
  // Handle different types
  if (typeof val1 !== typeof val2) {
    return { isEqual: false, reason: 'type mismatch' };
  }
  
  // Handle arrays
  if (Array.isArray(val1) && Array.isArray(val2)) {
    if (val1.length !== val2.length) {
      return { isEqual: false, reason: 'array length mismatch' };
    }
    for (let i = 0; i < val1.length; i++) {
      const itemComparison = compareValues(val1[i], val2[i], `${path}[${i}]`);
      if (!itemComparison.isEqual) {
        return { isEqual: false, reason: `array item ${i} differs: ${itemComparison.reason}` };
      }
    }
    return { isEqual: true };
  }
  
  // Handle objects
  if (typeof val1 === 'object' && val1 !== null && val2 !== null) {
    const keys1 = Object.keys(val1).sort();
    const keys2 = Object.keys(val2).sort();
    
    if (keys1.length !== keys2.length) {
      return { isEqual: false, reason: 'object key count mismatch' };
    }
    
    for (let i = 0; i < keys1.length; i++) {
      if (keys1[i] !== keys2[i]) {
        return { isEqual: false, reason: 'object key mismatch' };
      }
    }
    
    for (const key of keys1) {
      const childComparison = compareValues(val1[key], val2[key], `${path}.${key}`);
      if (!childComparison.isEqual) {
        return { isEqual: false, reason: `property ${key} differs: ${childComparison.reason}` };
      }
    }
    return { isEqual: true };
  }
  
  // Handle primitives
  const isEqual = val1 === val2;
  return { 
    isEqual, 
    reason: isEqual ? 'identical' : `primitive value mismatch: "${val1}" !== "${val2}"` 
  };
};

// Helper function to compare JSON objects deeply with better change tracking
const compareObjects = (obj1, obj2, path = '') => {
  const changes = [];
  
  console.log(`🔄 compareObjects called for path: "${path}"`);
  console.log('📊 obj1:', obj1);
  console.log('📊 obj2:', obj2);
  
  // Quick equality check
  if (obj1 === obj2) {
    console.log(`✅ Objects identical at ${path}`);
    return changes;
  }
  
  // Handle nulls and undefined
  if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined) {
    if (obj1 !== obj2) {
      console.log(`🔄 Null/undefined difference at ${path}`);
      changes.push({
        path: path || 'root',
        type: 'modified',
        oldValue: obj1,
        newValue: obj2
      });
    }
    return changes;
  }
  
  // Handle type differences
  if (typeof obj1 !== typeof obj2) {
    console.log(`🔄 Type difference at ${path}: ${typeof obj1} vs ${typeof obj2}`);
    changes.push({
      path: path || 'root',
      type: 'modified',
      oldValue: obj1,
      newValue: obj2
    });
    return changes;
  }
  
  // Handle arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    console.log(`📝 Comparing arrays at ${path}: [${obj1.length}] vs [${obj2.length}]`);
    
    if (obj1.length !== obj2.length) {
      console.log(`🔄 Array length difference at ${path}`);
      changes.push({
        path: path,
        type: 'modified',
        oldValue: obj1,
        newValue: obj2
      });
      return changes;
    }
    
    for (let i = 0; i < obj1.length; i++) {
      const itemPath = `${path}[${i}]`;
      const itemChanges = compareObjects(obj1[i], obj2[i], itemPath);
      changes.push(...itemChanges);
    }
    
    return changes;
  }
  
  // Handle non-object primitives
  if (typeof obj1 !== 'object') {
    if (obj1 !== obj2) {
      console.log(`🔄 Primitive difference at ${path}: "${obj1}" vs "${obj2}"`);
      changes.push({
        path: path || 'root',
        type: 'modified',
        oldValue: obj1,
        newValue: obj2
      });
    }
    return changes;
  }
  
  // Handle objects
  console.log(`📦 Comparing objects at ${path}`);
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
  console.log(`🔑 All keys at ${path}:`, Array.from(allKeys));
  
  for (const key of allKeys) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (!(key in obj1)) {
      console.log(`➕ Key "${key}" added at ${currentPath}`);
      changes.push({
        path: currentPath,
        type: 'added',
        newValue: obj2[key]
      });
    } else if (!(key in obj2)) {
      console.log(`➖ Key "${key}" removed at ${currentPath}`);
      changes.push({
        path: currentPath,
        type: 'removed',
        oldValue: obj1[key]
      });
    } else {
      console.log(`🔍 Comparing key "${key}" at ${currentPath}`);
      const childChanges = compareObjects(obj1[key], obj2[key], currentPath);
      changes.push(...childChanges);
    }
  }
  
  console.log(`📋 Found ${changes.length} changes at ${path}`);
  return changes;
};

// Helper function to count nested properties
const countProperties = (obj, count = 0) => {
  if (typeof obj !== 'object' || obj === null) return count + 1;
  
  for (const key in obj) {
    count = countProperties(obj[key], count);
  }
  
  return count;
};

export const parseJSONFile = async (fileContent) => {
  console.log('🔧 parseJSONFile called for documents comparison');
  
  try {
    let content;
    
    // Handle both file objects and file content strings
    if (typeof fileContent === 'string') {
      content = fileContent;
    } else {
      content = await readFileContent(fileContent);
    }
    
    if (!content || content.trim().length === 0) {
      throw new Error('JSON file is empty');
    }
    
    const json = JSON.parse(content);
    console.log('✅ JSON parsed successfully for documents:', json);
    
    return json;
    
  } catch (error) {
    console.error('❌ JSON parsing error:', error);
    
    if (error.name === 'SyntaxError') {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
    
    throw new Error(`Failed to parse JSON file: ${error.message}`);
  }
};

export const compareJSONFiles = async (json1, json2, options = {}) => {
  console.log('🔄 compareJSONFiles called for documents comparison');
  console.log('🎛️ Options:', options);
  
  try {
    // Parse both inputs
    const data1 = typeof json1 === 'string' ? await parseJSONFile(json1) : json1;
    const data2 = typeof json2 === 'string' ? await parseJSONFile(json2) : json2;
    
    console.log('📊 JSON Data 1:', data1);
    console.log('📊 JSON Data 2:', data2);
    
    // Perform deep comparison with detailed logging
    console.log('🔍 Starting deep comparison...');
    const changes = compareObjects(data1, data2);
    
    console.log('📋 All changes found:', changes);
    
    // Count totals
    const total1 = countProperties(data1);
    const total2 = countProperties(data2);
    const totalProperties = Math.max(total1, total2);
    
    console.log('📊 Property counts:', { total1, total2, totalProperties });
    
    const differences = changes.length;
    const matches = Math.max(0, totalProperties - differences);
    
    // Separate changes by type for JsonResults component
    const nested_differences = changes.map(change => ({
      ...change,
      level: change.path.split('.').length - 1
    }));
    
    const results = {
      // Core statistics expected by JsonResults.js
      differences_found: differences,
      matches_found: matches,
      total_records: totalProperties,
      
      // Change details
      changes: changes,
      nested_differences: nested_differences,
      
      // Original file contents for display
      file1_content: data1,
      file2_content: data2,
      
      // Additional metadata
      file1_properties: total1,
      file2_properties: total2,
      comparison_type: 'json_document',
      
      // Summary by change type
      added_count: changes.filter(c => c.type === 'added').length,
      removed_count: changes.filter(c => c.type === 'removed').length,
      modified_count: changes.filter(c => c.type === 'modified').length
    };
    
    console.log('✅ JSON document comparison complete:');
    console.log('  - Total properties:', results.total_records);
    console.log('  - Differences:', results.differences_found);
    console.log('  - Matches:', results.matches_found);
    console.log('  - Changes by type:', {
      added: results.added_count,
      removed: results.removed_count,
      modified: results.modified_count
    });
    
    // Debug output
    if (differences === 0) {
      console.log('⚠️ No differences detected - this might be incorrect!');
      console.log('🔍 Let me double-check by comparing key values manually:');
      
      // Manual spot check
      if (typeof data1 === 'object' && typeof data2 === 'object') {
        const keys1 = Object.keys(data1);
        const keys2 = Object.keys(data2);
        console.log('🔑 Keys comparison:', { keys1, keys2 });
        
        for (const key of keys1) {
          const comparison = compareValues(data1[key], data2[key], key);
          console.log(`🔍 Key "${key}":`, comparison);
        }
      }
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ JSON document comparison error:', error);
    throw new Error(`JSON comparison failed: ${error.message}`);
  }
};
