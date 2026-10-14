import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

globalThis.window = new JSDOM('').window;

const { markdownToHtml, convertMarkdown } = await import('../../src/engines/markdown-converter.js');

test('markdownToHtml: compiles standard Markdown elements', () => {
  const md = `# Overview

This is a paragraph with **bold** and *italic* text.

## Features
- First item
- Second item

> A thoughtful quote

\`\`\`javascript
const answer = 42;
\`\`\`

| Header 1 | Header 2 |
| :--- | :--- |
| Val A | Val B |
`;

  const html = markdownToHtml(md, { title: 'Project Overview' });

  assert.ok(html.includes('<!DOCTYPE html>'));
  assert.ok(html.includes('<title>Project Overview</title>'));
  assert.ok(html.includes('<h1 id="overview">Overview</h1>') || html.includes('<h1>Overview</h1>'));
  assert.ok(html.includes('<strong>bold</strong>'));
  assert.ok(html.includes('<em>italic</em>'));
  assert.ok(html.includes('<li>First item</li>'));
  assert.ok(html.includes('<blockquote>'));
  assert.ok(html.includes('<pre><code'));
  assert.ok(html.includes('<table>'));
  assert.ok(html.includes('Header 1</th>'));
  assert.ok(html.includes('Header 2</th>'));
});

test('markdownToHtml: sanitizes malicious script tags and inline handlers', () => {
  const dirtyMd = `# XSS Test

<script>alert("pwned")</script>

<img src="invalid.jpg" onerror="alert('hack')" alt="Test">

[Dangerous Link](javascript:alert(1))
`;

  const html = markdownToHtml(dirtyMd);

  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('onerror='));
  assert.ok(!html.includes('javascript:alert'));
});

test('convertMarkdown: converts File to HTML Blob with proper filename', async () => {
  const mdFile = new File(['# Hello World\n\nWelcome to local conversion.'], 'readme.markdown', {
    type: 'text/markdown'
  });

  const result = await convertMarkdown(mdFile, 'html');
  assert.equal(result.filename, 'readme.html');
  assert.equal(result.format, 'html');
  assert.ok(result.blob instanceof Blob);
  assert.equal(result.blob.type, 'text/html;charset=utf-8');

  const content = await result.blob.text();
  assert.ok(content.includes('<!DOCTYPE html>'));
  assert.ok(content.includes('Hello World'));
});
