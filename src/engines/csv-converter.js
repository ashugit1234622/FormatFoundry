import { generateOutputFilename } from '../core/filename-utils.js';
import { formatBytes } from '../core/formatters.js';

export function parseDelimited(rawText, delimiter = ',') {
  if (typeof rawText !== 'string') {
    throw new TypeError('Delimited text input must be a string');
  }

  let text = rawText;
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }

  if (text.trim() === '') {
    const label = delimiter === '\t' ? 'TSV' : 'CSV';
    throw new Error(`${label} file is empty`);
  }

  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;
  let i = 0;
  const len = text.length;

  while (i < len) {
    const char = text[i];

    if (insideQuotes) {
      if (char === '"') {
        if (i + 1 < len && text[i + 1] === '"') {
          currentField += '"';
          i += 2;
          continue;
        } else {
          insideQuotes = false;
          i += 1;
          continue;
        }
      } else {
        currentField += char;
        i += 1;
        continue;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
        i += 1;
        continue;
      }

      if (char === delimiter) {
        currentRow.push(currentField);
        currentField = '';
        i += 1;
        continue;
      }

      if (char === '\r') {
        if (i + 1 < len && text[i + 1] === '\n') {
          i += 1;
        }
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
        i += 1;
        continue;
      }

      if (char === '\n') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
        i += 1;
        continue;
      }

      currentField += char;
      i += 1;
    }
  }

  if (insideQuotes) {
    const label = delimiter === '\t' ? 'TSV' : 'CSV';
    throw new Error(`Unclosed quote in ${label} content`);
  }

  currentRow.push(currentField);
  rows.push(currentRow);

  return rows;
}

export function csvToJson(text, delimiter = ',') {
  const label = delimiter === '\t' ? 'TSV' : 'CSV';
  const allRows = parseDelimited(text, delimiter);

  const isRowBlank = (row) => !row || row.length === 0 || row.every((c) => (typeof c === 'string' ? c.trim() === '' : !c));

  let startIdx = 0;
  while (startIdx < allRows.length && isRowBlank(allRows[startIdx])) {
    startIdx++;
  }

  let endIdx = allRows.length - 1;
  while (endIdx >= startIdx && isRowBlank(allRows[endIdx])) {
    endIdx--;
  }

  if (startIdx > endIdx) {
    throw new Error(`${label} file is empty`);
  }

  const rows = allRows.slice(startIdx, endIdx + 1);
  const rawHeaderRow = rows[0];

  const dataRows = [];
  for (let r = 1; r < rows.length; r++) {
    if (!isRowBlank(rows[r])) {
      dataRows.push(rows[r]);
    }
  }

  let maxCols = rawHeaderRow.length;
  for (let r = 0; r < dataRows.length; r++) {
    if (dataRows[r].length > maxCols) {
      maxCols = dataRows[r].length;
    }
  }

  if (maxCols === 0) {
    throw new Error(`${label} file is empty`);
  }

  const headerCells = [];
  for (let c = 0; c < maxCols; c++) {
    headerCells.push(rawHeaderRow[c] !== undefined ? rawHeaderRow[c] : '');
  }

  const colHasData = new Array(maxCols).fill(false);
  for (let r = 0; r < dataRows.length; r++) {
    const row = dataRows[r];
    for (let c = 0; c < maxCols; c++) {
      if (row[c] !== undefined && typeof row[c] === 'string' && row[c].trim() !== '') {
        colHasData[c] = true;
      }
    }
  }

  const warnings = [];
  let effectiveColCount = maxCols;

  while (effectiveColCount > 0) {
    const lastColIdx = effectiveColCount - 1;
    const isHeaderEmpty = headerCells[lastColIdx].trim() === '';
    const hasData = colHasData[lastColIdx];

    if (isHeaderEmpty && !hasData) {
      warnings.push(`Empty trailing column ${lastColIdx + 1} ignored because it contains no data.`);
      effectiveColCount--;
    } else {
      break;
    }
  }

  if (effectiveColCount === 0) {
    throw new Error(`${label} contains no column headers or data`);
  }

  const seenFinalHeaders = new Set();
  const finalHeaders = [];

  for (let c = 0; c < effectiveColCount; c++) {
    const rawHeader = headerCells[c];
    const trimmedHeader = rawHeader.trim();

    let finalName = '';
    if (trimmedHeader === '') {
      let candidate = `column_${c + 1}`;
      if (seenFinalHeaders.has(candidate)) {
        let suffix = 2;
        while (seenFinalHeaders.has(`${candidate}_${suffix}`)) {
          suffix++;
        }
        candidate = `${candidate}_${suffix}`;
      }
      finalName = candidate;
      warnings.push(`Column ${c + 1} has an empty header. Generated fallback name "${finalName}".`);
    } else if (seenFinalHeaders.has(trimmedHeader)) {
      let suffix = 2;
      let candidate = `${trimmedHeader}_${suffix}`;
      while (seenFinalHeaders.has(candidate)) {
        suffix++;
        candidate = `${trimmedHeader}_${suffix}`;
      }
      finalName = candidate;
      warnings.push(`Duplicate header "${trimmedHeader}" at column ${c + 1} renamed to "${finalName}".`);
    } else {
      finalName = trimmedHeader;
    }

    seenFinalHeaders.add(finalName);
    finalHeaders.push(finalName);
  }

  if (dataRows.length === 0) {
    const emptyResult = [];
    Object.defineProperty(emptyResult, 'warnings', {
      value: warnings,
      enumerable: false,
      writable: true,
      configurable: true
    });
    return emptyResult;
  }

  const results = [];
  for (let r = 0; r < dataRows.length; r++) {
    const row = dataRows[r];
    const obj = {};
    for (let c = 0; c < effectiveColCount; c++) {
      const header = finalHeaders[c];
      obj[header] = row[c] !== undefined ? row[c] : '';
    }
    results.push(obj);
  }

  Object.defineProperty(results, 'warnings', {
    value: warnings,
    enumerable: false,
    writable: true,
    configurable: true
  });
  return results;
}

