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

## 2. Production Domain & Canonical URL Strategy

### Production Origin: `https://formatfoundry.site`
FormatFoundry uses `PUBLIC_SITE_URL` as the single source of truth for production domain configuration across all metadata, canonical tags, sitemaps, robots.txt, Open Graph tags, and Twitter Cards.

Configuration order of precedence:
1. Shell environment variable: `PUBLIC_SITE_URL=https://formatfoundry.site npm run build`
2. Root `.env` file: `PUBLIC_SITE_URL=https://formatfoundry.site`
3. Fallback (unconfigured): Omits canonicals and sitemap to prevent invalid indexing during local development.

- **Configured State (`PUBLIC_SITE_URL=https://formatfoundry.site`):**
  - Generates `<link rel="canonical" href="https://formatfoundry.site/<path>/" />` across all 18 HTML files. Each page references its own canonical path.
  - Generates `<meta property="og:url" content="https://formatfoundry.site/<path>/" />` and Twitter card metadata.
  - Generates `dist/sitemap.xml` with absolute URLs on `https://formatfoundry.site` and reliable `<lastmod>` dates derived from source file modification timestamps.
  - Configures `dist/robots.txt` referencing `Sitemap: https://formatfoundry.site/sitemap.xml`.
  - Generates `dist/_redirects` for Cloudflare static assets redirection.
- **Unconfigured State (`PUBLIC_SITE_URL` not set):**
  - Canonical and sitemap tags are omitted to prevent emitting localhost, example domains, or placeholder canonicals.
  - `dist/sitemap.xml` is unlinked and omitted from deployment.
  - `dist/robots.txt` permits crawling without referencing a non-existent sitemap.

### Hostname & HTTPS Redirection Strategy (Cloudflare Architecture)
FormatFoundry is hosted on Cloudflare with the apex domain `https://formatfoundry.site` as the primary canonical origin. To ensure consistent search indexing and security, all traffic is consolidated to the single HTTPS apex host:

1. **Worker Programmatic Redirections (`src/worker.js`):**
   - Configured as the Worker entrypoint in `wrangler.json` with `binding: "ASSETS"`.
   - Intercepts incoming requests before serving static assets:
     - Detects `url.protocol === 'http:'` and immediately issues a 301 redirect to `https://formatfoundry.site/...`.
     - Detects `url.hostname === 'www.formatfoundry.site'` or `url.hostname === 'formatfoundary.9021382809as.workers.dev'` and issues a 301 redirect to `https://formatfoundry.site/...`.
     - Passes valid HTTPS apex requests directly to `env.ASSETS.fetch(request)`.
2. **Relative `_redirects` Syntax for Cloudflare Static Assets:**
   - Cloudflare Workers Static Assets strictly requires that all rules in `_redirects` use **relative paths** for both source and destination. Absolute URLs in `_redirects` cause Cloudflare deployment to fail with `Invalid _redirects configuration: Only relative URLs are allowed`.
   - Configured in `public/_redirects`:
     ```text
     /tools /tools/ 301
     /index.html / 301
     ```
   - All hostname and cross-protocol canonicalization is delegated to `src/worker.js` and Cloudflare Edge Rules.
3. **Cloudflare Dashboard Edge Configuration (Defense in Depth):**
   - **Enforce HTTPS:** Under **SSL/TLS** > **Edge Certificates**, toggle **Always Use HTTPS** to **ON**.
   - **Resolve `www` 522 Error:** Under **Workers & Pages** > `formatfoundry` > **Settings** > **Domains & Routes**, add `www.formatfoundry.site` as an additional **Custom Domain** (or configure an Edge Redirect Rule under **Rules** > **Redirect Rules** matching `http.host eq "www.formatfoundry.site"` to dynamic destination `concat("https://formatfoundry.site", http.request.uri.path)` with 301). Do not create conflicting Worker Routes if Custom Domains are assigned.

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

## 5. Google Search Console & Monitoring Readiness

Once your site is live at your configured production domain:

### A. Property Setup & Domain Verification
1. Open [Google Search Console](https://search.google.com/search-console).
2. Choose property type:
   - **Domain Property (Recommended):** Covers all protocols (`http://` and `https://`) and subdomains (`www` and non-www). Requires DNS TXT verification.
   - **URL-Prefix Property:** For specific hosts (e.g. `https://formatfoundry.com`). Supports DNS TXT, HTML file upload, or HTML tag.
3. Verification:
   - **DNS TXT Record (Best practice):** Add the provided `google-site-verification` TXT record to your DNS provider (Cloudflare, Namecheap, Route53).
   - **Security Warning:** Never commit Search Console verification tokens or private credential files to public git repositories.
4. Verify ownership in Google Search Console.

### B. Sitemap Submission & URL Inspection
1. Navigate to **Sitemaps** in the left sidebar.
2. Enter `sitemap.xml` in "Add a new sitemap" and click **Submit**.
3. Verify the status displays **Success** and 18 discovered URLs are reported.
4. Open the **URL Inspection** tool:
   - Test key routes (e.g. `https://formatfoundry.com/png-to-jpg/` and `https://formatfoundry.com/json-to-csv/`).
   - Click **Test Live URL** to confirm Googlebot can fetch the HTML, render the layout, load CSS/JS assets, and identify structured data schemas.
   - Verify that Google recognizes the declared canonical URL as user-selected and matches Google-selected canonical.

### C. Ongoing Search & Indexing Diagnostics
- **Pages Report:** Check for any "Excluded" or "Crawled - currently not indexed" pages. Verify that canonical declarations match Google's selections.
- **Core Web Vitals Report:** Monitor 75th-percentile field performance for real visitors (LCP <= 2.5s, INP < 200ms, CLS <= 0.1).
- **Security & Manual Actions:** Verify "No issues detected" under Security & Manual Actions.

---

## 6. Bing Webmaster Tools Onboarding

1. Open [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Sign in and choose **Import from Google Search Console** (fastest, verifies instantly without additional DNS records) or add your URL prefix manually.
3. If adding manually, verify via DNS CNAME or TXT record.
4. Submit `https://formatfoundry.com/sitemap.xml` under **Sitemaps**.
5. Use the **URL Inspection** tool to verify Bingbot rendering.

---

## 7. Security Headers & Privacy Verification

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

---

## 8. Ethical SEO & Long-Term Promotion Guidelines

FormatFoundry adheres strictly to ethical, search-standard white-hat SEO practices:
- **Local-Processing Guarantee:** Loading FormatFoundry HTML, CSS, JavaScript, and favicon/og-image assets constitutes ordinary static web browsing. No user files, table records, or conversion outputs are ever transmitted to any server. This difference must be clearly communicated in privacy notices.
- **Zero Spam Policy:** Never participate in private blog networks (PBNs), automated link schemes, purchased backlinks, or mass forum posting.
- **Legitimate Technical Outreach:** Promote FormatFoundry through high-value technical articles, open-source repositories, developer tool roundups, and workflow tutorials demonstrating client-side data privacy.
- **Content Integrity:** Every tool page provides authentic documentation of supported features, data handling boundaries, and error recovery guidance matching the actual engine code. No doorway pages or mass-generated thin content are published.
