# Full Website SEO Audit Report — FormatFoundry

**Target Domain:** `https://formatfoundry.site/`  
**Overall SEO Health Score:** **79 / 100**  
**Detected Industry:** Web Utility / Free SaaS (Client-Side File Converters)  
**Total Published Routes Audited:** 40 (Home, Tools Directory, and 38 Dedicated Tool Landing Pages)  
**Date of Audit:** October 30, 2026  
**Auditor Engine:** claude-seo v2.5.0 Orchestration Suite  

---

## 1. Executive Summary

FormatFoundry operates a high-utility, 100% client-side file and structured data conversion engine across 38 distinct format pairs. Because file processing is executed exclusively in the user’s local browser memory (HTML5 Canvas, DOMPurify, WebCodecs, and Blobs), FormatFoundry possesses a distinct competitive advantage in data privacy, zero server operational latency, and zero cloud bandwidth costs.

From an SEO architecture perspective, the codebase demonstrates disciplined software engineering:
- **Zero Client-Side Blank Shells:** All 40 routes are fully pre-rendered static HTML with rich semantic tags and zero reliance on client-side JS rendering for crawler discovery.
- **Flawless Routing Infrastructure:** Clean URLs with self-referencing canonicals, an XML sitemap covering 100% of routes, and edge-level HTTP/3 delivery via Cloudflare.
- **Zero AI Hallucination/Fluff:** Content quality scores **78–81 / 100** for direct, fluff-free technical explanations.

However, several technical and structural issues prevent the site from reaching its full organic and AI search potential:
1. **Critical CSP Blocking Google Fonts & Cloudflare Beacon:** Active HTTP CSP headers block the Google Fonts stylesheet imported in CSS and block Cloudflare's injected analytics beacon, causing console errors on every page view.
2. **Temporary 307 Redirects on URL Normalization:** Omitting a trailing slash (e.g. `/png-to-jpg`) triggers an `HTTP 307 Temporary Redirect` rather than an `HTTP 301 Permanent Redirect`, diluting crawler link consolidation.
3. **Deprecated Schema Markup:** Google-deprecated `HowTo` schema and retired `FAQPage` SERP markup are emitted on all 38 tool landing pages.
4. **Missing AI Discovery Layer:** No `/llms.txt` or structured Markdown delivery for autonomous agents and LLM answer engines (Perplexity, ChatGPT Search, Claude).

---

## 2. Category Score Breakdown

| Category | Weight | Score | Weighted Contribution |
| :--- | :---: | :---: | :---: |
| **Technical SEO** | 22% | 82 / 100 | 18.04 |
| **Content Quality & E-E-A-T** | 23% | 76 / 100 | 17.48 |
| **On-Page SEO** | 20% | 88 / 100 | 17.60 |
| **Schema & Structured Data** | 10% | 72 / 100 | 7.20 |
| **Performance (Core Web Vitals)** | 10% | 78 / 100 | 7.80 |
| **AI Search Readiness (GEO & Agentic)** | 10% | 68 / 100 | 6.80 |
| **Images SEO** | 5% | 75 / 100 | 3.75 |
| **TOTAL HEALTH SCORE** | **100%** | **79 / 100** | **78.67** |

---

## 3. Top 5 Critical Issues & Top 5 Quick Wins

### Top 5 Critical Issues
1. **CSP Font & Script Violations:** `public/_headers` restricts `style-src` and `font-src` to `'self'`, blocking `@import url('https://fonts.googleapis.com/...')` in `main.css` and blocking Cloudflare's analytics beacon.
2. **HTTP 307 on Non-Trailing-Slash Requests:** Only `/tools` and `/index.html` have 301 rules in `public/_redirects`; all other 38 tool URLs receive 307 temporary redirects.
3. **Outdated Schema Vocabulary:** Deprecated `HowTo` schema and retired `FAQPage` markup inflate JSON-LD without providing Google rich snippets.
4. **CSS Render Waterfall:** `@import` inside `main.css` introduces a sequential request waterfall that delays First Contentful Paint.
5. **Missing Entity & Author Credentials:** No standalone `/about/` or `/privacy/` page validates who authored the engines or provides independent proof of zero-upload privacy.

### Top 5 Quick Wins
1. **Self-Host Fonts:** Drop local WOFF2 files into `src/assets/fonts/` and use local `@font-face` rules. Instantly resolves CSP errors and cuts FCP by ~200ms.
2. **Expand `_redirects`:** Add all 38 tool routes into `public/_redirects` to enforce `301 Permanent Redirects`.
3. **Deploy `public/llms.txt`:** Provide LLMs and AI crawlers with a clean, structured index of all conversion tools and client-side privacy boundaries.
4. **Prune Deprecated Schema:** Remove `HowTo` schema from `scripts/build-seo-pages.js` and connect entities via a unified `@graph`.
5. **Add Speculation Rules:** Insert `<script type="speculationrules">` into the root and tools index pages for instant hover prerendering.

