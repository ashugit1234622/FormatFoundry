import TurndownService from 'turndown';
import { sanitizeHtml } from '../utils/sanitizer.js';
import { generateOutputFilename, normalizeFormat } from '../core/filename-utils.js';
import { formatBytes } from '../core/formatters.js';

let cachedTurndown = null;

function getTurndownService() {
  if (cachedTurndown) {
    return cachedTurndown;
  }
  cachedTurndown = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced'
  });
  return cachedTurndown;
}

export function htmlToMarkdown(htmlContent) {
  if (typeof htmlContent !== 'string') {
    throw new TypeError('HTML input must be a string');
  }

  const clean = sanitizeHtml(htmlContent.trim());
  if (!clean) {
    return '';
  }

  const turndown = getTurndownService();
  return turndown.turndown(clean);
}

export async function convertHtml(file, targetFormat = 'markdown') {
  if (!file) {
    throw new Error('No HTML file provided for conversion');
  }

  const text = await file.text();
  const normalizedTarget = normalizeFormat(targetFormat);

  if (normalizedTarget !== 'markdown') {
    throw new Error(`Unsupported HTML conversion target: "${targetFormat}"`);
  }

  const mdContent = htmlToMarkdown(text);
  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
  const filename = generateOutputFilename(file.name || 'document.html', normalizedTarget);
  const url = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(blob)
    : '';

  return {
    blob,
    url,
    filename,
    size: blob.size,
    sizeFormatted: formatBytes(blob.size),
    mimeType: blob.type,
    format: normalizedTarget
  };
}
