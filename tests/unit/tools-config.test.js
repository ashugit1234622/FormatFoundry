import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TOOLS, TOOL_CATEGORIES, getToolConfig, getToolsByCategory } from '../../src/config/tools-config.js';
import { ConversionRegistry, registerAllStandardRoutes } from '../../src/core/registry.js';

describe('Tools Configuration and Route Metadata', () => {
  it('defines exactly 16 supported tools across 5 categories', () => {
    assert.equal(TOOLS.length, 16);
    assert.deepEqual(Object.keys(TOOL_CATEGORIES), ['image', 'svg', 'data', 'text', 'inspection']);
  });

  it('contains valid paths and slugs for all tools', () => {
    const slugs = new Set();
    const paths = new Set();

    for (const tool of TOOLS) {
      assert.ok(tool.slug && typeof tool.slug === 'string');
      assert.ok(tool.path && tool.path.startsWith('/') && tool.path.endsWith('/'));
      assert.equal(tool.path, `/${tool.slug}/`);
      assert.ok(!slugs.has(tool.slug), `Duplicate slug: ${tool.slug}`);
      assert.ok(!paths.has(tool.path), `Duplicate path: ${tool.path}`);
      slugs.add(tool.slug);
      paths.add(tool.path);
    }
  });

  it('includes mandatory SEO fields for each tool', () => {
    for (const tool of TOOLS) {
      assert.ok(tool.title.length > 20, `Title too short for ${tool.slug}`);
      assert.ok(tool.metaDescription.length > 40, `Description too short for ${tool.slug}`);
      assert.ok(tool.h1.length > 5, `H1 too short for ${tool.slug}`);
      assert.ok(tool.subtitle.length > 20, `Subtitle too short for ${tool.slug}`);
      assert.ok(Array.isArray(tool.howToSteps) && tool.howToSteps.length >= 3);
      assert.ok(Array.isArray(tool.faqs) && tool.faqs.length >= 1);
      assert.ok(tool.limitations.length > 20);
      assert.ok(tool.supportedInputs.length > 2);
      assert.ok(tool.supportedOutputs.length > 2);
      assert.ok(Array.isArray(tool.relatedTools) && tool.relatedTools.length >= 2);
      for (const rel of tool.relatedTools) {
        assert.ok(TOOLS.some((t) => t.slug === rel), `Unknown related tool: ${rel}`);
      }
    }
  });

  it('resolves tool configuration by slug flexibly', () => {
    assert.equal(getToolConfig('png-to-jpg')?.slug, 'png-to-jpg');
    assert.equal(getToolConfig('/png-to-jpg/')?.slug, 'png-to-jpg');
    assert.equal(getToolConfig('PNG-TO-JPG')?.slug, 'png-to-jpg');
    assert.equal(getToolConfig('non-existent-tool'), null);
    assert.equal(getToolConfig(null), null);
  });

  it('filters tools by category correctly', () => {
    const imageTools = getToolsByCategory('image');
    assert.equal(imageTools.length, 6);
    const svgTools = getToolsByCategory('svg');
    assert.equal(svgTools.length, 3);
    const dataTools = getToolsByCategory('data');
    assert.equal(dataTools.length, 4);
    const textTools = getToolsByCategory('text');
    assert.equal(textTools.length, 2);
    const inspectionTools = getToolsByCategory('inspection');
    assert.equal(inspectionTools.length, 1);
  });

  it('maps tool preferred targets to valid routes in conversion registry', () => {
    const registry = new ConversionRegistry();
    registerAllStandardRoutes(registry);

    for (const tool of TOOLS) {
      if (tool.preferredSource && tool.preferredTarget) {
        const available = registry.getAvailableTargets(tool.preferredSource);
        assert.ok(
          available.includes(tool.preferredTarget),
          `Tool ${tool.slug} preferred target "${tool.preferredTarget}" not supported for source "${tool.preferredSource}"`
        );
      }
    }
  });
});
