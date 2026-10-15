import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import worker from '../../src/worker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

describe('Cloudflare Worker & Redirects Validation', () => {
  it('redirects HTTP requests to HTTPS with 301', async () => {
    const req = new Request('http://formatfoundry.site/png-to-jpg/');
    const mockEnv = { ASSETS: { fetch: async () => new Response('ok') } };
    const res = await worker.fetch(req, mockEnv);

    assert.equal(res.status, 301);
    assert.equal(res.headers.get('location'), 'https://formatfoundry.site/png-to-jpg/');
  });

  it('redirects www.formatfoundry.site to apex formatfoundry.site with 301', async () => {
    const req = new Request('https://www.formatfoundry.site/tools/');
    const mockEnv = { ASSETS: { fetch: async () => new Response('ok') } };
    const res = await worker.fetch(req, mockEnv);

    assert.equal(res.status, 301);
    assert.equal(res.headers.get('location'), 'https://formatfoundry.site/tools/');
  });

  it('redirects legacy workers.dev to formatfoundry.site with 301', async () => {
    const req = new Request('https://formatfoundary.9021382809as.workers.dev/json-to-csv/');
    const mockEnv = { ASSETS: { fetch: async () => new Response('ok') } };
    const res = await worker.fetch(req, mockEnv);

    assert.equal(res.status, 301);
    assert.equal(res.headers.get('location'), 'https://formatfoundry.site/json-to-csv/');
  });

  it('passes standard HTTPS apex requests to static assets', async () => {
    const req = new Request('https://formatfoundry.site/svg-to-png/');
    let assetFetched = false;
    const mockEnv = {
      ASSETS: {
        fetch: async (r) => {
          assetFetched = true;
          return new Response('asset content', { status: 200 });
        }
      }
    };
    const res = await worker.fetch(req, mockEnv);

    assert.equal(assetFetched, true);
    assert.equal(res.status, 200);
  });

  it('validates that _redirects contains only relative URLs', () => {
    const redirectsPath = path.resolve(rootDir, 'public', '_redirects');
    assert.ok(fs.existsSync(redirectsPath), 'public/_redirects must exist');

    const content = fs.readFileSync(redirectsPath, 'utf-8');
    const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);

    assert.ok(lines.length > 0, '_redirects must not be empty');

    for (const line of lines) {
      if (line.startsWith('#')) continue;
      const parts = line.split(/\s+/);
      assert.ok(parts.length >= 2, `Invalid rule syntax: "${line}"`);
      const [source, destination] = parts;

      assert.ok(
        source.startsWith('/'),
        `_redirects source must be a relative URL starting with "/": "${source}"`
      );
      assert.ok(
        destination.startsWith('/'),
        `_redirects destination must be a relative URL starting with "/": "${destination}"`
      );
    }
  });
});
