# FormatFoundry — Claude Project Knowledge Base

> This document is the single authoritative context file for the FormatFoundry project.
> Upload this to your Claude Project so Claude has complete knowledge of the site.

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Project Name** | FormatFoundry |
| **Live URL** | https://formatfoundry.site/ |
| **Version** | 0.5.0 (Dedicated Tool Pages) |
| **Stack** | Vite 6 · Vanilla JS (ES Modules) · Cloudflare Pages |
| **Build Command** | `npm run build` (runs `node scripts/build-seo-pages.js` then Vite) |
| **Deploy Target** | Cloudflare Pages (static site) |
| **Tools Count** | 38 dedicated conversion tools across 8 categories |
| **Total Published Routes** | 40 (Home + Tools Directory + 38 Tool Pages) |

---

## 2. Core Architecture Principle

**FormatFoundry is 100% client-side.** All file processing executes in the user's browser using:
- `HTML5 Canvas` — raster image encoding (JPEG, WebP, PNG)
- `DOMPurify` — SVG sanitization before rasterization
- `mammoth.js` — DOCX → HTML extraction
- `pdfjs-dist` — PDF rendering and text extraction
- `pdf-lib` — in-browser PDF generation
- `pptxgenjs` — PowerPoint generation
- `fflate` — client-side ZIP bundling
- `marked` — Markdown → HTML compilation
- `turndown` — HTML → Markdown conversion

**Zero bytes of user files are ever transmitted to a server.** This is the core differentiator.

---

## 3. Tool Categories & 38 Tools

### Categories
| ID | Label | Description |
|---|---|---|
| `document` | Document & PDF Tools | PDFs, DOCX, text files |
| `presentation` | Presentation Tools | PPTX slide decks |
| `markup` | Markup & HTML Tools | HTML and Markdown |
| `image` | Image Converters | PNG, JPEG, WebP raster |
| `svg` | SVG Converters | SVG → raster (PNG/JPG/WebP) |
| `data` | Data Converters | JSON, CSV, TSV |
| `text` | Text Utilities | JSON formatting, Markdown compilation |
| `inspection` | Inspection & Batch Tools | Binary header inspection, ZIP |

### All 38 Tools (slug → name → path)

#### Image Converters
- `png-to-jpg` → PNG to JPG Converter → `/png-to-jpg/`
- `png-to-webp` → PNG to WebP Converter → `/png-to-webp/`
- `jpg-to-png` → JPG to PNG Converter → `/jpg-to-png/`
- `jpg-to-webp` → JPG to WebP Converter → `/jpg-to-webp/`
- `webp-to-png` → WebP to PNG Converter → `/webp-to-png/`
- `webp-to-jpg` → WebP to JPG Converter → `/webp-to-jpg/`

#### SVG Converters
- `svg-to-png` → SVG to PNG Converter → `/svg-to-png/`
- `svg-to-jpg` → SVG to JPG Converter → `/svg-to-jpg/`
- `svg-to-webp` → SVG to WebP Converter → `/svg-to-webp/`

#### Data Converters
- `json-to-csv` → JSON to CSV Converter → `/json-to-csv/`
- `csv-to-json` → CSV to JSON Converter → `/csv-to-json/`
- `csv-to-tsv` → CSV to TSV Converter → `/csv-to-tsv/`
- `tsv-to-csv` → TSV to CSV Converter → `/tsv-to-csv/`

#### Markup & HTML Tools
- `markdown-to-html` → Markdown to HTML Converter → `/markdown-to-html/`
- `html-to-markdown` → HTML to Markdown Converter → `/html-to-markdown/`

#### Text Utilities
- `json-formatter` → JSON Formatter & Validator → `/json-formatter/`

#### Inspection & Batch
- `image-inspector` → Image Inspector & Metadata Tool → `/image-inspector/`

#### Document & PDF Tools
- `pdf-to-text` → PDF to Text Converter → `/pdf-to-text/`
- `pdf-to-png` → PDF to PNG Converter → `/pdf-to-png/`
- `pdf-to-jpg` → PDF to JPG Converter → `/pdf-to-jpg/`
- `jpg-to-pdf` → JPG to PDF Converter → `/jpg-to-pdf/`
- `png-to-pdf` → PNG to PDF Converter → `/png-to-pdf/`
- `webp-to-pdf` → WebP to PDF Converter → `/webp-to-pdf/`
- `text-to-pdf` → Text to PDF Converter → `/text-to-pdf/`
- `markdown-to-pdf` → Markdown to PDF Converter → `/markdown-to-pdf/`
- `docx-to-html` → Word to HTML Converter → `/docx-to-html/`
- `docx-to-markdown` → Word to Markdown Converter → `/docx-to-markdown/`
- `docx-to-pdf` → Word to PDF Converter → `/docx-to-pdf/`
- `docx-to-text` → Word to Text Extractor → `/docx-to-text/`
- `text-to-docx` → Text to Word Converter → `/text-to-docx/`
- `markdown-to-docx` → Markdown to Word Converter → `/markdown-to-docx/`

