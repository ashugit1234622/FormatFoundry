import { parseSvgDimensions } from '../engines/svg-converter.js';
import { formatBytes } from './formatters.js';

export async function inspectImageFile(file, detectedFormat = null) {
  if (!file) {
    return null;
  }

  const browserMime = file.type || 'unknown';
  const size = typeof file.size === 'number' ? file.size : 0;
  const sizeFormatted = formatBytes(size);

  if (detectedFormat === 'svg') {
    try {
      const text = await file.text();
      const dims = parseSvgDimensions(text);
      return {
        signatureFormat: 'SVG (Vector Document)',
        browserMime,
        fileSize: size,
        fileSizeFormatted: sizeFormatted,
        width: dims.width,
        height: dims.height,
        aspectRatio: dims.aspectRatio,
        viewBox: dims.viewBox,
        hasExplicitDimensions: dims.hasExplicitDimensions,
        hasViewBox: dims.hasViewBox,
        canDecode: true,
        error: null
      };
    } catch (err) {
      return {
        signatureFormat: 'SVG (Vector Document)',
        browserMime,
        fileSize: size,
        fileSizeFormatted: sizeFormatted,
        width: null,
        height: null,
        aspectRatio: null,
        viewBox: null,
        hasExplicitDimensions: false,
        hasViewBox: false,
        canDecode: false,
        error: err instanceof Error ? err.message : 'Invalid or malformed SVG document'
      };
    }
  }

  const signatureFormat = detectedFormat
    ? detectedFormat.toUpperCase()
    : 'Unrecognized';

  let width = null;
  let height = null;
  let aspectRatio = null;
  let canDecode = false;
  let error = null;

  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      width = bitmap.width;
      height = bitmap.height;
      aspectRatio = height > 0 ? (width / height).toFixed(2) : null;
      canDecode = true;
      bitmap.close();
    } catch (err) {
      canDecode = false;
      error = err instanceof Error ? err.message : 'Browser failed to decode image';
    }
  } else if (typeof Image !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    let objectUrl = null;
    try {
      objectUrl = URL.createObjectURL(file);
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Browser failed to decode image'));
        img.src = objectUrl;
      });
      width = img.naturalWidth || img.width;
      height = img.naturalHeight || img.height;
      aspectRatio = height > 0 ? (width / height).toFixed(2) : null;
      canDecode = true;
    } catch (err) {
      canDecode = false;
      error = err instanceof Error ? err.message : 'Browser failed to decode image';
    } finally {
      if (objectUrl && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(objectUrl);
      }
    }
  }

  return {
    signatureFormat,
    browserMime,
    fileSize: size,
    fileSizeFormatted: sizeFormatted,
    width,
    height,
    aspectRatio,
    viewBox: null,
    hasExplicitDimensions: Boolean(width && height),
    hasViewBox: false,
    canDecode,
    error
  };
}
