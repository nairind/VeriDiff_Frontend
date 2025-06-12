// /utils/fileDetection.js
export const detectFileType = (file1, file2) => {
  const getExtension = (file) => file.name.toLowerCase().split('.').pop();
  
  const ext1 = getExtension(file1);
  const ext2 = getExtension(file2);
  
  const isExcel = (ext) => ['xlsx', 'xls', 'xlsm'].includes(ext);
  const isCSV = (ext) => ext === 'csv';
  
  if (isExcel(ext1) && isExcel(ext2)) {
    return 'excel';
  } else if (isCSV(ext1) && isCSV(ext2)) {
    return 'csv';
  } else if (isExcel(ext1) && isCSV(ext2)) {
    return 'excel_csv';
  } else if (isCSV(ext1) && isExcel(ext2)) {
    return 'csv_excel_swapped';
  }
  return 'unknown';
};
