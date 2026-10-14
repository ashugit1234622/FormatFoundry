import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFile, extractFileExtension } from '../../src/core/file-validator.js';
import { formatBytes } from '../../src/core/formatters.js';

test('formatBytes: formats binary byte quantities', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(-10), '0 B');
  assert.equal(formatBytes(null), '0 B');
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1536), '1.5 KB');
  assert.equal(formatBytes(1048576), '1 MB');
  assert.equal(formatBytes(1048576 * 5.25), '5.3 MB');
  assert.equal(formatBytes(1073741824), '1 GB');
});

test('extractFileExtension: extracts lowercase extensions safely', () => {
  assert.equal(extractFileExtension('document.pdf'), 'pdf');
  assert.equal(extractFileExtension('PHOTO.PNG'), 'png');
  assert.equal(extractFileExtension('archive.tar.gz'), 'gz');
  assert.equal(extractFileExtension('.gitignore'), '');
  assert.equal(extractFileExtension('noextension'), '');
  assert.equal(extractFileExtension(''), '');
  assert.equal(extractFileExtension(null), '');
});

test('validateFile: rejects invalid file references', () => {
  const resultNull = validateFile(null);
  assert.equal(resultNull.valid, false);
  assert.equal(resultNull.error, 'Invalid file reference');

  const resultMissingProps = validateFile({});
  assert.equal(resultMissingProps.valid, false);
});

test('validateFile: safely handles empty files (0 bytes)', () => {
  const emptyFile = { name: 'empty.txt', size: 0 };
  const result = validateFile(emptyFile);

  assert.equal(result.valid, false);
  assert.equal(result.error, 'File is empty (0 bytes)');
  assert.equal(result.extension, 'txt');
  assert.equal(result.sizeFormatted, '0 B');
});

test('validateFile: validates files within size limit', () => {
  const validFile = { name: 'data.json', size: 1024 * 100 };
  const result = validateFile(validFile);

  assert.equal(result.valid, true);
  assert.equal(result.error, null);
  assert.equal(result.extension, 'json');
  assert.equal(result.sizeFormatted, '100 KB');
});

test('validateFile: enforces maximum file size limit', () => {
  const oversizedFile = { name: 'huge-video.mp4', size: 60 * 1024 * 1024 };
  const result = validateFile(oversizedFile, { maxSizeBytes: 50 * 1024 * 1024 });

  assert.equal(result.valid, false);
  assert.match(result.error, /exceeds maximum allowed size/);
  assert.equal(result.extension, 'mp4');
});
