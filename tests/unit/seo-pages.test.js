import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOLS } from '../../src/config/tools-config.js';
import { buildPages } from '../../scripts/build-seo-pages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

describe('Static SEO Pages and Discovery Infrastructure', () => {
  it('generates index.html for all 16 dedicated tools', () => {
    for (const tool of TOOLS) {
      const pagePath = path.resolve(rootDir, tool.slug, 'index.html');
      assert.ok(fs.existsSync(pagePath), `Missing index.html for tool: ${tool.slug}`);

      const html = fs.readFileSync(pagePath, 'utf-8');
      const expectedTitle = tool.title.replace(/&/g, '&amp;');
      assert.ok(html.includes(`<title>${expectedTitle}</title>`), `Missing title in ${tool.slug}`);
      assert.ok(html.includes(`content="${tool.metaDescription}"`), `Missing meta description in ${tool.slug}`);
      const expectedH1 = tool.h1.replace(/&/g, '&amp;');
      assert.ok(html.includes(`<h1 class="intro-title">${expectedH1}</h1>`), `Missing h1 in ${tool.slug}`);
      assert.ok(html.includes(`data-tool="${tool.slug}"`), `Missing data-tool attribute in ${tool.slug}`);
      assert.ok(html.includes('id="dropzone"'), `Missing dropzone in ${tool.slug}`);
      assert.ok(html.includes('id="staged-container"'), `Missing staged-container in ${tool.slug}`);
      assert.ok(html.includes('class="breadcrumb-nav"'), `Missing breadcrumbs in ${tool.slug}`);
      assert.ok(html.includes('href="/tools/"'), `Missing link to /tools/ in ${tool.slug}`);
      assert.ok(html.includes('href="/"'), `Missing link to / in ${tool.slug}`);
      assert.ok(html.includes('/src/styles/main.css'), `Missing stylesheet in ${tool.slug}`);
      assert.ok(html.includes('/src/main.js'), `Missing main script in ${tool.slug}`);
    }
  });

  it('generates tools directory page with links to all 16 tools', () => {
    const toolsPagePath = path.resolve(rootDir, 'tools', 'index.html');
    assert.ok(fs.existsSync(toolsPagePath), 'Missing /tools/index.html');

    const html = fs.readFileSync(toolsPagePath, 'utf-8');
    assert.ok(html.includes('<h1 class="intro-title">All File Conversion Tools</h1>'));
    assert.ok(html.includes('data-page="tools"'));
    assert.ok(html.includes('id="tools-search"'));

    for (const tool of TOOLS) {
      assert.ok(html.includes(`href="${tool.path}"`), `Tools directory missing link to ${tool.path}`);
      const expectedName = tool.name.replace(/&/g, '&amp;');
      assert.ok(html.includes(expectedName), `Tools directory missing name for ${tool.name}`);
    }
  });

  it('updates root index.html with links to tools directory and popular tools', () => {
    const rootPagePath = path.resolve(rootDir, 'index.html');
    assert.ok(fs.existsSync(rootPagePath), 'Missing root index.html');

    const html = fs.readFileSync(rootPagePath, 'utf-8');
    assert.ok(html.includes('href="/tools/"'));
    assert.ok(html.includes('Popular Dedicated Tools'));
    assert.ok(html.includes('href="/png-to-jpg/"'));
    assert.ok(html.includes('href="/image-inspector/"'));
  });

  it('handles sitemap and robots safely when PUBLIC_SITE_URL is not set', () => {
    buildPages({ siteUrl: '' });

    assert.equal(fs.existsSync(path.resolve(rootDir, 'sitemap.xml')), false);
    assert.equal(fs.existsSync(path.resolve(rootDir, 'public', 'sitemap.xml')), false);

    const robotsContent = fs.readFileSync(path.resolve(rootDir, 'robots.txt'), 'utf-8');
    assert.ok(robotsContent.includes('User-agent: *'));
    assert.ok(robotsContent.includes('Allow: /'));
    assert.ok(!robotsContent.includes('Sitemap:'));
  });

  it('generates fully qualified canonicals, sitemap, and robots when PUBLIC_SITE_URL is set', () => {
    buildPages({ siteUrl: 'https://convert.formatfoundry.dev' });

    const sitemapContent = fs.readFileSync(path.resolve(rootDir, 'sitemap.xml'), 'utf-8');
    assert.ok(sitemapContent.includes('<loc>https://convert.formatfoundry.dev/</loc>'));
    assert.ok(sitemapContent.includes('<loc>https://convert.formatfoundry.dev/tools/</loc>'));
    for (const tool of TOOLS) {
      assert.ok(
        sitemapContent.includes(`<loc>https://convert.formatfoundry.dev${tool.path}</loc>`),
        `Sitemap missing entry for ${tool.path}`
      );
    }

    const robotsContent = fs.readFileSync(path.resolve(rootDir, 'robots.txt'), 'utf-8');
    assert.ok(robotsContent.includes('Sitemap: https://convert.formatfoundry.dev/sitemap.xml'));

    const samplePage = fs.readFileSync(path.resolve(rootDir, 'png-to-jpg', 'index.html'), 'utf-8');
    assert.ok(samplePage.includes('<link rel="canonical" href="https://convert.formatfoundry.dev/png-to-jpg/" />'));

    buildPages({ siteUrl: '' });
  });
});
