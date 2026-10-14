import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeImageFormat,
  formatToExtension,
  formatToMime,
  generateOutputFilename
} from '../../src/core/filename-utils.js';

test('normalizeImageFormat: normalizes casing and aliases', () => {
  assert.equal(normalizeImageFormat('PNG'), 'png');
  assert.equal(normalizeImageFormat('.jpg'), 'jpeg');
  assert.equal(normalizeImageFormat('jpeg'), 'jpeg');
  assert.equal(normalizeImageFormat('.WEBP'), 'webp');
  assert.equal(normalizeImageFormat(''), '');
  assert.equal(normalizeImageFormat(null), '');
});

test('formatToExtension: returns standard file extensions', () => {
  assert.equal(formatToExtension('jpeg'), 'jpg');
  assert.equal(formatToExtension('jpg'), 'jpg');
  assert.equal(formatToExtension('png'), 'png');
  assert.equal(formatToExtension('webp'), 'webp');
});

test('formatToMime: returns standard image MIME types', () => {
  assert.equal(formatToMime('jpeg'), 'image/jpeg');
  assert.equal(formatToMime('jpg'), 'image/jpeg');
  assert.equal(formatToMime('png'), 'image/png');
  assert.equal(formatToMime('webp'), 'image/webp');
  assert.equal(formatToMime('unknown'), '');
});

test('generateOutputFilename: generates clean output filenames with target extensions', () => {
  assert.equal(generateOutputFilename('photo.png', 'jpeg'), 'photo.jpg');
  assert.equal(generateOutputFilename('archive.backup.jpg', 'webp'), 'archive.backup.webp');
  assert.equal(generateOutputFilename('graphic.webp', 'png'), 'graphic.png');
  assert.equal(generateOutputFilename('noextension', 'jpeg'), 'noextension.jpg');
  assert.equal(generateOutputFilename('', 'png'), 'converted.png');
  assert.equal(generateOutputFilename(null, 'webp'), 'converted.webp');
});
