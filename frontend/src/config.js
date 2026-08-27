const rawUrl = import.meta.env.VITE_API_URL || '';
// Clean up trailing slash to prevent double slashes in API calls
export const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
