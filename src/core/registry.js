import { normalizeFormat, normalizeImageFormat } from './filename-utils.js';

export class ConversionRegistry {
  constructor() {
    this.routes = new Map();
  }

  registerRoute(definition) {
    if (!definition || typeof definition !== 'object') {
      throw new TypeError('Route definition must be an object');
    }

    const from = normalizeFormat(definition.from);
    const to = normalizeFormat(definition.to);
    const category = typeof definition.category === 'string' ? definition.category.trim() : '';
    const description = typeof definition.description === 'string' ? definition.description.trim() : '';
    const operation = typeof definition.operation === 'string' ? definition.operation.trim() : '';

    if (!from) {
      throw new Error('Route definition must specify a source format ("from")');
    }

    if (!to) {
      throw new Error('Route definition must specify a target format ("to")');
    }

    if (from === to && !operation && !definition.allowSameFormat) {
      throw new Error('Source and target formats cannot be identical');
    }

    if (!category) {
      throw new Error('Route definition must specify a category');
    }

    const routeKey = operation ? `${from}->${to}:${operation}` : `${from}->${to}`;
    const routeRecord = {
      from,
      to,
      operation,
      category,
      description,
      engine: definition.engine ?? null
    };

    this.routes.set(routeKey, routeRecord);
    return routeRecord;
  }

  hasRoute(from, to, operation = '') {
    const normFrom = normalizeFormat(from);
    const normTo = normalizeFormat(to);
    const key = operation ? `${normFrom}->${normTo}:${operation}` : `${normFrom}->${normTo}`;
    return this.routes.has(key);
  }

  getRoute(from, to, operation = '') {
    const normFrom = normalizeFormat(from);
    const normTo = normalizeFormat(to);
    const key = operation ? `${normFrom}->${normTo}:${operation}` : `${normFrom}->${normTo}`;
    return this.routes.get(key) || null;
  }

  getAvailableTargets(from) {
    const normalizedFrom = normalizeFormat(from);
    const targets = [];

    for (const route of this.routes.values()) {
      if (route.from === normalizedFrom && !targets.includes(route.to)) {
        targets.push(route.to);
      }
    }

    return targets;
  }

  getAllRoutes() {
    return Array.from(this.routes.values());
  }

  clear() {
    this.routes.clear();
  }
}

export function registerStandardImageRoutes(registry) {
  registry.registerRoute({
    from: 'png',
    to: 'jpeg',
    category: 'image',
    description: 'Convert PNG to JPEG with solid white background matte'
  });

  registry.registerRoute({
    from: 'png',
    to: 'webp',
    category: 'image',
    description: 'Convert PNG to WebP with alpha transparency preserved'
  });

  registry.registerRoute({
    from: 'jpeg',
    to: 'png',
    category: 'image',
    description: 'Convert JPEG to lossless PNG'
  });

  registry.registerRoute({
    from: 'jpeg',
    to: 'webp',
    category: 'image',
    description: 'Convert JPEG to WebP compression'
  });

  registry.registerRoute({
    from: 'webp',
    to: 'png',
    category: 'image',
    description: 'Convert WebP to lossless PNG'
  });

  registry.registerRoute({
    from: 'webp',
    to: 'jpeg',
    category: 'image',
    description: 'Convert WebP to JPEG with solid white background matte'
  });

  registry.registerRoute({
    from: 'svg',
    to: 'png',
    category: 'image',
    description: 'Rasterize SVG vector graphics to PNG'
  });

  registry.registerRoute({
    from: 'svg',
    to: 'jpeg',
    category: 'image',
    description: 'Rasterize SVG vector graphics to JPEG with white matte'
  });

  registry.registerRoute({
    from: 'svg',
    to: 'webp',
    category: 'image',
    description: 'Rasterize SVG vector graphics to WebP'
  });
}

export function registerStandardDataRoutes(registry) {
  registry.registerRoute({
    from: 'json',
    to: 'json-pretty',
    category: 'data',
    description: 'Pretty-print JSON with 2-space indentation'
  });

  registry.registerRoute({
    from: 'json',
    to: 'json-minify',
    category: 'data',
    description: 'Minify JSON to compact single line'
  });

  registry.registerRoute({
    from: 'json',
    to: 'csv',
    category: 'data',
    description: 'Convert JSON array of objects to CSV'
  });

  registry.registerRoute({
    from: 'json',
    to: 'tsv',
    category: 'data',
    description: 'Convert JSON array of objects to TSV'
  });

  registry.registerRoute({
    from: 'csv',
    to: 'json',
    category: 'data',
    description: 'Convert CSV to JSON array of objects'
  });

  registry.registerRoute({
    from: 'csv',
    to: 'tsv',
    category: 'data',
    description: 'Convert CSV to Tab-Separated Values (TSV)'
  });

  registry.registerRoute({
    from: 'tsv',
    to: 'csv',
    category: 'data',
    description: 'Convert TSV to Comma-Separated Values (CSV)'
  });

  registry.registerRoute({
    from: 'tsv',
    to: 'json',
    category: 'data',
    description: 'Convert TSV to JSON array of objects'
  });

  registry.registerRoute({
    from: 'markdown',
    to: 'html',
    category: 'text',
    description: 'Convert Markdown to sanitized HTML document'
  });
}

