import Papa from 'papaparse';

export const parseCSVFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = Papa.parse(event.target.result, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
      });

      if (result.errors?.length > 0) {
        console.warn('CSV parsing warnings:', result.errors);
      }

      resolve(result.data);
    };

    reader.onerror = () => reject(new Error('Failed to read CSV file'));
    reader.readAsText(file);
  });
};

export const compareCSVData = (data1, data2) => {
  const allColumns = new Set();
  data1.forEach(row => Object.keys(row).forEach(key => allColumns.add(key)));
  data2.forEach(row => Object.keys(row).forEach(key => allColumns.add(key)));

  let idColumn = Object.keys(data1[0] || {})[0] || '';
  if ('id' in (data1[0] || {})) idColumn = 'id';
  if ('ID' in (data1[0] || {})) idColumn = 'ID';

  const results = [];
  let differencesFound = 0;
  let matchesFound = 0;

  const data2Map = new Map();
  data2.forEach(row => {
    if (row[idColumn] !== undefined) {
      data2Map.set(String(row[idColumn]), row);
    }
  });

  data1.forEach(row1 => {
    const id = row1[idColumn];
    if (id === undefined) return;

    const row2 = data2Map.get(String(id));

    if (!row2) {
      for (const column of allColumns) {
        if (row1[column] !== undefined) {
          results.push({
            ID: String(id),
            COLUMN: column,
            SOURCE_1_VALUE: String(row1[column]),
            SOURCE_2_VALUE: '',
            STATUS: 'difference',
          });
          differencesFound++;
        }
      }
      return;
    }

    for (const column of allColumns) {
      const value1 = row1[column] ?? '';
      const value2 = row2[column] ?? '';
      if (value1 === '' && value2 === '') continue;

      const isMatch = String(value1) === String(value2);
      results.push({
        ID: String(id),
        COLUMN: column,
        SOURCE_1_VALUE: String(value1),
        SOURCE_2_VALUE: String(value2),
        STATUS: isMatch ? 'match' : 'difference',
      });

      isMatch ? matchesFound++ : differencesFound++;
    }
  });

  const data1Ids = new Set(data1.map(row => String(row[idColumn])));
  data2.forEach(row2 => {
    const id = row2[idColumn];
    if (id !== undefined && !data1Ids.has(String(id))) {
      for (const column of allColumns) {
        if (row2[column] !== undefined) {
          results.push({
            ID: String(id),
            COLUMN: column,
            SOURCE_1_VALUE: '',
            SOURCE_2_VALUE: String(row2[column]),
            STATUS: 'difference',
          });
          differencesFound++;
        }
      }
    }
  });

  return {
    total_records: data1.length,
    differences_found: differencesFound,
    matches_found: matchesFound,
    results,
  };
};

export const compareFiles = async (file1, file2) => {
  try {
    const [data1, data2] = await Promise.all([
      parseCSVFile(file1),
      parseCSVFile(file2)
    ]);
    return compareCSVData(data1, data2);
  } catch (error) {
    console.error('Comparison error:', error);
    throw new Error(`Comparison failed: ${error.message}`);
  }
};
