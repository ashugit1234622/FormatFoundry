import test from 'node:test';
import assert from 'node:assert/strict';
import { convertImage } from '../../src/engines/image-converter.js';

test('convertImage: rejects when no file is provided', async () => {
  await assert.rejects(
    async () => {
      await convertImage(null, 'webp');
    },
    {
      name: 'Error',
      message: 'No image file provided for conversion.'
    }
  );
});

test('convertImage: rejects when target format is unsupported', async () => {
  const mockFile = { name: 'test.png', size: 100 };
  await assert.rejects(
    async () => {
      await convertImage(mockFile, 'gif');
    },
    {
      name: 'Error',
      message: 'Unsupported output format: "gif".'
    }
  );
});

test('convertImage: rejects safely when browser decoding APIs are not available', async () => {
  const mockFile = { name: 'test.png', size: 100 };
  await assert.rejects(
    async () => {
      await convertImage(mockFile, 'webp');
    },
    {
      name: 'Error'
    }
  );
});
