# Schema & Structured Data Specialist Findings — FormatFoundry (formatfoundry.site)

**Audited Domain:** `https://formatfoundry.site/`  
**Date:** October 30, 2026  
**Category Score:** 72 / 100  

---

## 1. Executive Summary

FormatFoundry implements JSON-LD on all 40 published routes with zero syntax errors. The structured data includes `WebSite` and `WebApplication` on the root, `CollectionPage` and `ItemList` on `/tools/`, and `BreadcrumbList`, `WebApplication`, `FAQPage`, and `HowTo` across all 38 tool routes.

However, the implementation suffers from two major search deprecations and an entity graph disconnect:
1. **Deprecated `HowTo` Schema:** Deployed across all 38 tool pages despite Google deprecating HowTo rich results in September 2023.
2. **Retired `FAQPage` SERP Features:** Google retired FAQ rich results for standard websites in 2023 and completed the universal phase-out by May 2026.
3. **Disconnected Anonymous Objects:** JSON-LD is serialized as an array of unconnected top-level objects without URI-based `@id` linkages or an `Organization` publisher node.

---

## 2. Evidence & Diagnostics

### Finding 1: Deprecated `HowTo` Markup on All Tool Pages (Severity: Medium)
- **Current Output (`scripts/build-seo-pages.js:191-204`):**
  ```json
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to use PNG to JPG Converter",
    "step": [ ... ]
  }
  ```
- **Standard Status:** Google Search officially deprecated `HowTo` rich snippets in September 2023 across desktop and mobile. While syntactically valid schema.org, it yields zero SERP features and inflates DOM JSON-LD size without indexing benefit.

### Finding 2: `FAQPage` SERP Deprecation (Severity: Low / Info)
- **Current Output:** All 38 tool pages output `FAQPage` schema for their accordion FAQs.
- **Standard Status:** Google restricted FAQ rich results to government and official healthcare authorities in August 2023, and retired all FAQ SERP enhancements globally on May 7, 2026.
- **Guidance:** Do not hastily strip valid schema, but do not rely on it for Google rich snippets. Where applicable, genuine user problem-solving Q&A should migrate toward `QAPage` or community forum structures.

### Finding 3: Lack of Entity Graph Connection (`@graph` / `@id`) (Severity: Medium)
- **Observed Structure:**
  Tool pages render JSON-LD as:
  `[ { "@type": "WebApplication" }, { "@type": "BreadcrumbList" }, { "@type": "FAQPage" }, { "@type": "HowTo" } ]`
- **Issue:**
  The `WebApplication` entity is not linked to the `WebSite` (`https://formatfoundry.site/#website`), the publisher `Organization` (`https://formatfoundry.site/#organization`), or the page itself (`https://formatfoundry.site/png-to-jpg/#webpage`).
  Search engines parse disconnected nodes rather than an interconnected knowledge graph.

---

## 3. Specialist Recommendations

1. **Unify Schemas into a Connected `@graph` Architecture:**
   Update `scripts/build-seo-pages.js` to emit a single `@graph` with explicit `@id` cross-references:
   ```json
   {
     "@context": "https://schema.org",
     "@graph": [
       {
         "@type": "Organization",
         "@id": "https://formatfoundry.site/#organization",
         "name": "FormatFoundry",
         "url": "https://formatfoundry.site/",
         "logo": "https://formatfoundry.site/apple-touch-icon.png",
         "sameAs": ["https://github.com/formatfoundry"]
       },
       {
         "@type": "WebSite",
         "@id": "https://formatfoundry.site/#website",
         "url": "https://formatfoundry.site/",
         "name": "FormatFoundry",
         "publisher": { "@id": "https://formatfoundry.site/#organization" }
       },
       {
         "@type": "WebApplication",
         "@id": "https://formatfoundry.site/png-to-jpg/#app",
         "name": "PNG to JPG Converter",
         "url": "https://formatfoundry.site/png-to-jpg/",
         "applicationCategory": "UtilitiesApplication",
         "operatingSystem": "Any",
         "browserRequirements": "Requires JavaScript and HTML5 Canvas",
         "publisher": { "@id": "https://formatfoundry.site/#organization" },
         "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
       },
       {
         "@type": "BreadcrumbList",
         "@id": "https://formatfoundry.site/png-to-jpg/#breadcrumb",
         "itemListElement": [ ... ]
       }
     ]
   }
   ```
2. **Streamline Schema Vocabulary:**
   - Remove the deprecated `HowTo` block from automated tool generation to trim ~1.2 KB of redundant JSON-LD per page.
