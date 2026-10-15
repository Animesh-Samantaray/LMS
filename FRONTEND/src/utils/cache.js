

const CACHE_PREFIX = 'lms_cache_';
const DEFAULT_TTL_MINUTES = 5;


export const setCachedData = (key, data, ttlMinutes = DEFAULT_TTL_MINUTES) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const item = {
      data,
      expiry: Date.now() + Math.max(1, ttlMinutes) * 60 * 1000,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
  } catch (err) {
   
    console.warn(`[Cache] Could not store key "${key}":`, err.message);
  }
};


export const getCachedData = (key) => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.expiry !== 'number') {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    
    if (Date.now() > parsed.expiry) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return parsed.data;
  } catch (err) {
    return null;
  }
};


export const removeCachedData = (key) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (err) {
    
  }
};


export const clearAllCache = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (err) {
   
  }
};


export const fetchWithCache = async (key, fetchFn, ttlMinutes = DEFAULT_TTL_MINUTES) => {
  const cached = getCachedData(key);
  if (cached !== null) {
    return cached;
  }

  const fresh = await fetchFn();
  if (fresh !== undefined && fresh !== null) {
    setCachedData(key, fresh, ttlMinutes);
  }
  return fresh;
};

export default {
  get: getCachedData,
  set: setCachedData,
  remove: removeCachedData,
  clear: clearAllCache,
  fetchWithCache,
};
