import test from 'node:test';
import assert from 'node:assert/strict';
import { FileQueue } from '../../src/core/file-queue.js';
import { ConversionRegistry, registerStandardImageRoutes } from '../../src/core/registry.js';

function createMockImageFile(name, signatureBytes, size = 1024) {
  return {
    name,
    size,
    slice(start, end) {
      return {
        async arrayBuffer() {
          const arr = new Uint8Array(signatureBytes);
          return arr.buffer;
        }
      };
    }
  };
}

const PNG_BYTES = [137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0, 0, 0, 0, 0];
const JPEG_BYTES = [255, 216, 255, 224, 0, 16, 74, 70, 73, 70, 0, 0, 0, 0, 0, 0];
const WEBP_BYTES = [82, 73, 70, 70, 36, 0, 0, 0, 87, 69, 66, 80, 86, 80, 56, 32];
const TEXT_BYTES = [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80];

test('FileQueue: manages file items and metrics summary', () => {
  const registry = new ConversionRegistry();
  registerStandardImageRoutes(registry);
  const queue = new FileQueue({ registry, maxSizeBytes: 10 * 1024 * 1024 });

  assert.equal(queue.getItems().length, 0);
  assert.deepEqual(queue.getSummary(), {
    count: 0,
    totalBytes: 0,
    totalFormatted: '0 B',
    validCount: 0,
    invalidCount: 0,
    readyCount: 0,
    completedCount: 0
  });

  const emptyItem = queue.add({ name: 'empty.txt', size: 0 });
  assert.equal(emptyItem.name, 'empty.txt');
  assert.equal(emptyItem.valid, false);
  assert.equal(emptyItem.status, 'invalid');

  const summary = queue.getSummary();
  assert.equal(summary.count, 1);
  assert.equal(summary.invalidCount, 1);

  queue.clear();
  assert.equal(queue.getItems().length, 0);
});

test('FileQueue: inspects valid PNG file and sets ready state with targets', async () => {
  const registry = new ConversionRegistry();
  registerStandardImageRoutes(registry);
  const queue = new FileQueue({ registry });

  const mockFile = createMockImageFile('test.png', PNG_BYTES);
  const item = queue.add(mockFile);

  await new Promise((resolve) => setTimeout(resolve, 50));

  const updatedItem = queue.getItem(item.id);
  assert.equal(updatedItem.status, 'ready');
  assert.equal(updatedItem.detectedFormat, 'png');
  assert.equal(updatedItem.extensionMismatch, false);
  assert.deepEqual(updatedItem.availableTargets, ['jpeg', 'webp']);
  assert.equal(updatedItem.selectedTarget, 'jpeg');

  const changed = queue.setTarget(item.id, 'webp');
  assert.equal(changed, true);
  assert.equal(queue.getItem(item.id).selectedTarget, 'webp');
});

test('FileQueue: detects extension mismatch when file extension differs from bytes', async () => {
  const registry = new ConversionRegistry();
  registerStandardImageRoutes(registry);
  const queue = new FileQueue({ registry });

  const mockFile = createMockImageFile('disguised.jpg', PNG_BYTES);
  const item = queue.add(mockFile);

  await new Promise((resolve) => setTimeout(resolve, 50));

  const updatedItem = queue.getItem(item.id);
  assert.equal(updatedItem.status, 'ready');
  assert.equal(updatedItem.detectedFormat, 'png');
  assert.equal(updatedItem.extensionMismatch, true);
  assert.deepEqual(updatedItem.availableTargets, ['jpeg', 'webp']);
});

test('FileQueue: flags corrupted image files as invalid', async () => {
  const registry = new ConversionRegistry();
  registerStandardImageRoutes(registry);
  const queue = new FileQueue({ registry });

  const brokenFile = createMockImageFile('broken.png', TEXT_BYTES);
  const item = queue.add(brokenFile);

  await new Promise((resolve) => setTimeout(resolve, 50));

  const updatedItem = queue.getItem(item.id);
  assert.equal(updatedItem.status, 'invalid');
  assert.equal(updatedItem.valid, false);
  assert.match(updatedItem.error, /Invalid or corrupted image header/);
});

test('FileQueue: flags non-image file extensions as unsupported', async () => {
  const registry = new ConversionRegistry();
  registerStandardImageRoutes(registry);
  const queue = new FileQueue({ registry });

  const textFile = createMockImageFile('readme.txt', TEXT_BYTES);
  const item = queue.add(textFile);

  await new Promise((resolve) => setTimeout(resolve, 50));

  const updatedItem = queue.getItem(item.id);
  assert.equal(updatedItem.status, 'unsupported');
  assert.equal(updatedItem.valid, false);
  assert.match(updatedItem.error, /Unsupported format/);
});

test('FileQueue: manages result state and revocation', () => {
  const registry = new ConversionRegistry();
  const queue = new FileQueue({ registry });

  const item = queue.add({ name: 'photo.png', size: 100 });
  assert.equal(item.status, 'inspecting');

  queue.setResult(item.id, {
    url: 'blob:http://localhost/test-uuid',
    filename: 'photo.webp',
    sizeFormatted: '80 B'
  });

  const updated = queue.getItem(item.id);
  assert.equal(updated.status, 'completed');
  assert.equal(updated.result.filename, 'photo.webp');

  const removed = queue.remove(item.id);
  assert.equal(removed, true);
  assert.equal(queue.getItems().length, 0);
});
