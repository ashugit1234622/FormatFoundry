import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  parseDelimited,
  csvToJson,
  jsonToCsv,
  csvToTsv,
  tsvToCsv,
  convertCsvOrTsv,
  convertJsonToDelimited
} from '../../src/engines/csv-converter.js';

test('parseDelimited: parses simple and quoted fields with commas and CRLF', () => {
  const csv = 'name,age,city\r\nAlice,30,"New York, NY"\r\nBob,25,"London"';
  const rows = parseDelimited(csv, ',');
  assert.equal(rows.length, 3);
  assert.deepEqual(rows[0], ['name', 'age', 'city']);
  assert.deepEqual(rows[1], ['Alice', '30', 'New York, NY']);
  assert.deepEqual(rows[2], ['Bob', '25', 'London']);
});

test('parseDelimited: strips UTF-8 BOM if present at start', () => {
  const bomCsv = '\uFEFFid,name\r\n1,Alice';
  const rows = parseDelimited(bomCsv, ',');
  assert.equal(rows.length, 2);
  assert.equal(rows[0][0], 'id');
  assert.equal(rows[0][0].charCodeAt(0), 105);
});

test('parseDelimited: parses escaped quotes inside quoted fields', () => {
  const csv = 'id,quote\r\n1,"He said ""Hello, World!"""';
  const rows = parseDelimited(csv, ',');
  assert.equal(rows.length, 2);
  assert.equal(rows[1][1], 'He said "Hello, World!"');
});

test('parseDelimited: parses embedded newlines within quotes', () => {
  const csv = 'id,bio\r\n101,"Line 1\nLine 2\nLine 3"';
  const rows = parseDelimited(csv, ',');
  assert.equal(rows.length, 2);
  assert.equal(rows[1][1], 'Line 1\nLine 2\nLine 3');
});

test('parseDelimited: rejects unclosed quotes with error', () => {
  const broken = 'id,value\r\n1,"unclosed text';
  assert.throws(() => parseDelimited(broken, ','), {
    name: 'Error',
    message: 'Unclosed quote in CSV content'
  });
});

test('csvToJson: parses CSV containing UTF-8 BOM cleanly', () => {
  const bomCsv = '\uFEFFid,role\r\n101,Admin';
  const result = csvToJson(bomCsv);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], { id: '101', role: 'Admin' });
});

test('csvToJson: skips leading blank lines and handles trailing newlines', () => {
  const csv = '\n\r\n\nid,name\r\n1,Alice\r\n2,Bob\r\n\n\r\n';
  const result = csvToJson(csv);
  assert.equal(result.length, 2);
  assert.deepEqual(result[0], { id: '1', name: 'Alice' });
  assert.deepEqual(result[1], { id: '2', name: 'Bob' });
});

test('csvToJson: preserves cell values as strings and rejects type coercion', () => {
  const csv = 'code,flag,empty_col,zero\r\n00123,true,null,0';
  const result = csvToJson(csv);
  assert.equal(result.length, 1);
  assert.strictEqual(result[0].code, '00123');
  assert.strictEqual(result[0].flag, 'true');
  assert.strictEqual(result[0].empty_col, 'null');
  assert.strictEqual(result[0].zero, '0');
});

test('csvToJson: handles duplicate headers safely and deterministically without overwriting data', () => {
  const duplicateCsv = 'id,name,role,name\r\n1,Alice,Admin,Alicia';
  const result = csvToJson(duplicateCsv);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], {
    id: '1',
    name: 'Alice',
    role: 'Admin',
    name_2: 'Alicia'
  });
  assert.equal(result.warnings.length, 1);
  assert.ok(result.warnings[0].includes('Duplicate header "name" at column 4 renamed to "name_2"'));
});

test('csvToJson: generates fallback name for empty column header and emits non-blocking warning', () => {
  const emptyColCsv = 'id,,role\r\n1,Alice,Admin';
  const result = csvToJson(emptyColCsv);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], {
    id: '1',
    column_2: 'Alice',
    role: 'Admin'
  });
  assert.equal(result.warnings.length, 1);
  assert.ok(result.warnings[0].includes('Column 2 has an empty header'));
  assert.ok(result.warnings[0].includes('column_2'));
});

