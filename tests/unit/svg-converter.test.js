import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;

import { validateAndSanitizeSvg, parseSvgDimensions, convertSvg } from '../../src/engines/svg-converter.js';

test('validateAndSanitizeSvg: allows valid SVG root elements and attributes', () => {
  const validSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red"/></svg>';
  const sanitized = validateAndSanitizeSvg(validSvg);
  assert.ok(sanitized.includes('<svg'));
  assert.ok(sanitized.includes('circle'));
});

test('validateAndSanitizeSvg: strips script elements and inline script handlers', () => {
  const dirtySvg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" onload="alert(1)"><script>alert("xss")</script><rect width="50" height="50"/></svg>';
  const sanitized = validateAndSanitizeSvg(dirtySvg);
  assert.ok(!sanitized.includes('<script'));
  assert.ok(!sanitized.includes('onload'));
  assert.ok(sanitized.includes('<rect'));
});

test('validateAndSanitizeSvg: rejects non-string input', () => {
  assert.throws(() => validateAndSanitizeSvg(null), { name: 'TypeError' });
  assert.throws(() => validateAndSanitizeSvg(123), { name: 'TypeError' });
});

test('validateAndSanitizeSvg: rejects markup lacking svg root tags', () => {
  assert.throws(() => validateAndSanitizeSvg('<div>Not an SVG</div>'), {
    message: /File does not contain a valid SVG document root element/
  });
});

test('parseSvgDimensions: extracts explicit width and height attributes in px or unitless', () => {
  const svg = '<svg width="800px" height="600px" viewBox="0 0 800 600"></svg>';
  const dims = parseSvgDimensions(svg);
  assert.equal(dims.width, 800);
  assert.equal(dims.height, 600);
  assert.equal(dims.aspectRatio, '1.33');
  assert.equal(dims.hasExplicitDimensions, true);
  assert.equal(dims.hasViewBox, true);
});

test('parseSvgDimensions: derives width and height from viewBox when attributes are omitted', () => {
  const svg = '<svg viewBox="0 0 1920 1080"></svg>';
  const dims = parseSvgDimensions(svg);
  assert.equal(dims.width, 1920);
  assert.equal(dims.height, 1080);
  assert.equal(dims.aspectRatio, '1.78');
  assert.equal(dims.hasExplicitDimensions, false);
  assert.equal(dims.hasViewBox, true);
  assert.deepEqual(dims.viewBox, { minX: 0, minY: 0, width: 1920, height: 1080 });
});

test('parseSvgDimensions: throws when both dimensions and viewBox are missing', () => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="5"/></svg>';
  assert.throws(() => parseSvgDimensions(svg), {
    message: /SVG document lacks intrinsic dimensions/
  });
});

test('convertSvg: rejects missing file or unsupported target format', async () => {
  await assert.rejects(() => convertSvg(null, 'png'), {
    message: /No SVG file provided/
  });

  const mockFile = new File(['<svg width="10" height="10"></svg>'], 'test.svg', { type: 'image/svg+xml' });
  await assert.rejects(() => convertSvg(mockFile, 'bmp'), {
    message: /Unsupported output format: "bmp"/
  });
});

test('convertSvg: rejects files exceeding 50 MB limit', async () => {
  const mockLargeFile = {
    name: 'giant.svg',
    size: 55 * 1024 * 1024,
    text: async () => '<svg width="10" height="10"></svg>'
  };

  await assert.rejects(() => convertSvg(mockLargeFile, 'png'), {
    message: /SVG file exceeds the 50 MB maximum size limit/
  });
});
