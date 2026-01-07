// src/lib/safe.ts
export const safe = <T, R = T>(value: T | undefined | null, fallback: R) => {
  return value === undefined || value === null ? fallback : (value as unknown as R);
};

export const formatINR = (n?: number | null) => {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—';
  return `₹${n.toLocaleString()}`;
};