test('csvToJson: safely ignores empty trailing columns containing no data and logs warning', () => {
  const trailingEmpty = 'id,name,role,,,\r\n1,Alice,Admin,,,\r\n2,Bob,User,,,';
  const result = csvToJson(trailingEmpty);
  assert.equal(result.length, 2);
  assert.deepEqual(result[0], { id: '1', name: 'Alice', role: 'Admin' });
  assert.deepEqual(result[1], { id: '2', name: 'Bob', role: 'User' });
  assert.equal(result.warnings.length, 3);
  assert.ok(result.warnings.some((w) => w.includes('Empty trailing column 4 ignored')));
  assert.ok(result.warnings.some((w) => w.includes('Empty trailing column 5 ignored')));
  assert.ok(result.warnings.some((w) => w.includes('Empty trailing column 6 ignored')));
});

test('csvToJson: preserves empty trailing column when it contains data and assigns fallback name', () => {
  const trailingWithData = 'id,name,\r\n1,Alice,SecretData';
  const result = csvToJson(trailingWithData);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], {
    id: '1',
    name: 'Alice',
    column_3: 'SecretData'
  });
  assert.equal(result.warnings.length, 1);
  assert.ok(result.warnings[0].includes('Column 3 has an empty header'));
  assert.ok(result.warnings[0].includes('column_3'));
});

test('csvToJson: returns empty array for header-only CSV', () => {
  const headerOnly = 'id,name,role\r\n';
  const result = csvToJson(headerOnly);
  assert.deepEqual(result, []);
});

test('csvToJson: rejects empty CSV file with descriptive error', () => {
  assert.throws(() => csvToJson('   \n  '), {
    name: 'Error',
    message: 'CSV file is empty'
  });
});

test('jsonToCsv: builds headers deterministically and handles missing fields', () => {
  const data = [
    { id: 1, name: 'Alice', role: 'Engineer' },
    { id: 2, name: 'Bob' },
    { id: 3, role: 'Designer', extra: 'Notes' }
  ];

  const csv = jsonToCsv(data);
  const rows = parseDelimited(csv, ',');
  assert.deepEqual(rows[0], ['id', 'name', 'role', 'extra']);
  assert.deepEqual(rows[1], ['1', 'Alice', 'Engineer', '']);
  assert.deepEqual(rows[2], ['2', 'Bob', '', '']);
  assert.deepEqual(rows[3], ['3', '', 'Designer', 'Notes']);
});

test('jsonToCsv: serializes nested objects and arrays explicitly as JSON strings', () => {
  const data = [
    {
      id: 1,
      tags: ['alpha', 'beta'],
      meta: { source: 'api', v: 2 }
    }
  ];

  const csv = jsonToCsv(data);
  const rows = parseDelimited(csv, ',');
  assert.deepEqual(rows[0], ['id', 'tags', 'meta']);
  assert.equal(rows[1][1], '["alpha","beta"]');
  assert.equal(rows[1][2], '{"source":"api","v":2}');
});

test('jsonToCsv: requires top-level array of objects and gives clear error for invalid shapes', () => {
  assert.throws(
    () => jsonToCsv('{"single": "object"}'),
    (err) => {
      assert.ok(err.message.includes('requires a top-level array of objects'));
      return true;
    }
  );

  assert.throws(
    () => jsonToCsv('[1, 2, 3]'),
    (err) => {
      assert.ok(err.message.includes('requires each array item to be a plain object'));
      return true;
    }
  );

  assert.throws(
    () => jsonToCsv(''),
    (err) => {
      assert.ok(err.message.includes('input is empty'));
      return true;
    }
  );
});

test('jsonToCsv: rejects objects with empty or whitespace-only keys', () => {
  assert.throws(
    () => jsonToCsv([{ '': 'value' }]),
    (err) => {
      assert.ok(err.message.includes('empty or whitespace-only key name'));
      return true;
    }
  );
});

