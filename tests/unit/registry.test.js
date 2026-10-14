import test from 'node:test';
import assert from 'node:assert/strict';
import { ConversionRegistry, registerStandardImageRoutes } from '../../src/core/registry.js';

test('ConversionRegistry: registers and queries routes', () => {
  const registry = new ConversionRegistry();

  registry.registerRoute({
    from: 'png',
    to: 'webp',
    category: 'image',
    description: 'Lossless WebP'
  });

  assert.equal(registry.hasRoute('png', 'webp'), true);
  assert.equal(registry.hasRoute('webp', 'png'), false);

  const route = registry.getRoute('png', 'webp');
  assert.ok(route);
  assert.equal(route.from, 'png');
  assert.equal(route.to, 'webp');
  assert.equal(route.category, 'image');
  assert.equal(route.description, 'Lossless WebP');
});

test('ConversionRegistry: normalizes format casing, dots, and jpg aliases', () => {
  const registry = new ConversionRegistry();

  registry.registerRoute({
    from: '.PNG',
    to: '.WEBP',
    category: 'image'
  });

  assert.equal(registry.hasRoute('png', 'webp'), true);
  assert.equal(registry.hasRoute('.png', '.webp'), true);
  assert.equal(registry.hasRoute('PNG', 'WEBP'), true);

  const targets = registry.getAvailableTargets('.png');
  assert.deepEqual(targets, ['webp']);

  registry.registerRoute({
    from: 'jpg',
    to: 'png',
    category: 'image'
  });

  assert.equal(registry.hasRoute('jpeg', 'png'), true);
  assert.equal(registry.hasRoute('jpg', 'png'), true);
});

test('ConversionRegistry: rejects identical from and to formats', () => {
  const registry = new ConversionRegistry();

  assert.throws(
    () => {
      registry.registerRoute({
        from: 'png',
        to: 'png',
        category: 'image'
      });
    },
    {
      name: 'Error',
      message: 'Source and target formats cannot be identical'
    }
  );

  assert.throws(
    () => {
      registry.registerRoute({
        from: 'jpg',
        to: 'jpeg',
        category: 'image'
      });
    },
    {
      name: 'Error',
      message: 'Source and target formats cannot be identical'
    }
  );
});

test('ConversionRegistry: rejects incomplete route definitions', () => {
  const registry = new ConversionRegistry();

  assert.throws(() => registry.registerRoute(null), { name: 'TypeError' });
  assert.throws(() => registry.registerRoute({ to: 'webp', category: 'image' }), { name: 'Error' });
  assert.throws(() => registry.registerRoute({ from: 'png', category: 'image' }), { name: 'Error' });
  assert.throws(() => registry.registerRoute({ from: 'png', to: 'webp' }), { name: 'Error' });
});

test('ConversionRegistry: registerStandardImageRoutes populates 9 active routes including SVG', () => {
  const registry = new ConversionRegistry();
  registerStandardImageRoutes(registry);

  assert.equal(registry.getAllRoutes().length, 9);

  assert.deepEqual(registry.getAvailableTargets('png'), ['jpeg', 'webp']);
  assert.deepEqual(registry.getAvailableTargets('jpeg'), ['png', 'webp']);
  assert.deepEqual(registry.getAvailableTargets('jpg'), ['png', 'webp']);
  assert.deepEqual(registry.getAvailableTargets('webp'), ['png', 'jpeg']);
  assert.deepEqual(registry.getAvailableTargets('svg'), ['png', 'jpeg', 'webp']);

  assert.deepEqual(registry.getAvailableTargets('gif'), []);
  assert.deepEqual(registry.getAvailableTargets('pdf'), []);
  assert.deepEqual(registry.getAvailableTargets('json'), []);
});
