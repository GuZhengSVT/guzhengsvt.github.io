const filters = document.getElementById('filters');
const query = document.getElementById('query');
const artist = document.getElementById('artist');
const tagFilters = Array.from(filters.querySelectorAll('[data-tag-filter]'));
const collection = document.getElementById('collection');
const results = document.getElementById('results');
const empty = document.getElementById('empty-results');
const playlists = document.getElementById('playlists');
const views = Array.from(document.querySelectorAll('[data-view]'));
const normalize = (text) => text.normalize('NFKC').toLocaleLowerCase().trim();

function update() {
  const active = collection.value || 'all';
  const words = normalize(query.value).split(/\s+/u).filter(Boolean);
  const selectedTags = tagFilters.map((filter) => filter.value).filter(Boolean);
  let matched = 0;
  for (const view of views) {
    const selected = view.dataset.view === active;
    view.hidden = !selected;
    if (!selected) continue;
    if (view instanceof HTMLDetailsElement) view.open = true;
    for (const row of view.querySelectorAll('.track')) {
      const text = normalize(row.dataset.search);
      const tags = selectedTags.length ? row.dataset.tags.split(' ') : [];
      const match = words.every((word) => text.includes(word)) &&
        (!artist.value || row.dataset.artists.split(' ').includes(artist.value)) &&
        selectedTags.every((tag) => tags.includes(tag));
      row.hidden = !match;
      if (match) matched += 1;
    }
  }
  playlists.hidden = active === 'all';
  const filtered = words.length > 0 || artist.value || selectedTags.length > 0;
  empty.hidden = !filtered || matched !== 0;
  results.hidden = !filtered;
  results.textContent = active === 'all' ? `找到 ${matched} 首歌曲` : `找到 ${matched} 个歌单位置`;
}

filters.addEventListener('submit', (event) => event.preventDefault());
filters.addEventListener('input', update);
filters.addEventListener('reset', () => requestAnimationFrame(update));
filters.hidden = false;
update();
