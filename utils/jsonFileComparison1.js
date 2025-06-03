// utils/jsonFileComparison.js
// Document-specific implementation for documents.js page
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

// Helper function to compare JSON objects deeply
const compareObjects = (obj1, obj2, path = '') => {
  const changes = [];
  
  if (obj1 === obj2) return changes;
  
  if (typeof obj1 !== typeof obj2) {
    changes.push({
      path: path || 'root',
      type: 'modified',
      oldValue: obj1,
      newValue: obj2
    });
    return changes;
  }
  
  if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
    if (obj1 !== obj2) {
      changes.push({
        path: path || 'root',
        type: 'modified',
        oldValue: obj1,
        newValue: obj2
      });
    }
    return changes;
  }
  
  // Get all unique keys
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
  
  for (const key of allKeys) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (!(key in obj1)) {
      changes.push({
        path: currentPath,
        type: 'added',
        newValue: obj2[key]
      });
    } else if (!(key in obj2)) {
      changes.push({
        path: currentPath,
        type: 'removed',
        oldValue: obj1[key]
      });
    } else {
      changes.push(...compareObjects(obj1[key], obj2[key], currentPath));
    }
  }
  
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
    console.log('✅ JSON parsed successfully for documents');
    
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
    
    console.log('📊 Comparing JSON documents...');
    
    // Perform deep comparison
    const changes = compareObjects(data1, data2);
    
    // Count totals
    const total1 = countProperties(data1);
    const total2 = countProperties(data2);
    const totalProperties = Math.max(total1, total2);
    
    const differences = changes.length;
    const matches = totalProperties - differences;
    
    // Separate changes by type for JsonResults component
    const nested_differences = changes.map(change => ({
      ...change,
      level: change.path.split('.').length - 1
    }));
    
    const results = {
      // Core statistics expected by JsonResults.js
      differences_found: differences,
      matches_found: Math.max(0, matches),
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
