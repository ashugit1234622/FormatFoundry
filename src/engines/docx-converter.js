import mammoth from 'mammoth';
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import { generateOutputFilename, normalizeFormat } from '../core/filename-utils.js';
import { formatBytes } from '../core/formatters.js';
import { sanitizeHtml } from '../utils/sanitizer.js';
import { textToPdf } from './pdf-converter.js';

function prepareMammothOptions(arrayBuffer) {
  const options = { arrayBuffer };
  if (typeof Buffer !== 'undefined') {
    options.buffer = Buffer.from(arrayBuffer);
  }
  return options;
}

export async function docxToHtml(file) {
  if (!file) {
    throw new Error('No Word document provided for conversion');
  }

  const target = file?.blob || file;
  const arrayBuffer = await target.arrayBuffer();
  const result = await mammoth.convertToHtml(prepareMammothOptions(arrayBuffer));
  const rawHtml = result.value || '';
  const sanitized = sanitizeHtml(rawHtml);

  const title = (file.name || 'Word Document').replace(/\.[^.]+$/, '');
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1f1e1c; max-width: 840px; margin: 40px auto; padding: 0 24px 60px; }
    h1, h2, h3 { color: #111; margin-top: 1.4em; }
    p { margin: 1em 0; }
    table { border-collapse: collapse; width: 100%; margin: 1.5em 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; }
  </style>
</head>
<body>
${sanitized}
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const filename = generateOutputFilename(file.name || 'document.docx', 'html');
  const url = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(blob)
    : '';

  return {
    blob,
    url,
    filename,
    size: blob.size,
    sizeFormatted: formatBytes(blob.size),
    mimeType: 'text/html;charset=utf-8',
    format: 'html',
    messages: result.messages || []
  };
}

export async function docxToMarkdown(file) {
  if (!file) {
    throw new Error('No Word document provided for conversion');
  }

  const target = file?.blob || file;
  const arrayBuffer = await target.arrayBuffer();
  const result = await mammoth.convertToMarkdown(prepareMammothOptions(arrayBuffer));
  const markdownText = result.value || '';

  const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
  const filename = generateOutputFilename(file.name || 'document.docx', 'markdown');
  const url = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(blob)
    : '';

  return {
    blob,
    url,
    filename,
    size: blob.size,
    sizeFormatted: formatBytes(blob.size),
    mimeType: 'text/markdown;charset=utf-8',
    format: 'markdown',
    messages: result.messages || []
  };
}

export async function docxToText(file) {
  if (!file) {
    throw new Error('No Word document provided for conversion');
  }

  const target = file?.blob || file;
  const arrayBuffer = await target.arrayBuffer();
  const result = await mammoth.extractRawText(prepareMammothOptions(arrayBuffer));
  const rawText = result.value || '';

  const blob = new Blob([rawText], { type: 'text/plain;charset=utf-8' });
  const filename = generateOutputFilename(file.name || 'document.docx', 'text');
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
    messages: result.messages || []
  };
}

export async function docxToPdf(file, options = {}) {
  if (!file) {
    throw new Error('No Word document provided for conversion');
  }

  const target = file?.blob || file;
  const arrayBuffer = await target.arrayBuffer();
  const result = await mammoth.extractRawText(prepareMammothOptions(arrayBuffer));
  const rawText = result.value || '';

  const pdfResult = await textToPdf(rawText, 'pdf', options);
  const filename = generateOutputFilename(file.name || 'document.docx', 'pdf');

  return {
    ...pdfResult,
    filename
  };
}

export async function textToDocx(fileOrText) {
  const text = typeof fileOrText === 'string' ? fileOrText : await fileOrText.text();
  if (!text || text.trim() === '') {
    throw new Error('Text input is empty');
  }

  const lines = text.split(/\r\n|\r|\n/);
  const paragraphs = lines.map((line) => new Paragraph({
    children: [new TextRun(line)]
  }));

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs.length > 0 ? paragraphs : [new Paragraph('')]
    }]
  });

  const buffer = await Packer.toBlob(doc);
  const rawName = typeof fileOrText === 'object' && fileOrText?.name ? fileOrText.name : 'document.txt';
  const filename = generateOutputFilename(rawName, 'docx');
  const url = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(buffer)
    : '';

  return {
    blob: buffer,
    url,
    filename,
    size: buffer.size,
    sizeFormatted: formatBytes(buffer.size),
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    format: 'docx'
  };
}

export async function markdownToDocx(fileOrText) {
  const text = typeof fileOrText === 'string' ? fileOrText : await fileOrText.text();
  if (!text || text.trim() === '') {
    throw new Error('Markdown input is empty');
  }

  const lines = text.split(/\r\n|\r|\n/);
  const children = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      children.push(new Paragraph({
        text: trimmed.slice(2),
        heading: HeadingLevel.HEADING_1
      }));
    } else if (trimmed.startsWith('## ')) {
      children.push(new Paragraph({
        text: trimmed.slice(3),
        heading: HeadingLevel.HEADING_2
      }));
    } else if (trimmed.startsWith('### ')) {
      children.push(new Paragraph({
        text: trimmed.slice(4),
        heading: HeadingLevel.HEADING_3
      }));
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      children.push(new Paragraph({
        text: trimmed.slice(2),
        bullet: { level: 0 }
      }));
    } else {
      children.push(new Paragraph({
        children: [new TextRun(line)]
      }));
    }
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: children.length > 0 ? children : [new Paragraph('')]
    }]
  });

  const buffer = await Packer.toBlob(doc);
  const rawName = typeof fileOrText === 'object' && fileOrText?.name ? fileOrText.name : 'document.md';
  const filename = generateOutputFilename(rawName, 'docx');
  const url = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(buffer)
    : '';

  return {
    blob: buffer,
    url,
    filename,
    size: buffer.size,
    sizeFormatted: formatBytes(buffer.size),
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    format: 'docx'
  };
}
