import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
globalThis.window = dom.window;

import { inspectImageFile } from '../../src/core/image-inspector.js';

test('inspectImageFile: returns null when file is missing', async () => {
  const result = await inspectImageFile(null);
  assert.equal(result, null);
});

test('inspectImageFile: inspects valid SVG file dimensions and viewBox', async () => {
  const svgContent = '<svg viewBox="0 0 100 50"><rect width="100" height="50"/></svg>';
  const file = new File([svgContent], 'vector.svg', { type: 'image/svg+xml' });

  const info = await inspectImageFile(file, 'svg');
  assert.equal(info.signatureFormat, 'SVG (Vector Document)');
  assert.equal(info.browserMime, 'image/svg+xml');
  assert.equal(info.width, 100);
  assert.equal(info.height, 50);
  assert.equal(info.aspectRatio, '2.00');
  assert.equal(info.canDecode, true);
  assert.equal(info.error, null);
  assert.deepEqual(info.viewBox, { minX: 0, minY: 0, width: 100, height: 50 });
});

test('inspectImageFile: handles malformed SVG without throwing', async () => {
  const badSvg = '<svg>No dimensions here</svg>';
  const file = new File([badSvg], 'bad.svg', { type: 'image/svg+xml' });

  const info = await inspectImageFile(file, 'svg');
  assert.equal(info.signatureFormat, 'SVG (Vector Document)');
  assert.equal(info.canDecode, false);
  assert.ok(info.error.includes('SVG document lacks intrinsic dimensions'));
});

test('inspectImageFile: inspects raster image decoding and dimensions', async () => {
  const originalCreateBitmap = globalThis.createImageBitmap;
  globalThis.createImageBitmap = async () => ({
    width: 1920,
    height: 1080,
    close: () => {}
  });

  const file = new File([new Uint8Array([1, 2, 3])], 'photo.png', { type: 'image/png' });
  const info = await inspectImageFile(file, 'png');

  assert.equal(info.signatureFormat, 'PNG');
  assert.equal(info.browserMime, 'image/png');
  assert.equal(info.width, 1920);
  assert.equal(info.height, 1080);
  assert.equal(info.aspectRatio, '1.78');
  assert.equal(info.canDecode, true);
  assert.equal(info.error, null);

  globalThis.createImageBitmap = originalCreateBitmap;
});

test('inspectImageFile: handles decode failure gracefully without crashing', async () => {
  const originalCreateBitmap = globalThis.createImageBitmap;
  globalThis.createImageBitmap = async () => {
    throw new Error('Corrupt image data');
  };

  const file = new File([new Uint8Array([1, 2, 3])], 'corrupt.jpg', { type: 'image/jpeg' });
  const info = await inspectImageFile(file, 'jpeg');

  assert.equal(info.signatureFormat, 'JPEG');
  assert.equal(info.browserMime, 'image/jpeg');
  assert.equal(info.canDecode, false);
  assert.equal(info.width, null);
  assert.equal(info.height, null);
  assert.equal(info.error, 'Corrupt image data');

  globalThis.createImageBitmap = originalCreateBitmap;
});
