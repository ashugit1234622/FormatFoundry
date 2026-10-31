# FormatFoundry — Strategic SEO Action Plan

**Audited Property:** `https://formatfoundry.site/`  
**Current SEO Health Score:** **79 / 100**  
**Target SEO Health Score:** **95 / 100**  
**Date:** October 30, 2026  

---

## Synthesis Methodology

This plan synthesizes multi-category technical, content, schema, performance, and generative search diagnostics into a sequenced implementation roadmap. Each recommendation details:
- **First Principle (THINK):** The underlying mechanical reality driving the issue.
- **Systemic Dependency (CONNECT-system):** What it unblocks or relies upon.
- **Falsifiability Check (ACCEPT):** How to conclusively verify whether the fix succeeded or failed.
- **Leading Indicator (GROW):** The early metric to monitor without re-running full audits.

---

## Phase 1: Critical Fixes & Technical Consolidation (Week 1)

### 1. Resolve CSP Violations & Self-Host Google Fonts
- **Priority:** Critical (P0)
- **First Principle (THINK):** Browsers block network requests that violate the `Content-Security-Policy` HTTP header. FormatFoundry declares `style-src 'self' 'unsafe-inline'` and `font-src 'self'`, but `src/styles/main.css` executes `@import url('https://fonts.googleapis.com/...')`. Furthermore, Cloudflare Web Analytics beacon script is blocked by `script-src 'self'`.
- **Action:**
  1. Download `Plus Jakarta Sans` and `JetBrains Mono` as WOFF2 files into `src/assets/fonts/`.
  2. Declare them via local `@font-face` rules in `src/styles/fonts.css` and remove the `@import` line from `main.css`.
  3. Update `public/_headers` to explicitly permit Cloudflare Analytics if desired:
     ```http
     script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com;
     connect-src 'self' https://cloudflareinsights.com;
     ```
- **Systemic Dependency (CONNECT-system):** Unblocks FCP/LCP performance, eliminates 100% of browser console errors on every page visit, and preserves privacy architecture without external third-party requests.
- **Falsifiability Check (ACCEPT):** Open `https://formatfoundry.site/` in a clean browser session with DevTools Console open. The test passes IF AND ONLY IF zero Content Security Policy violation errors appear in the console.
- **Leading Indicator (GROW):** FCP improves by ~200ms; zero CSP report events logged.

---

### 2. Populate 301 Permanent Redirects for All 38 Tools in `_redirects`
- **Priority:** High (P1)
- **First Principle (THINK):** Search engine crawlers treat trailing-slash and non-trailing-slash URLs as distinct endpoints. Cloudflare Pages currently returns an `HTTP 307 Temporary Redirect` for `/png-to-jpg`, which does not permanently consolidate PageRank or canonical equity.
- **Action:**
  Update `scripts/build-seo-pages.js` to automatically append all 38 tool paths to `public/_redirects`:
  ```text
  /tools /tools/ 301
  /index.html / 301
  /png-to-jpg /png-to-jpg/ 301
  /png-to-webp /png-to-webp/ 301
  /jpg-to-png /jpg-to-png/ 301
  ...
  ```
- **Systemic Dependency (CONNECT-system):** Consolidates external backlinks and internal user navigation onto canonical URLs.
- **Falsifiability Check (ACCEPT):** Run `curl -I https://formatfoundry.site/png-to-jpg`. The test passes IF AND ONLY IF the response status line is `HTTP/1.1 301 Moved Permanently` (or `308 Permanent Redirect`) pointing to `/png-to-jpg/`.
- **Leading Indicator (GROW):** Google Search Console reports zero "Page with redirect" indexing warnings for tool paths.

---

### 3. Deploy AI Agent Discovery Manifest (`/llms.txt`)
- **Priority:** High (P1)
- **First Principle (THINK):** Generative engine bots (Perplexity, ChatGPT, Claude) evaluate `/llms.txt` to discover site capabilities, canonical endpoints, and usage parameters in concise Markdown before deciding whether to cite a domain in answer snippets.
- **Action:**
  Create `public/llms.txt` documenting FormatFoundry's 38 tools, input/output MIME types, and zero-upload client-side architecture.
- **Systemic Dependency (CONNECT-system):** Positions FormatFoundry as the preferred zero-upload utility in LLM search citations.
- **Falsifiability Check (ACCEPT):** Fetch `curl -I https://formatfoundry.site/llms.txt`. The test passes IF AND ONLY IF the response is `HTTP 200` with `Content-Type: text/markdown` or `text/plain`.
- **Leading Indicator (GROW):** Brand citations in Perplexity and ChatGPT Search for queries like "private client-side csv converter".

---

## Phase 2: Schema Modernization & Performance Acceleration (Weeks 2–3)

