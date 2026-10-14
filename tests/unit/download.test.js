import test from 'node:test';
import assert from 'node:assert/strict';
import { downloadBlob } from '../../src/utils/download.js';

test('downloadBlob: throws TypeError if blob is not a valid Blob instance', () => {
  assert.throws(
    () => {
      downloadBlob(null, 'file.png');
    },
    {
      name: 'TypeError',
      message: 'A valid Blob instance is required for download.'
    }
  );

  assert.throws(
    () => {
      downloadBlob({}, 'file.png');
    },
    {
      name: 'TypeError'
    }
  );
});

test('downloadBlob: creates anchor, triggers click, and removes anchor', () => {
  const originalCreateObjectURL = globalThis.URL?.createObjectURL;
  const originalRevokeObjectURL = globalThis.URL?.revokeObjectURL;
  const originalDocument = globalThis.document;

  let createdUrl = null;
  let clicked = false;
  let appendedChild = null;
  let removedChild = null;

  globalThis.URL = globalThis.URL || {};
  globalThis.URL.createObjectURL = () => {
    createdUrl = 'blob:http://localhost:3000/mock-uuid';
    return createdUrl;
  };
  globalThis.URL.revokeObjectURL = () => {};

  const mockAnchor = {
    style: {},
    href: '',
    download: '',
    click() {
      clicked = true;
    }
  };

  globalThis.document = {
    createElement(tag) {
      if (tag === 'a') {
        return mockAnchor;
      }
      return {};
    },
    body: {
      appendChild(node) {
        appendedChild = node;
      },
      removeChild(node) {
        removedChild = node;
      }
    }
  };

  const realBlob = new Blob(['sample-data'], { type: 'image/png' });
  downloadBlob(realBlob, 'custom-image.webp');

  assert.equal(mockAnchor.href, 'blob:http://localhost:3000/mock-uuid');
  assert.equal(mockAnchor.download, 'custom-image.webp');
  assert.equal(clicked, true);
  assert.equal(appendedChild, mockAnchor);
  assert.equal(removedChild, mockAnchor);

  if (originalCreateObjectURL) {
    globalThis.URL.createObjectURL = originalCreateObjectURL;
  }
  if (originalRevokeObjectURL) {
    globalThis.URL.revokeObjectURL = originalRevokeObjectURL;
  }
  globalThis.document = originalDocument;
});
