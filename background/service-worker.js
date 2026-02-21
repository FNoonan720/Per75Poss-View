/**
 * Background service worker — proxies API calls to stats.nba.com
 * to avoid CORS restrictions from content scripts.
 */

const CACHE = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const FETCH_TIMEOUT_MS = 30000;

const API_HEADERS = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.nba.com/',
  'Origin': 'https://www.nba.com',
  'x-nba-stats-origin': 'stats',
  'x-nba-stats-token': 'true',
};

function getCacheKey(url, params) {
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  return `${url}?${sorted}`;
}

function getCached(key) {
  const entry = CACHE.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    CACHE.delete(key);
    return null;
  }
  return entry.data;
}

async function fetchWithRetry(fullUrl, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const res = await fetch(fullUrl, {
        headers: API_HEADERS,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS * attempt));
      } else {
        throw err;
      }
    }
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== 'FETCH_STATS') return false;

  const { url, params } = message;
  const cacheKey = getCacheKey(url, params);
  const cached = getCached(cacheKey);

  if (cached) {
    sendResponse({ success: true, data: cached });
    return false;
  }

  const queryString = new URLSearchParams(params).toString();
  const fullUrl = `${url}?${queryString}`;

  fetchWithRetry(fullUrl)
    .then(data => {
      CACHE.set(cacheKey, { data, timestamp: Date.now() });
      sendResponse({ success: true, data });
    })
    .catch(err => {
      sendResponse({ success: false, error: err.message });
    });

  return true;
});
