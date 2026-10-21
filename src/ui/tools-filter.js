const FORMAT_ALIASES = {
  png: ['png', '.png'],
  jpg: ['jpg', '.jpg', 'jpeg', '.jpeg'],
  jpeg: ['jpeg', '.jpeg', 'jpg', '.jpg'],
  webp: ['webp', '.webp'],
  svg: ['svg', '.svg', 'vector'],
  json: ['json', '.json'],
  csv: ['csv', '.csv', 'comma', 'spreadsheet'],
  tsv: ['tsv', '.tsv', 'tab'],
  md: ['md', '.md', 'markdown'],
  markdown: ['markdown', 'md', '.md'],
  html: ['html', '.html', 'htm', '.htm'],
  htm: ['html', '.html', 'htm', '.htm'],
  pdf: ['pdf', '.pdf', 'document'],
  docx: ['docx', '.docx', 'doc', '.doc', 'word', 'office', 'document'],
  doc: ['docx', '.docx', 'doc', '.doc', 'word', 'office', 'document'],
  word: ['docx', '.docx', 'doc', '.doc', 'word', 'office', 'document'],
  pptx: ['pptx', '.pptx', 'ppt', '.ppt', 'powerpoint', 'presentation', 'slides'],
  ppt: ['pptx', '.pptx', 'ppt', '.ppt', 'powerpoint', 'presentation', 'slides'],
  powerpoint: ['pptx', '.pptx', 'ppt', '.ppt', 'powerpoint', 'presentation', 'slides'],
  txt: ['txt', '.txt', 'text', 'plain'],
  text: ['text', 'txt', '.txt', 'plain'],
  document: ['pdf', 'docx', 'doc', 'word', 'document', 'text', 'txt'],
  presentation: ['pptx', 'ppt', 'powerpoint', 'presentation', 'slides'],
  image: ['image', 'images', 'photo', 'picture', 'raster', 'png', 'jpg', 'jpeg', 'webp'],
  raster: ['raster', 'image', 'images', 'photo', 'picture', 'png', 'jpg', 'jpeg', 'webp'],
  vector: ['vector', 'svg', '.svg'],
  inspector: ['inspector', 'inspect', 'metadata', 'exif', 'dimensions', 'viewbox'],
  inspect: ['inspector', 'inspect', 'metadata', 'exif', 'dimensions', 'viewbox'],
  metadata: ['inspector', 'inspect', 'metadata', 'exif', 'dimensions'],
  formatter: ['formatter', 'format', 'minify', 'pretty', 'prettify', 'validate'],
  format: ['formatter', 'format', 'minify', 'pretty', 'prettify', 'validate'],
  pretty: ['formatter', 'format', 'minify', 'pretty', 'prettify', 'validate'],
  minify: ['formatter', 'format', 'minify', 'pretty', 'prettify', 'validate']
};

export function cleanFormatToken(token) {
  if (typeof token !== 'string') return '';
  return token.trim().toLowerCase().replace(/^\*+/, '').replace(/^\.+/, '').replace(/\.+$/, '');
}

export function getFormatVariants(token) {
  const cleaned = cleanFormatToken(token);
  if (!cleaned) return [];
  const variants = new Set([cleaned, `.${cleaned}`]);
  const aliases = FORMAT_ALIASES[cleaned];
  if (aliases && Array.isArray(aliases)) {
    for (const alias of aliases) {
      variants.add(alias);
      const cleanAlias = cleanFormatToken(alias);
      if (cleanAlias) {
        variants.add(cleanAlias);
        variants.add(`.${cleanAlias}`);
      }
    }
  }
  return Array.from(variants);
}

