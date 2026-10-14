import { sanitizeHtml } from '../utils/sanitizer.js';
import { generateOutputFilename, formatToMime } from '../core/filename-utils.js';

export function validateAndSanitizeSvg(svgText) {
  if (typeof svgText !== 'string') {
    throw new TypeError('SVG input must be a string');
  }

  const trimmed = svgText.trim();
  if (!trimmed.includes('<svg') || !trimmed.includes('</svg>')) {
    throw new Error('File does not contain a valid SVG document root element');
  }

  const sanitized = sanitizeHtml(trimmed, {
    USE_PROFILES: { svg: true, svgFilters: true }
  });

  if (!sanitized.includes('<svg')) {
    throw new Error('SVG document contained unsafe content or was completely filtered');
  }

  return sanitized;
}

export function parseSvgDimensions(svgText) {
  const widthMatch = svgText.match(/<svg[^>]*\bwidth=["']([0-9.]+)(px)?["']/i);
  const heightMatch = svgText.match(/<svg[^>]*\bheight=["']([0-9.]+)(px)?["']/i);
  const viewBoxMatch = svgText.match(/<svg[^>]*\bviewBox=["']([0-9.\s,-]+)["']/i);

  let width = widthMatch ? parseFloat(widthMatch[1]) : null;
  let height = heightMatch ? parseFloat(heightMatch[1]) : null;
  let viewBox = null;

  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(parseFloat);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      viewBox = {
        minX: parts[0],
        minY: parts[1],
        width: parts[2],
        height: parts[3]
      };
      if (!width || !height) {
        width = parts[2];
        height = parts[3];
      }
    }
  }

  if (!width || !height || width <= 0 || height <= 0) {
    throw new Error('SVG document lacks intrinsic dimensions (width, height, or valid viewBox)');
  }

  const aspectRatio = (width / height).toFixed(2);

  return {
    width: Math.round(width),
    height: Math.round(height),
    viewBox,
    aspectRatio,
    hasExplicitDimensions: Boolean(widthMatch && heightMatch),
    hasViewBox: Boolean(viewBoxMatch)
  };
}

export async function convertSvg(file, targetFormat, options = {}) {
  if (!file) {
    throw new Error('No SVG file provided for conversion');
  }

  if (file.size > 50 * 1024 * 1024) {
    throw new Error('SVG file exceeds the 50 MB maximum size limit');
  }

  const rawText = await file.text();
  const sanitizedSvg = validateAndSanitizeSvg(rawText);
  const dimensions = parseSvgDimensions(sanitizedSvg);

  const targetMime = formatToMime(targetFormat);
  if (!targetMime) {
    throw new Error(`Unsupported output format: "${targetFormat}"`);
  }

  if (typeof document === 'undefined' || typeof Image === 'undefined') {
    throw new Error('Browser graphics environment required for SVG rasterization');
  }

  const svgBlob = new Blob([sanitizedSvg], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Browser failed to render SVG image'));
    img.src = svgUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    URL.revokeObjectURL(svgUrl);
    throw new Error('Failed to acquire 2D canvas context for SVG rasterization');
  }

  if (targetFormat === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
  }

  ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
  URL.revokeObjectURL(svgUrl);

  const quality = typeof options.quality === 'number' ? Math.max(0.1, Math.min(1.0, options.quality)) : 0.92;

  const resultBlob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas rasterization failed to produce an output image'));
          return;
        }
        resolve(blob);
      },
      targetMime,
      quality
    );
  });

  canvas.width = 0;
  canvas.height = 0;

  if (resultBlob.type !== targetMime) {
    throw new Error(`MIME type mismatch: requested "${targetMime}" but browser produced "${resultBlob.type}"`);
  }

  const filename = generateOutputFilename(file.name || 'vector.svg', targetFormat);
  const url = URL.createObjectURL(resultBlob);

  return {
    blob: resultBlob,
    url,
    filename,
    size: resultBlob.size,
    format: targetFormat,
    dimensions
  };
}
