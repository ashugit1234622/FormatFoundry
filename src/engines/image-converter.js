import { formatToMime, generateOutputFilename } from '../core/filename-utils.js';
import { formatBytes } from '../core/formatters.js';

export async function convertImage(file, targetFormat, options = {}) {
  if (!file) {
    throw new Error('No image file provided for conversion.');
  }

  const targetMime = formatToMime(targetFormat);
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

  if (targetFormat === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const quality = targetFormat === 'png' ? undefined : (options.quality ?? 0.92);

  const blob = await new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (resultBlob) => {
          if (!resultBlob) {
            reject(new Error(`Browser failed to encode image to ${targetFormat.toUpperCase()}.`));
          } else {
            resolve(resultBlob);
          }
        },
        targetMime,
        quality
      );
    } catch {
      reject(new Error(`Unexpected failure during ${targetFormat.toUpperCase()} encoding.`));
    }
  });

  canvas.width = 0;
  canvas.height = 0;

  if (blob.type !== targetMime) {
    throw new Error(
      `Browser did not encode to ${targetFormat.toUpperCase()} (produced ${blob.type || 'unknown type'}).`
    );
  }

  const outputName = generateOutputFilename(file.name, targetFormat);
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    filename: outputName,
    size: blob.size,
    sizeFormatted: formatBytes(blob.size),
    mimeType: blob.type,
    width,
    height
  };
}
