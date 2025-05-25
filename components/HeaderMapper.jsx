// File: components/HeaderMapper.jsx

import React, { useState, useEffect } from 'react';

const HeaderMapper = ({ file1Headers, file2Headers, suggestedMappings, onConfirm, onRun }) => {
  const [mappings, setMappings] = useState([]);

  useEffect(() => {
    const enriched = suggestedMappings.map(m => ({
      file1Header: m.file1Header,
      file2Header: m.file2Header || '',
      similarity: m.similarity,
      isAmountField: false,
      toleranceType: 'flat',
      toleranceValue: ''
    }));
    setMappings(enriched);
  }, [suggestedMappings]);

  const updateMapping = (index, key, value) => {
    const updated = [...mappings];
    updated[index][key] = value;
    setMappings(updated);
  };

  const addMapping = () => {
    setMappings([
      ...mappings,
      { file1Header: '', file2Header: '', similarity: 0, isAmountField: false, toleranceType: 'flat', toleranceValue: '' }
    ]);
  };

  const removeMapping = (index) => {
    const updated = mappings.filter((_, i) => i !== index);
    setMappings(updated);
    // Immediately update the parent component with the new mappings
    onConfirm(updated);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    onConfirm(mappings); // Send full mappings with tolerance to parent
  };

  return (
    <div className="header-mapper">
      <h2>Confirm Header Mappings</h2>
      <form onSubmit={handleConfirm}>
        <table>
          <thead>
            <tr>
              <th>File 1 Header</th>
              <th>File 2 Header</th>
              <th>Amount Field?</th>
              <th>Tolerance Type</th>
              <th>Tolerance Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((m, i) => (
              <tr key={i}>
                <td>
                  <select
                    value={m.file1Header}
                    onChange={(e) => updateMapping(i, 'file1Header', e.target.value)}
                  >
                    <option value="">-- None --</option>
                    {file1Headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </td>
                <td>
                  <select
                    value={m.file2Header}
                    onChange={(e) => updateMapping(i, 'file2Header', e.target.value)}
                  >
                    <option value="">-- None --</option>
                    {file2Headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={m.isAmountField}
                    onChange={(e) => updateMapping(i, 'isAmountField', e.target.checked)}
                  />
                </td>
                <td>
                  <select
                    value={m.toleranceType}
                    onChange={(e) => updateMapping(i, 'toleranceType', e.target.value)}
                  >
                    <option value="flat">Flat</option>
                    <option value="%">%</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    value={m.toleranceValue}
                    onChange={(e) => updateMapping(i, 'toleranceValue', e.target.value)}
                    step="any"
                  />
                </td>
                <td>
                  <button type="button" onClick={() => removeMapping(i)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={addMapping}>Add Mapping</button>
        <button type="submit">Confirm Mapping</button>
        <button type="button" onClick={onRun}>Run Comparison</button>
      </form>
    </div>
  );
};

export default HeaderMapper;
