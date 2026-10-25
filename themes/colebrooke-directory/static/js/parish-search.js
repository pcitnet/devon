/* Lightweight privacy-respecting search; no remote dependencies. */
(() => {
  'use strict';
  const input = document.getElementById('parish-search-input');
  const form = document.getElementById('parish-search-form');
  const output = document.getElementById('parish-search-results');
  const status = document.getElementById('parish-search-status');
  const dataNode = document.getElementById('parish-search-data');
  if (!input || !form || !output || !status || !dataNode) return;
  let pages;
  try { pages = JSON.parse(dataNode.textContent); } catch (_) {
    status.textContent = 'The search index could not be loaded.';
    return;
  }
  const normalize = value => String(value || '').toLocaleLowerCase('en-GB').normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  function render(query) {
    output.replaceChildren();
    const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
    if (!terms.length) {
      status.textContent = 'Enter a term above to search the collection.';
      return;
    }
    const matches = pages.map(page => {
      const title = normalize(page.title);
      const description = normalize(page.summary);
      const body = normalize(page.text);
      if (!terms.every(t => title.includes(t) || description.includes(t) || body.includes(t))) return null;
      const score = terms.reduce((n, t) => n + (title.includes(t) ? 8 : 0) + (description.includes(t) ? 3 : 0) + (body.includes(t) ? 1 : 0), 0);
      return { page, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score || a.page.title.localeCompare(b.page.title));
    status.textContent = `${matches.length} ${matches.length === 1 ? 'entry' : 'entries'} found.`;
    const fragment = document.createDocumentFragment();
    for (const { page } of matches.slice(0, 60)) {
      const article = document.createElement('article');
      article.className = 'parish-result';
      const heading = document.createElement('h2');
      const a = document.createElement('a');
      a.href = page.url;
      a.textContent = page.title;
      heading.append(a);
      article.append(heading);
      if (page.summary) { const p = document.createElement('p'); p.textContent = page.summary; article.append(p); }
      fragment.append(article);
    }
    output.append(fragment);
    if (matches.length > 60) {
      const p = document.createElement('p');
      p.textContent = 'Showing the first 60 matches. Add another word to narrow your search.';
      output.append(p);
    }
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    const query = input.value.trim();
    const url = new URL(window.location.href);
    if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
    render(query);
  });
  const initial = new URL(window.location.href).searchParams.get('q') || '';
  if (initial) { input.value = initial; render(initial); }
})();
