import React from 'react';

const PDFSideBySideView = ({ results, file1Name, file2Name }) => {
  return (
    <div>
      <h3>Side-by-Side View</h3>
      <p>File 1: {file1Name}</p>
      <p>File 2: {file2Name}</p>
      <p>Changes: {results?.differences_found || 0}</p>
    </div>
  );
};

export default PDFSideBySideView;