export function normalizeSearchQuery(rawQuery) {
  const raw = typeof rawQuery === 'string' ? rawQuery.trim() : '';
  if (!raw) {
    return {
      raw: '',
      normalized: '',
      isEmpty: true,
      isDirectional: false,
      fromFormat: '',
      toFormat: '',
      tokens: []
    };
  }

  let normalized = raw.toLowerCase();
  normalized = normalized.replace(/\s*(?:->|-->|=>|→|>)\s*/g, ' to ');
  normalized = normalized.replace(/([a-z0-9]+)-(?:to)-([a-z0-9]+)/g, '$1 to $2');

  const directionalMatch = normalized.match(/^([a-z0-9.*]+)\s+to\s+([a-z0-9.*]+)$/);
  if (directionalMatch) {
    const fromFormat = cleanFormatToken(directionalMatch[1]);
    const toFormat = cleanFormatToken(directionalMatch[2]);
    return {
      raw,
      normalized,
      isEmpty: false,
      isDirectional: true,
      fromFormat,
      toFormat,
      tokens: [directionalMatch[1], directionalMatch[2]]
    };
  }

  const rawTokens = normalized.split(/\s+/).filter(Boolean);
  const tokens = [];
  for (const t of rawTokens) {
    if (t === 'to' || t === 'converter' || t === 'tool') continue;
    tokens.push(t);
  }

  const cleanedTokens = tokens.map((t) => cleanFormatToken(t)).filter(Boolean);
  const isEmpty = cleanedTokens.length === 0;

  return {
    raw,
    normalized,
    isEmpty,
    isDirectional: false,
    fromFormat: '',
    toFormat: '',
    tokens: tokens.length > 0 ? tokens : [raw]
  };
}

export function extractCardMetadata(card) {
  if (!card) {
    return {
      slug: '',
      source: '',
      target: '',
      category: '',
      searchableText: ''
    };
  }

  const slug = (card.getAttribute('data-tool') || '').toLowerCase();
  let source = (card.getAttribute('data-source') || '').toLowerCase();
  let target = (card.getAttribute('data-target') || '').toLowerCase();
  const category = (card.getAttribute('data-category') || '').toLowerCase();
  const dataFormats = (card.getAttribute('data-formats') || '').toLowerCase();
  const dataKeywords = (card.getAttribute('data-keywords') || '').toLowerCase();

  const titleEl = card.querySelector('.tool-card-title') || card.querySelector('.tool-card-link');
  const title = titleEl ? titleEl.textContent.trim().toLowerCase() : '';
  const badgeEl = card.querySelector('.tool-badge');
  const badge = badgeEl ? badgeEl.textContent.trim().toLowerCase() : '';
  const descEl = card.querySelector('.tool-card-desc');
  const desc = descEl ? descEl.textContent.trim().toLowerCase() : '';
  const linkEl = card.querySelector('.tool-card-link');
  const href = linkEl ? (linkEl.getAttribute('href') || '').toLowerCase() : '';

  if (!source || !target) {
    const ref = slug || href.replace(new RegExp('^/'), '').replace(new RegExp('/$'), '');
    if (ref.includes('-to-')) {
      const parts = ref.split('-to-');
      if (!source) source = parts[0];
      if (!target) target = parts[1];
    } else if (ref === 'markdown-to-html') {
      source = 'md';
      target = 'html';
    } else if (ref === 'json-formatter') {
      source = 'json';
      target = 'json';
    } else if (ref === 'image-inspector') {
      source = 'image';
      target = 'info';
    }
  }

  const textTokens = new Set();
  const words = `${title} ${badge} ${desc} ${href} ${slug} ${dataFormats} ${dataKeywords}`.split(/[\s,./\-_→>]+/).filter(Boolean);
  for (const w of words) {
    textTokens.add(w);
    textTokens.add(`.${w}`);
    const variants = getFormatVariants(w);
    for (const v of variants) {
      textTokens.add(v);
    }
  }

  const searchableText = `${Array.from(textTokens).join(' ')} ${title} ${desc} ${badge}`;

  return {
    slug,
    source,
    target,
    category,
    searchableText
  };
}

function matchesDirection(cardMeta, fromFormat, toFormat) {
  const fromVariants = getFormatVariants(fromFormat);
  const toVariants = getFormatVariants(toFormat);

  const cardSourceVariants = getFormatVariants(cardMeta.source);
  const cardTargetVariants = getFormatVariants(cardMeta.target);

  const fromMatches = fromVariants.some((v) => {
    const cleanV = cleanFormatToken(v);
    return cardSourceVariants.includes(cleanV) || cardMeta.slug.startsWith(`${cleanV}-to-`);
  });

  const toMatches = toVariants.some((v) => {
    const cleanV = cleanFormatToken(v);
    return cardTargetVariants.includes(cleanV) || cardMeta.slug.endsWith(`-to-${cleanV}`);
  });

  return fromMatches && toMatches;
}

