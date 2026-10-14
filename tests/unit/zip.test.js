import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveUniqueFilename, createZipArchive } from '../../src/utils/zip.js';

test('resolveUniqueFilename: returns original name on first encounter', () => {
  const map = new Map();
  const name1 = resolveUniqueFilename('image.png', map);
  assert.equal(name1, 'image.png');
});

test('resolveUniqueFilename: appends deterministic collision suffix on duplicates', () => {
  const map = new Map();
  assert.equal(resolveUniqueFilename('image.png', map), 'image.png');
  assert.equal(resolveUniqueFilename('image.png', map), 'image (2).png');
  assert.equal(resolveUniqueFilename('image.png', map), 'image (3).png');
});

test('resolveUniqueFilename: handles extensionless filenames and fallbacks', () => {
  const map = new Map();
  assert.equal(resolveUniqueFilename('data', map), 'data');
  assert.equal(resolveUniqueFilename('data', map), 'data (2)');

  assert.equal(resolveUniqueFilename('', map), 'download');
  assert.equal(resolveUniqueFilename('   ', map), 'download (2)');
});

test('createZipArchive: throws when items list is empty or invalid', async () => {
  await assert.rejects(() => createZipArchive([]), {
    message: /No files provided for ZIP archive/
  });

  await assert.rejects(() => createZipArchive(null), {
    message: /No files provided for ZIP archive/
  });

  await assert.rejects(() => createZipArchive([{ status: 'failed' }]), {
    message: /No completed conversions available to archive/
  });
});

test('createZipArchive: creates zip blob for valid items', async () => {
  const blob1 = new Blob(['hello world'], { type: 'text/plain' });
  const blob2 = new Blob(['name,age\nAlice,30'], { type: 'text/csv' });

  const items = [
    { filename: 'hello.txt', blob: blob1 },
    { filename: 'hello.txt', blob: blob2 }
  ];

  const archive = await createZipArchive(items);
  assert.equal(archive.filename, 'FormatFoundry-Converted.zip');
  assert.equal(archive.count, 2);
  assert.equal(archive.blob.type, 'application/zip');
  assert.ok(archive.size > 0);
});
