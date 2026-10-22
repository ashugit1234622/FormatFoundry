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

function unescapeXml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function sanitizeForPdf(str) {
  if (typeof str !== 'string') return '';
  return unescapeXml(str)
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

/**
 * High-fidelity browser-based PPTX to PDF renderer.
 * Leverages @aiden0z/pptx-renderer to parse and construct the exact visual slide DOM,
 * rasterizes each slide via html-to-image to high-resolution PNG, and constructs
 * a multi-page PDF where each page visually mirrors the original PowerPoint slide.
 */
async function renderPptxSlidesToPdfBrowser(file, options = {}) {
  const { parseZip, buildPresentation, renderSlide } = await import('@aiden0z/pptx-renderer');
  const { toPng } = await import('html-to-image');

  const target = file?.blob || file;
  const buffer = await target.arrayBuffer();

  const files = await parseZip(buffer);
  const pres = buildPresentation(files);

  if (!pres.slides || pres.slides.length === 0) {
    throw new Error('No slides found in PowerPoint presentation');
  }

  const container = document.createElement('div');
  container.id = 'ff-pptx-render-stage';
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = `${Math.ceil(pres.width || 960)}px`;
  container.style.height = `${Math.ceil(pres.height || 540)}px`;
  container.style.overflow = 'hidden';
  container.style.pointerEvents = 'none';
  container.style.opacity = '1';
  container.style.zIndex = '-99999';
  document.body.appendChild(container);

  const pdfDoc = await PDFDocument.create();
  const slideWidth = pres.width || 960;
  const slideHeight = pres.height || 540;

  try {
    for (let i = 0; i < pres.slides.length; i++) {
      const slide = pres.slides[i];
      const handle = renderSlide(pres, slide);
      container.appendChild(handle.element);

      if (handle.ready) {
        await handle.ready;
      }
      // Allow browser layout and DOM sub-resources to paint
      await new Promise((resolve) => setTimeout(resolve, 60));

      const pngDataUrl = await toPng(handle.element, {
        width: Math.ceil(slideWidth),
        height: Math.ceil(slideHeight),
        pixelRatio: 1.5,
        cacheBust: false
      });

      handle.dispose();
      container.removeChild(handle.element);

      const resp = await fetch(pngDataUrl);
      const pngBytes = await resp.arrayBuffer();
      const embeddedImg = await pdfDoc.embedPng(pngBytes);

      const page = pdfDoc.addPage([slideWidth, slideHeight]);
      page.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: slideWidth,
        height: slideHeight
      });
    }
  } finally {
    if (container.parentNode) {
      document.body.removeChild(container);
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
    slideCount: pres.slides.length
  };
}

/**
 * Headless fallback renderer for Node.js test environments or unparseable packages.
 * Parses OOXML, embeds available slide media images, and applies clean structured layout.
 */
