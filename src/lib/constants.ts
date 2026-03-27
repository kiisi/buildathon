export const APP_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APP_URL) ||
  'https://linkgroove.vercel.app'
