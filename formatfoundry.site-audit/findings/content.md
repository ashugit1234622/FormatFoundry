# Content Quality & E-E-A-T Specialist Findings — FormatFoundry (formatfoundry.site)

**Audited Domain:** `https://formatfoundry.site/`  
**Date:** October 30, 2026  
**Category Score:** 76 / 100  

---

## 1. Executive Summary

FormatFoundry’s content stands out for its high technical accuracy and complete absence of generic AI hallucination or fluffy filler. Scorers rated the content at **78–81 / 100** for information density and factual integrity. Descriptions accurately explain client-side mechanics: HTML5 Canvas compositing, RFC 4180 delimiter escaping, DOMPurify sanitization, and in-memory WebCodecs / blobs.

However, content authority is constrained by two primary factors:
1. **Templated Structural Repetition:** Across the 38 tool landing pages, sections ("How it Works", "Technical Specifications", "FAQ") share identical structural templates and repetitive phrasing ("in your browser with zero server uploads"), which Google's Helpful Content System may flag as programmatic scale.
2. **Missing Entity & Author Credentials (E-E-A-T):** No engineering byline, author profile, or standalone `/about/` page validates who built the converter engines or explains the cryptographic privacy guarantees.

---

## 2. Evidence & Diagnostics

### Finding 1: Repetition Score & Programmatic Pattern (Severity: Medium)
- **Tool Page Token Analysis (`content_quality.py` on `png-to-jpg`):**
  - Unique tokens: 365 / Total tokens: 1,431.
  - Repetition score: 37 / 100 (Flag: `repetitive`).
  - Filler score: 0 / 100 (Zero filler words).
  - AI pattern score: 0 / 100 (Zero generic AI cliches).
- **Observation:** The repetition is caused by identical boilerplate privacy paragraphs across every tool and identical 3-step procedural descriptions ("Select or drag and drop one or more files into the upload area...").
- **Risk:** Search engines reward unique value per URL. When 38 URLs share 70% common template language, indexation velocity slows down.

### Finding 2: E-E-A-T & Entity Validation Gaps (Severity: High)
- **Experience & Expertise:**
  - The repo includes an excellent strategy document (`PROMOTION.md`) proposing authoritative technical articles (e.g., *"Client-Side CSV Parsing: Handling RFC 4180 Escaping, Uneven Rows, and BOMs Without Server Uploads"*). However, none of these guides are yet published on the live site!
  - Users have no visible author bio, GitHub project link, or architectural whitepaper explaining *how* local processing is proven.
- **Authoritativeness & Trustworthiness:**
  - Missing standalone `/about/` and `/privacy/` pages. Currently, "About" and "Privacy" in the header link to hash fragments (`#about`, `#privacy`) on the homepage containing only 2–3 brief sentences.
  - No contact email, security disclosure policy, or issue reporting link.

---

## 3. Specialist Recommendations

1. **Publish Dedicated Reference Guides (Pillar Content):**
   - Implement the planned articles from `PROMOTION.md` under `/guides/` or `/blog/`:
     - *Client-Side CSV Parsing & RFC 4180* (links to `/csv-to-json/` and `/csv-to-tsv/`).
     - *Next-Gen In-Browser Image Transcoding* (links to `/png-to-webp/` and `/jpg-to-png/`).
     - *Sanitizing Untrusted SVGs in Browser Memory* (links to `/svg-to-png/`).
   - These provide deep contextual link targets that build authentic topical authority.
2. **Enrich Tool Pages with Format Comparison Matrices:**
   - Add a unique 3-to-4 row comparison table to each tool (e.g., for `png-to-jpg`: Alpha transparency support, typical compression ratio, color gamut, browser decoding speeds).
   - Add interactive or tabular conversion benchmarks to eliminate thin-content flags.
3. **Build Dedicated `/about/` & `/privacy/` Pages:**
   - Create a dedicated `/about/` page highlighting the lead engineer/creator, motivation for client-side privacy, open-source repository link, and tech stack.
   - Expand `/privacy/` to document the CSP sandbox policy, zero-cookie stance, and cryptographic privacy guarantees.