### 4. Refactor Schema to Linked `@graph` & Purge Deprecated `HowTo`
- **Priority:** Medium (P2)
- **First Principle (THINK):** Google officially deprecated `HowTo` rich results in September 2023. Disconnected top-level schema arrays fail to establish explicit entity relationships between the software, website, and publisher.
- **Action:**
  1. Remove `HowTo` schema block from `scripts/build-seo-pages.js`.
  2. Emit a unified `@graph` containing `Organization` (`#organization`), `WebSite` (`#website`), `WebApplication` (`#app`), and `BreadcrumbList` (`#breadcrumb`) interconnected via `@id`.
- **Systemic Dependency (CONNECT-system):** Trims ~1.2 KB of dead JSON-LD per tool page; establishes knowledge-graph authority with search engines.
- **Falsifiability Check (ACCEPT):** Validate tool URLs through Google Rich Results Test. The test passes IF valid `WebApplication` and `Breadcrumbs` are detected with zero errors and zero deprecated schema warnings.
- **Leading Indicator (GROW):** Rich snippet enhancement signals in Google Search Console.

---

### 5. Implement Speculation Rules API for Instant Navigation
- **Priority:** Medium (P2)
- **First Principle (THINK):** Modern Chromium browsers support `<script type="speculationrules">` to prefetch or prerender pages in the background on hover or touch, cutting subsequent page load latency to 0ms.
- **Action:**
  Insert a speculation rules block into the `<head>` of `index.html` and `tools/index.html` targeting tool routes with `eagerness: "moderate"`.
- **Systemic Dependency (CONNECT-system):** Dramatically elevates UX and Core Web Vitals (INP and navigational LCP).
- **Falsifiability Check (ACCEPT):** Inspect Chrome DevTools > Application > Speculation Rules on `https://formatfoundry.site/`. The test passes when hovering over a tool link initiates a background prefetch/prerender.
- **Leading Indicator (GROW):** Google CrUX 75th percentile LCP drop to < 0.8s.

---

## Phase 3: Content Authority & E-E-A-T Expansion (Month 2)

### 6. Publish Dedicated `/about/` & `/privacy/` Trust Portals
- **Priority:** High (P1)
- **First Principle (THINK):** Google's Quality Rater Guidelines (QRG) evaluate E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) by looking for clear ownership, organizational purpose, and demonstrable technical competence. Homepage anchor hash tags (`#about`) are insufficient for entity validation.
- **Action:**
  1. Build a dedicated `/about/` page: Creator story, architectural philosophy (why client-side matters for data sovereignty), open-source GitHub links, and tech stack details.
  2. Build a dedicated `/privacy/` page: Step-by-step instructions showing users how to verify zero network activity in browser DevTools, complete CSP security policy documentation, and third-party audit readiness.
- **Systemic Dependency (CONNECT-system):** Unblocks high-tier backlinks from privacy directories and tech publications.
- **Falsifiability Check (ACCEPT):** URLs `https://formatfoundry.site/about/` and `https://formatfoundry.site/privacy/` return 200, are listed in `sitemap.xml`, and appear in site navigation.
- **Leading Indicator (GROW):** Increased dwell time on privacy and about pages (> 90 seconds).

---

### 7. Launch Authoritative Technical Pillar Guides
- **Priority:** Medium (P2)
- **First Principle (THINK):** Tool utility pages rank for commercial/transactional terms ("convert png to jpg"), but informational intent ("how to parse RFC 4180 BOM in javascript") requires in-depth reference documentation.
- **Action:**
  Publish the 4 guides planned in `PROMOTION.md`:
  - *Client-Side CSV Parsing: RFC 4180 Escaping, Uneven Rows, and BOMs*
  - *In-Browser Image Transcoding: Canvas vs OffscreenCanvas vs WebCodecs*
  - *Converting Complex Nested JSON to Flat CSV Without Server Uploads*
  - *Sanitizing and Rasterizing SVG in Browser JavaScript*
- **Systemic Dependency (CONNECT-system):** Provides natural, contextual internal link anchors to the corresponding 38 tool pages.
- **Falsifiability Check (ACCEPT):** At least 4 technical articles live under `/guides/`, linked from tools and sitemap.
- **Leading Indicator (GROW):** Organic impressions in GSC for long-tail technical queries.

---

## Phase 4: Monitoring, Citations & Link Earning (Ongoing)

### 8. Ethical Outreach & Directory Placement
- **Action:**
  1. Submit to curated developer lists: *Awesome Privacy*, *Awesome Self-Hosted*, *AlternativeTo* (positioned as private alternative to CloudConvert/ILovePDF).
  2. Share engineering deep-dives on Hacker News (Show HN) and dev.to detailing zero-server file processing.
- **Monitoring Cadence:**
  - Weekly: GSC Coverage and Indexation status.
  - Monthly: Backlink profile check via Moz/Bing Webmaster.
  - Quarterly: Core Web Vitals assessment via CrUX.
