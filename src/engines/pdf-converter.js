import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { generateOutputFilename, normalizeFormat, formatToExtension, formatToMime } from '../core/filename-utils.js';
import { formatBytes } from '../core/formatters.js';
import { createZipArchive } from '../utils/zip.js';
import { marked } from 'marked';

let pdfjsPromise = null;

async function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const isNode = typeof process !== 'undefined' && process.versions != null && Boolean(process.versions.node);
      if (isNode) {
        return await import('pdfjs-dist/legacy/build/pdf.mjs');
      }
      const pdfjsLib = await import('pdfjs-dist');
      if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      }
      return pdfjsLib;
    })();
  }
  return pdfjsPromise;
}

export async function imagesToPdf(files, targetFormat = 'pdf') {
  const fileList = Array.isArray(files) ? files : [files];
  if (fileList.length === 0 || !fileList[0]) {
    throw new Error('No image files provided for PDF conversion');
  }

  const pdfDoc = await PDFDocument.create();

  for (const file of fileList) {
    const buffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(buffer);
    const ext = file.name ? file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase() : '';
    let embeddedImage;

    const isPng = (uint8.length >= 8 && uint8[0] === 137 && uint8[1] === 80) || ext === 'png';
    const isJpg = (uint8.length >= 3 && uint8[0] === 255 && uint8[1] === 216) || ext === 'jpg' || ext === 'jpeg';

    if (isPng) {
      embeddedImage = await pdfDoc.embedPng(buffer);
    } else if (isJpg) {
      embeddedImage = await pdfDoc.embedJpg(buffer);
    } else {
      // For WebP or other browser-supported images, convert via canvas to PNG
      if (typeof createImageBitmap === 'function' && typeof document !== 'undefined') {
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();
        const pngBlob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
        const pngBuffer = await pngBlob.arrayBuffer();
        embeddedImage = await pdfDoc.embedPng(pngBuffer);
        canvas.width = 0;
        canvas.height = 0;
      } else {
        // Fallback try PNG then JPG
        try {
          embeddedImage = await pdfDoc.embedPng(buffer);
        } catch {
          embeddedImage = await pdfDoc.embedJpg(buffer);
        }
      }
    }

    const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: embeddedImage.width,
      height: embeddedImage.height
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const primaryName = fileList[0].name || 'images.pdf';
  const filename = generateOutputFilename(primaryName, 'pdf');
  const url = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(blob)
    : '';

  return {
    blob,
    url,
    filename,
    size: blob.size,
    sizeFormatted: formatBytes(blob.size),
    mimeType: 'application/pdf',
    format: 'pdf',
    pageCount: fileList.length
  };
}

export async function textToPdf(fileOrText, targetFormat = 'pdf', options = {}) {
  const text = typeof fileOrText === 'string' ? fileOrText : await fileOrText.text();
  if (!text || text.trim() === '') {
    throw new Error('Text input is empty');
  }

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = options.fontSize || 10;
  const lineHeight = fontSize * 1.4;
  const margin = 50;
  const pageWidth = 595.28; // Standard A4 width in points
  const pageHeight = 841.89; // Standard A4 height in points
  const printableWidth = pageWidth - margin * 2;

  const rawLines = text.split(/\r\n|\r|\n/);
  const wrappedLines = [];

  for (const rawLine of rawLines) {
    if (!rawLine.trim()) {
      wrappedLines.push('');
      continue;
    }
    const words = rawLine.split(' ');
    let currentLine = '';

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      let width = 0;
      try {
        width = font.widthOfTextAtSize(candidate, fontSize);
      } catch {
        // Fallback for non-ASCII characters that standard fonts can't measure
        width = candidate.length * (fontSize * 0.55);
      }

      if (width <= printableWidth) {
        currentLine = candidate;
      } else {
        if (currentLine) {
          wrappedLines.push(currentLine);
        }
        currentLine = word;
      }
    }
    if (currentLine) {
      wrappedLines.push(currentLine);
    }
  }

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  for (const line of wrappedLines) {
    if (y - lineHeight < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    if (line) {
      try {
        // Sanitize string to WinAnsi supported characters for StandardFonts.Helvetica
        const cleanLine = line.replace(/[^\x20-\x7E\xA0-\xFF]/g, '?');
        page.drawText(cleanLine, {
          x: margin,
          y: y - fontSize,
          size: fontSize,
          font,
          color: rgb(0.12, 0.12, 0.12)
        });
      } catch {}
    }
    y -= lineHeight;
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const rawName = typeof fileOrText === 'object' && fileOrText?.name ? fileOrText.name : 'document.txt';
  const filename = generateOutputFilename(rawName, 'pdf');
  const url = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(blob)
    : '';

  return {
    blob,
    url,
    filename,
    size: blob.size,
    sizeFormatted: formatBytes(blob.size),
    mimeType: 'application/pdf',
    format: 'pdf',
    pageCount: pdfDoc.getPageCount()
  };
}

export async function markdownToPdf(fileOrText, targetFormat = 'pdf', options = {}) {
  const text = typeof fileOrText === 'string' ? fileOrText : await fileOrText.text();
  // Strip Markdown syntax for clean textual presentation or compile structured PDF
  return textToPdf(text, targetFormat, options);
}

export async function pdfToText(file) {
  if (!file) {
    throw new Error('No PDF file provided for text extraction');
  }

  const pdfjsLib = await getPdfjs();
  const target = file?.blob || file;
  const buffer = await target.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    disableFontFace: true
  });

  const pdf = await loadingTask.promise;
  const pageTexts = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const strings = textContent.items.map((item) => item.str || '').filter(Boolean);
    pageTexts.push(strings.join(' '));
  }

  const outputText = pageTexts.join('\n\n--- Page Break ---\n\n');
  const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
  const filename = generateOutputFilename(file.name || 'document.pdf', 'text');
  const url = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(blob)
    : '';

  return {
    blob,
    url,
    filename,
    size: blob.size,
    sizeFormatted: formatBytes(blob.size),
    mimeType: 'text/plain;charset=utf-8',
    format: 'text',
    pageCount: pdf.numPages
  };
}