export function escapeDelimitedCell(value, delimiter = ',') {
  if (value === null || value === undefined) {
    return '';
  }

  let str;
  if (typeof value === 'object') {
    str = JSON.stringify(value);
  } else {
    str = String(value);
  }

  const needsQuotes = str.includes('"') || str.includes(delimiter) || str.includes('\n') || str.includes('\r');
  if (needsQuotes) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function inspectJsonStructure(jsonInput) {
  let data = jsonInput;
  if (typeof jsonInput === 'string') {
    const trimmed = jsonInput.trim();
    if (!trimmed) {
      return { valid: false, error: 'Empty JSON input' };
    }
    try {
      data = JSON.parse(trimmed);
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }

  if (Array.isArray(data)) {
    const allObjects = data.every((item) => item && typeof item === 'object' && !Array.isArray(item));
    return {
      valid: true,
      structureType: 'array-of-objects',
      allObjects,
      recordCount: data.length,
      candidateArrays: [],
      description: allObjects
        ? `Array of ${data.length} object${data.length === 1 ? '' : 's'}`
        : `Array of ${data.length} items`
    };
  }

  if (data && typeof data === 'object') {
    const candidateArrays = [];
    const otherKeys = [];

    for (const key of Object.keys(data)) {
      const val = data[key];
      if (Array.isArray(val) && (val.length === 0 || val.every((item) => item && typeof item === 'object' && !Array.isArray(item)))) {
        candidateArrays.push({ key, count: val.length });
      } else {
        otherKeys.push(key);
      }
    }

    if (candidateArrays.length === 1) {
      return {
        valid: true,
        structureType: 'wrapper-single',
        candidateArrays: candidateArrays.map((c) => c.key),
        selectedProperty: candidateArrays[0].key,
        recordCount: candidateArrays[0].count,
        otherKeys,
        description: `Object containing record array "${candidateArrays[0].key}" (${candidateArrays[0].count} item${candidateArrays[0].count === 1 ? '' : 's'})`
      };
    }

    if (candidateArrays.length > 1) {
      return {
        valid: true,
        structureType: 'wrapper-multiple',
        candidateArrays: candidateArrays.map((c) => c.key),
        selectedProperty: candidateArrays[0].key,
        candidateDetails: candidateArrays,
        otherKeys,
        description: `Object containing multiple record arrays: ${candidateArrays.map((c) => `"${c.key}" (${c.count})`).join(', ')}`
      };
    }

    const keyCount = Object.keys(data).length;
    return {
      valid: true,
      structureType: 'single-object',
      candidateArrays: [],
      recordCount: 1,
      keyCount,
      otherKeys: [],
      description: `Single JSON object (${keyCount} propert${keyCount === 1 ? 'y' : 'ies'})`
    };
  }

  return {
    valid: false,
    structureType: 'primitive',
    description: `Primitive value (${data === null ? 'null' : typeof data})`
  };
}

export function jsonToCsv(jsonInput, delimiter = ',', options = {}) {
  const label = delimiter === '\t' ? 'TSV' : 'CSV';
  let data = jsonInput;

  if (typeof jsonInput === 'string') {
    const trimmed = jsonInput.trim();
    if (trimmed === '') {
      throw new Error(`JSON to ${label} requires valid JSON (input is empty)`);
    }
    try {
      data = JSON.parse(trimmed);
    } catch (err) {
      throw new Error(`JSON to ${label} requires valid JSON: ${err.message}`);
    }
  }

  if (data === null || typeof data !== 'object') {
    const receivedType = data === null ? 'null' : typeof data;
    throw new Error(`JSON to ${label} requires an array of objects or an object (received ${receivedType})`);
  }

  const warnings = [];
  let records = [];

  if (Array.isArray(data)) {
    if (data.length === 0) {
      if (options.warningsRef && warnings.length > 0) {
        options.warningsRef.push(...warnings);
      }
      return '';
    }
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        const itemType = item === null ? 'null' : (Array.isArray(item) ? 'array' : typeof item);
        throw new Error(`JSON to ${label} requires each array item to be a plain object (item at index ${i} is ${itemType})`);
      }
    }
    records = data;
  } else {
    const candidateArrays = [];
    const otherKeys = [];

    for (const key of Object.keys(data)) {
      const val = data[key];
      if (Array.isArray(val) && (val.length === 0 || val.every((item) => item && typeof item === 'object' && !Array.isArray(item)))) {
        candidateArrays.push(key);
      } else {
        otherKeys.push(key);
      }
    }

    const requestedProperty = options.arrayProperty || options.selectedPath;

    if (requestedProperty) {
      if (!Object.prototype.hasOwnProperty.call(data, requestedProperty)) {
        throw new Error(`JSON object does not contain requested property "${requestedProperty}"`);
      }
      const targetVal = data[requestedProperty];
      if (!Array.isArray(targetVal)) {
        throw new Error(`Property "${requestedProperty}" in JSON object is not an array`);
      }
      for (let i = 0; i < targetVal.length; i++) {
        const item = targetVal[i];
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          const itemType = item === null ? 'null' : (Array.isArray(item) ? 'array' : typeof item);
          throw new Error(`Selected array "${requestedProperty}" contains non-object at index ${i} (${itemType})`);
        }
      }
      records = targetVal;
      const excludedKeys = Object.keys(data).filter((k) => k !== requestedProperty);
      if (excludedKeys.length > 0) {
        warnings.push(`Converted record array from property "${requestedProperty}". Root-level metadata properties (${excludedKeys.join(', ')}) were excluded from the CSV rows.`);
      } else {
        warnings.push(`Converted record array from property "${requestedProperty}".`);
      }
    } else if (candidateArrays.length > 1) {
      throw new Error(`JSON root object contains multiple candidate record arrays: "${candidateArrays.join('", "')}". Please specify which property to convert.`);
    } else if (candidateArrays.length === 1) {
      const targetKey = candidateArrays[0];
      records = data[targetKey];
      const excludedKeys = Object.keys(data).filter((k) => k !== targetKey);
      if (excludedKeys.length > 0) {
        warnings.push(`Detected wrapper object. Converted record array from property "${targetKey}". Root-level metadata properties (${excludedKeys.join(', ')}) were excluded from the CSV rows.`);
      } else {
        warnings.push(`Detected wrapper object. Converted record array from property "${targetKey}".`);
      }
    } else {
      records = [data];
      warnings.push('Converted single JSON object into a 1-row CSV table.');
    }
  }

  if (options.warningsRef && warnings.length > 0) {
    options.warningsRef.push(...warnings);
  }

  if (records.length === 0) {
    return '';
  }

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      const itemType = record === null ? 'null' : (Array.isArray(record) ? 'array' : typeof record);
      throw new Error(`JSON to ${label} requires each array item to be a plain object (item at index ${i} is ${itemType})`);
    }
  }

  const headerSet = new Set();
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    for (const key of Object.keys(record)) {
      if (typeof key !== 'string' || key.trim() === '') {
        throw new Error(`JSON object contains empty or whitespace-only key name in record at index ${i}`);
      }
      headerSet.add(key);
    }
  }

  const headers = Array.from(headerSet);
  if (headers.length === 0) {
    throw new Error(`JSON to ${label} requires objects with at least one property`);
  }

  const lines = [];
  lines.push(headers.map((h) => escapeDelimitedCell(h, delimiter)).join(delimiter));

  for (const record of records) {
    const row = headers.map((header) => {
      const val = Object.prototype.hasOwnProperty.call(record, header) ? record[header] : '';
      return escapeDelimitedCell(val, delimiter);
    });
    lines.push(row.join(delimiter));
  }

  return lines.join('\r\n');
}

