# Performance & Core Web Vitals Specialist Findings — FormatFoundry (formatfoundry.site)

**Audited Domain:** `https://formatfoundry.site/`  
**Date:** October 30, 2026  
**Category Score:** 78 / 100  

---

## 1. Executive Summary

FormatFoundry’s architecture provides outstanding raw speed:
- Pure static HTML generation (zero runtime SSR latency, edge TTFB < 40ms on Cloudflare).
- Modest transfer payloads (~12–14 KB compressed HTML, bundled CSS and JS under 50 KB).
- Zero third-party tracker or ad script overhead.

However, two critical frontend bottlenecks degrade loading and interaction metrics:
1. **Render-Blocking `@import` in CSS Coupled with CSP Font Block:** The CSS file begins with an `@import url(...)` to Google Fonts, creating a sequential render chain. Because the CSP blocks Google Fonts, the browser suffers a font request delay before fallback rendering occurs.
2. **Missing Modern Navigation Acceleration:** Zero Speculation Rules, prerender links, or resource hints (`fetchpriority="high"`, preconnect). Preload audit scored **50 / 100**.

---

## 2. Evidence & Diagnostics

### Finding 1: CSS `@import` Render Chain (Severity: High)
- **File:** `src/styles/main.css:1`
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  ```
- **Performance Impact:**
  1. Browser downloads HTML document.
  2. Browser downloads `/assets/main-DnMCajMx.css`.
  3. Parser discovers `@import` inside the CSS and pauses rendering to request `fonts.googleapis.com`.
  4. Once `fonts.googleapis.com` resolves, browser requests font binaries from `fonts.gstatic.com`.
  5. In this specific deployment, CSP blocks the request at step 3, creating layout shift and font swap delays.
- **Metric Impact:** Directly degrades First Contentful Paint (FCP) and Largest Contentful Paint (LCP).

### Finding 2: Preload & Resource Hint Gaps (Severity: Medium)
- **Preload Checker Audit Result (`preload_check.py`):**
  - Score: **50 / 100**.
  - `speculation_rules`: 0 inline blocks, 0 headers.
  - `preload_hints`: 0.
  - `prerender_links`: 0.
  - `bfcache_signals`: Pass (no unload listeners, no `no-store` headers).
  - `lcp_resource_hints`: No `fetchpriority="high"` elements.

---

## 3. Specialist Recommendations

1. **Eliminate CSS `@import` (Self-Host or Preconnect Fonts):**
   - **Recommended Solution:** Bundle font files locally with WOFF2 and `@font-face` in `src/styles/fonts.css`. This eliminates two cross-origin network handshakes, guarantees font availability offline, satisfies the CSP without external holes, and speeds up FCP by ~200–350ms.
   - **Alternative Solution:** Move the Google Font link to the HTML `<head>` with preconnect:
     ```html
     <link rel="preconnect" href="https://fonts.googleapis.com">
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap">
     ```
2. **Implement Speculation Rules for Instant Tool Navigation:**
   - Add a `<script type="speculationrules">` block to the homepage and `/tools/`:
     ```html
     <script type="speculationrules">
     {
       "prerender": [
         {
           "source": "list",
           "urls": ["/png-to-jpg/", "/png-to-webp/", "/json-to-csv/", "/csv-to-json/"]
         }
       ],
       "prefetch": [
         {
           "source": "document",
           "where": { "and": [{ "href_matches": "/*/" }] },
           "eagerness": "moderate"
         }
       ]
     }
     </script>
     ```
   - This delivers instantaneous zero-millisecond page transitions when users click tools.
