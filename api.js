import { AppState } from './storage.js';

// Note: Secure in backend proxy for production
const API_KEY = '6c3ad75b1452e69636511eb2ad5175ca'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const MAX_CACHE = 20;

let abortController;

export async function fetchSearchData(query) {
  // True LRU Cache implementation
  if (AppState.queryCache[query]) {
    const data = AppState.queryCache[query];
    delete AppState.queryCache[query];
    AppState.queryCache[query] = data; // Move to end (most recently used)
    return data;
  }

  if (abortController) abortController.abort();
  abortController = new AbortController();

  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`,
      { signal: abortController.signal }
    );
    
    if (!response.ok) throw new Error('Network error');
    
    const data = await response.json();
    
    // Evict Least Recently Used (index 0)
    const cacheKeys = Object.keys(AppState.queryCache);
    if (cacheKeys.length >= MAX_CACHE) {
      delete AppState.queryCache[cacheKeys[0]];
    }
    
    AppState.queryCache[query] = data.results; 
    return data.results;
  } catch (error) {
    if (error.name === 'AbortError') return null; 
    console.error("Fetch error:", error);
    return [];
  }
}

export async function fetchFullDetails(id) {
  try {
    const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
    return await response.json();
  } catch (error) {
    console.error("Details fetch error:", error);
    return null; 
  }
}
