# Technical SEO Specialist Findings — FormatFoundry (formatfoundry.site)

**Audited Domain:** `https://formatfoundry.site/`  
**Date:** October 30, 2026  
**Category Score:** 82 / 100  

---

## 1. Executive Summary

FormatFoundry exhibits exceptional static architectural fundamentals: 100% pre-rendered HTML, instant TTFB via Cloudflare global edge caching, HTTP/3 protocol support, clean semantic markup, and zero broken internal links across its 40 routes. However, two critical technical defects undermine this foundation:
1. **Content Security Policy (CSP) Violations:** Active CSP headers block both Google Fonts stylesheets/fonts and Cloudflare's own injected web analytics beacon, triggering browser console errors on every page view.
2. **Temporary 307 Redirects on Canonical URL Normalization:** Requesting tool paths without a trailing slash (e.g., `/png-to-jpg`) triggers an `HTTP 307 Temporary Redirect` rather than an `HTTP 301 Permanent Redirect`, diluting link equity consolidation across search crawlers.

---

## 2. Evidence & Diagnostics

### Finding 1: CSP Header Blocks Google Fonts and Cloudflare Web Analytics (Severity: Critical)
- **Observed Header (`public/_headers`):**
  ```http
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; worker-src 'self' blob:; connect-src 'self'; frame-ancestors 'none';
  ```
- **Codebase Trigger:**
  - `src/styles/main.css:1`: `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');`
  - Cloudflare edge automatically injects `https://static.cloudflareinsights.com/beacon.min.js`.
- **Runtime Failure (Playwright Headless Chrome):**
  - `Loading the script 'https://static.cloudflareinsights.com/beacon.min.js/...' violates directive "script-src 'self' 'unsafe-inline'". Action blocked.`
  - `Loading the stylesheet 'https://fonts.googleapis.com/css2?...' violates directive "style-src 'self' 'unsafe-inline'". Action blocked.`
  - Fonts at `https://fonts.gstatic.com` are similarly blocked by `font-src 'self'`.
- **Impact:** Failed font requests trigger layout recalculations, FCP delays, and console errors for every visitor; analytics telemetry is silently dropped.

### Finding 2: Missing Trailing-Slash Redirects Return HTTP 307 Instead of HTTP 301 (Severity: High)
- **Observed Behavior:**
  ```bash
  curl -I https://formatfoundry.site/png-to-jpg
  HTTP/1.1 307 Temporary Redirect
  Location: /png-to-jpg/
  ```
- **Root Cause:**
  `public/_redirects` only defines:
  ```text
  /tools /tools/ 301
  /index.html / 301
  ```
  The remaining 38 tool routes fall back to Cloudflare Pages' default non-permanent 307 directory redirect.
- **Impact:** Search engine bots (Googlebot, Bingbot) do not immediately transfer link equity or permanently consolidate URL signals when encountering temporary 307 redirects.

### Finding 3: Sitemaps & robots.txt Alignment (Status: Pass)
- `https://formatfoundry.site/robots.txt` is accessible, specifies `Allow: /`, and advertises `Sitemap: https://formatfoundry.site/sitemap.xml`.
- `https://formatfoundry.site/sitemap.xml` contains all 40 published routes with exact `<lastmod>` (2026-10-24), `<changefreq>`, and `<priority>` weights.
- Probed common invalid paths (`/sitemap_index.xml`, `/wp-sitemap.xml`) correctly returned 404 without soft-404 leaks.

### Finding 4: Security Headers & HTTPS (Status: Pass)
- `X-Frame-Options: DENY` (clickjacking protection).
- `X-Content-Type-Options: nosniff` (MIME sniffing prevention).
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- HTTP to HTTPS automatic 301 redirect enforced at the edge.

---

## 3. Specialist Recommendations

1. **Resolve CSP Violations:**
   - Either self-host `Plus Jakarta Sans` and `JetBrains Mono` as local font assets in `src/assets/fonts/` (eliminates external network hops and guarantees zero-upload privacy), OR
   - Update `public/_headers` to explicitly allow Google Fonts and Cloudflare Insights:
     ```text
     script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com;
     style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
     font-src 'self' https://fonts.gstatic.com;
     connect-src 'self' https://cloudflareinsights.com;
     ```
2. **Populate `public/_redirects` for All 38 Tools:**
   - Update `scripts/build-seo-pages.js` to automatically write 301 redirects for every tool slug to ensure permanent canonical consolidation.
3. **Speculation Rules & Preloads:**
   - Add `<script type="speculationrules">` on the homepage and `/tools/` to prerender top visited tool routes on hover/touch.
