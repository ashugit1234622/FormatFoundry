export function normalizeFormat(format) {
  if (typeof format !== 'string') {
    return '';
  }
  const clean = format.trim().replace(/^\./, '').toLowerCase();
  if (clean === 'jpg') {
    return 'jpeg';
  }
  if (clean === 'md' || clean === 'mdown' || clean === 'mkd') {
    return 'markdown';
  }
  if (clean === 'htm') {
    return 'html';
  }
  if (clean === 'tab') {
    return 'tsv';
  }
  if (clean === 'txt' || clean === 'text') {
    return 'text';
  }
  if (clean === 'doc' || clean === 'docx') {
    return 'docx';
  }
  if (clean === 'ppt' || clean === 'pptx') {
    return 'pptx';
  }
  return clean;
}

export function normalizeImageFormat(format) {
  return normalizeFormat(format);
}

export function formatToExtension(format) {
  const normalized = normalizeFormat(format);
  if (normalized === 'jpeg') {
    return 'jpg';
  }
  if (normalized === 'png') {
    return 'png';
  }
  if (normalized === 'webp') {
    return 'webp';
  }
  if (normalized === 'svg') {
    return 'svg';
  }
  if (normalized === 'pdf') {
    return 'pdf';
  }
  if (normalized === 'docx') {
    return 'docx';
  }
  if (normalized === 'pptx') {
    return 'pptx';
  }
  if (normalized === 'text') {
    return 'txt';
  }
  if (normalized === 'json' || normalized === 'json-pretty' || normalized === 'json-minify') {
    return 'json';
  }
  if (normalized === 'csv') {
    return 'csv';
  }
  if (normalized === 'tsv') {
    return 'tsv';
  }
  if (normalized === 'markdown') {
    return 'md';
  }
  if (normalized === 'html') {
    return 'html';
  }
  return normalized;
}

export function formatToMime(format) {
  const normalized = normalizeFormat(format);
  if (normalized === 'jpeg') {
    return 'image/jpeg';
  }
  if (normalized === 'png') {
    return 'image/png';
  }
  if (normalized === 'webp') {
    return 'image/webp';
  }
  if (normalized === 'pdf') {
    return 'application/pdf';
  }
  if (normalized === 'docx') {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  if (normalized === 'pptx') {
    return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  }
  if (normalized === 'text') {
    return 'text/plain;charset=utf-8';
  }
  if (normalized === 'json' || normalized === 'json-pretty' || normalized === 'json-minify') {
    return 'application/json';
  }
  if (normalized === 'csv') {
    return 'text/csv;charset=utf-8';
  }
  if (normalized === 'tsv') {
    return 'text/tab-separated-values;charset=utf-8';
  }
  if (normalized === 'markdown') {
    return 'text/markdown;charset=utf-8';
  }
  if (normalized === 'html') {
    return 'text/html;charset=utf-8';
  }
  if (normalized === 'svg') {
    return 'image/svg+xml';
  }
  return '';
}

export function generateOutputFilename(originalName, targetFormat) {
  const normalized = normalizeFormat(targetFormat);
  const extension = formatToExtension(normalized);
  const fallback = `converted.${extension}`;

  if (typeof originalName !== 'string' || !originalName.trim()) {
    return fallback;
  }

  const trimmed = originalName.trim();
  const lastDot = trimmed.lastIndexOf('.');
  const rawBase = lastDot > 0 ? trimmed.slice(0, lastDot) : trimmed;
  const baseName = rawBase.replace(/^.*[\\/]/, '') || 'converted';

  if (normalized === 'json-pretty') {
    return `${baseName}.formatted.json`;
  }
  if (normalized === 'json-minify') {
    return `${baseName}.min.json`;
  }

  return `${baseName}.${extension}`;
}
