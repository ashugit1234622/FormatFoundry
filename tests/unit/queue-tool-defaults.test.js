import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FileQueue } from '../../src/core/file-queue.js';
import { ConversionRegistry, registerAllStandardRoutes } from '../../src/core/registry.js';

function createFullRegistry() {
  const registry = new ConversionRegistry();
  registerAllStandardRoutes(registry);
  return registry;
}

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

function createMockDataFile(name, textContent = '', size = 100) {
  return {
    name,
    size,
    slice(start, end) {
      return {
        async arrayBuffer() {
          return new ArrayBuffer(0);
        }
      };
    },
    async text() {
      return textContent;
    }
  };
}

const PNG_BYTES = [137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0, 0, 0, 0, 0];
const WEBP_BYTES = [82, 73, 70, 70, 36, 0, 0, 0, 87, 69, 66, 80, 86, 80, 56, 32];

describe('FileQueue Tool Defaults & Preferred Targets', () => {
  it('initializes with default preferred options if omitted', () => {
    const registry = createFullRegistry();
    const queue = new FileQueue({ registry });
    assert.equal(queue.preferredTarget, null);
    assert.equal(queue.preferredSource, null);
  });

  it('automatically selects preferredTarget when matching source is staged', async () => {
    const registry = createFullRegistry();
    const queue = new FileQueue({
      registry,
      preferredTarget: 'jpeg',
      preferredSource: 'png'
    });

    const file = createMockImageFile('picture.png', PNG_BYTES);
    const item = queue.add(file);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const updated = queue.getItem(item.id);
    assert.equal(updated.status, 'ready');
    assert.equal(updated.selectedTarget, 'jpeg');
    assert.ok(updated.availableTargets.includes('jpeg'));
    assert.ok(updated.availableTargets.includes('webp'));
  });

  it('auto-selects png for webp-to-png tool configuration', async () => {
    const registry = createFullRegistry();
    const queue = new FileQueue({
      registry,
      preferredTarget: 'png',
      preferredSource: 'webp'
    });

    const file = createMockImageFile('photo.webp', WEBP_BYTES);
    const item = queue.add(file);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const updated = queue.getItem(item.id);
    assert.equal(updated.status, 'ready');
    assert.equal(updated.selectedTarget, 'png');
  });

  it('reconciles and provides fallback when staged file cannot use preferred target', async () => {
    const registry = createFullRegistry();
    const queue = new FileQueue({
      registry,
      preferredTarget: 'jpeg',
      preferredSource: 'png'
    });

    const jsonFile = createMockDataFile('test.json', JSON.stringify([{ id: 1 }]));
    const item = queue.add(jsonFile);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const updated = queue.getItem(item.id);
    assert.equal(updated.status, 'ready');
    assert.notEqual(updated.selectedTarget, 'jpeg');
    assert.equal(updated.selectedTarget, updated.availableTargets[0]);
  });

  it('allows user to manually override and change the target format', async () => {
    const registry = createFullRegistry();
    const queue = new FileQueue({
      registry,
      preferredTarget: 'jpeg',
      preferredSource: 'png'
    });

    const file = createMockImageFile('picture.png', PNG_BYTES);
    const item = queue.add(file);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const initial = queue.getItem(item.id);
    assert.equal(initial.selectedTarget, 'jpeg');

    const changed = queue.setTarget(item.id, 'webp');
    assert.equal(changed, true);
    assert.equal(queue.getItem(item.id).selectedTarget, 'webp');
  });

  it('rejects unsupported target changes gracefully', async () => {
    const registry = createFullRegistry();
    const queue = new FileQueue({ registry });

    const file = createMockImageFile('picture.png', PNG_BYTES);
    const item = queue.add(file);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const changed = queue.setTarget(item.id, 'markdown');
    assert.equal(changed, false);
    assert.notEqual(queue.getItem(item.id).selectedTarget, 'markdown');
  });
});
