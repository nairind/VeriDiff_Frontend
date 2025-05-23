// components/HeaderMapper.jsx
import React from 'react';

export default function HeaderMapper({ mapping, onConfirm }) {
  return (
    <div className="header-mapper-modal">
      <h3>Confirm Header Mapping</h3>
      <table>
        <thead>
          <tr>
            <th>Source 1 Header</th>
            <th>Mapped to Source 2</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(mapping).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>
                <input
                  defaultValue={value || ''}
                  onChange={(e) => onConfirm(key, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
