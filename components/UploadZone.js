// /components/UploadZone.js
import React from 'react';

const UploadZone = ({ 
  fileNumber, 
  file, 
  dragActive, 
  onFileSelect, 
  onDrop, 
  onDragOver, 
  onDragEnter, 
  onDragLeave 
}) => {
  return (
    <div
      className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
      style={{
        border: '2px dashed #d1d5db',
        borderRadius: '0.75rem',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: file ? '#f0fdf4' : '#fafafa',
        borderColor: file ? '#10b981' : '#d1d5db',
        minHeight: '140px',
        minWidth: '250px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative'
      }}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onClick={() => document.getElementById(`file${fileNumber}`).click()}
    >
      <input
        id={`file${fileNumber}`}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={onFileSelect}
        style={{ display: 'none' }}
      />
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
        {file ? '✅' : '📊'}
      </div>
      <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
        {file ? file.name : `${fileNumber === 1 ? 'First' : 'Second'} File`}
      </div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
        {file ? 'Ready to compare' : 'Excel (.xlsx, .xls) or CSV'}
      </div>
    </div>
  );
};

export default UploadZone;