export function csvToTsv(csvText) {
  const rows = parseDelimited(csvText, ',');
  return rows.map((row) => row.map((cell) => escapeDelimitedCell(cell, '\t')).join('\t')).join('\r\n');
}

export function tsvToCsv(tsvText) {
  const rows = parseDelimited(tsvText, '\t');
  return rows.map((row) => row.map((cell) => escapeDelimitedCell(cell, ',')).join(',')).join('\r\n');
}

export async function convertCsvOrTsv(file, targetFormat) {
  if (!file) {
    throw new Error('No file provided for delimited conversion');
  }

  const text = await file.text();
  let outputString = '';
  let mimeType = 'text/plain';
  let warnings = [];

  if (targetFormat === 'json') {
    const isTsv = file.name?.toLowerCase().endsWith('.tsv');
    const records = csvToJson(text, isTsv ? '\t' : ',');
    warnings = records.warnings || [];
    outputString = JSON.stringify(records, null, 2);
    mimeType = 'application/json;charset=utf-8';
  } else if (targetFormat === 'tsv') {
    outputString = csvToTsv(text);
    mimeType = 'text/tab-separated-values;charset=utf-8';
  } else if (targetFormat === 'csv') {
    outputString = tsvToCsv(text);
    mimeType = 'text/csv;charset=utf-8';
  } else {
    throw new Error(`Unsupported delimited conversion target: "${targetFormat}"`);
  }

  const blob = new Blob([outputString], { type: mimeType });
  const filename = generateOutputFilename(file.name || `data.${targetFormat}`, targetFormat);
  const url = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(blob)
    : '';

  return {
    blob,
    url,
    filename,
    size: blob.size,
    sizeFormatted: formatBytes(blob.size),
    format: targetFormat,
    warnings
  };
}

export async function convertJsonToDelimited(file, targetFormat = 'csv', options = {}) {
  if (!file) {
    throw new Error('No file provided for JSON conversion');
  }

  const text = await file.text();
  const delimiter = targetFormat === 'tsv' ? '\t' : ',';
  const warnings = [];
  const outputString = jsonToCsv(text, delimiter, { ...options, warningsRef: warnings });
  const mimeType = targetFormat === 'tsv'
    ? 'text/tab-separated-values;charset=utf-8'
    : 'text/csv;charset=utf-8';

  const blob = new Blob([outputString], { type: mimeType });
  const filename = generateOutputFilename(file.name || `data.${targetFormat}`, targetFormat);
  const url = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(blob)
    : '';

  return {
    blob,
    url,
    filename,
    size: blob.size,
    sizeFormatted: formatBytes(blob.size),
    format: targetFormat,
    warnings
  };
}
