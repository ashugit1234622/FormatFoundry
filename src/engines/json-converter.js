import { generateOutputFilename } from '../core/filename-utils.js';

export function parseJsonSafely(text) {
  if (typeof text !== 'string') {
    throw new TypeError('JSON input must be a string');
  }

  const trimmed = text.trim();
  if (trimmed === '') {
    throw new Error('JSON input is empty');
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    let line = 1;
    let column = 1;
    const match = err.message.match(/at position (\d+)/i);
    if (match) {
      const pos = parseInt(match[1], 10);
      const lines = text.slice(0, pos).split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
      throw new Error(`Malformed JSON: ${err.message} (line ${line}, column ${column})`);
    }
    throw new Error(`Malformed JSON: ${err.message}`);
  }
}

export function formatJsonText(text, mode = 'pretty', indent = 2) {
  const parsed = parseJsonSafely(text);
  if (mode === 'minify') {
    return JSON.stringify(parsed);
  }
  return JSON.stringify(parsed, null, indent);
}

export async function convertJson(file, targetFormat = 'json-pretty') {
  if (!file) {
    throw new Error('No JSON file provided for conversion');
  }

  const text = await file.text();
  const mode = targetFormat === 'json-minify' ? 'minify' : 'pretty';
  const formattedText = formatJsonText(text, mode);

  const blob = new Blob([formattedText], { type: 'application/json;charset=utf-8' });
  const filename = generateOutputFilename(file.name || 'data.json', targetFormat);
  const url = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(blob)
    : '';

  return {
    blob,
    url,
    filename,
    size: blob.size,
    format: 'json'
  };
}
