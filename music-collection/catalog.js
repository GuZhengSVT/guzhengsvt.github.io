const catalog = document.getElementById('catalog');
const filters = document.getElementById('filters');
const query = document.getElementById('query');
const artist = document.getElementById('artist');
const tagFilters = Array.from(filters.querySelectorAll('[data-tag-filter]'));
const fields = [query, artist, ...tagFilters];
const collection = document.getElementById('collection');
const results = document.getElementById('results');
const tracks = document.getElementById('tracks');
const empty = document.getElementById('empty-results');
const pager = document.getElementById('page-nav');
const previous = document.getElementById('previous-page');
const next = document.getElementById('next-page');
const pageLabel = document.getElementById('page-label');
const { view, firstPage, source } = catalog.dataset;
const initialPage = Number(catalog.dataset.page);
const initialPages = Number(catalog.dataset.pages);
const pageSize = Number(catalog.dataset.pageSize);
const initialRows = tracks.innerHTML;
const initialEmpty = empty.textContent;
const normalize = (text) => text.normalize('NFKC').toLocaleLowerCase().trim();
const unfilteredUrl = (page) => page === 1 ? firstPage : `${firstPage}page/${page}/`;

let searchIndex;
let pending;

async function fetchPart(file, signal) {
  const response = await fetch(source + file, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
}

async function pageRows(page, signal) {
  if (page === initialPage) return initialRows;
  return (await fetchPart(`${page}.html`, signal)).text();
}

function filterParams() {
  return new URLSearchParams(fields.filter((field) => field.value.trim())
    .map((field) => [field.name, field.value]));
}

function filteredUrl(params, page) {
  const urlParams = new URLSearchParams(params);
  if (page > 1) urlParams.set('page', page);
  return `?${urlParams}`;
}

function showPager(page, pages, pageUrl) {
  pager.hidden = pages < 2;
  pageLabel.textContent = `第 ${page} / ${pages} 页`;
  previous.hidden = page === 1;
  next.hidden = page === pages;
  if (!previous.hidden) previous.href = pageUrl(page - 1);
  if (!next.hidden) next.href = pageUrl(page + 1);
}

async function showUnfilteredPage(page, saveHistory = false) {
  pending?.abort();
  pending = new AbortController();
  const { signal } = pending;
  const url = unfilteredUrl(page);
  tracks.setAttribute('aria-busy', 'true');

  try {
    const rows = await pageRows(page, signal);
    if (signal.aborted) return;

    if (saveHistory) history.pushState(null, '', url);
    else if (location.pathname !== url || location.search) history.replaceState(null, '', url);
    tracks.innerHTML = rows;
    empty.hidden = tracks.childElementCount > 0;
    empty.textContent = initialEmpty;
    results.hidden = true;
    showPager(page, initialPages, unfilteredUrl);
    if (saveHistory) document.getElementById('songs-title').focus();
  } catch {
    if (!signal.aborted) location.assign(url);
  } finally {
    if (!signal.aborted) tracks.removeAttribute('aria-busy');
  }
}

async function matchingRows(indices, signal) {
  const pages = new Map();
  for (const index of indices) {
    const page = Math.floor(index / pageSize) + 1;
    if (!pages.has(page)) pages.set(page, []);
    pages.get(page).push(index % pageSize);
  }
  const rows = await Promise.all(Array.from(pages, async ([page, offsets]) => {
    const template = document.createElement('template');
    template.innerHTML = await pageRows(page, signal);
    const selected = offsets.map((offset) => template.content.children[offset]);
    for (const row of selected) row.remove();
    return selected;
  }));
  return rows.flat();
}

async function update(requestedPage = 1, focus = false) {
  const params = filterParams();
  if (!params.size) return showUnfilteredPage(1);

  pending?.abort();
  pending = new AbortController();
  const { signal } = pending;
  const words = normalize(query.value).split(/\s+/u).filter(Boolean);
  const selectedArtist = artist.value;
  const selectedTags = tagFilters.map((filter) => filter.value).filter(Boolean);
  results.textContent = '正在筛选歌曲…';
  results.hidden = false;
  tracks.setAttribute('aria-busy', 'true');

  try {
    searchIndex ??= fetchPart('search.json').then((response) => response.json()).catch((error) => {
      searchIndex = undefined;
      throw error;
    });
    const index = await searchIndex;
    if (signal.aborted) return;

    const matches = [];
    index.forEach(([text, artists, tags], row) => {
      if ((!selectedArtist || artists.includes(selectedArtist)) &&
          selectedTags.every((tag) => tags.includes(tag)) &&
          (!words.length || words.every((word) => normalize(text).includes(word)))) matches.push(row);
    });

    const pages = Math.max(1, Math.ceil(matches.length / pageSize));
    const page = Math.min(requestedPage, pages);
    const offset = (page - 1) * pageSize;
    const rows = await matchingRows(matches.slice(offset, offset + pageSize), signal);
    if (signal.aborted) return;

    tracks.replaceChildren(...rows);
    empty.hidden = matches.length > 0;
    empty.textContent = '没有符合筛选条件的歌曲。';
    results.textContent = view === 'all' ? `找到 ${matches.length} 首歌曲` : `找到 ${matches.length} 个歌单位置`;
    showPager(page, pages, (number) => filteredUrl(params, number));
    history.replaceState(null, '', filteredUrl(params, page));
    if (focus) document.getElementById('songs-title').focus();
  } catch (error) {
    if (signal.aborted) return;
    results.textContent = '筛选结果加载失败，请重试。';
  } finally {
    if (!signal.aborted) tracks.removeAttribute('aria-busy');
  }
}

function restoreFilters() {
  const urlParams = new URLSearchParams(location.search);
  for (const field of fields) {
    const value = urlParams.get(field.name) ?? '';
    field.value = field === query || Array.from(field.options).some((option) => option.value === value) ? value : '';
  }
  const page = Number(urlParams.get('page'));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function pageFromPath(path) {
  return Number(path.match(/\/page\/(\d+)\/$/)?.[1]) || 1;
}

filters.addEventListener('submit', (event) => event.preventDefault());
filters.addEventListener('input', (event) => {
  if (event.target === collection) {
    const params = filterParams();
    location.assign(collection.value + (params.size ? filteredUrl(params, 1) : ''));
  } else {
    update();
  }
});
filters.addEventListener('reset', (event) => {
  event.preventDefault();
  if (view !== 'all') {
    location.assign(collection.options[0].value);
  } else {
    for (const field of fields) field.value = '';
    update();
  }
});
pager.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link?.hasAttribute('href') || event.button || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
  event.preventDefault();
  const url = new URL(link.href);
  if (filterParams().size) update(Number(url.searchParams.get('page')) || 1, true);
  else showUnfilteredPage(pageFromPath(url.pathname), true);
});
window.addEventListener('popstate', () => {
  const page = restoreFilters();
  if (filterParams().size) update(page);
  else showUnfilteredPage(pageFromPath(location.pathname));
});

filters.hidden = false;
const page = restoreFilters();
if (filterParams().size) update(page);
