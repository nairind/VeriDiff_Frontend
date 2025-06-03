// utils/xmlFileComparison.js
// Document-specific implementation for documents.js page
// Returns data compatible with XmlResults.js component

// Helper function to safely read file content
const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    console.log('📁 Reading XML file for documents comparison:', file?.name);
    
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        console.log('✅ XML file read successfully, length:', content?.length);
        resolve(content);
      } catch (error) {
        console.error('❌ XML file reading error:', error);
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

// Helper function to parse XML element into structured data
const parseElement = (element, path = '') => {
  const result = {
    name: element.tagName,
    path: path,
    attributes: {},
    text: '',
    children: []
  };
  
  // Extract attributes
  Array.from(element.attributes).forEach(attr => {
    result.attributes[attr.name] = attr.value;
  });
  
  // Extract text content (only direct text, not from children)
  const directText = Array.from(element.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent.trim())
    .join(' ')
    .trim();
  
  if (directText) {
    result.text = directText;
  }
  
  // Parse child elements
  Array.from(element.children).forEach((child, index) => {
    const childPath = path ? `${path}.${child.tagName}[${index}]` : `${child.tagName}[${index}]`;
    result.children.push(parseElement(child, childPath));
  });
  
  return result;
};

// Helper function to compare XML elements
const compareElements = (elem1, elem2, path = '') => {
  const changes = [];
  
  if (!elem1 && !elem2) return changes;
  
  if (!elem1) {
    changes.push({
      type: 'added',
      path: path,
      elementName: elem2.name,
      newValue: elem2
    });
    return changes;
  }
  
  if (!elem2) {
    changes.push({
      type: 'removed',
      path: path,
      elementName: elem1.name,
      oldValue: elem1
    });
    return changes;
  }
  
  // Compare element names
  if (elem1.name !== elem2.name) {
    changes.push({
      type: 'modified',
      path: path,
      elementName: elem1.name,
      oldValue: elem1.name,
      newValue: elem2.name
    });
  }
  
  // Compare text content
  if (elem1.text !== elem2.text) {
    changes.push({
      type: 'modified',
      path: `${path}.text`,
      elementName: elem1.name,
      oldValue: elem1.text,
      newValue: elem2.text
    });
  }
  
  // Compare attributes
  const allAttrKeys = new Set([
    ...Object.keys(elem1.attributes),
    ...Object.keys(elem2.attributes)
  ]);
  
  for (const attrKey of allAttrKeys) {
    const val1 = elem1.attributes[attrKey];
    const val2 = elem2.attributes[attrKey];
    
    if (val1 !== val2) {
      changes.push({
        type: 'attribute_changed',
        path: `${path}@${attrKey}`,
        elementName: elem1.name,
        attributeName: attrKey,
        oldValue: val1,
        newValue: val2
      });
    }
  }
  
  // Compare children
  const maxChildren = Math.max(elem1.children.length, elem2.children.length);
  for (let i = 0; i < maxChildren; i++) {
    const child1 = elem1.children[i];
    const child2 = elem2.children[i];
    const childPath = `${path}.${child1?.name || child2?.name}[${i}]`;
    
    changes.push(...compareElements(child1, child2, childPath));
  }
  
  return changes;
};

// Helper function to count total elements
const countElements = (element) => {
  if (!element) return 0;
  return 1 + element.children.reduce((count, child) => count + countElements(child), 0);
};

export const parseXMLFile = async (fileContent) => {
  console.log('🔧 parseXMLFile called for documents comparison');
  
  try {
    let content;
    
    // Handle both file objects and file content strings
    if (typeof fileContent === 'string') {
      content = fileContent;
    } else {
      content = await readFileContent(fileContent);
    }
    
    if (!content || content.trim().length === 0) {
      throw new Error('XML file is empty');
    }
    
    // Parse XML using DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.getElementsByTagName('parsererror');
    if (parseError.length > 0) {
      const errorText = parseError[0].textContent;
      throw new Error(`Invalid XML format: ${errorText}`);
    }
    
    console.log('✅ XML parsed successfully for documents');
    
    // Parse into structured format
    const rootElement = xmlDoc.documentElement;
    const parsedStructure = parseElement(rootElement, 'root');
    
    return {
      raw: content,
      parsed: parsedStructure,
      doc: xmlDoc
    };
    
  } catch (error) {
    console.error('❌ XML parsing error:', error);
    throw new Error(`Failed to parse XML file: ${error.message}`);
  }
};

export const compareXMLFiles = async (xml1, xml2, options = {}) => {
  console.log('🔄 compareXMLFiles called for documents comparison');
  console.log('🎛️ Options:', options);
  
  try {
    // Parse both inputs
    const data1 = typeof xml1 === 'string' ? await parseXMLFile(xml1) : xml1;
    const data2 = typeof xml2 === 'string' ? await parseXMLFile(xml2) : xml2;
    
    console.log('📊 Comparing XML documents...');
    
    // Perform element comparison
    const allChanges = compareElements(data1.parsed, data2.parsed);
    
    // Separate element changes from attribute changes
    const element_changes = allChanges.filter(change => 
      change.type !== 'attribute_changed'
    );
    
    const attribute_changes = allChanges.filter(change => 
      change.type === 'attribute_changed'
    );
    
    // Count totals
    const total1 = countElements(data1.parsed);
    const total2 = countElements(data2.parsed);
    const totalElements = Math.max(total1, total2);
    
    const differences = allChanges.length;
    const matches = Math.max(0, totalElements - differences);
    
    const results = {
      // Core statistics expected by XmlResults.js
      differences_found: differences,
      matches_found: matches,
      total_elements: totalElements,
      
      // Change details
      changes: allChanges,
      element_changes: element_changes,
      attribute_changes: attribute_changes,
      
      // Original file contents for display
      file1_content: data1.raw,
      file2_content: data2.raw,
      
      // Parsed structures for tree display
      file1_parsed: data1.parsed,
      file2_parsed: data2.parsed,
      
      // Additional metadata
      file1_elements: total1,
      file2_elements: total2,
      comparison_type: 'xml_document',
      
      // Summary by change type
      added_count: element_changes.filter(c => c.type === 'added').length,
      removed_count: element_changes.filter(c => c.type === 'removed').length,
      modified_count: element_changes.filter(c => c.type === 'modified').length,
      attribute_changes_count: attribute_changes.length
    };
    
    console.log('✅ XML document comparison complete:');
    console.log('  - Total elements:', results.total_elements);
    console.log('  - Differences:', results.differences_found);
    console.log('  - Matches:', results.matches_found);
    console.log('  - Element changes:', results.element_changes.length);
    console.log('  - Attribute changes:', results.attribute_changes.length);
    
    return results;
    
  } catch (error) {
    console.error('❌ XML document comparison error:', error);
    throw new Error(`XML comparison failed: ${error.message}`);
  }
};
