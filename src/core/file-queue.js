import { validateFile } from './file-validator.js';
import { formatBytes } from './formatters.js';
import { sniffFileImageFormat } from './image-sniffer.js';
import { defaultRegistry } from './registry.js';
import { normalizeFormat, normalizeImageFormat } from './filename-utils.js';
import { inspectImageFile } from './image-inspector.js';
import { validateAndSanitizeSvg, parseSvgDimensions } from '../engines/svg-converter.js';

let counter = 0;

function createUniqueId() {
  counter += 1;
  return `file-${Date.now()}-${counter}`;
}

function safeRevokeUrl(url) {
  if (url && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
    try {
      URL.revokeObjectURL(url);
    } catch {}
  }
}

export class FileQueue {
  constructor(options = {}) {
    this.options = options;
    this.registry = options.registry || defaultRegistry;
    this.preferredTarget = options.preferredTarget || null;
    this.preferredSource = options.preferredSource || null;
    this.items = [];
    this.listeners = new Set();
  }

  resolveInitialTarget(targets) {
    if (!Array.isArray(targets) || targets.length === 0) {
      return null;
    }
    if (this.preferredTarget && targets.includes(this.preferredTarget)) {
      return this.preferredTarget;
    }
    return targets[0];
  }

  add(file) {
    const validation = validateFile(file, this.options);
    const item = {
      id: createUniqueId(),
      file,
      name: file?.name || 'unknown',
      size: typeof file?.size === 'number' ? file.size : 0,
      sizeFormatted: validation.sizeFormatted,
      extension: validation.extension,
      detectedFormat: null,
      extensionMismatch: false,
      status: validation.valid ? 'inspecting' : 'invalid',
      valid: validation.valid,
      error: validation.error,
      availableTargets: [],
      selectedTarget: null,
      result: null,
      inspection: null
    };

    this.items.push(item);
    this.notify();

    if (item.valid) {
      this.inspectItem(item);
    }

    return item;
  }

  addMultiple(fileList) {
    if (!fileList || typeof fileList[Symbol.iterator] !== 'function') {
      return [];
    }

    const added = [];
    for (const file of fileList) {
      const item = this.add(file);
      added.push(item);
    }
    return added;
  }

  async inspectItem(item) {
    const detected = await sniffFileImageFormat(item.file);
    const stillInQueue = this.items.find((i) => i.id === item.id);
    if (!stillInQueue) {
      return;
    }

    if (detected) {
      item.detectedFormat = detected;
      const targets = this.registry.getAvailableTargets(detected);
      item.availableTargets = targets;
      item.selectedTarget = this.resolveInitialTarget(targets);

      const normExt = normalizeImageFormat(item.extension);
      if (normExt && normExt !== detected) {
        item.extensionMismatch = true;
      }

      if (targets.length > 0) {
        item.status = 'ready';
        item.valid = true;
        item.error = null;
      } else {
        item.status = 'unsupported';
        item.valid = false;
        item.error = 'No conversion targets available for this format';
      }

      item.inspection = await inspectImageFile(item.file, detected).catch(() => null);
    } else {
      const normExt = normalizeFormat(item.extension);
      const isKnownImageExt = normExt === 'png' || normExt === 'jpeg' || normExt === 'webp';

      if (normExt === 'svg') {
        try {
          if (item.file.size > 50 * 1024 * 1024) {
            throw new Error('SVG file exceeds the 50 MB maximum size limit');
          }
          const text = await item.file.text();
          const sanitized = validateAndSanitizeSvg(text);
          parseSvgDimensions(sanitized);

          item.detectedFormat = 'svg';
          const targets = this.registry.getAvailableTargets('svg');
          item.availableTargets = targets;
          item.selectedTarget = this.resolveInitialTarget(targets);

          if (targets.length > 0) {
            item.status = 'ready';
            item.valid = true;
            item.error = null;
          } else {
            item.status = 'unsupported';
            item.valid = false;
            item.error = 'No conversion targets available for this format';
          }

          item.inspection = await inspectImageFile(item.file, 'svg').catch(() => null);
        } catch (err) {
          item.status = 'invalid';
          item.valid = false;
          item.error = err instanceof Error ? err.message : 'Invalid or malformed SVG document';
          item.inspection = await inspectImageFile(item.file, 'svg').catch(() => null);
        }
      } else if (isKnownImageExt) {
        item.status = 'invalid';
        item.valid = false;
        item.error = 'Invalid or corrupted image header';
        item.inspection = await inspectImageFile(item.file, null).catch(() => null);
      } else if (normExt === 'json' || normExt === 'csv' || normExt === 'tsv' || normExt === 'markdown') {
        item.detectedFormat = normExt;
        const targets = this.registry.getAvailableTargets(normExt);
        item.availableTargets = targets;
        item.selectedTarget = this.resolveInitialTarget(targets);

        if (targets.length > 0) {
          item.status = 'ready';
          item.valid = true;
          item.error = null;
        } else {
          item.status = 'unsupported';
          item.valid = false;
          item.error = 'No conversion targets available for this format';
        }
      } else {
        item.status = 'unsupported';
        item.valid = false;
        item.error = 'Unsupported format';
      }
    }

    this.notify();
  }

