/**
 * Enhanced function to get Excel file info including all sheets - FIXED VERSION
 */
export const getExcelFileInfo = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        
        // Get all sheet information
        const sheets = workbook.SheetNames.map(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const isHidden = workbook.Workbook?.Sheets?.find(s => s.name === sheetName)?.Hidden === 1;
          
          // FIXED: Better handling of empty sheets and range calculation
          let rowCount = 0;
          let headers = [];
          let hasData = false;
          
          try {
            // Check if worksheet has any reference range
            if (worksheet['!ref']) {
              const range = XLSX.utils.decode_range(worksheet['!ref']);
              rowCount = range.e.r + 1;
              hasData = rowCount > 1;
              
              // Get first few headers for preview
              const json = XLSX.utils.sheet_to_json(worksheet, { defval: "", header: 1 });
              if (json.length > 0 && Array.isArray(json[0])) {
                headers = json[0].slice(0, 5).map(h => String(h || '').trim());
              }
            } else {
              // Empty sheet
              rowCount = 0;
              hasData = false;
              headers = [];
            }
          } catch (sheetError) {
            console.warn(`Error processing sheet ${sheetName}:`, sheetError);
            // Fallback for problematic sheets
            rowCount = 0;
            hasData = false;
            headers = [];
          }
          
          return {
            name: sheetName,
            isHidden,
            rowCount,
            headers,
            hasData
          };
        });

        resolve({
          fileName: file.name,
          sheets: sheets,
          defaultSheet: sheets.find(s => !s.isHidden && s.hasData)?.name || sheets[0]?.name
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
