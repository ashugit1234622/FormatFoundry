# FormatFoundry — Production Deployment & Launch Guide

FormatFoundry is a 100% client-side file and data converter built with Vanilla JavaScript, HTML5, CSS3, and Vite. All conversions (raster images, SVGs, JSON, CSV, TSV, and Markdown) execute locally in the user's browser memory. There is no backend, database, server-side code, or external API dependency.

This guide provides step-by-step instructions for deploying FormatFoundry to modern static hosting platforms, configuring production domains, verifying clean directory routing, and submitting sitemaps to Google Search Console.

---

## 1. Build Prerequisites & Commands

### Prerequisites
- Node.js v18.0.0 or higher (v20+ recommended)
- npm v9.0.0 or higher

### Build Commands

```bash
# 1. Install dependencies
npm ci

# 2. Run unit and integration tests (99 tests)
npm test

# 3. Production build with configured custom domain
# Set PUBLIC_SITE_URL to your canonical HTTPS origin (no trailing slash)
PUBLIC_SITE_URL=https://formatfoundry.dev npm run build

# 4. Audit production output
npm run audit

# 5. Local preview of production build
npm run preview
```

### Build Output Structure
The build generates the static output in the `dist/` directory:
- `dist/index.html` — Universal converter homepage
- `dist/tools/index.html` — Searchable tools directory
- `dist/<slug>/index.html` — 16 dedicated tool landing pages (e.g. `dist/png-to-jpg/index.html`)
- `dist/assets/` — Content-hashed, bundled CSS and JavaScript files
- `dist/robots.txt` — Search engine crawler instructions
- `dist/sitemap.xml` — Canonical XML sitemap (only emitted when `PUBLIC_SITE_URL` is set)

---

## 2. Production Domain & Canonical URL Configuration

### How `PUBLIC_SITE_URL` Works
FormatFoundry uses `PUBLIC_SITE_URL` as the single source of truth for production domain configuration.

- **Configured State (`PUBLIC_SITE_URL=https://your-domain.com`):**
  - Generates `<link rel="canonical" href="https://your-domain.com/<path>/" />` in every HTML file.
  - Generates `dist/sitemap.xml` containing all 18 canonical URLs with absolute paths, priority ratings, and update frequencies.
  - Adds `Sitemap: https://your-domain.com/sitemap.xml` to `dist/robots.txt`.
- **Unconfigured State (`PUBLIC_SITE_URL` not set):**
  - Canonical tags are omitted to prevent emitting inaccurate domains.
  - `sitemap.xml` is omitted to prevent search engines from indexing temporary or placeholder URLs.
  - `robots.txt` permits crawling without referencing a non-existent sitemap.

---

## 3. Static Hosting Configurations

FormatFoundry uses directory-based static routing (`/<slug>/index.html`). Every major static hosting provider serves `index.html` for directory requests without requiring server-side rewrite rules.

### A. Cloudflare Pages
1. Connect your Git repository in the Cloudflare dashboard.
2. Build Settings:
   - **Framework preset:** `None` (or `Vite`)
   - **Build command:** `PUBLIC_SITE_URL=https://your-domain.com npm run build`
   - **Build output directory:** `dist`
3. Environment variables:
   - Add `PUBLIC_SITE_URL` with value `https://your-domain.com`.
4. Cloudflare Pages automatically handles directory indexes (`/png-to-jpg/` serves `dist/png-to-jpg/index.html`).

### B. Vercel
1. Import repository into Vercel.
2. Build Settings:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Environment Variables:
   - Key: `PUBLIC_SITE_URL`
   - Value: `https://your-domain.com`
4. Directory routing works out of the box.

### C. Netlify
1. Connect repository in Netlify.
2. Build Settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Environment Variables:
   - Key: `PUBLIC_SITE_URL`
   - Value: `https://your-domain.com`
4. Netlify automatically resolves `/<slug>/` to `/<slug>/index.html`.

### D. GitHub Pages
1. In your GitHub repository settings, navigate to **Pages**.
2. Source: **GitHub Actions**.
3. Create a workflow `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy FormatFoundry to GitHub Pages
   on:
     push:
       branches: [main]
   permissions:
     contents: read
     pages: write
     id-token: write
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
         - run: npm ci
         - run: PUBLIC_SITE_URL=https://your-domain.com npm run build
         - uses: actions/upload-pages-artifact@v3
           with:
             path: dist
     deploy:
       needs: build
       runs-on: ubuntu-latest
       steps:
         - uses: actions/deploy-pages@v4
   ```

### E. AWS S3 + CloudFront
1. Create an S3 bucket configured for static website hosting.
2. Sync `dist/` to the S3 bucket:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name/ --delete
   ```
3. Set CloudFront Origin to the S3 website endpoint or use CloudFront Functions to append `index.html` to directory requests.
4. Configure SSL certificate using AWS Certificate Manager (ACM).

---

## 4. Custom Domain & HTTPS Setup

1. **DNS Configuration:**
   - **Apex domain (`example.com`):** Create an `A` record or `ALIAS`/`ANAME` record pointing to your provider's IP addresses or CNAME flattening target.
   - **Subdomain (`www.example.com` or `convert.example.com`):** Create a `CNAME` record pointing to your provider's URL (e.g., `your-app.pages.dev`, `cname.vercel-dns.com`).
2. **Enforce HTTPS:**
   - Cloudflare, Vercel, Netlify, and GitHub Pages provision free Let's Encrypt certificates automatically.
   - Enable **Always Use HTTPS** in your provider dashboard.
   - Enable **HSTS** (HTTP Strict Transport Security) to ensure browsers only connect via HTTPS.

---

## 5. Google Search Console & Sitemap Submission

Once your site is live at your custom domain:

1. **Verify Ownership:**
   - Open [Google Search Console](https://search.google.com/search-console).
   - Add a property for your domain (Domain property or URL prefix).
   - Verify ownership using DNS TXT record (recommended) or HTML meta tag.
2. **Submit Sitemap:**
   - In Search Console, navigate to **Sitemaps** in the left sidebar.
   - Enter `sitemap.xml` in the "Add a new sitemap" input.
   - Click **Submit**.
   - Verify that Google reports status: **Success** and identifies all 18 discovered URLs.
3. **Inspect URLs:**
   - Use the **URL Inspection** tool to test representative routes (e.g. `https://your-domain.com/png-to-jpg/`).
   - Confirm Googlebot can fetch the page, render the HTML, and discover internal links.
   - Request indexing for key landing pages if desired.

---

## 6. Security Headers & Privacy Verification

FormatFoundry operates entirely on the client side. Recommended security headers to configure in your hosting provider's configuration file (e.g., `_headers` for Cloudflare/Netlify or `vercel.json`):

```text
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'none'; frame-ancestors 'none';
```

Note: `connect-src 'none'` enforces at the browser level that FormatFoundry cannot transmit file data, telemetry, or API requests to external servers, providing cryptographic defense-in-depth for the zero-upload privacy guarantee.
