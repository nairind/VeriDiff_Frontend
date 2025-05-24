// HeaderMapper.js (updated to support tolerance setup)
import React, { useState, useEffect } from 'react';

const HeaderMapper = ({ file1Headers, file2Headers, suggestedMappings, onConfirm }) => {
  const [mappings, setMappings] = useState([]);

  useEffect(() => {
    setMappings(
      suggestedMappings.map(m => ({
        file1Header: m.file1Header,
        file2Header: m.file2Header || '',
        similarity: m.similarity,
        isAmount: false,
        toleranceType: 'flat', // or 'percent'
        toleranceValue: ''
      }))
    );
  }, [suggestedMappings]);

  const updateMapping = (index, key, value) => {
    const updated = [...mappings];
    updated[index][key] = value;
    setMappings(updated);
  };

  const addMapping = () => {
    setMappings([...mappings, {
      file1Header: '', file2Header: '', similarity: 0,
      isAmount: false, toleranceType: 'flat', toleranceValue: ''
    }]);
  };

  const removeMapping = (index) => {
    const updated = mappings.filter((_, i) => i !== index);
    setMappings(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(mappings);
  };

  return (
    <div className="header-mapper">
      <h2>Confirm Header Mappings</h2>
      <form onSubmit={handleSubmit}>
        <table className="mapping-table">
          <thead>
            <tr>
              <th>Source Header (File 1)</th>
              <th>Mapped Header (File 2)</th>
              <th>Similarity</th>
              <th>Amount?</th>
              <th>Tolerance Type</th>
              <th>Tolerance Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((mapping, index) => (
              <tr key={index}>
                <td>{mapping.file1Header}</td>
                <td>
                  <select
                    value={mapping.file2Header}
                    onChange={(e) => updateMapping(index, 'file2Header', e.target.value)}>
                    <option value="">-- None --</option>
                    {file2Headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </td>
                <td>{mapping.similarity}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={mapping.isAmount}
                    onChange={(e) => updateMapping(index, 'isAmount', e.target.checked)}
                  />
                </td>
                <td>
                  <select
                    value={mapping.toleranceType}
                    onChange={(e) => updateMapping(index, 'toleranceType', e.target.value)}
                    disabled={!mapping.isAmount}>
                    <option value="flat">Flat</option>
                    <option value="percent">%</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    step="any"
                    value={mapping.toleranceValue}
                    onChange={(e) => updateMapping(index, 'toleranceValue', e.target.value)}
                    disabled={!mapping.isAmount}
                  />
                </td>
                <td>
                  <button type="button" onClick={() => removeMapping(index)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={addMapping}>Add Mapping</button>
        <button type="submit">Confirm Mappings</button>
      </form>
    </div>
  );
};

export default HeaderMapper;
