// File: utils/mapHeaders.js

/**
 * Attempts to map headers from file1 to file2 using normalization and fuzzy matching.
 * Returns an array of mapped pairs and confidence score (1 = exact match, < 1 = partial match).
 *
 * @param {Array<string>} headers1 - Headers from File 1
 * @param {Array<string>} headers2 - Headers from File 2
 * @returns {Array<{ file1Header: string, file2Header: string | null, confidence: number }>}
 */
export function mapHeaders(headers1, headers2) {
  const normalize = (header) =>
    header.toLowerCase().replace(/[^a-z0-9]/gi, '').trim();

  const normalizedHeaders2 = headers2.map((h) => ({
    original: h,
    normalized: normalize(h),
  }));

  return headers1.map((h1) => {
    const norm1 = normalize(h1);

    // Try exact match first
    const exactMatch = normalizedHeaders2.find(
      (h2) => h2.normalized === norm1
    );

    if (exactMatch) {
      return {
        file1Header: h1,
        file2Header: exactMatch.original,
        confidence: 1.0,
      };
    }

    // Fallback to partial match based on substring similarity
    let bestMatch = null;
    let bestScore = 0;

    normalizedHeaders2.forEach((h2) => {
      const score = similarity(norm1, h2.normalized);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = h2;
      }
    });

    if (bestScore >= 0.5) {
      return {
        file1Header: h1,
        file2Header: bestMatch.original,
        confidence: bestScore,
      };
    }

    return {
      file1Header: h1,
      file2Header: null,
      confidence: 0,
    };
  });
}

/**
 * Computes a simple similarity score (0–1) between two strings using
 * Dice’s Coefficient based on bigrams.
 */
function similarity(a, b) {
  if (!a.length || !b.length) return 0;
  if (a === b) return 1;

  const bigrams = (str) =>
    new Set([...str].map((_, i) => str.slice(i, i + 2)).filter((s) => s.length === 2));

  const aBigrams = bigrams(a);
  const bBigrams = bigrams(b);

  const intersection = [...aBigrams].filter((bg) => bBigrams.has(bg));
  return (2 * intersection.length) / (aBigrams.size + bBigrams.size);
}
