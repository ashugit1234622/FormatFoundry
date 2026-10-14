import { convertImage } from './image-converter.js';
import { convertJson } from './json-converter.js';
import { convertCsvOrTsv, convertJsonToDelimited } from './csv-converter.js';
import { convertMarkdown } from './markdown-converter.js';
import { convertSvg } from './svg-converter.js';
import { normalizeFormat } from '../core/filename-utils.js';

export async function convertFile(file, targetFormat, options = {}) {
  if (!file) {
    throw new Error('No file provided for conversion');
  }

  const target = normalizeFormat(targetFormat);

  if (target === 'json-pretty' || target === 'json-minify') {
    return convertJson(file, target);
  }

  const ext = file.name ? file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase() : '';
  const source = normalizeFormat(options.sourceFormat) || normalizeFormat(ext);

  if (source === 'svg') {
    if (target === 'png' || target === 'jpeg' || target === 'webp') {
      return convertSvg(file, target, options);
    }
  }

  if (source === 'json') {
    if (target === 'csv' || target === 'tsv') {
      return convertJsonToDelimited(file, target, options);
    }
  }

  if (source === 'csv' || source === 'tsv') {
    if (target === 'json' || target === 'tsv' || target === 'csv') {
      return convertCsvOrTsv(file, target);
    }
  }

  if (source === 'markdown' || ext === 'md') {
    if (target === 'html') {
      return convertMarkdown(file, target);
    }
  }

  if (target === 'jpeg' || target === 'png' || target === 'webp') {
    return convertImage(file, target, options);
  }

  throw new Error(`Unsupported conversion route: from "${source || ext}" to "${targetFormat}"`);
}