async function renderPptxSlidesToPdfFallback(file, options = {}) {
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

  // Determine presentation dimensions if present in ppt/presentation.xml
  let pageWidth = 960;
  let pageHeight = 540;
  if (unzipped && unzipped['ppt/presentation.xml']) {
    const presXml = textDecoder.decode(unzipped['ppt/presentation.xml']);
    const sldSzMatch = presXml.match(/<p:sldSz\b[^>]*cx="(\d+)"[^>]*cy="(\d+)"/i);
    if (sldSzMatch) {
      const cx = parseInt(sldSzMatch[1], 10);
      const cy = parseInt(sldSzMatch[2], 10);
      if (cx > 0 && cy > 0) {
        pageWidth = Math.round(cx / 12700);
        pageHeight = Math.round(cy / 12700);
      }
    }
  }

  const slideKeys = unzipped
    ? Object.keys(unzipped)
        .filter((k) => k.startsWith('ppt/slides/slide') && k.endsWith('.xml'))
        .sort((a, b) => {
          const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
          const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
          return numA - numB;
        })
    : [];

  const totalSlides = Math.max(slideKeys.length, 1);
  const primaryName = sanitizeForPdf(file.name || 'presentation.pptx');

  if (slideKeys.length === 0) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawText(primaryName, { x: 50, y: pageHeight - 50, size: 20, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
  } else {
    for (let sIdx = 0; sIdx < slideKeys.length; sIdx++) {
      const key = slideKeys[sIdx];
      const xml = textDecoder.decode(unzipped[key]);
      const paragraphs = extractSlideData(xml);

      // Check for slide relationships to locate embedded pictures
      const relsKey = key.replace('ppt/slides/', 'ppt/slides/_rels/') + '.rels';
      let embeddedImg = null;
      if (unzipped[relsKey]) {
        const relsXml = textDecoder.decode(unzipped[relsKey]);
        const imgMatch = relsXml.match(/Target="(\.\.\/media\/[^"]+)"/i);
        if (imgMatch) {
          const targetPath = 'ppt/' + imgMatch[1].replace('../', '');
          const imgBytes = unzipped[targetPath];
          if (imgBytes) {
            try {
              if (targetPath.endsWith('.png')) {
                embeddedImg = await pdfDoc.embedPng(imgBytes);
              } else if (targetPath.endsWith('.jpg') || targetPath.endsWith('.jpeg')) {
                embeddedImg = await pdfDoc.embedJpg(imgBytes);
              }
            } catch {}
          }
        }
      }

      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      // Subtle top header
      try {
        page.drawText(primaryName, {
          x: 50,
          y: pageHeight - 30,
          size: 9,
          font: regularFont,
          color: rgb(0.5, 0.5, 0.5)
        });
        page.drawText(`Slide ${sIdx + 1} of ${totalSlides}`, {
          x: pageWidth - 130,
          y: pageHeight - 30,
          size: 9,
          font: regularFont,
          color: rgb(0.5, 0.5, 0.5)
        });
      } catch {}

      let curY = pageHeight - 65;

      if (paragraphs.length > 0) {
        const titleItem = paragraphs[0];
        const titleLines = wrapText(titleItem.text, 65);
        for (const tLine of titleLines) {
          try {
            page.drawText(tLine, {
              x: 50,
              y: curY,
              size: 20,
              font: boldFont,
              color: rgb(0.08, 0.12, 0.2)
            });
            curY -= 26;
          } catch {}
        }

        // Title divider
        try {
          page.drawLine({
            start: { x: 50, y: curY + 12 },
            end: { x: 180, y: curY + 12 },
            thickness: 2,
            color: rgb(0.2, 0.7, 0.95)
          });
        } catch {}
        curY -= 12;

        const bodyItems = paragraphs.slice(1);
        for (const item of bodyItems) {
          if (curY < 60) break;
          const indent = 50 + Math.min(item.level, 3) * 16;
          const bullet = item.level > 0 ? '- ' : '* ';
          const wrapped = wrapText(item.text, 75 - Math.min(item.level, 3) * 5);

          for (let lIdx = 0; lIdx < wrapped.length; lIdx++) {
            if (curY < 60) break;
            const prefix = lIdx === 0 ? bullet : '  ';
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
          curY -= 4;
        }
      }

      // If slide has an embedded picture, display it
      if (embeddedImg) {
        try {
          const imgAspect = embeddedImg.width / embeddedImg.height;
          const maxImgW = Math.min(pageWidth - 100, 480);
          const maxImgH = Math.min(curY - 40, 260);
          if (maxImgH > 60) {
            let imgW = maxImgW;
            let imgH = imgW / imgAspect;
            if (imgH > maxImgH) {
              imgH = maxImgH;
              imgW = imgH * imgAspect;
            }
            const imgX = (pageWidth - imgW) / 2;
            const imgY = 40 + (maxImgH - imgH) / 2;
            page.drawImage(embeddedImg, { x: imgX, y: imgY, width: imgW, height: imgH });
          }
        } catch {}
      }
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

export async function pptxToPdf(file, options = {}) {
  if (!file) {
    throw new Error('No PowerPoint file provided for PDF conversion');
  }

  const hasBrowserDom =
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof document.createElement === 'function' &&
    typeof HTMLCanvasElement !== 'undefined';

  if (hasBrowserDom) {
    try {
      return await renderPptxSlidesToPdfBrowser(file, options);
    } catch (browserErr) {
      console.warn('[pptxToPdf] High-fidelity browser rendering encountered error, falling back to structured renderer:', browserErr);
    }
  }

  return renderPptxSlidesToPdfFallback(file, options);
}


