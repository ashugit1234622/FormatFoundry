import test from 'node:test';
import assert from 'node:assert/strict';
import { detectImageSignature, sniffFileImageFormat } from '../../src/core/image-sniffer.js';

test('detectImageSignature: detects valid PNG 8-byte signature', () => {
  const pngHeader = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13]);
  assert.equal(detectImageSignature(pngHeader), 'png');
});

test('detectImageSignature: detects valid JPEG 3-byte signature', () => {
  const jpegHeader = new Uint8Array([255, 216, 255, 224, 0, 16, 74, 70, 73, 70]);
  assert.equal(detectImageSignature(jpegHeader), 'jpeg');
});

test('detectImageSignature: detects valid WebP 12-byte RIFF/WEBP signature', () => {
  const webpHeader = new Uint8Array([
    82, 73, 70, 70,
    36, 0, 0, 0,
    87, 69, 66, 80,
    86, 80, 56, 32
  ]);
  assert.equal(detectImageSignature(webpHeader), 'webp');
});

test('detectImageSignature: returns null for truncated or invalid byte sequences', () => {
  assert.equal(detectImageSignature(null), null);
  assert.equal(detectImageSignature(new Uint8Array([])), null);
  assert.equal(detectImageSignature(new Uint8Array([137, 80, 78])), null);
  assert.equal(detectImageSignature(new Uint8Array([255, 216])), null);
  assert.equal(detectImageSignature(new Uint8Array([82, 73, 70, 70, 0, 0, 0, 0, 87, 69])), null);
  assert.equal(detectImageSignature(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])), null);
  assert.equal(detectImageSignature(new Uint8Array([71, 73, 70, 56, 57, 97])), null);
});

test('sniffFileImageFormat: safely reads slice from mock file or Blob', async () => {
  const mockPngFile = {
    size: 100,
    slice(start, end) {
      return {
        async arrayBuffer() {
          const arr = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0, 0, 0, 0, 0]);
          return arr.buffer;
        }
      };
    }
  };

  const detected = await sniffFileImageFormat(mockPngFile);
  assert.equal(detected, 'png');

  const emptyFile = { size: 0, slice: () => ({ arrayBuffer: async () => new ArrayBuffer(0) }) };
  assert.equal(await sniffFileImageFormat(emptyFile), null);

  assert.equal(await sniffFileImageFormat(null), null);
});
