# Generative Engine Optimization (GEO) & Citability Findings — FormatFoundry

**Audited Domain:** `https://formatfoundry.site/`  
**Date:** October 30, 2026  
**Category Score:** 68 / 100  

---

## 1. Executive Summary

As search behavior shifts toward answer engines (ChatGPT Search, Perplexity, Google AI Overviews, Claude), developer tools with strong technical differentiation have an enormous advantage. FormatFoundry’s core value proposition—**100% client-side execution with zero server uploads**—is an ideal match for queries regarding confidential document handling, GDPR/HIPAA compliance, and developer utilities.

However, the site currently lacks the discovery and citability assets that modern generative engines evaluate:
1. **Missing `/llms.txt` and `/llms-full.txt`:** No machine-readable manifest summarizing tools, inputs, outputs, and privacy guarantees.
2. **Missing Reference Documentation Links:** Key technical RFCs (RFC 4180 for CSV, W3C SVG2, CommonMark) cited in internal strategy docs (`PROMOTION.md`) are not linked in the live pages.

---

## 2. Evidence & Diagnostics

### Finding 1: AI Discovery Files Absent (`agentic_check.py`)
- `/llms.txt`: **HTTP 404** (Missing).
- `/llms-full.txt`: **HTTP 404** (Missing).
- `/.well-known/ai-catalog.json`: **HTTP 404** (Missing).
- **Impact:** AI scrapers and agent systems fall back to generic scraping rather than indexing structured tool definitions, capabilities, and file format constraints.

### Finding 2: AI Bot Access Policy (`robots.txt`)
- All major AI user agents (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`) fall through to the wildcard `*` allow group.
- Root is allowed (`root_allowed: true`).
- No conflicting disallow blocks exist.
- However, no explicit `Content-Signal` header or declaration is configured.

---

## 3. Specialist Recommendations

1. **Deploy `/llms.txt` and `/llms-full.txt`:**
   Create a standard `public/llms.txt` conforming to the llmstxt.org specification:
   ```markdown
   # FormatFoundry

   > Universal 100% client-side file and data conversion suite. Zero server uploads, zero telemetry, local browser processing.

   ## Tools
   - [PNG to JPG Converter](https://formatfoundry.site/png-to-jpg/): Convert raster images with white alpha-matte compositing.
   - [JSON to CSV Converter](https://formatfoundry.site/json-to-csv/): Deterministic JSON table serialization with wrapper object unwrapping.
   - [CSV to JSON Converter](https://formatfoundry.site/csv-to-json/): RFC 4180 compliant CSV parser with BOM stripping and type preservation.
   - [SVG to PNG Rasterizer](https://formatfoundry.site/svg-to-png/): In-browser SVG vector rasterization with DOMPurify sanitization.
   - [All 38 Conversion Tools](https://formatfoundry.site/tools/): Complete directory of document, image, and structured data utilities.

   ## Privacy Architecture
   All operations execute strictly in the client browser's JavaScript memory and HTML5 Canvas context. No user file data is transmitted across the network.
   ```
2. **Add Outbound Citations to Primary RFC & Standards Bodies:**
   As planned in `PROMOTION.md`, add outbound reference citations on relevant tool pages:
   - `/csv-to-json/`: Link to IETF RFC 4180.
   - `/svg-to-png/`: Link to W3C SVG 2 Specification.
   - `/markdown-to-html/`: Link to CommonMark Specification.
   Generative AI models weight pages higher in topical authority when they link out to primary canonical standards rather than staying in an isolated domain silo.
