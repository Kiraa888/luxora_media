import { AppState } from './storage.js';
import { fetchSearchData, fetchTrending } from './api.js';
import { renderCards, renderStats, renderSkeletons, openDetails } from './ui.js';

const searchInput = document.getElementById('premium-search');
const resultsGrid = document.getElementById('results-grid');
const searchSection = document.getElementById('search-section');
const tabSearch = document.getElementById('tab-search');
const tabWatchlist = document.getElementById('tab-watchlist');
const modal = document.getElementById('media-modal');
const closeModalBtn = document.getElementById('close-modal');
const themeToggle = document.getElementById('theme-toggle');

// Initialize Theme
if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-theme');

// ==========================================
// INITIAL LOAD & SEARCH LOGIC
// ==========================================
let searchTimeout;

// 🌟 New: Load Trending Feed
async function loadFeatured() {
  renderSkeletons();
  const results = await fetchTrending();
  if (results) {
    AppState.currentResults = results;
    renderCards(AppState.currentResults);
  }
}

async function handleSearch(query) {
  if (!query || query.length < 2) {
    loadFeatured();
    return;
  }
  renderSkeletons();
  const results = await fetchSearchData(query);
  if (results) {
    AppState.currentResults = results;
    renderCards(AppState.currentResults);
  }
}

// Automatically load trending movies when the user opens the site
loadFeatured();

// ==========================================
// SEARCH & INPUT EVENTS
// ==========================================
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  const query = e.target.value.trim();
  
  if (!query || query.length < 2) {
    loadFeatured(); // Instantly show trending when search is cleared
    return;
  }
  
  searchTimeout = setTimeout(() => handleSearch(query), 400);
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    clearTimeout(searchTimeout);
    handleSearch(e.target.value.trim());
  }
});

// ==========================================
// DELEGATION & MODAL EVENTS
// ==========================================
resultsGrid.addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (!card) return;
  openDetails(Number(card.dataset.id));
});

closeModalBtn.addEventListener('click', () => modal.close());
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.close();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.open) modal.close();
});

// ==========================================
// NAVIGATION & THEME EVENTS
// ==========================================
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
});

tabSearch.addEventListener('click', () => {
  AppState.viewMode = 'search';
  tabSearch.classList.add('active');
  tabWatchlist.classList.remove('active');
  searchSection.classList.remove('hidden');
  document.getElementById('stats-container').innerHTML = '';
  searchInput.value = '';
  loadFeatured(); // Show trending when navigating back to the search tab
  window.scrollTo({ top: 0, behavior: 'smooth' }); 
});

tabWatchlist.addEventListener('click', () => {
  AppState.viewMode = 'watchlist';
  tabWatchlist.classList.add('active');
  tabSearch.classList.remove('active');
  searchSection.classList.add('hidden');
  renderStats();
  renderCards(AppState.watchlist);
  window.scrollTo({ top: 0, behavior: 'smooth' }); 
});