test('csvToTsv and tsvToCsv: convert between comma and tab delimiters preserving quotes', () => {
  const csv = 'name,notes,rank\r\n"Smith, John","Great\tjob",1';
  const tsv = csvToTsv(csv);

  assert.ok(tsv.includes('\t'));
  const tsvRows = parseDelimited(tsv, '\t');
  assert.deepEqual(tsvRows[0], ['name', 'notes', 'rank']);
  assert.equal(tsvRows[1][0], 'Smith, John');
  assert.equal(tsvRows[1][1], 'Great\tjob');

  const backCsv = tsvToCsv(tsv);
  const backRows = parseDelimited(backCsv, ',');
  assert.deepEqual(backRows[1], ['Smith, John', 'Great\tjob', '1']);
});

test('convertCsvOrTsv and convertJsonToDelimited: generate valid Blobs and output filenames', async () => {
  const jsonFile = new File(['[{"id":1,"name":"Alice"}]'], 'records.json', {
    type: 'application/json'
  });
  const csvResult = await convertJsonToDelimited(jsonFile, 'csv');
  assert.equal(csvResult.filename, 'records.csv');
  assert.equal(csvResult.format, 'csv');
  assert.ok(csvResult.blob instanceof Blob);

  const csvFile = new File(['id,name\r\n1,Alice'], 'records.csv', {
    type: 'text/csv'
  });
  const tsvResult = await convertCsvOrTsv(csvFile, 'tsv');
  assert.equal(tsvResult.filename, 'records.tsv');
  assert.equal(tsvResult.format, 'tsv');

  const jsonResult = await convertCsvOrTsv(csvFile, 'json');
  assert.equal(jsonResult.filename, 'records.json');
  assert.equal(jsonResult.format, 'json');
  assert.ok(jsonResult.sizeFormatted);
  assert.ok(Array.isArray(jsonResult.warnings));
  const jsonText = await jsonResult.blob.text();
  assert.deepEqual(JSON.parse(jsonText), [{ id: '1', name: 'Alice' }]);
});

test('csvToJson: converts real-world annual-enterprise-survey-2025-financial-year-provisional-size-bands.csv without error', () => {
  const filePath = path.resolve('tests/fixtures/annual-enterprise-survey-2025-financial-year-provisional-size-bands.csv');
  assert.ok(fs.existsSync(filePath), 'Fixture file must exist');
  const text = fs.readFileSync(filePath, 'utf8');
  const result = csvToJson(text);
  assert.equal(result.length, 23220);
  assert.equal(result.warnings.length, 9);
  assert.ok(result.warnings.every((w) => w.includes('Column') && w.includes('has an empty header')));

  assert.equal(result[0].year, '2011');
  assert.equal(result[0].industry_code_ANZSIC, 'A');
  assert.equal(result[0].industry_name_ANZSIC, 'Agriculture, Forestry and Fishing');
  assert.equal(result[0].rme_size_grp, 'a_0');
  assert.equal(result[0].variable, 'Activity unit');
  assert.equal(result[0].value, '46134');
  assert.equal(result[0].unit, 'COUNT');
  assert.equal(result[0].column_8, '');

  const row17134 = result[17133];
  assert.equal(row17134.year, '2022');
  assert.equal(row17134.column_10, '2022');
  assert.equal(row17134.column_11, 'B');
  assert.equal(row17134.column_12, 'Mining');
  assert.equal(row17134.column_13, 'c_6-9');
  assert.equal(row17134.column_14, 'Sales, government funding, grants and subsidies');
  assert.equal(row17134.column_15, 'C');
  assert.equal(row17134.column_16, 'DOLLARS(millions)');

  const lastRow = result[result.length - 1];
  assert.equal(lastRow.year, '2025');
  assert.equal(lastRow.industry_code_ANZSIC, 'all');
  assert.equal(lastRow.value, '976077');
});
