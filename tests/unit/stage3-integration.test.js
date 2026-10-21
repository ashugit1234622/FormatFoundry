import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

globalThis.window = new JSDOM('').window;

import { FileQueue } from '../../src/core/file-queue.js';
import { ConversionRegistry, registerAllStandardRoutes } from '../../src/core/registry.js';
import { convertFile } from '../../src/engines/dispatcher.js';
import { generateOutputFilename, normalizeFormat } from '../../src/core/filename-utils.js';

test('Stage 3 Integration: registry holds all image, data, and text routes', () => {
  const registry = new ConversionRegistry();
  registerAllStandardRoutes(registry);

  assert.deepEqual(registry.getAvailableTargets('png'), ['jpeg', 'webp', 'pdf', 'pptx']);
  assert.deepEqual(registry.getAvailableTargets('jpeg'), ['png', 'webp', 'pdf', 'pptx']);
  assert.deepEqual(registry.getAvailableTargets('webp'), ['png', 'jpeg', 'pdf', 'pptx']);

  assert.deepEqual(registry.getAvailableTargets('json'), ['json-pretty', 'json-minify', 'csv', 'tsv']);
  assert.deepEqual(registry.getAvailableTargets('csv'), ['json', 'tsv']);
  assert.deepEqual(registry.getAvailableTargets('tsv'), ['csv', 'json']);
  assert.deepEqual(registry.getAvailableTargets('markdown'), ['html', 'pdf', 'docx', 'pptx']);
});

test('Stage 3 Integration: filename generation formats filenames properly', () => {
  assert.equal(generateOutputFilename('config.json', 'json-pretty'), 'config.formatted.json');
  assert.equal(generateOutputFilename('config.json', 'json-minify'), 'config.min.json');
  assert.equal(generateOutputFilename('users.json', 'csv'), 'users.csv');
  assert.equal(generateOutputFilename('table.csv', 'tsv'), 'table.tsv');
  assert.equal(generateOutputFilename('table.tsv', 'json'), 'table.json');
  assert.equal(generateOutputFilename('notes.md', 'html'), 'notes.html');
  assert.equal(generateOutputFilename('photo.png', 'jpeg'), 'photo.jpg');
});

test('Stage 3 Integration: mixed file queue accepts valid images, data, and text without cross-interference', async () => {
  const registry = new ConversionRegistry();
  registerAllStandardRoutes(registry);
  const queue = new FileQueue({ registry });

  const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const pngFile = new File([pngBytes], 'sample.png', { type: 'image/png' });

  const jsonFile = new File(['[{"id": 1, "status": "active"}]'], 'data.json', {
    type: 'application/json'
  });

  const csvFile = new File(['name,age\r\nAlice,30'], 'data.csv', {
    type: 'text/csv'
  });

  const mdFile = new File(['# Documentation\n\nContent goes here.'], 'docs.md', {
    type: 'text/markdown'
  });

  const brokenImg = new File(['not real image bytes'], 'broken.png', {
    type: 'image/png'
  });

  const unsupportedFile = new File(['some archive content'], 'archive.zip', {
    type: 'application/zip'
  });

  queue.addMultiple([pngFile, jsonFile, csvFile, mdFile, brokenImg, unsupportedFile]);

  await new Promise((resolve) => setTimeout(resolve, 80));

  const items = queue.getItems();
  assert.equal(items.length, 6);

  const pngItem = items.find((i) => i.name === 'sample.png');
  assert.equal(pngItem.status, 'ready');
  assert.equal(pngItem.detectedFormat, 'png');

  const jsonItem = items.find((i) => i.name === 'data.json');
  assert.equal(jsonItem.status, 'ready');
  assert.equal(jsonItem.detectedFormat, 'json');
  assert.deepEqual(jsonItem.availableTargets, ['json-pretty', 'json-minify', 'csv', 'tsv']);

  const csvItem = items.find((i) => i.name === 'data.csv');
  assert.equal(csvItem.status, 'ready');
  assert.equal(csvItem.detectedFormat, 'csv');
  assert.deepEqual(csvItem.availableTargets, ['json', 'tsv']);

  const mdItem = items.find((i) => i.name === 'docs.md');
  assert.equal(mdItem.status, 'ready');
  assert.equal(mdItem.detectedFormat, 'markdown');
  assert.deepEqual(mdItem.availableTargets, ['html', 'pdf', 'docx', 'pptx']);

  const brokenItem = items.find((i) => i.name === 'broken.png');
  assert.equal(brokenItem.status, 'invalid');

  const zipItem = items.find((i) => i.name === 'archive.zip');
  assert.equal(zipItem.status, 'unsupported');

  const summary = queue.getSummary();
  assert.equal(summary.count, 6);
  assert.equal(summary.readyCount, 4);
  assert.equal(summary.invalidCount, 2);
});

test('Stage 3 Integration: batch conversion processes valid files and continues past individual errors', async () => {
  const registry = new ConversionRegistry();
  registerAllStandardRoutes(registry);
  const queue = new FileQueue({ registry });

  const validJson = new File(['[{"a":1},{"a":2}]'], 'valid.json', { type: 'application/json' });
  const malformedJson = new File(['{not valid json}'], 'bad.json', { type: 'application/json' });
  const validCsv = new File(['col1,col2\r\nx,y'], 'valid.csv', { type: 'text/csv' });

  queue.addMultiple([validJson, malformedJson, validCsv]);
  await new Promise((resolve) => setTimeout(resolve, 50));

  const items = queue.getItems();
  queue.setTarget(items[0].id, 'csv');
  queue.setTarget(items[1].id, 'csv');
  queue.setTarget(items[2].id, 'tsv');

  for (const item of queue.getItems().filter((i) => i.status === 'ready')) {
    queue.setStatus(item.id, 'converting');
    try {
      const res = await convertFile(item.file, item.selectedTarget);
      queue.setResult(item.id, res);
    } catch (err) {
      queue.setStatus(item.id, 'failed', err.message);
    }
  }

  const updated = queue.getItems();
  assert.equal(updated[0].status, 'completed');
  assert.equal(updated[0].result.filename, 'valid.csv');

  assert.equal(updated[1].status, 'failed');
  assert.ok(updated[1].error.includes('Malformed JSON') || updated[1].error.includes('valid JSON'));

  assert.equal(updated[2].status, 'completed');
  assert.equal(updated[2].result.filename, 'valid.tsv');
});
