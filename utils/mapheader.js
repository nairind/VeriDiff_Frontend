// File: utils/mapHeaders.js

/**
 * Attempts to map headers from file1 to file2 based on normalization and similarity
 * @param {Array<string>} headers1 - Headers from File 1
 * @param {Array<string>} headers2 - Headers from File 2
 * @returns {Array<{ file1Header: string, file2Header: string | null }>} - Mapped header pairs
 */
export function mapHeaders(headers1, headers2) {
  // Normalize a single header string
  const normalize = (header) => header.toLowerCase().replace(/[^a-z0-9]/gi, '').trim();

  // Build normalized lookup for headers2
  const normalizedHeaders2 = headers2.map(h => ({
    original: h,
    normalized: normalize(h)
  }));

  return headers1.map(h1 => {
    const norm1 = normalize(h1);
    const match = normalizedHeaders2.find(h2 => h2.normalized === norm1);
    return {
      file1Header: h1,
      file2Header: match ? match.original : null
    };
  });
}
