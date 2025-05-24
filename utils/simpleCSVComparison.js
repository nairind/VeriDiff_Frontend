import Papa from 'papaparse';

/**
 * Parses a CSV file and returns its content as an array of objects.
 * @param {File} file
 * @returns {Promise<Array<Object>>}
 */
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

/**
 * Compares two CSV datasets
 * @param {Array<Object>} data1
 * @param {Array<Object>} data2
 * @returns {Object} - Comparison results
 */
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
      const
