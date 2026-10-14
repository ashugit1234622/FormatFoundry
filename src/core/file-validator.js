import { formatBytes } from './formatters.js';

export const DEFAULT_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export function extractFileExtension(filename) {
  if (typeof filename !== 'string') {
    return '';
  }

  const trimmed = filename.trim();
  const lastDotIndex = trimmed.lastIndexOf('.');

  if (lastDotIndex <= 0 || lastDotIndex === trimmed.length - 1) {
    return '';
  }

  return trimmed.slice(lastDotIndex + 1).toLowerCase();
}

export function validateFile(file, options = {}) {
  const maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES;

  if (!file || typeof file.size !== 'number' || typeof file.name !== 'string') {
    return {
      valid: false,
      error: 'Invalid file reference',
      extension: '',
      sizeFormatted: '0 B'
    };
  }

  const extension = extractFileExtension(file.name);
  const sizeFormatted = formatBytes(file.size);

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty (0 bytes)',
      extension,
      sizeFormatted
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File exceeds maximum allowed size of ${formatBytes(maxSizeBytes)}`,
      extension,
      sizeFormatted
    };
  }

  return {
    valid: true,
    error: null,
    extension,
    sizeFormatted
  };
}