#### Presentation Tools
- `jpg-to-pptx` → JPG to PowerPoint Converter → `/jpg-to-pptx/`
- `png-to-pptx` → PNG to PowerPoint Converter → `/png-to-pptx/`
- `webp-to-pptx` → WebP to PowerPoint Converter → `/webp-to-pptx/`
- `text-to-pptx` → Text to PowerPoint Converter → `/text-to-pptx/`
- `markdown-to-pptx` → Markdown to PowerPoint Converter → `/markdown-to-pptx/`
- `pptx-to-text` → PowerPoint to Text Extractor → `/pptx-to-text/`
- `pptx-to-pdf` → PowerPoint to PDF Converter → `/pptx-to-pdf/`

---

## 4. Site URLs & Sitemap Structure

**Homepage:** https://formatfoundry.site/
**Tools Directory:** https://formatfoundry.site/tools/
**Sitemap:** https://formatfoundry.site/sitemap.xml
**Robots:** https://formatfoundry.site/robots.txt

All tool pages: `https://formatfoundry.site/{slug}/`

### robots.txt
```
User-agent: *
Allow: /

Sitemap: https://formatfoundry.site/sitemap.xml
```
All AI user agents (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot) are allowed at root with no disallow rules.

### Sitemap Coverage
All 40 routes are in `sitemap.xml` with `<lastmod>2026-10-24`, proper `<changefreq>`, and `<priority>` weights (homepage 1.0, tools dir 0.9, individual tools 0.8).

---

## 5. HTTP Security Headers (`public/_headers`)

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; worker-src 'self' blob:; connect-src 'self'; frame-ancestors 'none';

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/sitemap.xml
  Cache-Control: public, max-age=3600

/robots.txt
  Cache-Control: public, max-age=3600