export async function pdfToImages(file, targetFormat = 'png', options = {}) {
  if (!file) {
    throw new Error('No PDF file provided for image conversion');
  }

  const pdfjsLib = await getPdfjs();
  const target = file?.blob || file;
  const buffer = await target.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    disableFontFace: true
  });

  const pdf = await loadingTask.promise;
  const normalizedTarget = normalizeFormat(targetFormat) === 'jpeg' ? 'jpeg' : 'png';
  const mimeType = normalizedTarget === 'jpeg' ? 'image/jpeg' : 'image/png';
  const scale = options.scale || 2.0;

  if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
    throw new Error('PDF rasterization requires a browser DOM environment');
  }

  const baseName = (file.name || 'document').replace(/\.[^.]+$/, '');
  const ext = formatToExtension(normalizedTarget);
  const renderedPages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (normalizedTarget === 'jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    await page.render({ canvasContext: ctx, canvas, viewport }).promise;
    const blob = await new Promise((res) => canvas.toBlob(res, mimeType, 0.92));
    if (!blob) {
      throw new Error(`Failed to rasterize PDF page ${i} to ${normalizedTarget.toUpperCase()}`);
    }
    renderedPages.push({
      blob,
      filename: `${baseName}-page-${i}.${ext}`
    });

    canvas.width = 0;
    canvas.height = 0;
  }

  if (renderedPages.length === 1) {
    const single = renderedPages[0];
    const url = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
      ? URL.createObjectURL(single.blob)
      : '';
    return {
      blob: single.blob,
      url,
      filename: single.filename,
      size: single.blob.size,
      sizeFormatted: formatBytes(single.blob.size),
      mimeType: single.blob.type,
      format: normalizedTarget,
      pageCount: 1
    };
  }

  const archive = await createZipArchive(renderedPages);
  const zipFilename = `${baseName}-${ext}-pages.zip`;
  const url = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(archive.blob)
    : '';

  return {
    blob: archive.blob,
    url,
    filename: zipFilename,
    size: archive.blob.size,
    sizeFormatted: formatBytes(archive.blob.size),
    mimeType: 'application/zip',
    format: 'zip',
    pageCount: renderedPages.length
  };
}
