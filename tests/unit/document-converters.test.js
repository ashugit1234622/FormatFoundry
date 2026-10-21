import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.DOMParser = dom.window.DOMParser;

import { htmlToMarkdown, convertHtml } from '../../src/engines/html-converter.js';
import { textToPdf, markdownToPdf, pdfToText } from '../../src/engines/pdf-converter.js';
import {
  textToDocx,
  markdownToDocx,
  docxToHtml,
  docxToMarkdown,
  docxToText,
  docxToPdf
} from '../../src/engines/docx-converter.js';
import {
  textToPptx,
  markdownToPptx,
  pptxToText,
  pptxToPdf
} from '../../src/engines/pptx-converter.js';
import { convertFile } from '../../src/engines/dispatcher.js';

describe('Document Converters — HTML Engine', () => {
  it('htmlToMarkdown: converts HTML tags and tables to Markdown', () => {
    const html = `
      <h1>Project Title</h1>
      <p>This is a <strong>bold statement</strong> and <em>italic note</em> with a <a href="https://example.com">link</a>.</p>
      <ul>
        <li>Item One</li>
        <li>Item Two</li>
      </ul>
      <table>
        <thead>
          <tr><th>Col A</th><th>Col B</th></tr>
        </thead>
        <tbody>
          <tr><td>Val 1</td><td>Val 2</td></tr>
        </tbody>
      </table>
    `;
    const md = htmlToMarkdown(html);
    assert.ok(md.includes('# Project Title'), 'Should have H1 heading');
    assert.ok(md.includes('**bold statement**'), 'Should have bold text');
    assert.ok(md.includes('*italic note*') || md.includes('_italic note_'), 'Should have italic text');
    assert.ok(md.includes('[link](https://example.com)'), 'Should have markdown link');
    assert.ok(md.includes('Item One'), 'Should have list items');
    assert.ok(md.includes('Col A') && md.includes('Val 1'), 'Should have table contents');
  });

  it('convertHtml: converts HTML Blob to Markdown result', async () => {
    const html = '<h2>Section</h2><p>Paragraph content.</p>';
    const file = new Blob([html], { type: 'text/html' });
    file.name = 'index.html';

    const result = await convertHtml(file, 'markdown');
    assert.ok(result.blob instanceof Blob, 'Result should be a Blob');
    assert.ok(result.filename.endsWith('.md'), 'Filename should have .md extension');
    const text = await result.blob.text();
    assert.ok(text.includes('## Section'), 'Text should contain Markdown heading');
  });
});

describe('Document Converters — PDF Engine', () => {
  it('textToPdf: generates a valid paginated PDF Blob', async () => {
    const sampleText = 'FormatFoundry PDF Generation Test.\nLine 2 with content.\nLine 3.';
    const result = await textToPdf(sampleText, 'pdf', { title: 'Test Document' });
    assert.ok(result.blob instanceof Blob);
    assert.equal(result.mimeType, 'application/pdf');

    const buffer = Buffer.from(await result.blob.arrayBuffer());
    const header = buffer.subarray(0, 5).toString('ascii');
    assert.equal(header, '%PDF-');
  });

  it('markdownToPdf: compiles headings, lists, and quotes into PDF', async () => {
    const md = `# Main Document
## Subheading
This is a paragraph with **strong** text.

- First bullet point
- Second bullet point

> Important quote block
`;
    const result = await markdownToPdf(md, 'pdf', { title: 'Markdown Test' });
    assert.ok(result.blob instanceof Blob);
    const buffer = Buffer.from(await result.blob.arrayBuffer());
    assert.equal(buffer.subarray(0, 5).toString('ascii'), '%PDF-');
  });

  it('pdfToText: extracts text from a generated PDF document', async () => {
    const uniqueText = 'ClientSidePdfExtractionToken_ABC123';
    const pdfRes = await textToPdf(`Hello World!\n${uniqueText}\nEnd of document.`);
    const extractRes = await pdfToText(pdfRes.blob);
    const extracted = await extractRes.blob.text();
    assert.ok(extracted.includes(uniqueText), `Extracted text should include token: ${extracted}`);
  });
});

describe('Document Converters — Word (DOCX) Engine', () => {
  it('textToDocx: creates a valid Office Open XML DOCX file', async () => {
    const text = 'Paragraph 1\nParagraph 2\nParagraph 3';
    const result = await textToDocx(text);
    assert.ok(result.blob instanceof Blob);
    const buffer = Buffer.from(await result.blob.arrayBuffer());
    // PK zip signature (0x50 0x4B 0x03 0x04)
    assert.equal(buffer[0], 0x50);
    assert.equal(buffer[1], 0x4B);
  });

  it('markdownToDocx: translates Markdown headers and lists to DOCX', async () => {
    const md = `# Overview
## Architecture
Some body text describing the system.

- Bullet item 1
- Bullet item 2
`;
    const result = await markdownToDocx(md);
    assert.ok(result.blob instanceof Blob);
    const buffer = Buffer.from(await result.blob.arrayBuffer());
    assert.equal(buffer[0], 0x50);
    assert.equal(buffer[1], 0x4B);
  });

  it('docxToHtml, docxToMarkdown, docxToText: parses generated DOCX back to text formats', async () => {
    const originalText = 'Section Title\nThis is a test paragraph inside Word DOCX.';
    const docxRes = await textToDocx(originalText);

    const htmlRes = await docxToHtml(docxRes.blob);
    const html = await htmlRes.blob.text();
    assert.ok(html.includes('Section Title'), 'HTML should contain section title');

    const mdRes = await docxToMarkdown(docxRes.blob);
    const md = await mdRes.blob.text();
    assert.ok(md.includes('Section Title'), 'Markdown should contain section title');

    const plainRes = await docxToText(docxRes.blob);
    const plain = await plainRes.blob.text();
    assert.ok(plain.includes('Section Title'), 'Plain text should contain section title');
  });

  it('docxToPdf: converts DOCX content into a valid PDF document', async () => {
    const docxRes = await textToDocx('DOCX to PDF Conversion Test Document.');
    const result = await docxToPdf(docxRes.blob);
    assert.ok(result.blob instanceof Blob);
    const buffer = Buffer.from(await result.blob.arrayBuffer());
    assert.equal(buffer.subarray(0, 5).toString('ascii'), '%PDF-');
  });
});