```

> ⚠️ **Known CSP Issue:** `font-src 'self'` blocks `fonts.gstatic.com` (Google Fonts) and the CSP blocks Cloudflare analytics beacon.

---

## 6. URL Redirects (`public/_redirects`)

```
/tools /tools/ 301
/index.html / 301
```

> ⚠️ **Known Issue:** Only these two routes have 301 permanent redirects. All 38 tool paths without trailing slashes return HTTP 307 (Cloudflare default). Needs fixing.

---

## 7. Dependencies (`package.json`)

```json
{
  "dependencies": {
    "@aiden0z/pptx-renderer": "^1.4.0",
    "docx": "^9.13.0",
    "dompurify": "^3.4.17",
    "fflate": "^0.8.3",
    "html-to-image": "^1.11.13",
    "mammoth": "^1.13.0",
    "marked": "^18.1.1",
    "pdf-lib": "^1.17.1",
    "pdfjs-dist": "^6.4.299",
    "pptxgenjs": "^4.0.1",
    "turndown": "^7.2.4"
  },
  "devDependencies": {
    "jsdom": "^29.1.1",
    "vite": "^6.2.0"
  }
}
```

---

## 8. Key Source Files & Roles

| File | Purpose |
|---|---|
| `src/config/tools-config.js` | Master tool registry (all 38 tools: slugs, titles, metas, FAQs, features, schema) |
| `scripts/build-seo-pages.js` | Static HTML generator — produces all tool landing pages with JSON-LD, OG tags, breadcrumbs |
| `scripts/audit-seo.js` | Post-build SEO gate — validates 40 routes for missing metas, canonicals, duplicates |
| `src/styles/main.css` | Main stylesheet (imports Google Fonts at line 1 — see CSP issue) |
| `vite.config.js` | Multi-page Vite config discovering all `{slug}/index.html` directories |
| `public/_headers` | Cloudflare Pages response headers |
| `public/_redirects` | Cloudflare Pages redirect rules |
| `sitemap.xml` | XML sitemap for 40 routes |

---

## 9. On-Page SEO Architecture

Every published page includes:
- Unique `<title>` and `<meta name="description">`
- Self-referencing `<link rel="canonical">`
- OpenGraph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
- Twitter Card metadata (`summary_large_image`)
- `1200×630` social image at `/og-image.png`
- Apple Touch Icon (180×180) + PNG favicon (32×32) + SVG favicon
- Semantic HTML: `<header>`, `<main>`, `<nav>`, `<footer>`, `<article>`
- Visible HTML breadcrumbs + matching JSON-LD `BreadcrumbList`

### JSON-LD Schema Per Page Type
| Page | Schema Types |
|---|---|
| Homepage (`/`) | `WebSite` + `WebApplication` + `Offer` |
| Tools Directory (`/tools/`) | `CollectionPage` + `ItemList` (38 items) |
| Tool Pages (`/{slug}/`) | `WebApplication` + `BreadcrumbList` + `FAQPage` + `HowTo` |

---

## 10. SEO Audit Summary (October 30, 2026)

**Overall Health Score: 79 / 100**

| Category | Score |
|---|---|
| Technical SEO | 82/100 |
| Content Quality & E-E-A-T | 76/100 |
| On-Page SEO | 88/100 |
| Schema & Structured Data | 72/100 |
| Performance (Core Web Vitals) | 78/100 |
| AI Search Readiness (GEO) | 68/100 |
| Images SEO | 75/100 |

### Critical Issues (in priority order)
1. **CSP Blocks Google Fonts & Cloudflare Analytics** — self-host fonts as WOFF2 or update CSP
2. **HTTP 307 Temporary Redirects on all 38 tool non-trailing-slash URLs** — add 301 rules in `_redirects`
3. **Deprecated `HowTo` schema on all tool pages** — Google deprecated Sept 2023, remove from build script
4. **CSS `@import` render-blocking waterfall** — delays FCP; self-host or move to HTML `<link>` with preconnect
5. **Missing `/llms.txt`** — AI crawlers (Perplexity, ChatGPT, Claude) cannot find structured capability index
6. **Disconnected schema (no `@graph` / `@id`)** — add `Organization` publisher node with URI-based entity linking
7. **Missing dedicated `/about/` and `/privacy/` pages** — hash anchors are insufficient for E-E-A-T

### Quick Wins
1. Self-host fonts → eliminates CSP errors + speeds up FCP by ~200ms
2. Add 38 tool 301 redirect rules to `public/_redirects`
3. Deploy `public/llms.txt` for AI search engine citations
4. Remove `HowTo` schema from build script, introduce `@graph` linking
5. Add `<script type="speculationrules">` for hover prerendering

---

## 11. Planned Content Improvements

Technical pillar articles planned for `/guides/`:
1. *Client-Side CSV Parsing: RFC 4180 Escaping, Uneven Rows, and BOMs Without Server Uploads*
2. *Next-Gen Image Transcoding: Canvas vs. OffscreenCanvas vs. WebCodecs for Browser Compression*
3. *Converting Complex Nested JSON into Flat CSV: Best Practices for Wrapper Objects and Record Arrays*
4. *Sanitizing and Rasterizing SVG in Browser JavaScript Without Security Vulnerabilities*

Link-building strategy:
- Submit to *Awesome Privacy*, *Awesome Self-Hosted*, *AlternativeTo*
- Developer outreach: GitHub, dev.to, Hacker News (Show HN)
- Add outbound citations: IETF RFC 4180, W3C SVG2, CommonMark spec

---

## 12. Test Suite

**157 tests | 11 suites | 0 failures** (as of Oct 30, 2026)

Coverage:
- CSV/JSON/TSV parsing (RFC 4180, BOM stripping, uneven rows)
- Document converters (PDF, DOCX, PPTX — all engines end-to-end)
- SVG sanitization and rasterization
- Static SEO page generation correctness (40 routes)
- Cloudflare redirect rules validation
- FileQueue, ConversionRegistry, and tool configuration
- Tools filter/search logic

---

## 13. Cloudflare Deployment Info

- Platform: **Cloudflare Pages** (static site)
- Edge: **HTTP/3 enabled**, global CDN, `zstd`/`gzip` compression
- Cache: `/assets/*` cached with 1-year immutable cache; HTML served with `max-age=0, must-revalidate`
- Worker: Handles HTTPS redirect, www→apex redirect, legacy workers.dev redirect
- Analytics: Cloudflare Web Analytics (beacon token: `31e70183fe374fa09a7c86b32342d791`)

---

*Generated: October 31, 2026 | For use as Claude Project Knowledge file*
