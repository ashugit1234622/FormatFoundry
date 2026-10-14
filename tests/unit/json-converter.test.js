import test from 'node:test';
import assert from 'node:assert/strict';
import { parseJsonSafely, formatJsonText, convertJson } from '../../src/engines/json-converter.js';

test('parseJsonSafely: parses valid JSON object and array', () => {
  const obj = parseJsonSafely('{"name": "FormatFoundry", "active": true}');
  assert.deepEqual(obj, { name: 'FormatFoundry', active: true });

  const arr = parseJsonSafely('[1, 2, "three", null]');
  assert.deepEqual(arr, [1, 2, 'three', null]);
});

test('parseJsonSafely: rejects empty input with clear error', () => {
  assert.throws(() => parseJsonSafely(''), {
    name: 'Error',
    message: 'JSON input is empty'
  });

  assert.throws(() => parseJsonSafely('   \n  \t '), {
    name: 'Error',
    message: 'JSON input is empty'
  });
});

test('parseJsonSafely: reports line and column for malformed JSON', () => {
  const malformed = '{\n  "title": "Report",\n  "count": 12,\n  badKey: 5\n}';
  assert.throws(
    () => parseJsonSafely(malformed),
    (err) => {
      assert.ok(err.message.includes('Malformed JSON:'));
      assert.ok(err.message.includes('line 4'));
      return true;
    }
  );
});

test('parseJsonSafely: does not silently repair trailing commas or unquoted keys', () => {
  assert.throws(() => parseJsonSafely('{"a": 1,}'));
  assert.throws(() => parseJsonSafely('{a: 1}'));
});

test('formatJsonText: pretty-prints with 2-space indentation', () => {
  const input = '{"b":2,"a":1,"nested":{"c":true}}';
  const pretty = formatJsonText(input, 'pretty', 2);
  const expected = '{\n  "b": 2,\n  "a": 1,\n  "nested": {\n    "c": true\n  }\n}';
  assert.equal(pretty, expected);
});

test('formatJsonText: minifies valid JSON', () => {
  const input = '{\n  "title": "Doc",\n  "items": [\n    1,\n    2,\n    3\n  ]\n}';
  const minified = formatJsonText(input, 'minify');
  assert.equal(minified, '{"title":"Doc","items":[1,2,3]}');
});

test('convertJson: converts File object and generates output Blob and filename', async () => {
  const file = new File(['{"users":[{"id":1,"name":"Alice"}]}'], 'users.json', {
    type: 'application/json'
  });

  const prettyResult = await convertJson(file, 'json-pretty');
  assert.equal(prettyResult.filename, 'users.formatted.json');
  assert.equal(prettyResult.format, 'json');
  assert.ok(prettyResult.blob instanceof Blob);
  assert.equal(prettyResult.blob.type, 'application/json;charset=utf-8');

  const prettyText = await prettyResult.blob.text();
  assert.ok(prettyText.includes('  "users": ['));

  const minResult = await convertJson(file, 'json-minify');
  assert.equal(minResult.filename, 'users.min.json');
  const minText = await minResult.blob.text();
  assert.equal(minText, '{"users":[{"id":1,"name":"Alice"}]}');
});