export function registerStandardDocumentRoutes(registry) {
  // PDF Extraction
  registry.registerRoute({
    from: 'pdf',
    to: 'text',
    category: 'document',
    description: 'Extract text from PDF document pages'
  });

  registry.registerRoute({
    from: 'pdf',
    to: 'png',
    category: 'document',
    description: 'Render PDF pages to PNG images'
  });

  registry.registerRoute({
    from: 'pdf',
    to: 'jpeg',
    category: 'document',
    description: 'Render PDF pages to JPEG images'
  });

  // Images to PDF
  registry.registerRoute({
    from: 'png',
    to: 'pdf',
    category: 'document',
    description: 'Compile PNG images into PDF document'
  });

  registry.registerRoute({
    from: 'jpeg',
    to: 'pdf',
    category: 'document',
    description: 'Compile JPEG images into PDF document'
  });

  registry.registerRoute({
    from: 'webp',
    to: 'pdf',
    category: 'document',
    description: 'Compile WebP images into PDF document'
  });

  // Text & Markdown to PDF
  registry.registerRoute({
    from: 'text',
    to: 'pdf',
    category: 'document',
    description: 'Convert plain text to paginated PDF document'
  });

  registry.registerRoute({
    from: 'markdown',
    to: 'pdf',
    category: 'document',
    description: 'Compile Markdown to styled PDF document'
  });

  // Word (DOCX) conversions
  registry.registerRoute({
    from: 'docx',
    to: 'html',
    category: 'document',
    description: 'Convert Word document to clean HTML5'
  });

  registry.registerRoute({
    from: 'docx',
    to: 'markdown',
    category: 'document',
    description: 'Convert Word document to Markdown'
  });

  registry.registerRoute({
    from: 'docx',
    to: 'text',
    category: 'document',
    description: 'Extract plain text from Word document'
  });

  registry.registerRoute({
    from: 'docx',
    to: 'pdf',
    category: 'document',
    description: 'Convert Word document to PDF'
  });

  registry.registerRoute({
    from: 'markdown',
    to: 'docx',
    category: 'document',
    description: 'Convert Markdown to Microsoft Word document'
  });

  registry.registerRoute({
    from: 'text',
    to: 'docx',
    category: 'document',
    description: 'Convert plain text to Microsoft Word document'
  });

  // PowerPoint (PPTX) conversions
  registry.registerRoute({
    from: 'png',
    to: 'pptx',
    category: 'presentation',
    description: 'Convert PNG images into PowerPoint slides'
  });

  registry.registerRoute({
    from: 'jpeg',
    to: 'pptx',
    category: 'presentation',
    description: 'Convert JPEG images into PowerPoint slides'
  });

  registry.registerRoute({
    from: 'webp',
    to: 'pptx',
    category: 'presentation',
    description: 'Convert WebP images into PowerPoint slides'
  });

  registry.registerRoute({
    from: 'text',
    to: 'pptx',
    category: 'presentation',
    description: 'Convert text outline into PowerPoint slides'
  });

  registry.registerRoute({
    from: 'markdown',
    to: 'pptx',
    category: 'presentation',
    description: 'Convert Markdown sections into PowerPoint slides'
  });

  registry.registerRoute({
    from: 'pptx',
    to: 'pdf',
    category: 'presentation',
    description: 'Convert PowerPoint presentation to PDF slides'
  });

  registry.registerRoute({
    from: 'pptx',
    to: 'text',
    category: 'presentation',
    description: 'Extract all text from PowerPoint presentation'
  });

  // Web / Markup
  registry.registerRoute({
    from: 'html',
    to: 'markdown',
    category: 'text',
    description: 'Convert HTML markup to clean Markdown'
  });
}

export function registerAllStandardRoutes(registry) {
  registerStandardImageRoutes(registry);
  registerStandardDataRoutes(registry);
  registerStandardDocumentRoutes(registry);
}

export const defaultRegistry = new ConversionRegistry();
