import { AppState, toggleVaultState } from './storage.js';
import { fetchFullDetails } from './api.js';

const resultsGrid = document.getElementById('results-grid');
const statsContainer = document.getElementById('stats-container');
const modal = document.getElementById('media-modal');
const modalBody = document.getElementById('modal-body');
const IMG_URL = 'https://corsproxy.io/?https://image.tmdb.org/t/p/w500';
const FALLBACK_IMG = 'https://via.placeholder.com/500x750/050505/d4af37?text=Classified+Archive';

export function sanitize(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

export function renderSkeletons() {
  resultsGrid.innerHTML = Array(8).fill('<div class="skeleton"></div>').join('');
}

export function renderCards(dataArray) {
  if (!dataArray) return;
  
  const validData = dataArray.filter(item => item && item.title);
  
  if (validData.length === 0) {
    const msg = AppState.viewMode === 'watchlist' ? "Your Vault is empty." : "No elite records found.";
    resultsGrid.innerHTML = `<p class="muted-text" style="text-align:center; grid-column: 1/-1;">${msg}</p>`;
    return;
  }

  resultsGrid.innerHTML = validData.map(item => {
    const safeTitle = sanitize(item.title);
    const year = item.release_date ? sanitize(item.release_date).substring(0, 4) : 'Unknown';
    const rating = item.vote_average ? item.vote_average.toFixed(1) : '0.0';
    const imgSrc = item.poster_path ? IMG_URL + item.poster_path : FALLBACK_IMG;

    return `
      <article class="card" data-id="${item.id}">
        <div class="card-img-wrapper">
          <img src="${imgSrc}" alt="${safeTitle}" class="card-img" loading="lazy">
        </div>
        <div class="card-content">
          <h3 class="gold-text" style="font-size: 1.2rem;">${safeTitle}</h3>
          <p class="muted-text">${year} &bull; ⭐ ${rating}</p>
        </div>
      </article>
    `;
  }).join('');

  resultsGrid.querySelectorAll('.card-img').forEach(img => {
    img.addEventListener('error', function() {
      this.src = FALLBACK_IMG;
    }, { once: true }); 
  });
}

export function renderStats() {
  if (AppState.watchlist.length === 0) {
    statsContainer.innerHTML = '';
    return;
  }
  
  const total = AppState.watchlist.length;
  const avgRating = (AppState.watchlist.reduce((sum, m) => sum + m.vote_average, 0) / total).toFixed(1);
  
  statsContainer.innerHTML = `
    <div class="vault-stats">
      <div class="stat-box"><span>${total}</span> Cured Titles</div>
      <div class="stat-box"><span>⭐ ${avgRating}</span> Vault Average</div>
    </div>
  `;
}

export async function openDetails(id) {
  let movie = AppState.watchlist.find(m => m.id === id) || AppState.currentResults.find(m => m.id === id);
  
  if (movie && !movie.runtime) {
    const fullData = await fetchFullDetails(id);
    if (fullData) movie = { ...movie, ...fullData };
  }
  
  // Null Safety
  if (!movie) {
    modalBody.innerHTML = `<p class="muted-text" style="text-align:center; padding: 20px;">Classified archive failed to load. Please try again.</p>`;
    modal.showModal();
    return;
  }
  
  const isInVault = AppState.watchlist.some(m => m.id === movie.id);
  const imgSrc = movie.poster_path ? IMG_URL + movie.poster_path : FALLBACK_IMG;

  // Strict Assignment
  const ratingText = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const runtimeText = movie.runtime ? `${movie.runtime} mins` : 'Unknown';

  modalBody.innerHTML = `
    <div class="modal-split">
      <img src="${imgSrc}" class="modal-poster">
      <div>
        <h2 class="gold-text">${sanitize(movie.title)}</h2>
        <p class="muted-text" style="font-style: italic; margin-bottom: 15px;">${sanitize(movie.tagline)}</p>
        <p style="font-size: 0.95rem;">${sanitize(movie.overview)}</p>
        
        <div style="margin-top: 20px; border-top: 1px solid rgba(212, 175, 55, 0.2); padding-top: 15px; font-size: 0.9rem;">
          <span class="gold-text">Runtime:</span> ${sanitize(runtimeText)} <br>
          <span class="gold-text">Rating:</span> ⭐ ${sanitize(ratingText)}
        </div>

        <button id="vault-toggle-btn" class="gold-btn ${isInVault ? 'active' : ''}">
          ${isInVault ? 'Remove from Vault' : 'Add to Vault'}
        </button>
      </div>
    </div>
  `;
  
  const posterImg = modalBody.querySelector('.modal-poster');
  if (posterImg) {
    posterImg.addEventListener('error', function() {
      this.src = FALLBACK_IMG;
    }, { once: true });
  }
  
  const btn = modalBody.querySelector('#vault-toggle-btn');
  btn.onclick = () => {
    const isNowInVault = toggleVaultState(movie);
    btn.textContent = isNowInVault ? 'Remove from Vault' : 'Add to Vault';
    btn.classList.toggle('active', isNowInVault);
    
    if (AppState.viewMode === 'watchlist') {
      renderStats();
      renderCards(AppState.watchlist);
      if (AppState.watchlist.length === 0) modal.close();
    }
  };
  
  modal.showModal();
}
