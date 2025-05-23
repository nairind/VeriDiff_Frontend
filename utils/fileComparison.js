// utils/fileComparison.js
import { compareFiles as compareCSVFiles } from './simpleCSVComparison';
import { compareTextFiles_main } from './textFileComparison';
import { compareJSONFiles_main } from './jsonFileComparison';
import { compareExcelFiles } from './excelFileComparison';
import { compareExcelCSVFiles } from './excelCSVComparison';

export const compareByType = async (fileType, file1, file2) => {
  switch (fileType) {
    case 'csv':
      return await compareCSVFiles(file1, file2);
    case 'text':
      return await compareTextFiles_main(file1, file2);
    case 'json':
      return await compareJSONFiles_main(file1, file2);
    case 'excel':
      return await compareExcelFiles(file1, file2);
    case 'excel_csv':
      return await compareExcelCSVFiles(file1, file2);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
};
