import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOLS } from '../src/config/tools-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.resolve(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

export function runSeoAudit(options = {}) {
  const targetDir = options.targetDir ? path.resolve(options.targetDir) : path.resolve(rootDir, 'dist');
  const baseUrl = options.siteUrl !== undefined
    ? options.siteUrl
    : (process.env.PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');

  const issues = [];
  const checksPassed = [];

  const expectedRoutes = [
    { path: '/', file: path.resolve(targetDir, 'index.html'), type: 'home' },
    { path: '/tools/', file: path.resolve(targetDir, 'tools', 'index.html'), type: 'directory' }
  ];

  for (const tool of TOOLS) {
    expectedRoutes.push({
      path: tool.path,
      file: path.resolve(targetDir, tool.slug, 'index.html'),
      type: 'tool',
      tool
    });
  }

  const forbiddenFiles = ['test-stage4.html', 'tests', 'scratch'];
  for (const forbidden of forbiddenFiles) {
    const forbiddenPath = path.resolve(targetDir, forbidden);
    if (fs.existsSync(forbiddenPath)) {
      issues.push(`Forbidden test or development asset found in release directory: ${forbidden}`);
    }
  }

  const seenTitles = new Map();
  const seenDescriptions = new Map();
  const validRoutePaths = new Set(expectedRoutes.map((r) => r.path));

  for (const route of expectedRoutes) {
    if (!fs.existsSync(route.file)) {
      issues.push(`Missing HTML file for published route ${route.path}: ${route.file}`);
      continue;
    }

    const html = fs.readFileSync(route.file, 'utf-8');

    if (!html.includes('<!DOCTYPE html>')) {
      issues.push(`${route.path} is missing <!DOCTYPE html> declaration`);
    }
    if (!html.includes('<html lang="en">')) {
      issues.push(`${route.path} is missing <html lang="en"> element`);
    }
    if (!html.includes('charset="UTF-8"') && !html.includes("charset='UTF-8'")) {
      issues.push(`${route.path} is missing UTF-8 charset declaration`);
    }
    if (!html.includes('name="viewport"')) {
      issues.push(`${route.path} is missing viewport meta tag`);
    }

    const noindexMatch = html.match(/<meta[^>]*name=["'](?:robots|googlebot)["'][^>]*content=["']([^"']*)["']/i);
    if (noindexMatch && /noindex|none/i.test(noindexMatch[1])) {
      issues.push(`Accidental noindex directive detected in ${route.path}: "${noindexMatch[0]}"`);
    }

    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    if (!titleMatch || !titleMatch[1].trim()) {
      issues.push(`${route.path} is missing or has empty <title> tag`);
    } else {
      const title = titleMatch[1].trim();
      if (title.length < 15) {
        issues.push(`${route.path} has an undescriptively short title (${title.length} chars): "${title}"`);
      }
      if (seenTitles.has(title)) {
        issues.push(`Duplicate title between ${route.path} and ${seenTitles.get(title)}: "${title}"`);
      } else {
        seenTitles.set(title, route.path);
      }
    }

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (!descMatch || !descMatch[1].trim()) {
      issues.push(`${route.path} is missing or has empty meta description`);
    } else {
      const desc = descMatch[1].trim();
      if (desc.length < 30) {
        issues.push(`${route.path} has an undescriptively short meta description (${desc.length} chars)`);
      }
      if (seenDescriptions.has(desc)) {
        issues.push(`Duplicate meta description between ${route.path} and ${seenDescriptions.get(desc)}`);
      } else {
        seenDescriptions.set(desc, route.path);
      }
    }

    const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
    if (!h1Matches || h1Matches.length === 0) {
      issues.push(`${route.path} is missing an <h1> heading element`);
    } else if (h1Matches.length > 1) {
      issues.push(`${route.path} has multiple (${h1Matches.length}) <h1> headings`);
    }

    if (html.includes('workers.dev')) {
      issues.push(`${route.path} contains forbidden temporary workers.dev reference`);
    }

    if (!html.includes('rel="apple-touch-icon"') || !html.includes('/apple-touch-icon.png')) {
      issues.push(`${route.path} is missing valid apple-touch-icon link tag`);
    }

    if (route.type === 'home') {
      const expectedHomeDesc = 'Convert images, SVGs, JSON, CSV, TSV, and Markdown files online. Free browser-based conversion with private, local file processing.';
      const descMatchExact = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      if (descMatchExact && descMatchExact[1].trim() !== expectedHomeDesc) {
        issues.push(`Homepage meta description must match concise copy: expected "${expectedHomeDesc}" but found "${descMatchExact[1]}"`);
      }
    }

    if (baseUrl) {
      const expectedCanonical = `${baseUrl}${route.path}`;
      const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
      if (!canonicalMatch) {
        issues.push(`${route.path} is missing canonical link tag for ${expectedCanonical}`);
      } else if (canonicalMatch[1] !== expectedCanonical) {
        issues.push(`${route.path} canonical mismatch: expected "${expectedCanonical}" but found "${canonicalMatch[1]}"`);
      }
    }

    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    const twitterCardMatch = html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']+)["']/i);

    if (!ogTitleMatch) issues.push(`${route.path} is missing og:title meta tag`);
    if (!ogDescMatch) issues.push(`${route.path} is missing og:description meta tag`);
    if (!ogImageMatch) issues.push(`${route.path} is missing og:image meta tag`);
    if (!twitterCardMatch) issues.push(`${route.path} is missing twitter:card meta tag`);

    const jsonLdMatch = html.match(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i);
    if (!jsonLdMatch) {
      issues.push(`${route.path} is missing JSON-LD structured data script`);
    } else {
      try {
        const parsedJsonLd = JSON.parse(jsonLdMatch[1]);
        const items = Array.isArray(parsedJsonLd) ? parsedJsonLd : [parsedJsonLd];
        for (const item of items) {
          if (item['@context'] !== 'https://schema.org') {
            issues.push(`${route.path} JSON-LD has invalid @context: "${item['@context']}"`);
          }
          if (!item['@type']) {
            issues.push(`${route.path} JSON-LD missing @type attribute`);
          }
        }
      } catch (err) {
        issues.push(`${route.path} has malformed JSON-LD structured data: ${err.message}`);
      }
    }

    if (route.type === 'tool') {
      if (!html.includes(`data-tool="${route.tool.slug}"`)) {
        issues.push(`${route.path} body is missing data-tool="${route.tool.slug}"`);
      }
      if (!html.includes('class="breadcrumb-nav"')) {
        issues.push(`${route.path} is missing breadcrumb navigation element`);
      }
      if (!html.includes('id="dropzone"')) {
        issues.push(`${route.path} is missing #dropzone conversion element`);
      }
    } else if (route.type === 'directory') {
      if (!html.includes('data-page="tools"')) {
        issues.push(`${route.path} is missing data-page="tools" attribute`);
      }
      if (!html.includes('id="tools-search"')) {
        issues.push(`${route.path} is missing tools search input`);
      }
    }

    const linkRegex = /<a[^>]+href=["']([^"']+)["']/gi;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const href = linkMatch[1];
      if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) {
        continue;
      }
      if (href.startsWith('#')) {
        continue;
      }
      const [linkPath] = href.split('#');
      if (linkPath) {
        if (!linkPath.startsWith('/')) {
          issues.push(`${route.path} contains non-root relative link: "${href}"`);
        } else if (!validRoutePaths.has(linkPath)) {
          issues.push(`${route.path} contains link to unknown route: "${href}"`);
        }
      }
    }

    const anchorRegex = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
    let anchorMatch;
    while ((anchorMatch = anchorRegex.exec(html)) !== null) {
      const textContent = anchorMatch[1].replace(/<[^>]+>/g, '').trim();
      if (textContent.length > 80) {
        issues.push(`${route.path} contains excessively verbose anchor text (${textContent.length} chars): "${textContent.slice(0, 50)}..."`);
      }
    }
  }

  const sitemapPath = path.resolve(targetDir, 'sitemap.xml');
  const robotsPath = path.resolve(targetDir, 'robots.txt');

  if (baseUrl) {
    if (!fs.existsSync(sitemapPath)) {
      issues.push(`sitemap.xml is missing from release directory ${targetDir}`);
    } else {
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
      if (!sitemapContent.includes('<urlset') || !sitemapContent.includes('</urlset>')) {
        issues.push('sitemap.xml is missing valid <urlset> root element');
      }
      if (sitemapContent.includes('localhost') || sitemapContent.includes('127.0.0.1')) {
        issues.push('sitemap.xml contains prohibited development or localhost URLs');
      }
      for (const route of expectedRoutes) {
        const fullExpectedUrl = `${baseUrl}${route.path}`;
        if (!sitemapContent.includes(`<loc>${fullExpectedUrl}</loc>`)) {
          issues.push(`sitemap.xml is missing entry for published route ${fullExpectedUrl}`);
        }
      }
      const lastmodMatches = sitemapContent.match(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g);
      if (!lastmodMatches || lastmodMatches.length < expectedRoutes.length) {
        issues.push('sitemap.xml entries must include valid <lastmod> dates in YYYY-MM-DD format');
      }
    }
  }

  if (!fs.existsSync(robotsPath)) {
    issues.push(`robots.txt is missing from release directory ${targetDir}`);
  } else {
    const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
    if (!robotsContent.includes('User-agent: *') || !robotsContent.includes('Allow: /')) {
      issues.push('robots.txt must permit crawling of public website content (Allow: /)');
    }
    if (baseUrl && !robotsContent.includes(`Sitemap: ${baseUrl}/sitemap.xml`)) {
      issues.push(`robots.txt must reference production sitemap: Sitemap: ${baseUrl}/sitemap.xml`);
    }
  }

  const ogImagePath = path.resolve(targetDir, 'og-image.png');
  if (!fs.existsSync(ogImagePath)) {
    issues.push(`Open Graph social share image is missing from release directory: ${ogImagePath}`);
  } else {
    const ogStats = fs.statSync(ogImagePath);
    if (ogStats.size < 1000) {
      issues.push(`Open Graph image file is suspiciously small or corrupted (${ogStats.size} bytes)`);
    } else {
      checksPassed.push(`Open Graph social image verified (${Math.round(ogStats.size / 1024)} KB)`);
    }
  }

  const appleTouchIconPath = path.resolve(targetDir, 'apple-touch-icon.png');
  if (!fs.existsSync(appleTouchIconPath)) {
    issues.push(`apple-touch-icon.png is missing from release directory ${targetDir}`);
  } else {
    const iconStat = fs.statSync(appleTouchIconPath);
    if (iconStat.size < 500) {
      issues.push(`apple-touch-icon.png is too small (${iconStat.size} bytes)`);
    } else {
      checksPassed.push(`Apple touch icon verified (${Math.round(iconStat.size / 1024)} KB)`);
    }
  }

  const redirectsPath = path.resolve(targetDir, '_redirects');
  if (!fs.existsSync(redirectsPath)) {
    issues.push(`_redirects file is missing from release directory ${targetDir}`);
  } else {
    const redirectsContent = fs.readFileSync(redirectsPath, 'utf-8');
    const lines = redirectsContent.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.startsWith('#')) continue;
      const parts = line.split(/\s+/);
      if (parts.length < 2) {
        issues.push(`_redirects contains invalid rule line: "${line}"`);
        continue;
      }
      const [source, destination] = parts;
      if (!source.startsWith('/')) {
        issues.push(`Invalid _redirects rule: source must be a relative URL starting with "/": "${source}"`);
      }
      if (!destination.startsWith('/')) {
        issues.push(`Invalid _redirects rule: destination must be a relative URL starting with "/": "${destination}"`);
      }
    }
    checksPassed.push('Cloudflare _redirects configuration verified (relative URLs only)');
  }

  checksPassed.push(`Audited ${expectedRoutes.length} published routes for semantic HTML and meta tags`);

  return {
    targetDir,
    baseUrl,
    routesAudited: expectedRoutes.length,
    issuesCount: issues.length,
    issues,
    checksPassed,
    passed: issues.length === 0
  };
}

if (process.argv[1] && process.argv[1].endsWith('audit-seo.js')) {
  const result = runSeoAudit();
  console.log(`SEO Release Gate: Audited ${result.routesAudited} published routes in ${result.targetDir} (baseUrl: ${result.baseUrl || 'Unconfigured'}).`);
  if (result.passed) {
    console.log(`SEO Release Gate: PASSED with 0 issues (${result.checksPassed.join(', ')}).`);
  } else {
    console.error(`SEO Release Gate: FAILED with ${result.issuesCount} issue(s):`);
    for (const issue of result.issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }
}
