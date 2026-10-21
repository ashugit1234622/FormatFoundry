import PptxGenJS from 'pptxgenjs';
import { unzipSync } from 'fflate';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { generateOutputFilename, normalizeFormat } from '../core/filename-utils.js';
import { formatBytes } from '../core/formatters.js';

async function blobToDataUrl(blob) {
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  const buffer = await blob.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:${blob.type || 'image/png'};base64,${base64}`;
}

export async function imagesToPptx(files, targetFormat = 'pptx') {
  const fileList = Array.isArray(files) ? files : [files];
  if (fileList.length === 0 || !fileList[0]) {
    throw new Error('No image files provided for presentation conversion');
  }

  const Pptx = PptxGenJS.default || PptxGenJS;
  const pptx = new Pptx();
  pptx.layout = 'LAYOUT_16x9';

  for (const file of fileList) {
    const slide = pptx.addSlide();
    const dataUrl = await blobToDataUrl(file);
    slide.addImage({
      data: dataUrl,
      x: 0.5,
      y: 0.5,
      w: 9.0,
      h: 4.5,
      sizing: { type: 'contain', w: 9.0, h: 4.5 }
    });
  }

  const uint8 = await pptx.write({ outputType: 'uint8array' });
  const blob = new Blob([uint8], {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  });

  const primaryName = fileList[0].name || 'presentation.pptx';
  const filename = generateOutputFilename(primaryName, 'pptx');
  const url = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(blob)
    : '';

  return {
    blob,
    url,
    filename,
    size: blob.size,
    sizeFormatted: formatBytes(blob.size),
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    format: 'pptx',
    slideCount: fileList.length
  };
}

export async function textToPptx(fileOrText, targetFormat = 'pptx') {
  const text = typeof fileOrText === 'string' ? fileOrText : await fileOrText.text();
  if (!text || text.trim() === '') {
    throw new Error('Text input is empty');
  }

  const Pptx = PptxGenJS.default || PptxGenJS;
  const pptx = new Pptx();
  pptx.layout = 'LAYOUT_16x9';

  const sections = text.split(/\n(?=# )|\n\n+/g).map((s) => s.trim()).filter(Boolean);
  if (sections.length === 0) {
    sections.push(text);
  }

  for (const section of sections) {
    const slide = pptx.addSlide();
    const lines = section.split(/\r\n|\r|\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    let title = lines[0].replace(/^#+\s*/, '');
    let bodyLines = lines.slice(1).map((l) => l.replace(/^[-*]\s*/, ''));

    slide.addText(title, {
      x: 0.8,
      y: 0.8,
      w: 8.4,
      h: 1.0,
      fontSize: 24,
      bold: true,
      color: '111111'
    });

    if (bodyLines.length > 0) {
      slide.addText(bodyLines.join('\n'), {
        x: 0.8,
        y: 2.0,
        w: 8.4,
        h: 3.0,
        fontSize: 16,
        color: '444444',
        bullet: true
      });
    }
  }

  const uint8 = await pptx.write({ outputType: 'uint8array' });
  const blob = new Blob([uint8], {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  });

  const rawName = typeof fileOrText === 'object' && fileOrText?.name ? fileOrText.name : 'presentation.txt';
  const filename = generateOutputFilename(rawName, 'pptx');
  const url = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(blob)
    : '';

  return {
    blob,
    url,
    filename,
    size: blob.size,
    sizeFormatted: formatBytes(blob.size),
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    format: 'pptx',
    slideCount: sections.length
  };
}

export async function markdownToPptx(fileOrText, targetFormat = 'pptx') {
  return textToPptx(fileOrText, targetFormat);
}

export async function pptxToText(file) {
  if (!file) {
    throw new Error('No PowerPoint file provided for text extraction');
  }

  const target = file?.blob || file;
  const buffer = await target.arrayBuffer();
  const uint8 = new Uint8Array(buffer);
  const unzipped = unzipSync(uint8);

  const slideKeys = Object.keys(unzipped)
    .filter((k) => k.startsWith('ppt/slides/slide') && k.endsWith('.xml'))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

  if (slideKeys.length === 0) {
    throw new Error('No slides found in PowerPoint presentation');
  }

  const slideTexts = [];
  const textDecoder = new TextDecoder('utf-8');

  for (let idx = 0; idx < slideKeys.length; idx++) {
    const key = slideKeys[idx];
    const xml = textDecoder.decode(unzipped[key]);
    const matches = xml.match(/<a:t>([^<]*)<\/a:t>/g) || [];
    const textPieces = matches
      .map((m) => m.replace(/<\/?a:t>/g, '').trim())
      .filter(Boolean);

    if (textPieces.length > 0) {
      slideTexts.push(`--- Slide ${idx + 1} ---\n` + textPieces.join('\n'));
    }
  }

  const outputText = slideTexts.join('\n\n');
  const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
  const filename = generateOutputFilename(file.name || 'presentation.pptx', 'text');
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
    slideCount: slideKeys.length
  };
}

function sanitizeForPdf(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '-')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ')
    .trim();
}

function wrapText(text, maxChars = 75) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxChars) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines;
}

function extractSlideData(slideXml) {
  const paragraphs = [];
  const pRegex = /<a:p\b[^>]*>([\s\S]*?)<\/a:p>/gi;
  let pMatch;
  while ((pMatch = pRegex.exec(slideXml)) !== null) {
    const pContent = pMatch[1];
    const tRegex = /<a:t\b[^>]*>([^<]*)<\/a:t>/gi;
    let tMatch;
    let fullText = '';
    while ((tMatch = tRegex.exec(pContent)) !== null) {
      fullText += tMatch[1];
    }
    const clean = sanitizeForPdf(fullText);
    if (clean) {
      const lvlMatch = pContent.match(/lvl="(\d+)"/i);
      const level = lvlMatch ? parseInt(lvlMatch[1], 10) : 0;
      paragraphs.push({ text: clean, level });
    }
  }

  if (paragraphs.length === 0) {
    const matches = slideXml.match(/<a:t\b[^>]*>([^<]*)<\/a:t>/gi) || [];
    for (const m of matches) {
      const clean = sanitizeForPdf(m.replace(/<\/?a:t\b[^>]*>/g, ''));
      if (clean) {
        paragraphs.push({ text: clean, level: 0 });
      }
    }
  }

  return paragraphs;
}

export async function pptxToPdf(file, options = {}) {
  if (!file) {
    throw new Error('No PowerPoint file provided for PDF conversion');
  }

  const target = file?.blob || file;
  const buffer = await target.arrayBuffer();
  const uint8 = new Uint8Array(buffer);

  let unzipped = null;
  try {
    unzipped = unzipSync(uint8);
  } catch {
    unzipped = null;
  }

  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const textDecoder = new TextDecoder('utf-8');
  const slidesData = [];

  if (unzipped) {
    const slideKeys = Object.keys(unzipped)
      .filter((k) => k.startsWith('ppt/slides/slide') && k.endsWith('.xml'))
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });

    for (const key of slideKeys) {
      const xml = textDecoder.decode(unzipped[key]);
      const paragraphs = extractSlideData(xml);
      slidesData.push(paragraphs);
    }
  }

  if (slidesData.length === 0) {
    let rawText = '';
    try {
      rawText = textDecoder.decode(uint8);
      rawText = rawText.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    } catch {
      rawText = '';
    }

    const lines = rawText
      .split(/\r\n|\r|\n/)
      .map((l) => sanitizeForPdf(l))
      .filter((l) => l.length >= 3 && !/^[A-Za-z0-9+/=]+$/.test(l));

    if (lines.length > 0) {
      const chunkSize = 6;
      for (let i = 0; i < lines.length; i += chunkSize) {
        slidesData.push(lines.slice(i, i + chunkSize).map((t, idx) => ({ text: t, level: idx === 0 ? 0 : 1 })));
      }
    } else {
      slidesData.push([{ text: 'PowerPoint Presentation', level: 0 }]);
    }
  }

  const pageWidth = 842;
  const pageHeight = 474;
  const primaryName = sanitizeForPdf(file.name || 'presentation.pptx');
  const totalSlides = slidesData.length;

  for (let sIdx = 0; sIdx < slidesData.length; sIdx++) {
    const paragraphs = slidesData[sIdx];
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    try {
      page.drawText(primaryName, {
        x: 60,
        y: pageHeight - 35,
        size: 9,
        font: regularFont,
        color: rgb(0.55, 0.6, 0.65)
      });
      page.drawText(`Slide ${sIdx + 1} of ${totalSlides}`, {
        x: pageWidth - 140,
        y: pageHeight - 35,
        size: 9,
        font: regularFont,
        color: rgb(0.55, 0.6, 0.65)
      });
    } catch {}

    if (paragraphs.length === 0) {
      continue;
    }

    const titleItem = paragraphs[0];
    const bodyItems = paragraphs.slice(1);

    let curY = pageHeight - 75;
    const titleLines = wrapText(titleItem.text, 55);
    for (const tLine of titleLines) {
      try {
        page.drawText(tLine, {
          x: 60,
          y: curY,
          size: 20,
          font: boldFont,
          color: rgb(0.08, 0.12, 0.2)
        });
        curY -= 26;
      } catch {}
    }

    try {
      page.drawLine({
        start: { x: 60, y: curY + 12 },
        end: { x: 180, y: curY + 12 },
        thickness: 2,
        color: rgb(0.22, 0.74, 0.97)
      });
    } catch {}

    curY -= 10;

    for (const item of bodyItems) {
      const indent = 60 + Math.min(item.level, 3) * 20;
      const bulletPrefix = item.level > 0 ? '- ' : '* ';
      const wrapped = wrapText(item.text, 70 - Math.min(item.level, 3) * 5);

      for (let lIdx = 0; lIdx < wrapped.length; lIdx++) {
        if (curY < 45) {
          pdfDoc.addPage([pageWidth, pageHeight]);
          curY = pageHeight - 60;
        }

        const prefix = lIdx === 0 ? bulletPrefix : '  ';
        const lineText = sanitizeForPdf(prefix + wrapped[lIdx]);

        try {
          page.drawText(lineText, {
            x: indent,
            y: curY,
            size: 13,
            font: regularFont,
            color: rgb(0.2, 0.25, 0.3)
          });
        } catch {}

        curY -= 18;
      }
      curY -= 6;
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const filename = generateOutputFilename(file.name || 'presentation.pptx', 'pdf');
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
    slideCount: pdfDoc.getPageCount()
  };
}

