var params = new URLSearchParams(window.location.search);
var query = (params.get('q') || '').trim();
var input = document.querySelector('[data-search-input]');
var title = document.querySelector('[data-search-title]');
var summary = document.querySelector('[data-search-summary]');
var results = document.querySelector('[data-search-results]');

if (input) {
  input.value = query;
}

function posterStyle(image) {
  return "--poster-image: url('" + image + "');";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function card(item) {
  var tags = item.tags.slice(0, 3).map(function (tag) {
    return '<span>' + escapeHtml(tag) + '</span>';
  }).join('');

  return [
    '<a class="movie-card" href="' + escapeHtml(item.url) + '">',
    '  <span class="poster-bg" style="' + posterStyle(escapeHtml(item.image)) + '"></span>',
    '  <span class="card-body">',
    '    <span class="card-kicker">' + escapeHtml(item.type) + ' · ' + escapeHtml(item.year) + '</span>',
    '    <strong>' + escapeHtml(item.title) + '</strong>',
    '    <span class="card-desc">' + escapeHtml(item.desc) + '</span>',
    '    <span class="tag-row">' + tags + '</span>',
    '    <span class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span><span>' + escapeHtml(item.score) + '分</span></span>',
    '  </span>',
    '</a>'
  ].join('');
}

function matchItem(item, keyword) {
  var haystack = [
    item.title,
    item.desc,
    item.year,
    item.region,
    item.type,
    item.genre,
    item.tags.join(' ')
  ].join(' ').toLowerCase();

  return haystack.indexOf(keyword.toLowerCase()) !== -1;
}

if (results && query) {
  var matched = SITE_SEARCH_ITEMS.filter(function (item) {
    return matchItem(item, query);
  }).slice(0, 120);

  if (title) {
    title.textContent = '搜索结果：' + query;
  }

  if (summary) {
    summary.textContent = matched.length ? '找到 ' + matched.length + ' 部相关影片。' : '暂未找到完全匹配的影片，可尝试更短的关键词。';
  }

  if (matched.length) {
    results.innerHTML = matched.map(card).join('');
  } else {
    results.innerHTML = '<div class="search-empty">没有匹配结果</div>';
  }
}
