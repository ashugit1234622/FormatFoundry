import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOLS } from '../src/config/tools-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function runRouteAudit(options = {}) {
  const targetDir = options.targetDir ? path.resolve(options.targetDir) : path.resolve(rootDir, 'dist');
  const isDist = targetDir.endsWith('dist') || fs.existsSync(path.resolve(targetDir, 'assets'));
  const issues = [];

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

  const forbiddenFiles = isDist
    ? ['test-stage4.html', 'tests', 'scratch']
    : ['test-stage4.html'];

  for (const forbidden of forbiddenFiles) {
    const forbiddenPath = path.resolve(targetDir, forbidden);
    if (fs.existsSync(forbiddenPath)) {
      issues.push(`Forbidden test/development asset found in production directory: ${forbidden}`);
    }
  }

  const seenTitles = new Map();
  const seenDescriptions = new Map();
  const validRoutePaths = new Set(expectedRoutes.map((r) => r.path));

  for (const route of expectedRoutes) {
    if (!fs.existsSync(route.file)) {
      issues.push(`Missing HTML file for route ${route.path}: ${route.file}`);
      continue;
    }

    const html = fs.readFileSync(route.file, 'utf-8');

    if (!html.includes('<!DOCTYPE html>')) {
      issues.push(`${route.path} is missing <!DOCTYPE html>`);
    }

    if (!html.includes('<html lang="en">')) {
      issues.push(`${route.path} is missing <html lang="en">`);
    }

    if (!html.includes('charset="UTF-8"') && !html.includes("charset='UTF-8'")) {
      issues.push(`${route.path} is missing charset declaration`);
    }

    if (!html.includes('name="viewport"')) {
      issues.push(`${route.path} is missing viewport meta tag`);
    }

    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    if (!titleMatch || !titleMatch[1].trim()) {
      issues.push(`${route.path} is missing or has empty <title>`);
    } else {
      const title = titleMatch[1].trim();
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
      if (seenDescriptions.has(desc)) {
        issues.push(`Duplicate meta description between ${route.path} and ${seenDescriptions.get(desc)}`);
      } else {
        seenDescriptions.set(desc, route.path);
      }
    }

    const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
    if (!h1Matches || h1Matches.length === 0) {
      issues.push(`${route.path} has no <h1> element`);
    } else if (h1Matches.length > 1) {
      issues.push(`${route.path} has multiple (${h1Matches.length}) <h1> elements`);
    }

    if (route.type === 'tool') {
      if (!html.includes(`data-tool="${route.tool.slug}"`)) {
        issues.push(`${route.path} body is missing data-tool="${route.tool.slug}"`);
      }
      if (!html.includes('class="breadcrumb-nav"')) {
        issues.push(`${route.path} is missing breadcrumbs`);
      }
      if (!html.includes('id="dropzone"')) {
        issues.push(`${route.path} is missing #dropzone`);
      }
      if (!html.includes('id="staged-container"')) {
        issues.push(`${route.path} is missing #staged-container`);
      }
    } else if (route.type === 'home') {
      if (!html.includes('id="dropzone"')) {
        issues.push(`${route.path} is missing #dropzone`);
      }
      if (!html.includes('id="staged-container"')) {
        issues.push(`${route.path} is missing #staged-container`);
      }
    } else if (route.type === 'directory') {
      if (!html.includes('id="tools-search"')) {
        issues.push(`${route.path} is missing #tools-search`);
      }
      if (!html.includes('data-page="tools"')) {
        issues.push(`${route.path} is missing data-page="tools"`);
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

    if (isDist) {
      const assetRegex = /(?:src|href)=["'](\/assets\/[^"']+)["']/gi;
      let assetMatch;
      while ((assetMatch = assetRegex.exec(html)) !== null) {
        const assetPath = assetMatch[1];
        const relativeAsset = assetPath.replace(/^\//, '');
        const diskAsset = path.resolve(targetDir, relativeAsset);
        if (!fs.existsSync(diskAsset)) {
          issues.push(`${route.path} references missing asset: "${assetPath}"`);
        } else {
          const stats = fs.statSync(diskAsset);
          if (stats.size === 0) {
            issues.push(`${route.path} references empty asset file: "${assetPath}"`);
          }
        }
      }
    }

    const placeholderWords = ['lorem ipsum', 'TODO', 'FIXME', 'undefined', 'null', 'NaN'];
    for (const word of placeholderWords) {
      if (html.includes(word)) {
        issues.push(`${route.path} contains placeholder text: "${word}"`);
      }
    }
  }

  const sitemapPath = path.resolve(targetDir, 'sitemap.xml');
  const robotsPath = path.resolve(targetDir, 'robots.txt');

  if (fs.existsSync(sitemapPath)) {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
    if (!sitemapContent.includes('<urlset') || !sitemapContent.includes('</urlset>')) {
      issues.push('sitemap.xml is missing valid <urlset> tags');
    }
    if (sitemapContent.includes('localhost') || sitemapContent.includes('127.0.0.1')) {
      issues.push('sitemap.xml contains localhost development URLs');
    }
    for (const route of expectedRoutes) {
      if (!sitemapContent.includes(route.path)) {
        issues.push(`sitemap.xml missing entry for published route ${route.path}`);
      }
    }
  }

  if (fs.existsSync(robotsPath)) {
    const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
    if (!robotsContent.includes('User-agent: *') || !robotsContent.includes('Allow: /')) {
      issues.push('robots.txt does not permit crawling of public content');
    }
    if (!fs.existsSync(sitemapPath) && robotsContent.includes('Sitemap:')) {
      issues.push('robots.txt references a sitemap when sitemap.xml is omitted');
    }
    if (fs.existsSync(sitemapPath) && !robotsContent.includes('Sitemap:')) {
      issues.push('robots.txt does not reference existing sitemap.xml');
    }
  }

  return {
    targetDir,
    routesAudited: expectedRoutes.length,
    issuesCount: issues.length,
    issues,
    passed: issues.length === 0
  };
}

if (process.argv[1] && process.argv[1].endsWith('audit-routes.js')) {
  const result = runRouteAudit();
  console.log(`Audited ${result.routesAudited} published routes in ${result.targetDir}.`);
  if (result.passed) {
    console.log('Production route audit passed with 0 issues.');
  } else {
    console.error(`Production route audit failed with ${result.issuesCount} issue(s):`);
    for (const issue of result.issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }
}