---

## 4. In-Depth Category Assessments

### 4.1. Technical SEO (Score: 82/100)
- **Crawlability & Indexability:** 100% crawlable. `robots.txt` specifies `Allow: /` and advertises `sitemap.xml`.
- **Sitemap Architecture:** `sitemap.xml` contains all 40 URLs with exact `<lastmod>` timestamps and clean canonical paths.
- **Protocol & Caching:** Cloudflare HTTP/3 (`h3=":443"`), `zstd` compression, global edge cache hit ratio.
- **Edge Security Headers:** Strict transport, nosniff, frame-ancestors deny, strict referrer policy.
- *Detailed Report:* See [findings/technical.md](findings/technical.md).

### 4.2. Content Quality & E-E-A-T (Score: 76/100)
- **Factual Integrity:** Scored 78–81/100 on automated quality evaluators with 0 filler words and 0 generic AI phrasing.
- **Repetition Risk:** Shared boilerplate privacy and upload instructions across 38 tools triggered a repetition score of 37.
- **E-E-A-T Missing Elements:** Author engineer byline, organization profile, and publication of the planned in-depth guides (RFC 4180, SVG security, WebCodecs) are pending.
- *Detailed Report:* See [findings/content.md](findings/content.md).

### 4.3. On-Page SEO (Score: 88/100)
- **Meta Tags:** All 40 pages feature unique, keyword-targeted `<title>` and `<meta name="description">` tags within standard lengths.
- **Heading Structure:** Semantic single `<h1>` followed by logical `<h2>` and `<h3>` tags.
- **Breadcrumb Navigation:** Complete HTML visual breadcrumbs paired with JSON-LD `BreadcrumbList`.
- **Social Metadata:** Complete Open Graph and Twitter Card tags linked to verified 1200x630px social images.

### 4.4. Schema & Structured Data (Score: 72/100)
- **Current Coverage:** `WebSite` and `WebApplication` on root; `CollectionPage` and `ItemList` on `/tools/`; `BreadcrumbList`, `WebApplication`, `FAQPage`, and `HowTo` on tool pages.
- **Action Required:** Modernize into a connected `@graph` architecture with an `Organization` publisher node, and remove deprecated `HowTo` blocks.
- *Detailed Report:* See [findings/schema.md](findings/schema.md).

### 4.5. Performance & Core Web Vitals (Score: 78/100)
- **Strengths:** Pure static assets, tiny HTML footprint (< 14 KB), sub-50ms TTFB.
- **Bottlenecks:** CSS `@import` render-blocking cascade and CSP font blocking. Preload checklist scored 50/100 due to missing modern speculation rules.
- *Detailed Report:* See [findings/performance.md](findings/performance.md).

### 4.6. AI Search Readiness (GEO & Agentic) (Score: 68/100)
- **Strengths:** Full server-side pre-rendering allows all user agents to parse core content without JavaScript execution. Clean semantic landmark regions.
- **Gaps:** No `/llms.txt`, no Markdown alternate representation (`Accept: text/markdown`), and no outbound citations to canonical RFCs.
- *Detailed Reports:* See [findings/geo.md](findings/geo.md) and [findings/agentic.md](findings/agentic.md).

### 4.7. Search Experience Optimization (Score: 84/100)
- **User Intent:** Aligns directly with transactional format conversion intent with zero sign-up friction.
- **Enhancement:** Add a 1-click "Verify Zero Server Uploads in DevTools" callout to substantiate privacy claims, and provide sample data buttons for instant testing.
- *Detailed Report:* See [findings/sxo.md](findings/sxo.md).

---

## 5. Artifact Directory Manifest

All audit assets and specialist reports are persisted under `formatfoundry.site-audit/`:
- `FULL-AUDIT-REPORT.md`: This comprehensive document.
- `ACTION-PLAN.md`: Sequenced implementation roadmap with falsifiability checks.
- `audit-data.json`: Machine-readable audit data envelope.
- `findings/technical.md`: Deep technical & CSP analysis.
- `findings/content.md`: E-E-A-T and content density review.
- `findings/schema.md`: Schema deprecations and `@graph` template.
- `findings/performance.md`: Font cascades and speculation rules.
- `findings/visual.md`: Desktop & mobile responsive evaluations.
- `findings/geo.md`: AI Overviews and citation optimization.
- `findings/agentic.md`: Autonomous agent and `/llms.txt` readiness.
- `findings/sxo.md`: Search experience and persona alignment.
- `screenshots/formatfoundry_site_desktop.png`: 1920x1080 desktop render.
- `screenshots/formatfoundry_site_mobile.png`: 375x667 mobile render.
