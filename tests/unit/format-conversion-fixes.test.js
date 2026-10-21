import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('');
globalThis.window = dom.window;

import { convertFile } from '../../src/engines/dispatcher.js';
import { convertCsvOrTsv, convertJsonToDelimited } from '../../src/engines/csv-converter.js';
import { parseSvgDimensions, validateAndSanitizeSvg } from '../../src/engines/svg-converter.js';
import { markdownToHtml } from '../../src/engines/markdown-converter.js';
import { resolveUniqueFilename } from '../../src/utils/zip.js';
import { normalizeFormat, formatToExtension } from '../../src/core/filename-utils.js';

test('dispatcher: cleanly rejects non-raster formats targeting image formats without attempting image decode', async () => {
  const jsonFile = new File(['[{"a": 1}]'], 'data.json', { type: 'application/json' });
  await assert.rejects(
    async () => {
      await convertFile(jsonFile, 'png', { sourceFormat: 'json' });
    },
    {
      name: 'Error',
      message: 'Unsupported conversion route: from "json" to "png"'
    }
  );

  const csvFile = new File(['a,b\n1,2'], 'data.csv', { type: 'text/csv' });
  await assert.rejects(
    async () => {
      await convertFile(csvFile, 'webp', { sourceFormat: 'csv' });
    },
    {
      name: 'Error',
      message: 'Unsupported conversion route: from "csv" to "webp"'
    }
  );

  const mdFile = new File(['# Title'], 'doc.md', { type: 'text/markdown' });
  await assert.rejects(
    async () => {
      await convertFile(mdFile, 'jpeg', { sourceFormat: 'markdown' });
    },
    {
      name: 'Error',
      message: 'Unsupported conversion route: from "markdown" to "jpeg"'
    }
  );
});

test('convertCsvOrTsv: respects sourceFormat in options and handles all delimited cross-conversions', async () => {
  // TSV file named 'export.txt' with explicit sourceFormat: 'tsv' converting to JSON
  const tsvFile = new File(['name\tage\nAlice\t30'], 'export.txt', { type: 'text/plain' });
  const jsonResult = await convertCsvOrTsv(tsvFile, 'json', { sourceFormat: 'tsv' });
  assert.equal(jsonResult.format, 'json');
  assert.equal(jsonResult.filename, 'export.json');
  const jsonText = await jsonResult.blob.text();
  assert.deepEqual(JSON.parse(jsonText), [{ name: 'Alice', age: '30' }]);

  // TSV to TSV normalization
  const tsvToTsvResult = await convertCsvOrTsv(tsvFile, 'tsv', { sourceFormat: 'tsv' });
  assert.equal(tsvToTsvResult.format, 'tsv');
  const tsvText = await tsvToTsvResult.blob.text();
  assert.ok(tsvText.includes('Alice\t30'));

  // CSV to CSV normalization
  const csvFile = new File(['name,age\nBob,25'], 'export.txt', { type: 'text/plain' });
  const csvToCsvResult = await convertCsvOrTsv(csvFile, 'csv', { sourceFormat: 'csv' });
  assert.equal(csvToCsvResult.format, 'csv');
  const csvText = await csvToCsvResult.blob.text();
  assert.ok(csvText.includes('Bob,25'));
});

test('convertJsonToDelimited: successfully converts JSON to TSV', async () => {
  const jsonFile = new File(['[{"id": 1, "name": "Alice"}]'], 'users.json', { type: 'application/json' });
  const tsvResult = await convertJsonToDelimited(jsonFile, 'tsv');
  assert.equal(tsvResult.format, 'tsv');
  assert.equal(tsvResult.filename, 'users.tsv');
  const tsvText = await tsvResult.blob.text();
  assert.ok(tsvText.includes('id\tname'));
  assert.ok(tsvText.includes('1\tAlice'));
});

test('svg-converter: parses negative and scientific notation viewBox and handles case-insensitive tags', () => {
  const svgSci = '<svg viewBox="-10.5 -20.5 1.5e2 2e2"><circle r="10"/></svg>';
  const dimsSci = parseSvgDimensions(svgSci);
  assert.equal(dimsSci.width, 150);
  assert.equal(dimsSci.height, 200);
  assert.equal(dimsSci.viewBox.minX, -10.5);
  assert.equal(dimsSci.viewBox.minY, -20.5);

  const upperSvg = '<SVG viewBox="0 0 100 100"><rect width="10" height="10"/></SVG>';
  const sanitized = validateAndSanitizeSvg(upperSvg);
  assert.ok(sanitized.toLowerCase().includes('<svg'));
  const dimsUpper = parseSvgDimensions(sanitized);
  assert.equal(dimsUpper.width, 100);
  assert.equal(dimsUpper.height, 100);
});

test('markdownToHtml: escapes HTML characters in title parameter to prevent XSS in generated document', () => {
  const maliciousTitle = 'My Doc <script>alert("XSS")</script> & "Quotes"';
  const html = markdownToHtml('# Hello', { title: maliciousTitle });
  assert.ok(!html.includes('<script>alert("XSS")</script>'));
  assert.ok(html.includes('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'));
  assert.ok(html.includes('&amp;'));
});

test('resolveUniqueFilename: handles collisions when duplicate candidates already exist', () => {
  const seen = new Map();
  // Simulate having file.png and file (2).png already registered
  seen.set('file.png', 1);
  seen.set('file (2).png', 1);

  // Now a second file.png comes in: should resolve to file (3).png instead of colliding with file (2).png
  const resolved = resolveUniqueFilename('file.png', seen);
  assert.equal(resolved, 'file (3).png');
});

test('filename-utils: normalizes format aliases and extensions', () => {
  assert.equal(normalizeFormat('tab'), 'tsv');
  assert.equal(normalizeFormat('.mdown'), 'markdown');
  assert.equal(normalizeFormat('mkd'), 'markdown');
  assert.equal(formatToExtension('svg'), 'svg');
  assert.equal(formatToExtension('jpeg'), 'jpg');
  assert.equal(formatToExtension('tsv'), 'tsv');
});
