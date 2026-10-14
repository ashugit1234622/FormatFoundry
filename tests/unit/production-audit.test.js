import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runRouteAudit } from '../../scripts/audit-routes.js';
import { TOOLS } from '../../src/config/tools-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

describe('Production Route & Asset Audit', () => {
  it('passes comprehensive route audit on source templates', () => {
    const result = runRouteAudit({ targetDir: rootDir });
    assert.equal(result.routesAudited, 18);
    assert.equal(result.issuesCount, 0, `Issues encountered: ${result.issues.join('; ')}`);
    assert.equal(result.passed, true);
  });

  it('verifies all 16 tool routes correspond to valid tools configuration', () => {
    for (const tool of TOOLS) {
      assert.ok(tool.slug && tool.path);
      assert.equal(tool.path, `/${tool.slug}/`);
    }
  });

  it('passes production route audit on dist directory if built', () => {
    const distDir = path.resolve(rootDir, 'dist');
    const result = runRouteAudit({ targetDir: distDir });
    assert.equal(result.routesAudited, 18);
    assert.equal(result.issuesCount, 0, `Dist audit issues: ${result.issues.join('; ')}`);
    assert.equal(result.passed, true);
  });
});
