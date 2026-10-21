import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import {
  cleanFormatToken,
  getFormatVariants,
  normalizeSearchQuery,
  matchesToolCard,
  setupToolsFilter
} from '../../src/ui/tools-filter.js';
import { TOOLS } from '../../src/config/tools-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

describe('Tools Filter & Extension Search Logic', () => {
  it('cleanFormatToken strips dots, wildcards, and normalizes casing', () => {
    assert.strictEqual(cleanFormatToken('.png'), 'png');
    assert.strictEqual(cleanFormatToken('PNG'), 'png');
    assert.strictEqual(cleanFormatToken('*.PNG'), 'png');
    assert.strictEqual(cleanFormatToken('png.'), 'png');
    assert.strictEqual(cleanFormatToken('..csv..'), 'csv');
    assert.strictEqual(cleanFormatToken('  .JpEg  '), 'jpeg');
    assert.strictEqual(cleanFormatToken(''), '');
    assert.strictEqual(cleanFormatToken(null), '');
  });

  it('getFormatVariants includes dotted extension and cross-format aliases', () => {
    const pngVariants = getFormatVariants('.png');
    assert.ok(pngVariants.includes('png'));
    assert.ok(pngVariants.includes('.png'));

    const jpgVariants = getFormatVariants('jpg');
    assert.ok(jpgVariants.includes('jpg'));
    assert.ok(jpgVariants.includes('.jpg'));
    assert.ok(jpgVariants.includes('jpeg'));
    assert.ok(jpgVariants.includes('.jpeg'));

    const jpegVariants = getFormatVariants('.jpeg');
    assert.ok(jpegVariants.includes('jpg'));
    assert.ok(jpegVariants.includes('jpeg'));

    const mdVariants = getFormatVariants('.md');
    assert.ok(mdVariants.includes('md'));
    assert.ok(mdVariants.includes('.md'));
    assert.ok(mdVariants.includes('markdown'));

    const csvVariants = getFormatVariants('CSV');
    assert.ok(csvVariants.includes('csv'));
    assert.ok(csvVariants.includes('.csv'));

    const jsonVariants = getFormatVariants('.JSON');
    assert.ok(jsonVariants.includes('json'));
    assert.ok(jsonVariants.includes('.json'));
  });

  it('normalizeSearchQuery parses extensions, casing, and direction conversions', () => {
    const emptyQuery = normalizeSearchQuery('   ');
    assert.strictEqual(emptyQuery.isEmpty, true);

    const dotOnly = normalizeSearchQuery('.');
    assert.strictEqual(dotOnly.isEmpty, true);

    const starOnly = normalizeSearchQuery('*');
    assert.strictEqual(starOnly.isEmpty, true);

    const pngLower = normalizeSearchQuery('.png');
    assert.strictEqual(pngLower.isDirectional, false);
    assert.deepStrictEqual(pngLower.tokens, ['.png']);

    const pngUpper = normalizeSearchQuery('PNG');
    assert.deepStrictEqual(pngUpper.tokens, ['png']);

    const dirArrow = normalizeSearchQuery('.png -> .jpg');
    assert.strictEqual(dirArrow.isDirectional, true);
    assert.strictEqual(dirArrow.fromFormat, 'png');
    assert.strictEqual(dirArrow.toFormat, 'jpg');

    const dirTo = normalizeSearchQuery('png to jpg');
    assert.strictEqual(dirTo.isDirectional, true);
    assert.strictEqual(dirTo.fromFormat, 'png');
    assert.strictEqual(dirTo.toFormat, 'jpg');

    const dirHyphen = normalizeSearchQuery('json-to-csv');
    assert.strictEqual(dirHyphen.isDirectional, true);
    assert.strictEqual(dirHyphen.fromFormat, 'json');
    assert.strictEqual(dirHyphen.toFormat, 'csv');
  });

  it('filters live tools directory page by extension across all supported formats', () => {
    const htmlPath = path.resolve(rootDir, 'tools', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const cards = Array.from(document.querySelectorAll('.tool-card'));
    assert.strictEqual(cards.length, TOOLS.length);

    const pngCards = cards.filter((c) => matchesToolCard(c, '.png'));
    const pngSlugs = pngCards.map((c) => c.getAttribute('data-tool'));
    assert.ok(pngSlugs.includes('png-to-jpg'));
    assert.ok(pngSlugs.includes('png-to-webp'));
    assert.ok(pngSlugs.includes('jpg-to-png'));
    assert.ok(pngSlugs.includes('webp-to-png'));
    assert.ok(pngSlugs.includes('svg-to-png'));
    assert.ok(!pngSlugs.includes('json-to-csv'));
    assert.ok(!pngSlugs.includes('csv-to-tsv'));

    const pngUpperCards = cards.filter((c) => matchesToolCard(c, 'PNG'));
    assert.strictEqual(pngUpperCards.length, pngCards.length);

    const pngMixedCards = cards.filter((c) => matchesToolCard(c, 'Png'));
    assert.strictEqual(pngMixedCards.length, pngCards.length);

    const pngDotUpper = cards.filter((c) => matchesToolCard(c, '.PNG'));
    assert.strictEqual(pngDotUpper.length, pngCards.length);

    const csvCards = cards.filter((c) => matchesToolCard(c, '.csv'));
    const csvSlugs = csvCards.map((c) => c.getAttribute('data-tool'));
    assert.ok(csvSlugs.includes('json-to-csv'));
    assert.ok(csvSlugs.includes('csv-to-json'));
    assert.ok(csvSlugs.includes('csv-to-tsv'));
    assert.ok(csvSlugs.includes('tsv-to-csv'));
    assert.ok(!csvSlugs.includes('png-to-jpg'));

    const jsonCards = cards.filter((c) => matchesToolCard(c, '.json'));
    const jsonSlugs = jsonCards.map((c) => c.getAttribute('data-tool'));
    assert.ok(jsonSlugs.includes('json-to-csv'));
    assert.ok(jsonSlugs.includes('csv-to-json'));
    assert.ok(jsonSlugs.includes('json-formatter'));
    assert.ok(!jsonSlugs.includes('svg-to-jpg'));

    const svgCards = cards.filter((c) => matchesToolCard(c, '.svg'));
    const svgSlugs = svgCards.map((c) => c.getAttribute('data-tool'));
    assert.ok(svgSlugs.includes('svg-to-png'));
    assert.ok(svgSlugs.includes('svg-to-jpg'));
    assert.ok(svgSlugs.includes('svg-to-webp'));
    assert.ok(!svgSlugs.includes('csv-to-tsv'));

    const mdCards = cards.filter((c) => matchesToolCard(c, '.md'));
    const mdSlugs = mdCards.map((c) => c.getAttribute('data-tool'));
    assert.ok(mdSlugs.includes('markdown-to-html'));

    const markdownCards = cards.filter((c) => matchesToolCard(c, 'markdown'));
    assert.ok(markdownCards.map((c) => c.getAttribute('data-tool')).includes('markdown-to-html'));

    const jpegCards = cards.filter((c) => matchesToolCard(c, '.jpeg'));
    const jpegSlugs = jpegCards.map((c) => c.getAttribute('data-tool'));
    assert.ok(jpegSlugs.includes('png-to-jpg'));
    assert.ok(jpegSlugs.includes('jpg-to-png'));
  });

  it('handles directional conversion queries accurately', () => {
    const htmlPath = path.resolve(rootDir, 'tools', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const cards = Array.from(document.querySelectorAll('.tool-card'));

    const pngToJpg = cards.filter((c) => matchesToolCard(c, '.png to .jpg'));
    assert.strictEqual(pngToJpg.length, 1);
    assert.strictEqual(pngToJpg[0].getAttribute('data-tool'), 'png-to-jpg');

    const jpgToPng = cards.filter((c) => matchesToolCard(c, 'jpg -> png'));
    assert.strictEqual(jpgToPng.length, 1);
    assert.strictEqual(jpgToPng[0].getAttribute('data-tool'), 'jpg-to-png');

    const jsonToCsv = cards.filter((c) => matchesToolCard(c, 'json to csv'));
    assert.strictEqual(jsonToCsv.length, 1);
    assert.strictEqual(jsonToCsv[0].getAttribute('data-tool'), 'json-to-csv');

    const csvToJson = cards.filter((c) => matchesToolCard(c, '.csv to .json'));
    assert.strictEqual(csvToJson.length, 1);
    assert.strictEqual(csvToJson[0].getAttribute('data-tool'), 'csv-to-json');
  });

  it('setupToolsFilter wires DOM events, visibility, empty state, and clear button', () => {
    const htmlPath = path.resolve(rootDir, 'tools', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const searchInput = document.getElementById('tools-search');
    const noResultsEl = document.getElementById('tools-no-results');
    const clearBtn = document.getElementById('tools-clear-search');
    const statusEl = document.getElementById('tools-search-status');

    assert.ok(searchInput);
    assert.ok(noResultsEl);
    assert.ok(clearBtn);

    const filterCtrl = setupToolsFilter({
      input: searchInput,
      container: document.querySelector('.tools-directory'),
      noResults: noResultsEl,
      clearButton: clearBtn,
      status: statusEl
    });

    assert.ok(filterCtrl);

    searchInput.value = '.png';
    searchInput.dispatchEvent(new dom.window.Event('input'));

    const visiblePngCards = document.querySelectorAll('.tool-card:not([style*="display: none"])');
    assert.ok(visiblePngCards.length >= 5);
    assert.strictEqual(noResultsEl.style.display, 'none');

    searchInput.value = '.xyznonexistent';
    searchInput.dispatchEvent(new dom.window.Event('input'));

    const visibleEmptyCards = document.querySelectorAll('.tool-card:not([style*="display: none"])');
    assert.strictEqual(visibleEmptyCards.length, 0);
    assert.strictEqual(noResultsEl.style.display, '');
    assert.strictEqual(document.getElementById('tools-search-query').textContent, '.xyznonexistent');

    clearBtn.click();
    assert.strictEqual(searchInput.value, '');
    const restoredCards = document.querySelectorAll('.tool-card:not([style*="display: none"])');
    assert.strictEqual(restoredCards.length, TOOLS.length);
    assert.strictEqual(noResultsEl.style.display, 'none');

    searchInput.value = 'svg';
    searchInput.dispatchEvent(new dom.window.Event('input'));
    assert.ok(document.querySelectorAll('.tool-card:not([style*="display: none"])').length >= 3);

    const escEvent = new dom.window.KeyboardEvent('keydown', { key: 'Escape' });
    searchInput.dispatchEvent(escEvent);
    assert.strictEqual(searchInput.value, '');
    assert.strictEqual(document.querySelectorAll('.tool-card:not([style*="display: none"])').length, TOOLS.length);

    filterCtrl.destroy();
  });
});
