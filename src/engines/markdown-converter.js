import { marked } from 'marked';
import { sanitizeHtml } from '../utils/sanitizer.js';
import { generateOutputFilename } from '../core/filename-utils.js';

export function markdownToHtml(markdownText, { title = 'Converted Document' } = {}) {
  if (typeof markdownText !== 'string') {
    throw new TypeError('Markdown input must be a string');
  }

  const rawHtml = marked.parse(markdownText, {
    gfm: true,
    breaks: false
  });

  const sanitizedBody = sanitizeHtml(rawHtml);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #1f1e1c;
      background-color: #ffffff;
      max-width: 840px;
      margin: 40px auto;
      padding: 0 24px 60px;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #111111;
      line-height: 1.3;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    p {
      margin: 1em 0;
    }
    a {
      color: #2b4c6f;
      text-decoration: underline;
    }
    pre {
      background-color: #f6f5f0;
      border: 1px solid #e2dfd5;
      border-radius: 4px;
      padding: 14px 18px;
      overflow-x: auto;
      font-size: 0.9em;
    }
    code {
      font-family: ui-monospace, "SFMono-Regular", Consolas, Menlo, monospace;
      background-color: #f2f0e8;
      padding: 2px 5px;
      border-radius: 3px;
      font-size: 0.88em;
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #c8c4b7;
      margin: 1.2em 0;
      padding: 0.5em 16px;
      color: #595752;
      background-color: #faf9f5;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1.5em 0;
    }
    th, td {
      border: 1px solid #e2dfd5;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #f2f0e8;
      font-weight: 600;
    }
    hr {
      border: none;
      border-top: 1px solid #e2dfd5;
      margin: 2em 0;
    }
  </style>
</head>
<body>
${sanitizedBody}
</body>
</html>`;
}

export async function convertMarkdown(file, targetFormat = 'html') {
  if (!file) {
    throw new Error('No Markdown file provided for conversion');
  }

  const text = await file.text();
  const title = file.name ? file.name.replace(/\.[^/.]+$/, '') : 'Document';
  const htmlContent = markdownToHtml(text, { title });

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const filename = generateOutputFilename(file.name || 'document.md', targetFormat);
  const url = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(blob)
    : '';

  return {
    blob,
    url,
    filename,
    size: blob.size,
    format: 'html'
  };
}
