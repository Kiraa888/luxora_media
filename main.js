import { AppState } from './storage.js';
import { fetchSearchData } from './api.js';
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
// SEARCH & INPUT EVENTS
// ==========================================
let searchTimeout;

async function handleSearch(query) {
  if (!query || query.length < 2) {
    resultsGrid.innerHTML = '';
    return;
  }
  renderSkeletons();
  const results = await fetchSearchData(query);
  if (results) {
    AppState.currentResults = results;
    renderCards(AppState.currentResults);
  }
}

searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  const query = e.target.value.trim();
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
  resultsGrid.innerHTML = '';
  searchInput.value = '';
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