export function matchesToolCard(card, query) {
  const queryMeta = typeof query === 'string' ? normalizeSearchQuery(query) : query;
  if (!queryMeta || queryMeta.isEmpty) {
    return true;
  }

  const cardMeta = extractCardMetadata(card);

  if (queryMeta.isDirectional && queryMeta.fromFormat && queryMeta.toFormat) {
    return matchesDirection(cardMeta, queryMeta.fromFormat, queryMeta.toFormat);
  }

  for (const token of queryMeta.tokens) {
    const variants = getFormatVariants(token);
    let tokenMatched = false;
    for (const v of variants) {
      if (cardMeta.searchableText.includes(v)) {
        tokenMatched = true;
        break;
      }
    }
    if (!tokenMatched) {
      return false;
    }
  }

  return true;
}

export function setupToolsFilter(options = {}) {
  const doc = options.document || (options.input && options.input.ownerDocument) || (typeof document !== 'undefined' ? document : null);
  if (!doc) return null;

  const searchInput = options.input || doc.getElementById('tools-search');
  if (!searchInput) return null;

  const container = options.container || doc.querySelector('.tools-directory') || doc.body;
  const cards = Array.from(container.querySelectorAll('.tool-card'));
  const sections = Array.from(container.querySelectorAll('.tools-category-section'));
  const noResultsEl = options.noResults || doc.getElementById('tools-no-results');
  const queryDisplayEl = options.queryDisplay || doc.getElementById('tools-search-query');
  const clearBtn = options.clearButton || doc.getElementById('tools-clear-search');
  const statusEl = options.status || doc.getElementById('tools-search-status');

  function filter(rawQuery) {
    const queryMeta = normalizeSearchQuery(rawQuery);
    let visibleCount = 0;

    cards.forEach((card) => {
      const isVisible = matchesToolCard(card, queryMeta);
      card.style.display = isVisible ? '' : 'none';
      if (isVisible) visibleCount += 1;
    });

    sections.forEach((section) => {
      const visibleCards = section.querySelectorAll('.tool-card:not([style*="display: none"])');
      if (visibleCards.length === 0 && !queryMeta.isEmpty) {
        section.style.display = 'none';
      } else {
        section.style.display = '';
      }
    });

    if (noResultsEl) {
      if (visibleCount === 0 && !queryMeta.isEmpty) {
        noResultsEl.style.display = '';
        if (queryDisplayEl) {
          queryDisplayEl.textContent = queryMeta.raw;
        }
      } else {
        noResultsEl.style.display = 'none';
      }
    }

    if (statusEl) {
      if (queryMeta.isEmpty) {
        statusEl.textContent = `Showing all ${cards.length} tools`;
      } else if (visibleCount === 0) {
        statusEl.textContent = `No tools found for "${queryMeta.raw}"`;
      } else {
        statusEl.textContent = `Showing ${visibleCount} of ${cards.length} tools`;
      }
    }

    if (typeof options.onFilter === 'function') {
      options.onFilter({ query: rawQuery, visibleCount, totalCount: cards.length });
    }

    return visibleCount;
  }

  function handleInput(event) {
    filter(event.target.value);
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      searchInput.value = '';
      filter('');
      searchInput.blur();
    }
  }

  function handleClear() {
    searchInput.value = '';
    filter('');
    searchInput.focus();
  }

  searchInput.addEventListener('input', handleInput);
  searchInput.addEventListener('keydown', handleKeyDown);
  if (clearBtn) {
    clearBtn.addEventListener('click', handleClear);
  }

  if (searchInput.value) {
    filter(searchInput.value);
  }

  return {
    filter,
    clear: handleClear,
    destroy() {
      searchInput.removeEventListener('input', handleInput);
      searchInput.removeEventListener('keydown', handleKeyDown);
      if (clearBtn) {
        clearBtn.removeEventListener('click', handleClear);
      }
    }
  };
}
