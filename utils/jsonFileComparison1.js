// utils/jsonFileComparison1.js
// COMPLETELY FIXED Document-specific implementation for documents.js page
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

// Helper function to compare JSON objects deeply with better change tracking
const compareObjects = (obj1, obj2, path = '') => {
  const changes = [];
  
  console.log(`🔄 compareObjects called for path: "${path}"`);
  console.log('📊 obj1 type:', typeof obj1, 'value:', obj1);
  console.log('📊 obj2 type:', typeof obj2, 'value:', obj2);
  
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
  console.log('📋 Input type:', typeof fileContent, 'Is File?', fileContent instanceof File);
  
  try {
    let content;
    
    // Handle both file objects and file content strings
    if (typeof fileContent === 'string') {
      console.log('📄 Input is string, using directly');
      content = fileContent;
    } else if (fileContent instanceof File) {
      console.log('📁 Input is File object, reading content...');
      content = await readFileContent(fileContent);
    } else {
      console.log('📊 Input appears to be parsed JSON already:', fileContent);
      return fileContent; // Already parsed
    }
    
    if (!content || content.trim().length === 0) {
      throw new Error('JSON file is empty');
    }
    
    console.log('📄 About to parse JSON content, length:', content.length);
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
  console.log('📋 Input 1 type:', typeof json1, 'Is File?', json1 instanceof File);
  console.log('📋 Input 2 type:', typeof json2, 'Is File?', json2 instanceof File);
  
  try {
    // FIXED: Always parse inputs properly
    console.log('🔧 Parsing input 1...');
    const data1 = await parseJSONFile(json1);
    console.log('🔧 Parsing input 2...');
    const data2 = await parseJSONFile(json2);
    
    console.log('📊 Final JSON Data 1:', data1);
    console.log('📊 Final JSON Data 2:', data2);
    
    // Verify we have actual JSON objects, not File objects
    if (data1 instanceof File || data2 instanceof File) {
      throw new Error('Failed to parse files - still have File objects instead of JSON data');
    }
    
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
    
    return results;
    
  } catch (error) {
    console.error('❌ JSON document comparison error:', error);
    throw new Error(`JSON comparison failed: ${error.message}`);
  }
};
