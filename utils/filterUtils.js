// /utils/filterUtils.js
export const getFilteredResults = (results, resultsFilter, searchTerm, sortField, sortDirection) => {
  if (!results?.results) return [];
  
  let filtered = results.results;
  
  // Apply filter
  if (resultsFilter === 'differences') {
    filtered = filtered.filter(row => 
      Object.values(row.fields).some(field => field.status === 'difference')
    );
  } else if (resultsFilter === 'matches') {
    filtered = filtered.filter(row => 
      Object.values(row.fields).every(field => field.status === 'match')
    );
  }
  
  // Apply search
  if (searchTerm) {
    filtered = filtered.filter(row =>
      Object.values(row.fields).some(field =>
        String(field.val1).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(field.val2).toLowerCase().includes(searchTerm.toLowerCase())
      ) || String(row.ID).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Apply sorting
  if (sortField) {
    filtered.sort((a, b) => {
      let aVal = sortField === 'ID' ? a.ID : a.fields[sortField]?.val1 || '';
      let bVal = sortField === 'ID' ? b.ID : b.fields[sortField]?.val1 || '';
      
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        aVal = aNum;
        bVal = bNum;
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  return filtered;
};

export const groupFields = (fieldNames) => {
  if (fieldNames.length < 8) {
    return [{ name: 'All Fields', fields: fieldNames, isDefault: true }];
  }

  const groups = {
    'Identity': [],
    'Financial': [],
    'Time & Hours': [],
    'Contact': [],
    'Other': []
  };

  fieldNames.forEach(field => {
    const fieldLower = field.toLowerCase();
    
    if (/id|name|employee|person|user|code/.test(fieldLower)) {
      groups['Identity'].push(field);
    } else if (/pay|salary|wage|amount|cost|fee|tax|pension|benefit|bonus|overtime/.test(fieldLower)) {
      groups['Financial'].push(field);
    } else if (/hour|time|date|period|shift|week|month/.test(fieldLower)) {
      groups['Time & Hours'].push(field);
    } else if (/email|phone|address|contact/.test(fieldLower)) {
      groups['Contact'].push(field);
    } else {
      groups['Other'].push(field);
    }
  });

  return Object.entries(groups)
    .filter(([name, fields]) => fields.length > 0)
    .map(([name, fields]) => ({ name, fields, isDefault: false }));
};
