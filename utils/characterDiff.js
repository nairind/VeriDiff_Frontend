// /utils/characterDiff.js
export const getCharacterDiff = (str1, str2, ignoreWhitespace = false) => {
  if (!str1 || !str2) return { str1: str1 || '', str2: str2 || '', hasChanges: str1 !== str2 };
  
  let s1 = ignoreWhitespace ? str1.replace(/\s+/g, ' ').trim() : str1;
  let s2 = ignoreWhitespace ? str2.replace(/\s+/g, ' ').trim() : str2;
  
  if (s1 === s2) {
    return { str1, str2, hasChanges: false };
  }
  
  const result1 = [];
  const result2 = [];
  const maxLen = Math.max(s1.length, s2.length);
  
  for (let i = 0; i < maxLen; i++) {
    const char1 = s1[i] || '';
    const char2 = s2[i] || '';
    
    if (char1 === char2) {
      result1.push({ char: char1, type: 'same' });
      result2.push({ char: char2, type: 'same' });
    } else {
      result1.push({ char: char1, type: char1 ? 'removed' : 'missing' });
      result2.push({ char: char2, type: char2 ? 'added' : 'missing' });
    }
  }
  
  return { str1: result1, str2: result2, hasChanges: true };
};

export const renderCharacterDiff = (diffResult, showCharacterDiff) => {
  if (!showCharacterDiff || !diffResult.hasChanges) {
    return <span>{typeof diffResult.str1 === 'string' ? diffResult.str1 : diffResult.str1.map(c => c.char).join('')}</span>;
  }
  
  return (
    <span>
      {Array.isArray(diffResult.str1) ? diffResult.str1.map((charObj, idx) => (
        <span
          key={idx}
          style={{
            backgroundColor: charObj.type === 'removed' ? '#fee2e2' : 
                           charObj.type === 'missing' ? '#fef3c7' : 'transparent',
            color: charObj.type === 'removed' ? '#dc2626' : 
                   charObj.type === 'missing' ? '#d97706' : 'inherit',
            textDecoration: charObj.type === 'removed' ? 'line-through' : 'none',
            padding: charObj.type !== 'same' ? '1px 2px' : '0',
            borderRadius: '2px'
          }}
        >
          {charObj.char}
        </span>
      )) : diffResult.str1}
    </span>
  );
};