  setTarget(id, targetFormat) {
    const item = this.getItem(id);
    if (!item || !item.availableTargets.includes(targetFormat)) {
      return false;
    }

    if (item.result?.url) {
      safeRevokeUrl(item.result.url);
      item.result = null;
    }

    item.selectedTarget = targetFormat;
    if (item.status === 'completed' || item.status === 'failed') {
      item.status = 'ready';
      item.error = null;
    }

    this.notify();
    return true;
  }

  setStatus(id, status, error = null) {
    const item = this.getItem(id);
    if (!item) {
      return false;
    }

    item.status = status;
    item.error = error;
    this.notify();
    return true;
  }

  setResult(id, result) {
    const item = this.getItem(id);
    if (!item) {
      return false;
    }

    if (item.result?.url && item.result.url !== result.url) {
      safeRevokeUrl(item.result.url);
    }

    item.result = result;
    item.status = 'completed';
    item.error = null;
    this.notify();
    return true;
  }

  remove(id) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }

    const [removed] = this.items.splice(index, 1);
    if (removed.result?.url) {
      safeRevokeUrl(removed.result.url);
    }

    this.notify();
    return true;
  }

  clear() {
    if (this.items.length === 0) {
      return;
    }

    for (const item of this.items) {
      if (item.result?.url) {
        safeRevokeUrl(item.result.url);
      }
    }

    this.items = [];
    this.notify();
  }

  getItems() {
    return [...this.items];
  }

  getItem(id) {
    return this.items.find((item) => item.id === id) || null;
  }

  getSummary() {
    const count = this.items.length;
    let totalBytes = 0;
    let validCount = 0;
    let invalidCount = 0;
    let readyCount = 0;
    let completedCount = 0;

    for (const item of this.items) {
      totalBytes += item.size;
      if (item.valid) {
        validCount += 1;
      } else {
        invalidCount += 1;
      }
      if (item.status === 'ready') {
        readyCount += 1;
      }
      if (item.status === 'completed') {
        completedCount += 1;
      }
    }

    return {
      count,
      totalBytes,
      totalFormatted: formatBytes(totalBytes),
      validCount,
      invalidCount,
      readyCount,
      completedCount
    };
  }

  subscribe(listener) {
    if (typeof listener !== 'function') {
      return () => {};
    }

    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    const summary = this.getSummary();
    const items = this.getItems();
    for (const listener of this.listeners) {
      try {
        listener(items, summary);
      } catch (err) {
        console.error('Error in queue listener', err);
      }
    }
  }
}
