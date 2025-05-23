// File: utils/mapHeaders.js

/**
 * Normalize header: lowercase, remove non-alphanumerics, trim spaces
 * @param {string} header
 * @returns {string}
 */
function normalizeHeader(header) {
  return header.toLowerCase().replace(/[^a-z0-9]/gi, '').trim();
}

/**
 * Compute Levenshtein distance between two strings
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => []);

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Calculates similarity score from 0 to 1
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function similarity(a, b) {
  const distance = levenshtein(a, b);
  const maxLength = Math.max(a.length, b.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

/**
 * Attempts to map headers from file1 to file2 using normalization and similarity
 * @param {Array<string>} headers1
 * @param {Array<string>} headers2
 * @returns {Array<{ file1Header: string, file2Header: string | null, similarity: number }>}
 */
export function mapHeaders(headers1, headers2) {
  const normalized2 = headers2.map(h => ({
    original: h,
    normalized: normalizeHeader(h)
  }));

  return headers1.map(h1 => {
    const norm1 = normalizeHeader(h1);

    // Find best match using similarity score
    let bestMatch = null;
    let bestScore = 0;

    for (const h2 of normalized2) {
      const score = similarity(norm1, h2.normalized);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = h2.original;
      }
    }

    return {
      file1Header: h1,
      file2Header: bestScore > 0.7 ? bestMatch : null,
      similarity: parseFloat(bestScore.toFixed(2))
    };
  });
}
