# Visual & Layout Specialist Findings — FormatFoundry (formatfoundry.site)

**Audited Domain:** `https://formatfoundry.site/`  
**Date:** October 30, 2026  
**Category Score:** 75 / 100  

---

## 1. Executive Summary

Headless browser tests (`analyze_visual.py` and `capture_screenshot.py`) confirmed responsive rendering across desktop (1920x1080) and mobile (375x667). Viewport meta tags are correctly configured, touch targets meet spacing guidelines, and horizontal overflow was completely absent.

Key opportunities identified:
1. **Above-the-Fold Actionability:** The immediate initial viewport displays the header and descriptive copy, but the actionable dropzone and conversion workspace require slight downward scrolling or interaction.
2. **Mobile Font Base Sizing:** The base font size measures 15px in standard rendering, slightly under the recommended 16px accessibility threshold.

---

## 2. Evidence & Diagnostics

### Finding 1: Above-the-Fold Analysis (`analyze_visual.py`)
- `h1_visible`: **True** ("Universal client-side file & data converter").
- `cta_visible`: **False** (Primary interactive tool actions sit below introductory explanatory paragraphs).
- `hero_image`: None.
- `desktop_screenshot`: Captured to `formatfoundry.site-audit/screenshots/formatfoundry_site_desktop.png`.
- `mobile_screenshot`: Captured to `formatfoundry.site-audit/screenshots/formatfoundry_site_mobile.png`.

### Finding 2: Mobile Viewport & Typography
- `viewport_meta`: **True** (`width=device-width, initial-scale=1.0`).
- `horizontal_scroll`: **False** (No layout overflow).
- `touch_targets_ok`: **True** (All links and category buttons have adequate tap paddings).
- `base_font_size`: **15px** (Reported `readable: false` against the 16px mobile body baseline).

---

## 3. Specialist Recommendations

1. **Optimize Above-the-Fold Conversion Space:**
   - On tool landing pages, ensure the upload dropzone or file picker button is clearly visible within the first 600px of vertical viewport space.
   - Tighten introductory hero margins so desktop and mobile users see the dropzone without having to scroll.
2. **Normalize Base Font Sizing to 16px:**
   - Update `body { font-size: 1rem; }` where 1rem = 16px, ensuring compliance with mobile typography standards and preventing auto-zoom behaviors in iOS Safari.
