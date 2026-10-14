import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="dropzone"></div><div id="staged-container"></div></body></html>', {
  url: 'http://localhost:3000/'
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Blob = dom.window.Blob;
globalThis.File = dom.window.File;
globalThis.FileReader = dom.window.FileReader;
globalThis.URL = {
  createObjectURL: (blob) => `blob:http://localhost:3000/${Math.random().toString(36).slice(2)}`,
  revokeObjectURL: () => {}
};

import { FileQueue } from '../../src/core/file-queue.js';
import { defaultRegistry, registerAllStandardRoutes } from '../../src/core/registry.js';
import { setupDropzone } from '../../src/ui/dropzone.js';
import { setupStagedList } from '../../src/ui/staged-list.js';
import { convertFile } from '../../src/engines/dispatcher.js';

registerAllStandardRoutes(defaultRegistry);

function getFixtureFile(relativePath, mimeType) {
  const fullPath = path.resolve(relativePath);
  const buffer = fs.readFileSync(fullPath);
  const filename = path.basename(fullPath);
  return new File([buffer], filename, { type: mimeType });
}

test('DOM Verification: Multi-format file staging, DOM inspection, conversion, download links, and ZIP creation', async () => {
  const dropzoneEl = document.getElementById('dropzone');
  const stagedEl = document.getElementById('staged-container');

  const queue = new FileQueue({ registry: defaultRegistry });

  async function handleConvertItem(item) {
    if (!item || !item.selectedTarget || item.status === 'converting') {
      return;
    }
    queue.setStatus(item.id, 'converting');
    try {
      const result = await convertFile(item.file, item.selectedTarget, {
        sourceFormat: item.detectedFormat,
        arrayProperty: item.selectedArrayProperty || null
      });
      queue.setResult(item.id, result);
    } catch (err) {
      queue.setStatus(item.id, 'failed', err.message);
    }
  }

  async function handleConvertAll() {
    const readyItems = queue.getItems().filter((i) => i.status === 'ready');
    for (const item of readyItems) {
      await handleConvertItem(item);
    }
  }

  setupDropzone({
    container: dropzoneEl,
    onFilesSelected: (files) => queue.addMultiple(files)
  });

  setupStagedList({
    container: stagedEl,
    queue,
    onConvertItem: handleConvertItem,
    onConvertAll: handleConvertAll
  });

  assert.ok(dropzoneEl.querySelector('#file-input'));
  assert.ok(stagedEl.querySelector('.empty-state'));

  const jsonFile = getFixtureFile('tests/fixtures/airports.json', 'application/json');
  const csvFile = getFixtureFile('tests/fixtures/sample.csv', 'text/csv');
  const tsvFile = getFixtureFile('tests/fixtures/sample.tsv', 'text/tab-separated-values');
  const mdFile = getFixtureFile('tests/fixtures/sample.md', 'text/markdown');

  queue.addMultiple([jsonFile, csvFile, tsvFile, mdFile]);

  await new Promise((resolve) => setTimeout(resolve, 80));

  const stagedCards = stagedEl.querySelectorAll('.staged-item');
  assert.equal(stagedCards.length, 4);

  const summaryEl = stagedEl.querySelector('.staging-summary');
  assert.ok(summaryEl.textContent.includes('4 files staged'));

  const airportCard = Array.from(stagedCards).find((c) => c.textContent.includes('airports.json'));
  assert.ok(airportCard);
  const airportBadge = airportCard.querySelector('.item-ext-badge');
  assert.equal(airportBadge.textContent, 'JSON');
  const airportSelect = airportCard.querySelector('select[data-action="change-target"]');
  assert.ok(airportSelect);
  airportSelect.value = 'csv';
  airportSelect.dispatchEvent(new dom.window.Event('change', { bubbles: true }));

  await new Promise((resolve) => setTimeout(resolve, 30));

  const convertBtn = airportCard.querySelector('button[data-action="convert"]');
  assert.ok(convertBtn);
  convertBtn.click();

  await new Promise((resolve) => setTimeout(resolve, 80));

  const updatedAirportCard = Array.from(stagedEl.querySelectorAll('.staged-item')).find((c) =>
    c.textContent.includes('airports.json')
  );
  const airportStatus = updatedAirportCard.querySelector('.status-badge');
  assert.equal(airportStatus.textContent.trim(), 'Converted');

  const downloadLink = updatedAirportCard.querySelector('a[data-action="download"]');
  assert.ok(downloadLink);
  assert.equal(downloadLink.getAttribute('download'), 'airports.csv');
  assert.ok(downloadLink.getAttribute('href').startsWith('blob:'));

  const convertAllBtn = stagedEl.querySelector('[data-action="convert-all"]');
  assert.ok(convertAllBtn);
  convertAllBtn.click();

  await new Promise((resolve) => setTimeout(resolve, 150));

  const allCompletedCards = stagedEl.querySelectorAll('.staged-item.is-completed');
  assert.equal(allCompletedCards.length, 4);

  const downloadLinks = stagedEl.querySelectorAll('a[data-action="download"]');
  assert.equal(downloadLinks.length, 4);

  const zipBtn = stagedEl.querySelector('[data-action="download-zip"]');
  assert.ok(zipBtn);
  assert.equal(zipBtn.hasAttribute('disabled'), false);

  zipBtn.click();
  await new Promise((resolve) => setTimeout(resolve, 100));

  assert.equal(zipBtn.hasAttribute('disabled'), false);
});
