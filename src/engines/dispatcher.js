import { convertImage } from './image-converter.js';
import { convertJson } from './json-converter.js';
import { convertCsvOrTsv, convertJsonToDelimited } from './csv-converter.js';
import { convertMarkdown } from './markdown-converter.js';
import { convertSvg } from './svg-converter.js';
import { convertHtml } from './html-converter.js';
import { imagesToPdf, textToPdf, markdownToPdf, pdfToText, pdfToImages } from './pdf-converter.js';
import { docxToHtml, docxToMarkdown, docxToText, docxToPdf, textToDocx, markdownToDocx } from './docx-converter.js';
import { imagesToPptx, textToPptx, markdownToPptx, pptxToText, pptxToPdf } from './pptx-converter.js';
import { normalizeFormat } from '../core/filename-utils.js';
import { extractFileExtension } from '../core/file-validator.js';

export async function convertFile(file, targetFormat, options = {}) {
  if (!file) {
    throw new Error('No file provided for conversion');
  }

  const target = normalizeFormat(targetFormat);

  if (target === 'json-pretty' || target === 'json-minify') {
    return convertJson(file, target);
  }

  const ext = extractFileExtension(file.name);
  const source = normalizeFormat(options.sourceFormat) || normalizeFormat(ext);

  if (source === 'svg') {
    if (target === 'png' || target === 'jpeg' || target === 'webp') {
      return convertSvg(file, target, options);
    }
    if (target === 'pdf') {
      const rasterPng = await convertSvg(file, 'png', options);
      const intermediateFile = {
        blob: rasterPng.blob,
        arrayBuffer: () => rasterPng.blob.arrayBuffer(),
        name: rasterPng.filename
      };
      return imagesToPdf(intermediateFile, target);
    }
  }

  if (source === 'json') {
    if (target === 'csv' || target === 'tsv') {
      return convertJsonToDelimited(file, target, options);
    }
  }

  if (source === 'csv' || source === 'tsv') {
    if (target === 'json' || target === 'tsv' || target === 'csv') {
      return convertCsvOrTsv(file, target, { ...options, sourceFormat: source });
    }
    if (target === 'pdf') {
      return textToPdf(file, target, options);
    }
  }

  if (source === 'html') {
    if (target === 'markdown') {
      return convertHtml(file, target);
    }
    if (target === 'pdf') {
      return textToPdf(file, target, options);
    }
  }

  if (source === 'markdown' || ext === 'md' || ext === 'markdown') {
    if (target === 'html') {
      return convertMarkdown(file, target);
    }
    if (target === 'pdf') {
      return markdownToPdf(file, target, options);
    }
    if (target === 'docx') {
      return markdownToDocx(file);
    }
    if (target === 'pptx') {
      return markdownToPptx(file);
    }
  }

  if (source === 'text' || ext === 'txt') {
    if (target === 'pdf') {
      return textToPdf(file, target, options);
    }
    if (target === 'docx') {
      return textToDocx(file);
    }
    if (target === 'pptx') {
      return textToPptx(file);
    }
  }

  if (source === 'pdf') {
    if (target === 'text') {
      return pdfToText(file);
    }
    if (target === 'png' || target === 'jpeg') {
      return pdfToImages(file, target, options);
    }
  }

  if (source === 'docx') {
    if (target === 'html') {
      return docxToHtml(file);
    }
    if (target === 'markdown') {
      return docxToMarkdown(file);
    }
    if (target === 'text') {
      return docxToText(file);
    }
    if (target === 'pdf') {
      return docxToPdf(file, options);
    }
  }

  if (source === 'pptx') {
    if (target === 'text') {
      return pptxToText(file);
    }
    if (target === 'pdf') {
      return pptxToPdf(file, options);
    }
  }

  if (source === 'png' || source === 'jpeg' || source === 'webp') {
    if (target === 'pdf') {
      return imagesToPdf(file, target);
    }
    if (target === 'pptx') {
      return imagesToPptx(file, target);
    }
  }

  const isNonRasterSource =
    source === 'json' ||
    source === 'csv' ||
    source === 'tsv' ||
    source === 'markdown' ||
    source === 'html' ||
    source === 'svg' ||
    source === 'pdf' ||
    source === 'docx' ||
    source === 'pptx' ||
    source === 'text';

  if ((target === 'jpeg' || target === 'png' || target === 'webp') && !isNonRasterSource) {
    return convertImage(file, target, options);
  }

  throw new Error(`Unsupported conversion route: from "${source || ext}" to "${targetFormat}"`);
}
