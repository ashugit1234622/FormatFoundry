import { formatToMime, generateOutputFilename, normalizeFormat } from '../core/filename-utils.js';
import { formatBytes } from '../core/formatters.js';

export async function convertImage(file, targetFormat, options = {}) {
  if (!file) {
    throw new Error('No image file provided for conversion.');
  }

  const normalizedTarget = normalizeFormat(targetFormat);
  const targetMime = formatToMime(normalizedTarget);
  if (!targetMime) {
    throw new Error(`Unsupported output format: "${targetFormat}".`);
  }

  if (typeof createImageBitmap !== 'function') {
    throw new Error('Image decoding API (createImageBitmap) is not supported in this browser.');
  }

  if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
    throw new Error('Canvas conversion requires a browser DOM environment.');
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('Failed to decode image. The file may be corrupted, truncated, or unreadable.');
  }

  const width = bitmap.width;
  const height = bitmap.height;

  if (!width || !height || width <= 0 || height <= 0) {
    bitmap.close();
    throw new Error('Image has invalid dimensions.');
  }

  const MAX_CANVAS_DIMENSION = 32767;
  const MAX_CANVAS_AREA = 100000000;

  if (width > MAX_CANVAS_DIMENSION || height > MAX_CANVAS_DIMENSION || (width * height) > MAX_CANVAS_AREA) {
    bitmap.close();
    throw new Error(`Image dimensions (${width}x${height}) exceed maximum supported canvas limits.`);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    canvas.width = 0;
    canvas.height = 0;
    throw new Error('Failed to allocate 2D canvas context for conversion.');
  }

  if (normalizedTarget === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const quality = normalizedTarget === 'png'
    ? undefined
    : (typeof options.quality === 'number' ? Math.max(0.1, Math.min(1.0, options.quality)) : 0.92);

  const displayFormat = normalizedTarget === 'jpeg' ? 'JPG' : normalizedTarget.toUpperCase();

  const blob = await new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (resultBlob) => {
          if (!resultBlob) {
            reject(new Error(`Browser failed to encode image to ${displayFormat}.`));
          } else {
            resolve(resultBlob);
          }
        },
        targetMime,
        quality
      );
    } catch {
      reject(new Error(`Unexpected failure during ${displayFormat} encoding.`));
    }
  });

  canvas.width = 0;
  canvas.height = 0;

  if (blob.type && blob.type.toLowerCase() !== targetMime.toLowerCase()) {
    throw new Error(
      `Browser did not encode to ${displayFormat} (produced ${blob.type || 'unknown type'}).`
    );
  }

  const outputName = generateOutputFilename(file.name, normalizedTarget);
  const url = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(blob)
    : '';

  return {
    blob,
    url,
    filename: outputName,
    size: blob.size,
    sizeFormatted: formatBytes(blob.size),
    mimeType: blob.type,
    format: normalizedTarget,
    width,
    height
  };
}
