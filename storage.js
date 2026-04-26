export const AppState = {
  currentResults: [],
  watchlist: JSON.parse(localStorage.getItem('luxoraVault')) || [],
  viewMode: 'search',
  queryCache: {} 
};

export function toggleVaultState(movieObj) {
  const index = AppState.watchlist.findIndex(m => m.id === movieObj.id);
  let isAdded = false;

  if (index === -1) {
    AppState.watchlist.push({
      id: movieObj.id, 
      title: movieObj.title, 
      poster_path: movieObj.poster_path,
      release_date: movieObj.release_date, 
      vote_average: movieObj.vote_average,
      overview: movieObj.overview, 
      runtime: movieObj.runtime, 
      tagline: movieObj.tagline
    });
    isAdded = true;
  } else {
    AppState.watchlist.splice(index, 1);
  }
  
  localStorage.setItem('luxoraVault', JSON.stringify(AppState.watchlist));
  return isAdded;
}
