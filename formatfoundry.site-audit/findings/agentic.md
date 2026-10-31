# Agentic Readiness Specialist Findings — FormatFoundry (formatfoundry.site)

**Audited Domain:** `https://formatfoundry.site/`  
**Date:** October 30, 2026  
**Category Score:** 70 / 100  

---

## 1. Executive Summary

Autonomous AI agents (such as Claude Code, OpenAI Operator, Perplexity, and local browser agents) increasingly perform web navigation and programmatic file operations directly. FormatFoundry scores strongly on baseline accessibility:
- Server-rendered HTML contains 359 words of core content accessible without executing JavaScript.
- Clean semantic DOM hierarchy with proper accessibility landmark regions (`banner`, `main`, `navigation`, `contentinfo`).
- 404 probes return strict HTTP 404 status codes (preventing agent soft-404 navigation loops).

Key areas for agentic optimization include:
1. Publishing `/llms.txt` and `ai-catalog.json`.
2. Providing a clean Markdown alternate representation for autonomous fetchers.

---

## 2. Evidence & Diagnostics

### Finding 1: Core Content Accessible Without JavaScript (Status: Pass)
- `server-rendered`: **Pass** (`words_without_js: 359`, `js_shell_marker: false`).
- Text content is pre-rendered in static HTML files during build time. Even when an agent or scraper disables JavaScript, tool instructions, FAQs, category links, and descriptions are fully readable.

### Finding 2: AI User Agent Probing (`agentic_check.py`)
- `robots-ai-groups`: Pass (all agents fall through to wildcard `*`).
- `robots-user-agents`: Pass (no root blocks for `Claude-User`, `ChatGPT-User`, `Perplexity-User`, `Google-Agent`).
- `http-404`: Pass (probed random path returned real 404, not catch-all 200).
- `markdown-delivery`: Info (no `.md` alternates or `Vary: Accept` headers).

---

## 3. Specialist Recommendations

1. **Serve Content-Negotiated Markdown:**
   - Allow agents that request `Accept: text/markdown` or fetch `/index.md` / `/tools/index.md` to receive structured Markdown versions of tool specifications.
2. **Expose Tool Signatures:**
   - Document supported inputs and output MIME types in a standard machine-readable format (`/llms.txt`).
