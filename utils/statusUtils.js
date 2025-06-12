// /utils/statusUtils.js
export const getRecordStatus = (row) => {
  if (!row.fields) return 'unknown';
  
  const fieldValues = Object.values(row.fields);
  const hasDifferences = fieldValues.some(field => field.status === 'difference');
  const hasAcceptable = fieldValues.some(field => field.status === 'acceptable');
  const allMatches = fieldValues.every(field => field.status === 'match');
  
  if (allMatches) return 'match';
  if (hasDifferences) return 'modified';
  if (hasAcceptable) return 'acceptable';
  return 'unknown';
};

export const getStatusConfig = (status) => {
  switch (status) {
    case 'match':
      return { 
        color: '#16a34a', 
        bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', 
        border: '#22c55e', 
        icon: '✅', 
        label: 'Perfect Match'
      };
    case 'modified':
      return { 
        color: '#d97706', 
        bg: 'linear-gradient(135deg, #fefce8, #fef3c7)', 
        border: '#f59e0b', 
        icon: '✏️', 
        label: 'Modified'
      };
    case 'acceptable':
      return { 
        color: '#0369a1', 
        bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)', 
        border: '#3b82f6', 
        icon: '⚠️', 
        label: 'Within Tolerance'
      };
    default:
      return { 
        color: '#6b7280', 
        bg: 'linear-gradient(135deg, #f9fafb, #f3f4f6)', 
        border: '#d1d5db', 
        icon: '❓', 
        label: 'Unknown'
      };
  }
};
