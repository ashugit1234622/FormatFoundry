import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOLS, TOOL_CATEGORIES } from '../src/config/tools-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.resolve(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

function getBaseUrl(customUrl) {
  const raw = customUrl !== undefined ? customUrl : (process.env.PUBLIC_SITE_URL || '');
  return typeof raw === 'string' ? raw.trim().replace(/\/+$/, '') : '';
}

function escapeHtml(str) {
  if (typeof str !== 'string') {
    return '';
  }
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getReliableDate(filepath) {
  try {
    if (fs.existsSync(filepath)) {
      return fs.statSync(filepath).mtime.toISOString().split('T')[0];
    }
  } catch {}
  return new Date().toISOString().split('T')[0];
}

function renderHeader(activePath = '') {
  const isHome = activePath === '/';
  const isTools = activePath === '/tools/';

  return `
    <header class="site-header">
      <div class="site-header-inner">
        <a href="/" class="brand-group" aria-label="FormatFoundry Home">
          <span class="brand-wordmark">FormatFoundry</span>
          <span class="brand-badge">Client-Side</span>
        </a>
        <nav class="site-nav" aria-label="Primary Navigation">
          <a href="/tools/" class="nav-link ${isTools ? 'active' : ''}">Tools</a>
          <a href="${isHome ? '#workspace' : '/#workspace'}" class="nav-link ${isHome ? 'active' : ''}">Workspace</a>
          <a href="${isHome ? '#privacy' : '/#privacy'}" class="nav-link">Privacy</a>
          <a href="${isHome ? '#about' : '/#about'}" class="nav-link">About</a>
        </nav>
      </div>
    </header>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="site-footer-inner">
        <span>FormatFoundry &middot; Local-first utility</span>
        <div class="footer-links">
          <a href="/" class="footer-link">Home</a>
          <a href="/tools/" class="footer-link">All Tools</a>
          <a href="/#privacy" class="footer-link">Privacy Guarantee</a>
          <a href="/#about" class="footer-link">Output Guarantee</a>
        </div>
        <span>Version 0.5.0 (Dedicated Tool Pages)</span>
      </div>
    </footer>
  `;
}

function renderCanonical(canonicalPath, baseUrl = '') {
  if (!baseUrl) {
    return '';
  }
  return `<link rel="canonical" href="${baseUrl}${canonicalPath}" />`;
}

function renderOpenGraphAndTwitter({ title, description, path: pagePath, baseUrl = '' }) {
  const imageUrl = baseUrl ? `${baseUrl}/og-image.png` : '/og-image.png';
  const pageUrl = baseUrl ? `${baseUrl}${pagePath}` : pagePath;

  return `
    <meta property="og:site_name" content="FormatFoundry" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    ${baseUrl ? `<meta property="og:url" content="${pageUrl}" />` : ''}
    <meta property="og:image" content="${imageUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${imageUrl}" />`;
}

function renderJsonLd(schema) {
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

function generateToolPageHtml(tool, baseUrl = '') {
  const canonicalTag = renderCanonical(tool.path, baseUrl);
  const ogTwitterTags = renderOpenGraphAndTwitter({
    title: tool.title,
    description: tool.metaDescription,
    path: tool.path,
    baseUrl
  });

  const toolSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: tool.name,
      url: baseUrl ? `${baseUrl}${tool.path}` : tool.path,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript and HTML5 Canvas support',
      description: tool.metaDescription,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl ? `${baseUrl}/` : '/'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Tools',
          item: baseUrl ? `${baseUrl}/tools/` : '/tools/'
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: tool.shortName,
          item: baseUrl ? `${baseUrl}${tool.path}` : tool.path
        }
      ]
    }
  ];

  const jsonLdTag = renderJsonLd(toolSchema);
  const headerHtml = renderHeader(tool.path);
  const footerHtml = renderFooter();

  const stepsHtml = tool.howToSteps
    .map(
      (step) => `
        <li class="how-to-step">
          <span class="step-number" aria-hidden="true"></span>
          <span>${escapeHtml(step)}</span>
        </li>
      `
    )
    .join('');

  const featuresHtml = tool.features
    .map((feat) => `<li>${escapeHtml(feat)}</li>`)
    .join('');

  const faqsHtml = tool.faqs
    .map(
      (faq) => `
        <details class="faq-details">
          <summary class="faq-summary">${escapeHtml(faq.question)}</summary>
          <div class="faq-answer">
            <p>${escapeHtml(faq.answer)}</p>
          </div>
        </details>
      `
    )
    .join('');

  const relatedCardsHtml = tool.relatedTools
    .map((relSlug) => {
      const relTool = TOOLS.find((t) => t.slug === relSlug);
      if (!relTool) return '';
      return `
        <a href="${relTool.path}" class="related-tool-card">
          <span>${escapeHtml(relTool.name)}</span>
          <span aria-hidden="true">&rarr;</span>
        </a>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(tool.title)}</title>
    <meta name="description" content="${escapeHtml(tool.metaDescription)}" />
    ${canonicalTag}
    ${ogTwitterTags}
    ${jsonLdTag}
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232B4C6F' stroke-width='2'><rect x='3' y='3' width='18' height='18' rx='3'/><path d='M8 12h8M12 8v8'/></svg>" />
    <link rel="stylesheet" href="/src/styles/main.css" />
  </head>
  <body data-tool="${tool.slug}">
    ${headerHtml}

    <main class="main-content">
      <nav class="breadcrumb-nav" aria-label="Breadcrumb">
        <ol class="breadcrumb-list">
          <li class="breadcrumb-item">
            <a href="/" class="breadcrumb-link">Home</a>
            <span class="breadcrumb-separator" aria-hidden="true">/</span>
          </li>
          <li class="breadcrumb-item">
            <a href="/tools/" class="breadcrumb-link">Tools</a>
            <span class="breadcrumb-separator" aria-hidden="true">/</span>
          </li>
          <li class="breadcrumb-item">
            <span class="breadcrumb-current" aria-current="page">${escapeHtml(tool.shortName)}</span>
          </li>
        </ol>
      </nav>

      <section class="intro-section">
        <h1 class="intro-title">${escapeHtml(tool.h1)}</h1>
        <p class="intro-subtitle">${escapeHtml(tool.subtitle)}</p>
      </section>

      <section class="workspace-section" id="workspace" aria-labelledby="workspace-heading">
        <h2 id="workspace-heading" class="sr-only">${escapeHtml(tool.name)} Workspace</h2>
        <div id="dropzone" class="dropzone" tabindex="0" role="region" aria-label="File upload dropzone"></div>
        <div id="staged-container"></div>
      </section>

      <section class="tool-content-section" aria-labelledby="guide-heading">
        <h2 id="guide-heading" class="sr-only">How to Use and Format Specifications</h2>

        <article class="tool-section-card">
          <h3 class="tool-section-title">How to convert ${escapeHtml(tool.shortName)} locally</h3>
          <ol class="how-to-steps">
            ${stepsHtml}
          </ol>
        </article>

        <article class="tool-section-card">
          <h3 class="tool-section-title">Format specifications &amp; engine handling</h3>
          <div class="specs-grid">
            <div class="spec-box">
              <span class="spec-label">Supported Input</span>
              <span class="spec-value">${escapeHtml(tool.supportedInputs)}</span>
            </div>
            <div class="spec-box">
              <span class="spec-label">Available Targets</span>
              <span class="spec-value">${escapeHtml(tool.supportedOutputs)}</span>
            </div>
            <div class="spec-box">
              <span class="spec-label">Processing Engine</span>
              <span class="spec-value">Client-Side JavaScript &amp; HTML5</span>
            </div>
            <div class="spec-box">
              <span class="spec-label">Privacy Model</span>
              <span class="spec-value">100% Local (0 Network Uploads)</span>
            </div>
          </div>
          <ul class="tool-section-text" style="margin-top: 12px; padding-left: 20px;">
            ${featuresHtml}
          </ul>
        </article>

        <article class="tool-section-card">
          <h3 class="tool-section-title">Technical specifications &amp; limitations</h3>
          <div class="limitations-box">
            <strong>Important format notes:</strong> ${escapeHtml(tool.limitations)}
          </div>
        </article>

        <article class="tool-section-card">
          <h3 class="tool-section-title">Client-side privacy guarantee</h3>
          <p class="tool-section-text">
            FormatFoundry executes this conversion entirely within your browser runtime using standard Web APIs. No document, image bytes, metadata, or telemetry are ever uploaded to remote servers or third-party analytical endpoints.
          </p>
        </article>

        <article class="tool-section-card">
          <h3 class="tool-section-title">Frequently asked questions</h3>
          <div class="faq-list">
            ${faqsHtml}
          </div>
        </article>

        <article class="tool-section-card">
          <h3 class="tool-section-title">Related conversion utilities</h3>
          <div class="related-tools-grid">
            ${relatedCardsHtml}
            <a href="/tools/" class="related-tool-card" style="border-style: dashed;">
              <span>Explore All Tools</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </article>
      </section>
    </main>

    ${footerHtml}

    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`;
}

function generateToolsDirectoryHtml(baseUrl = '') {
  const canonicalTag = renderCanonical('/tools/', baseUrl);
  const ogTwitterTags = renderOpenGraphAndTwitter({
    title: 'All File Conversion Tools — FormatFoundry',
    description: 'Browse all 16 client-side file conversion tools for raster images, vector SVGs, JSON, CSV, TSV, and Markdown.',
    path: '/tools/',
    baseUrl
  });

  const directorySchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'All File Conversion Tools',
      url: baseUrl ? `${baseUrl}/tools/` : '/tools/',
      description: 'Directory of all 16 client-side conversion tools in FormatFoundry.'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl ? `${baseUrl}/` : '/'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'All Tools',
          item: baseUrl ? `${baseUrl}/tools/` : '/tools/'
        }
      ]
    }
  ];

  const jsonLdTag = renderJsonLd(directorySchema);
  const headerHtml = renderHeader('/tools/');
  const footerHtml = renderFooter();

  const categories = Object.values(TOOL_CATEGORIES);

  const sectionsHtml = categories
    .map((cat) => {
      const catTools = TOOLS.filter((t) => t.category === cat.id);
      if (catTools.length === 0) return '';

      const cardsHtml = catTools
        .map(
          (tool) => `
            <a href="${tool.path}" class="tool-card">
              <div class="tool-card-top">
                <div class="tool-card-header">
                  <span class="tool-card-title">${escapeHtml(tool.name)}</span>
                  <span class="tool-badge">${escapeHtml(tool.badgeFrom)} &rarr; ${escapeHtml(tool.badgeTo)}</span>
                </div>
                <p class="tool-card-desc">${escapeHtml(tool.metaDescription)}</p>
              </div>
              <span class="tool-card-action">Open Tool <span aria-hidden="true">&rarr;</span></span>
            </a>
          `
        )
        .join('');

      return `
        <section class="tools-category-section" data-category="${cat.id}">
          <div class="tools-category-header">
            <h2 class="tools-category-title">${escapeHtml(cat.label)}</h2>
            <p class="tools-category-desc">${escapeHtml(cat.description)}</p>
          </div>
          <div class="tools-grid">
            ${cardsHtml}
          </div>
        </section>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>All File Conversion Tools — FormatFoundry</title>
    <meta
      name="description"
      content="Browse all 16 client-side file conversion tools in FormatFoundry. Convert raster images, SVGs, JSON, CSV, TSV, and Markdown locally with zero server uploads."
    />
    ${canonicalTag}
    ${ogTwitterTags}
    ${jsonLdTag}
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232B4C6F' stroke-width='2'><rect x='3' y='3' width='18' height='18' rx='3'/><path d='M8 12h8M12 8v8'/></svg>" />
    <link rel="stylesheet" href="/src/styles/main.css" />
  </head>
  <body data-page="tools">
    ${headerHtml}

    <main class="main-content">
      <nav class="breadcrumb-nav" aria-label="Breadcrumb">
        <ol class="breadcrumb-list">
          <li class="breadcrumb-item">
            <a href="/" class="breadcrumb-link">Home</a>
            <span class="breadcrumb-separator" aria-hidden="true">/</span>
          </li>
          <li class="breadcrumb-item">
            <span class="breadcrumb-current" aria-current="page">All Tools</span>
          </li>
        </ol>
      </nav>

      <section class="intro-section">
        <h1 class="intro-title">All File Conversion Tools</h1>
        <p class="intro-subtitle">
          Every tool below processes files directly in your browser with zero remote server uploads, absolute privacy, and instant downloads.
        </p>
      </section>

      <div class="tools-search-wrapper">
        <input
          type="search"
          id="tools-search"
          class="tools-search-input"
          placeholder="Filter tools by format or keyword (e.g. png, svg, json, csv)..."
          aria-label="Filter tools"
        />
      </div>

      <div class="tools-directory">
        ${sectionsHtml}
      </div>

      <section class="info-panel" id="privacy">
        <h2 class="info-title">Privacy &amp; Local Processing Guarantee</h2>
        <p class="info-text">
          FormatFoundry performs all byte sniffing, canvas image processing, data serialization, and document compilation strictly inside your browser’s sandboxed JavaScript runtime. No byte of your files is ever uploaded to a remote server or external service.
        </p>
      </section>
    </main>

    ${footerHtml}

    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`;
}

function generateHomepageHtml(baseUrl = '') {
  const canonicalTag = renderCanonical('/', baseUrl);
  const ogTwitterTags = renderOpenGraphAndTwitter({
    title: 'FormatFoundry — Client-Side File & Data Converter',
    description: 'FormatFoundry converts images (PNG, JPEG, WebP), SVGs, structured data (JSON, CSV, TSV), and Markdown documents locally in your browser with zero file uploads, absolute privacy, and instant downloads.',
    path: '/',
    baseUrl
  });

  const homeSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'FormatFoundry',
      url: baseUrl ? `${baseUrl}/` : '/',
      description: 'Universal client-side file and data converter processing images, SVGs, tabular data, and documents in browser memory.'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'FormatFoundry',
      url: baseUrl ? `${baseUrl}/` : '/',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript and HTML5 Canvas support',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      featureList: 'Client-side image conversion, SVG rasterization, JSON/CSV/TSV transformation, Markdown compilation, ZIP archive bundling'
    }
  ];

  const jsonLdTag = renderJsonLd(homeSchema);
  const headerHtml = renderHeader('/');
  const footerHtml = renderFooter();

  const popularSlugs = ['png-to-jpg', 'png-to-webp', 'svg-to-png', 'json-to-csv', 'csv-to-json', 'image-inspector'];
  const popularCardsHtml = popularSlugs
    .map((slug) => {
      const tool = TOOLS.find((t) => t.slug === slug);
      if (!tool) return '';
      return `
        <a href="${tool.path}" class="tool-card">
          <div class="tool-card-top">
            <div class="tool-card-header">
              <span class="tool-card-title">${escapeHtml(tool.name)}</span>
              <span class="tool-badge">${escapeHtml(tool.badgeFrom)} &rarr; ${escapeHtml(tool.badgeTo)}</span>
            </div>
            <p class="tool-card-desc">${escapeHtml(tool.metaDescription)}</p>
          </div>
          <span class="tool-card-action">Open Tool <span aria-hidden="true">&rarr;</span></span>
        </a>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FormatFoundry — Client-Side File &amp; Data Converter</title>
    <meta
      name="description"
      content="FormatFoundry converts images (PNG, JPEG, WebP), SVGs, structured data (JSON, CSV, TSV), and Markdown documents locally in your browser with zero file uploads, absolute privacy, and instant downloads."
    />
    ${canonicalTag}
    ${ogTwitterTags}
    ${jsonLdTag}
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232B4C6F' stroke-width='2'><rect x='3' y='3' width='18' height='18' rx='3'/><path d='M8 12h8M12 8v8'/></svg>" />
    <link rel="stylesheet" href="/src/styles/main.css" />
  </head>
  <body>
    ${headerHtml}

    <main class="main-content">
      <section class="intro-section">
        <h1 class="intro-title">Universal client-side file &amp; data converter</h1>
        <p class="intro-subtitle">
          Convert raster images (PNG, JPEG, WebP), rasterize vector SVGs, transform structured data (JSON, CSV, TSV), and compile sanitized Markdown directly inside your browser. All processing executes in local memory with zero remote uploads, zero analytics tracking, and no external servers.
        </p>
      </section>

      <section class="workspace-section" id="workspace" aria-labelledby="workspace-heading">
        <h2 id="workspace-heading" class="sr-only">Conversion Workspace</h2>
        <div id="dropzone" class="dropzone" tabindex="0" role="region" aria-label="File upload dropzone"></div>
        <div id="staged-container"></div>
      </section>

      <section class="tools-category-section" style="margin-top: var(--space-4);">
        <div class="tools-category-header" style="flex-direction: row; justify-content: space-between; align-items: baseline;">
          <div>
            <h2 class="tools-category-title">Popular Dedicated Tools</h2>
            <p class="tools-category-desc">Dedicated converter landing pages with preconfigured format options.</p>
          </div>
          <a href="/tools/" class="btn-secondary" style="font-size: var(--font-size-xs);">View All 16 Tools &rarr;</a>
        </div>
        <div class="tools-grid">
          ${popularCardsHtml}
        </div>
      </section>

      <section class="info-panel" id="privacy">
        <h2 class="info-title">Privacy &amp; Local Processing Guarantee</h2>
        <p class="info-text">
          FormatFoundry performs all byte sniffing, canvas image processing, data serialization, and document compilation strictly inside your browser’s sandboxed JavaScript runtime. No byte of your files is ever uploaded to a remote server or external service.
        </p>
      </section>

      <section class="info-panel" id="about">
        <h2 class="info-title">Honest Output Guarantees</h2>
        <p class="info-text">
          Conversions preserve structural integrity. Raster images maintain exact pixel dimensions. JSON formatting enforces clean two-space indentation or minification. Delimited data conversions strictly preserve string values without unintended type coercion. Markdown compiles to valid, sanitized HTML.
        </p>
      </section>
    </main>

    ${footerHtml}

    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`;
}

function generateSitemapXml(baseUrl = '') {
  if (!baseUrl) {
    return null;
  }

  const configPath = path.resolve(rootDir, 'src', 'config', 'tools-config.js');
  const homePath = path.resolve(rootDir, 'index.html');
  const toolsPath = path.resolve(rootDir, 'tools', 'index.html');

  const defaultDate = getReliableDate(configPath);
  const homeDate = getReliableDate(homePath);
  const toolsDate = getReliableDate(toolsPath);

  const urls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'weekly', lastmod: homeDate },
    { loc: `${baseUrl}/tools/`, priority: '0.9', changefreq: 'weekly', lastmod: toolsDate }
  ];

  for (const tool of TOOLS) {
    const toolFile = path.resolve(rootDir, tool.slug, 'index.html');
    urls.push({
      loc: `${baseUrl}${tool.path}`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: fs.existsSync(toolFile) ? getReliableDate(toolFile) : defaultDate
    });
  }

  const urlEntries = urls
    .map(
      (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;
}

function generateRobotsTxt(baseUrl = '') {
  if (!baseUrl) {
    return `User-agent: *
Allow: /
`;
  }

  return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
}

export function buildPages(options = {}) {
  const baseUrl = getBaseUrl(options.siteUrl);

  const toolsDir = path.resolve(rootDir, 'tools');
  if (!fs.existsSync(toolsDir)) {
    fs.mkdirSync(toolsDir, { recursive: true });
  }
  fs.writeFileSync(path.resolve(toolsDir, 'index.html'), generateToolsDirectoryHtml(baseUrl), 'utf-8');

  for (const tool of TOOLS) {
    const toolDir = path.resolve(rootDir, tool.slug);
    if (!fs.existsSync(toolDir)) {
      fs.mkdirSync(toolDir, { recursive: true });
    }
    fs.writeFileSync(path.resolve(toolDir, 'index.html'), generateToolPageHtml(tool, baseUrl), 'utf-8');
  }

  fs.writeFileSync(path.resolve(rootDir, 'index.html'), generateHomepageHtml(baseUrl), 'utf-8');

  const publicDir = path.resolve(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapContent = generateSitemapXml(baseUrl);
  const robotsContent = generateRobotsTxt(baseUrl);

  const publicSitemap = path.resolve(publicDir, 'sitemap.xml');
  const rootSitemap = path.resolve(rootDir, 'sitemap.xml');
  const distDir = path.resolve(rootDir, 'dist');
  const distSitemap = path.resolve(distDir, 'sitemap.xml');
  const distRobots = path.resolve(distDir, 'robots.txt');

  if (sitemapContent) {
    fs.writeFileSync(publicSitemap, sitemapContent, 'utf-8');
    fs.writeFileSync(rootSitemap, sitemapContent, 'utf-8');
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(distSitemap, sitemapContent, 'utf-8');
    }
  } else {
    if (fs.existsSync(publicSitemap)) fs.unlinkSync(publicSitemap);
    if (fs.existsSync(rootSitemap)) fs.unlinkSync(rootSitemap);
    if (fs.existsSync(distSitemap)) fs.unlinkSync(distSitemap);
  }

  fs.writeFileSync(path.resolve(publicDir, 'robots.txt'), robotsContent, 'utf-8');
  fs.writeFileSync(path.resolve(rootDir, 'robots.txt'), robotsContent, 'utf-8');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(distRobots, robotsContent, 'utf-8');
  }

  const ogSource = path.resolve(publicDir, 'og-image.png');
  const ogDist = path.resolve(distDir, 'og-image.png');
  if (fs.existsSync(ogSource) && fs.existsSync(distDir)) {
    fs.copyFileSync(ogSource, ogDist);
  }

  return {
    toolCount: TOOLS.length,
    pagesGenerated: TOOLS.length + 2,
    hasBaseUrl: Boolean(baseUrl),
    baseUrl
  };
}

if (process.argv[1] && process.argv[1].endsWith('build-seo-pages.js')) {
  const result = buildPages();
  console.log(`Generated ${result.pagesGenerated} static pages and sitemap/robots (baseUrl: ${result.baseUrl || 'Not configured'})`);
}