describe('Document Converters — PowerPoint (PPTX) Engine', () => {
  it('textToPptx: creates a valid PPTX slide deck with 16:9 layout', async () => {
    const text = 'Title Slide Text\n\nSlide Two Content\nBullet details\n\nSlide Three Content';
    const result = await textToPptx(text);
    assert.ok(result.blob instanceof Blob);
    const buffer = Buffer.from(await result.blob.arrayBuffer());
    // PPTX is a zip file starting with PK
    assert.equal(buffer[0], 0x50);
    assert.equal(buffer[1], 0x4B);
  });

  it('markdownToPptx: generates slides from Markdown headings and bullets', async () => {
    const md = `# Presentation Deck
## First Key Finding
- Metric increased by 45%
- Customer retention remains high

## Second Key Finding
- Revenue milestone reached
`;
    const result = await markdownToPptx(md);
    assert.ok(result.blob instanceof Blob);
    const buffer = Buffer.from(await result.blob.arrayBuffer());
    assert.equal(buffer[0], 0x50);
    assert.equal(buffer[1], 0x4B);
  });

  it('pptxToText: extracts slide text from generated PPTX presentation', async () => {
    const text = 'Slide One Title\nFirst slide message.\n\nSlide Two Title\nSecond slide details.';
    const pptxRes = await textToPptx(text);
    const extractRes = await pptxToText(pptxRes.blob);
    const extracted = await extractRes.blob.text();
    assert.ok(extracted.includes('Slide 1') || extracted.includes('Slide One'), 'Should extract slide content');
  });

  it('pptxToPdf: converts generated PPTX presentation into PDF slides', async () => {
    const text = 'Executive Slide Title\nBullet point item 1.\nBullet point item 2.\n\nSlide Two Header\nDetails here.';
    const pptxRes = await textToPptx(text);
    const pdfRes = await pptxToPdf(pptxRes.blob);

    assert.ok(pdfRes.blob instanceof Blob);
    assert.equal(pdfRes.format, 'pdf');
    assert.equal(pdfRes.mimeType, 'application/pdf');
    assert.ok(pdfRes.filename.endsWith('.pdf'));

    const buffer = Buffer.from(await pdfRes.blob.arrayBuffer());
    assert.equal(buffer.subarray(0, 5).toString('ascii'), '%PDF-');
    assert.ok(pdfRes.slideCount >= 2, 'Should generate at least 2 slide pages in PDF');
  });
});

describe('Document Converters — Dispatcher Integration', () => {
  it('convertFile: handles PDF to Text conversion', async () => {
    const pdfRes = await textToPdf('Dispatcher PDF to TXT Test.');
    const file = new File([pdfRes.blob], 'doc.pdf', { type: 'application/pdf' });
    const result = await convertFile(file, 'text', { sourceFormat: 'pdf' });

    assert.ok(result.blob instanceof Blob);
    assert.equal(result.format, 'text');
    assert.ok(result.filename.endsWith('.txt'));
    const text = await result.blob.text();
    assert.ok(text.includes('Dispatcher PDF to TXT Test'));
  });

  it('convertFile: handles Markdown to Word DOCX conversion', async () => {
    const file = new File(['# Heading\nContent paragraph.'], 'report.md', { type: 'text/markdown' });
    const result = await convertFile(file, 'docx', { sourceFormat: 'markdown' });

    assert.ok(result.blob instanceof Blob);
    assert.equal(result.format, 'docx');
    assert.ok(result.filename.endsWith('.docx'));
  });

  it('convertFile: handles Word DOCX to PDF conversion', async () => {
    const docxRes = await textToDocx('Sample Document for Dispatcher');
    const file = new File([docxRes.blob], 'source.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const result = await convertFile(file, 'pdf', { sourceFormat: 'docx' });

    assert.ok(result.blob instanceof Blob);
    assert.equal(result.format, 'pdf');
    assert.ok(result.filename.endsWith('.pdf'));
  });

  it('convertFile: handles HTML to Markdown conversion', async () => {
    const file = new File(['<h3>Subheader</h3><p>Test body.</p>'], 'page.html', { type: 'text/html' });
    const result = await convertFile(file, 'markdown', { sourceFormat: 'html' });

    assert.ok(result.blob instanceof Blob);
    assert.equal(result.format, 'markdown');
    assert.ok(result.filename.endsWith('.md'));
    const text = await result.blob.text();
    assert.ok(text.includes('### Subheader'));
  });

  it('convertFile: handles PowerPoint PPT/PPTX to PDF conversion', async () => {
    const pptxRes = await textToPptx('Quarterly Review\nGrowth expanded by 40%.\nNew product launched.');
    const file = new File([pptxRes.blob], 'presentation.pptx', {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    });
    const result = await convertFile(file, 'pdf', { sourceFormat: 'pptx' });

    assert.ok(result.blob instanceof Blob);
    assert.equal(result.format, 'pdf');
    assert.ok(result.filename.endsWith('.pdf'));

    const buffer = Buffer.from(await result.blob.arrayBuffer());
    assert.equal(buffer.subarray(0, 5).toString('ascii'), '%PDF-');
  });
});
