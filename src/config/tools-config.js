export const TOOL_CATEGORIES = {
  document: {
    id: 'document',
    label: 'Document & PDF Tools',
    description: 'Convert PDFs, Word documents (DOCX), and text files locally with zero server uploads.'
  },
  presentation: {
    id: 'presentation',
    label: 'Presentation Tools',
    description: 'Convert slide decks and presentations (PPTX) locally into text, images, and documents.'
  },
  markup: {
    id: 'markup',
    label: 'Markup & HTML Tools',
    description: 'Convert HTML and Markdown bidirectional documentation and web markup.'
  },
  image: {
    id: 'image',
    label: 'Image Converters',
    description: 'Convert between popular raster formats locally with transparency preservation and custom compression.'
  },
  svg: {
    id: 'svg',
    label: 'SVG Converters',
    description: 'Rasterize scalable vector graphics to high-resolution PNG, JPG, or WebP files directly in your browser.'
  },
  data: {
    id: 'data',
    label: 'Data Converters',
    description: 'Transform structured datasets between JSON, CSV, and TSV with strict string preservation.'
  },
  text: {
    id: 'text',
    label: 'Text Utilities',
    description: 'Compile Markdown to clean HTML or format, validate, and minify JSON payloads.'
  },
  inspection: {
    id: 'inspection',
    label: 'Inspection & Batch Tools',
    description: 'Inspect image binary headers, verify decodability, and bundle converted files into single ZIP archives.'
  }
};

export const TOOLS = [
  {
    slug: 'png-to-jpg',
    path: '/png-to-jpg/',
    name: 'PNG to JPG Converter',
    shortName: 'PNG to JPG',
    category: 'image',
    preferredSource: 'png',
    preferredTarget: 'jpeg',
    title: 'PNG to JPG Converter — Free, Client-Side Image Conversion | FormatFoundry',
    metaDescription: 'Convert PNG images to JPG format locally in your browser. Fast, private raster image conversion with white background compositing for transparency.',
    h1: 'PNG to JPG Converter',
    subtitle: 'Convert PNG images to compressed JPG format directly in your browser with zero server uploads, privacy-first processing, and instant downloads.',
    badgeFrom: 'PNG',
    badgeTo: 'JPG',
    howToSteps: [
      'Select or drag and drop one or more PNG files into the upload area.',
      'Confirm JPG is selected as the target format in the staged item controls.',
      'Click Convert to rasterize locally and download the resulting JPG file or a ZIP archive.'
    ],
    supportedInputs: 'PNG (.png, image/png)',
    supportedOutputs: 'JPG/JPEG (.jpg, image/jpeg), WebP (.webp)',
    features: [
      'Pure browser-based rasterization using HTML5 Canvas',
      'Solid white background compositing for alpha transparency',
      'High-quality compression with zero server upload',
      'Batch conversion and multi-file ZIP download'
    ],
    limitations: 'Because the JPEG format does not support alpha transparency channels, transparent areas in your PNG images are automatically composited onto a solid white background.',
    faqs: [
      {
        question: 'What happens to transparent pixels when converting PNG to JPG?',
        answer: 'JPEG does not support alpha transparency. FormatFoundry automatically composites any transparent areas onto a clean, solid white background matte before encoding.'
      },
      {
        question: 'Are my PNG images uploaded to an external server?',
        answer: 'No. All file reading, decoding, canvas compositing, and JPEG encoding execute strictly in your local browser memory using JavaScript and HTML5 Canvas.'
      },
      {
        question: 'Can I batch convert multiple PNG images to JPG at once?',
        answer: 'Yes. You can drag and drop multiple PNG files into the workspace, click Convert All, and download each result individually or bundle them together into a single ZIP archive.'
      }
    ],
    relatedTools: ['png-to-webp', 'jpg-to-png', 'image-inspector']
  },
  {
    slug: 'png-to-webp',
    path: '/png-to-webp/',
    name: 'PNG to WebP Converter',
    shortName: 'PNG to WebP',
    category: 'image',
    preferredSource: 'png',
    preferredTarget: 'webp',
    title: 'PNG to WebP Converter — Reduce Image Size with Alpha Transparency | FormatFoundry',
    metaDescription: 'Convert PNG images to modern WebP format in your browser. Preserve alpha transparency while achieving smaller file sizes with zero server uploads.',
    h1: 'PNG to WebP Converter',
    subtitle: 'Convert PNG images to efficient WebP format with preserved alpha transparency and reduced byte size directly inside your browser.',
    badgeFrom: 'PNG',
    badgeTo: 'WEBP',
    howToSteps: [
      'Drag and drop your PNG images into the dropzone above.',
      'Verify WebP is selected as the target format.',
      'Click Convert to generate optimized WebP images locally.'
    ],
    supportedInputs: 'PNG (.png, image/png)',
    supportedOutputs: 'WebP (.webp, image/webp), JPG (.jpg, image/jpeg)',
    features: [
      'Preserves 8-bit alpha transparency channels',
      'Significantly smaller file sizes compared to standard PNG',
      'Modern web image format supported by all major browsers',
      'Instant local downloads with bulk ZIP packaging'
    ],
    limitations: 'WebP compression uses lossy or lossless browser canvas encoding depending on browser implementation, typically reducing file size by 25-35% while preserving visual clarity.',
    faqs: [
      {
        question: 'Does converting PNG to WebP keep transparent backgrounds?',
        answer: 'Yes. WebP supports full 8-bit alpha channel transparency, so your transparent backgrounds remain intact without being replaced by a solid color.'
      },
      {
        question: 'How much file size reduction can I expect?',
        answer: 'WebP typically provides 25% to 35% reduction in file size compared to equivalent PNG images while maintaining equivalent visual fidelity.'
      }
    ],
    relatedTools: ['png-to-jpg', 'webp-to-png', 'image-inspector']
  },
  {
    slug: 'jpg-to-png',
    path: '/jpg-to-png/',
    name: 'JPG to PNG Converter',
    shortName: 'JPG to PNG',
    category: 'image',
    preferredSource: 'jpeg',
    preferredTarget: 'png',
    title: 'JPG to PNG Converter — Lossless Raster Image Conversion | FormatFoundry',
    metaDescription: 'Convert JPG images to lossless PNG format in your browser. Clean, private image conversion with instant local downloads and zero server uploads.',
    h1: 'JPG to PNG Converter',
    subtitle: 'Transform compressed JPG images into uncompressed, lossless PNG graphics directly inside your browser sandbox.',
    badgeFrom: 'JPG',
    badgeTo: 'PNG',
    howToSteps: [
      'Drop your JPG or JPEG files into the staging workspace.',
      'Confirm PNG is chosen as the target format.',
      'Click Convert to produce lossless PNG files locally.'
    ],
    supportedInputs: 'JPG/JPEG (.jpg, .jpeg, image/jpeg)',
    supportedOutputs: 'PNG (.png, image/png), WebP (.webp)',
    features: [
      'Lossless pixel preservation',
      'Accepts both .jpg and .jpeg file extensions',
      'Local canvas decoding with instant downloads',
      'Preserves original pixel dimensions exactly'
    ],
    limitations: 'Converting a lossy JPG to PNG will not restore compression artifacts that were already present in the original JPEG file, though it prevents any further quality loss.',
    faqs: [
      {
        question: 'Will converting JPG to PNG improve image quality?',
        answer: 'No. PNG is a lossless format, so it will preserve the exact pixels of the source JPEG without adding further artifacts, but it cannot reverse lossy compression already baked into the JPEG.'
      },
      {
        question: 'Does this converter accept both .jpg and .jpeg extensions?',
        answer: 'Yes. FormatFoundry handles .jpg and .jpeg files identically, verifying the actual JFIF/EXIF binary signature to ensure valid image data.'
      }
    ],
    relatedTools: ['jpg-to-webp', 'png-to-jpg', 'image-inspector']
  },
  {
    slug: 'jpg-to-webp',
    path: '/jpg-to-webp/',
    name: 'JPG to WebP Converter',
    shortName: 'JPG to WebP',
    category: 'image',
    preferredSource: 'jpeg',
    preferredTarget: 'webp',
    title: 'JPG to WebP Converter — Optimize Images for Web | FormatFoundry',
    metaDescription: 'Convert JPG images to modern WebP format for faster web performance. In-browser client-side image compression with zero server uploads.',
    h1: 'JPG to WebP Converter',
    subtitle: 'Compress JPEG photographs into modern, bandwidth-efficient WebP images locally in your browser for faster site loading.',
    badgeFrom: 'JPG',
    badgeTo: 'WEBP',
    howToSteps: [
      'Upload JPEG or JPG files into the conversion area.',
      'Select WebP as the destination format.',
      'Click Convert and download your optimized WebP image.'
    ],
    supportedInputs: 'JPG/JPEG (.jpg, .jpeg, image/jpeg)',
    supportedOutputs: 'WebP (.webp, image/webp), PNG (.png, image/png)',
    features: [
      'Advanced predictive coding for superior image compression',
      'Maintains photographic detail with lower byte size',
      'Completely client-side with zero telemetry',
      'Bulk batch conversion support'
    ],
    limitations: 'Image conversion runs via the browser rendering engine. Very large images (over 20-30 megapixels) may be constrained by available device memory.',
    faqs: [
      {
        question: 'Why should I convert JPG to WebP?',
        answer: 'WebP offers 25% to 34% smaller file sizes than comparable JPEG images at equivalent quality ratings, helping websites load significantly faster.'
      }
    ],
    relatedTools: ['jpg-to-png', 'webp-to-jpg', 'image-inspector']
  },
  {
    slug: 'webp-to-png',
    path: '/webp-to-png/',
    name: 'WebP to PNG Converter',
    shortName: 'WebP to PNG',
    category: 'image',
    preferredSource: 'webp',
    preferredTarget: 'png',
    title: 'WebP to PNG Converter — Convert WebP to Lossless PNG | FormatFoundry',
    metaDescription: 'Convert WebP images to widely compatible PNG format in your browser. Preserves transparency with zero server uploads and instant downloads.',
    h1: 'WebP to PNG Converter',
    subtitle: 'Convert WebP graphics to universally compatible PNG files with transparency preservation right inside your browser.',
    badgeFrom: 'WEBP',
    badgeTo: 'PNG',
    howToSteps: [
      'Select or drag WebP files into the dropzone.',
      'Confirm PNG is selected as the target format.',
      'Click Convert and download the resulting PNG files.'
    ],
    supportedInputs: 'WebP (.webp, image/webp)',
    supportedOutputs: 'PNG (.png, image/png), JPG (.jpg, image/jpeg)',
    features: [
      'Universal compatibility across legacy software and viewers',
      'Preserves transparency channels intact',
      'No quality degradation during format transformation',
      'Batch processing with one-click ZIP download'
    ],
    limitations: 'Resulting PNG files will generally be larger in byte size than the source WebP files due to PNG using uncompressed or deflate-compressed bitmap representations.',
    faqs: [
      {
        question: 'Will WebP transparency be preserved in the PNG output?',
        answer: 'Yes. PNG fully supports alpha transparency channels, ensuring transparent areas from your WebP file are accurately preserved.'
      }
    ],
    relatedTools: ['webp-to-jpg', 'png-to-webp', 'image-inspector']
  },
  {
    slug: 'webp-to-jpg',
    path: '/webp-to-jpg/',
    name: 'WebP to JPG Converter',
    shortName: 'WebP to JPG',
    category: 'image',
    preferredSource: 'webp',
    preferredTarget: 'jpeg',
    title: 'WebP to JPG Converter — Convert WebP to Standard JPEG | FormatFoundry',
    metaDescription: 'Convert WebP images to standard JPG format in your browser. Universal image compatibility with custom quality and white matte transparency handling.',
    h1: 'WebP to JPG Converter',
    subtitle: 'Transform modern WebP files into universally recognized JPG photos locally in your browser with zero remote server processing.',
    badgeFrom: 'WEBP',
    badgeTo: 'JPG',
    howToSteps: [
      'Drop your WebP files into the workspace.',
      'Ensure JPG is selected in the format picker.',
      'Click Convert to render your JPG image locally.'
    ],
    supportedInputs: 'WebP (.webp, image/webp)',
    supportedOutputs: 'JPG/JPEG (.jpg, image/jpeg), PNG (.png, image/png)',
    features: [
      'Universal photo compatibility for all devices and software',
      'Solid white background compositing for transparent areas',
      'Strict local execution with zero data transfer',
      'Single-item or combined ZIP archive downloads'
    ],
    limitations: 'Any alpha transparency present in the source WebP is composited onto a solid white background because the JPEG standard does not support alpha channels.',
    faqs: [
      {
        question: 'Why convert WebP to JPG?',
        answer: 'While WebP is widely supported in modern web browsers, some older desktop applications, email clients, and printing services require standard JPEG files.'
      }
    ],
    relatedTools: ['webp-to-png', 'png-to-jpg', 'image-inspector']
  },
  {
    slug: 'svg-to-png',
    path: '/svg-to-png/',
    name: 'SVG to PNG Converter',
    shortName: 'SVG to PNG',
    category: 'svg',
    preferredSource: 'svg',
    preferredTarget: 'png',
    title: 'SVG to PNG Converter — High-Resolution Vector Rasterization | FormatFoundry',
    metaDescription: 'Rasterize SVG vector graphics to crisp PNG images locally in your browser. Preserves transparency and intrinsic dimensions with zero server uploads.',
    h1: 'SVG to PNG Converter',
    subtitle: 'Rasterize SVG vector documents into high-resolution PNG images with alpha transparency directly inside your browser sandbox.',
    badgeFrom: 'SVG',
    badgeTo: 'PNG',
    howToSteps: [
      'Upload an SVG file with valid width/height or viewBox definitions.',
      'Verify PNG is set as the target raster format.',
      'Click Convert to rasterize your vector graphic to PNG locally.'
    ],
    supportedInputs: 'SVG (.svg, image/svg+xml)',
    supportedOutputs: 'PNG (.png, image/png), JPG (.jpg, image/jpeg), WebP (.webp)',
    features: [
      'Preserves full alpha transparency',
      'Respects intrinsic SVG dimensions and viewBox coordinates',
      'Sanitized with DOMPurify to eliminate unsafe scripts',
      '100% private client-side rasterization'
    ],
    limitations: 'External fonts, remote linked stylesheets, and cross-origin linked images are intentionally excluded during sanitization to guarantee strict user privacy.',
    faqs: [
      {
        question: 'How are SVG dimensions determined for PNG output?',
        answer: 'FormatFoundry inspects explicit width and height attributes in the SVG root. If absent, dimensions are derived directly from the SVG viewBox attribute.'
      },
      {
        question: 'Are embedded scripts in the SVG executed?',
        answer: 'No. FormatFoundry cleans SVG markup with DOMPurify using strict SVG-only profiles before rasterizing, blocking all script execution and unsafe event handlers.'
      }
    ],
    relatedTools: ['svg-to-jpg', 'svg-to-webp', 'image-inspector']
  },
  {
    slug: 'svg-to-jpg',
    path: '/svg-to-jpg/',
    name: 'SVG to JPG Converter',
    shortName: 'SVG to JPG',
    category: 'svg',
    preferredSource: 'svg',
    preferredTarget: 'jpeg',
    title: 'SVG to JPG Converter — Rasterize Vector Graphics to JPEG | FormatFoundry',
    metaDescription: 'Convert SVG vector illustrations into JPEG images in your browser. Clean white background compositing with zero server uploads.',
    h1: 'SVG to JPG Converter',
    subtitle: 'Rasterize scalable vector artwork into standard JPG format with white background compositing locally in your browser.',
    badgeFrom: 'SVG',
    badgeTo: 'JPG',
    howToSteps: [
      'Drag and drop an SVG graphic into the workspace.',
      'Confirm JPG is selected as the destination format.',
      'Click Convert to generate your JPEG output.'
    ],
    supportedInputs: 'SVG (.svg, image/svg+xml)',
    supportedOutputs: 'JPG/JPEG (.jpg, image/jpeg), PNG (.png, image/png), WebP (.webp)',
    features: [
      'Crisp vector rendering onto a solid white matte',
      'Extracts intrinsic dimensions from viewBox or attributes',
      'Client-side canvas rendering without remote processing',
      'Strict 50 MB ceiling enforcement'
    ],
    limitations: 'Transparent backgrounds in vector graphics are filled with solid white (#FFFFFF) because JPEG does not support alpha channels.',
    faqs: [
      {
        question: 'What color is used for transparent SVG areas?',
        answer: 'Because JPEG does not support transparency, transparent vector backgrounds are composited onto a solid white background (#FFFFFF).'
      }
    ],
    relatedTools: ['svg-to-png', 'svg-to-webp', 'image-inspector']
  },
  {
    slug: 'svg-to-webp',
    path: '/svg-to-webp/',
    name: 'SVG to WebP Converter',
    shortName: 'SVG to WebP',
    category: 'svg',
    preferredSource: 'svg',
    preferredTarget: 'webp',
    title: 'SVG to WebP Converter — Rasterize SVG to WebP | FormatFoundry',
    metaDescription: 'Rasterize SVG vector documents to modern WebP images with transparency. Private client-side conversion with instant downloads.',
    h1: 'SVG to WebP Converter',
    subtitle: 'Convert SVG vector illustrations into modern, highly compressed WebP raster images directly in your browser.',
    badgeFrom: 'SVG',
    badgeTo: 'WEBP',
    howToSteps: [
      'Select your SVG file using the file picker or drag and drop.',
      'Ensure WebP is selected as the conversion target.',
      'Click Convert to produce an optimized WebP image.'
    ],
    supportedInputs: 'SVG (.svg, image/svg+xml)',
    supportedOutputs: 'WebP (.webp, image/webp), PNG (.png, image/png), JPG (.jpg, image/jpeg)',
    features: [
      'Combines vector precision with modern raster compression',
      'Alpha transparency preserved throughout rendering',
      'Zero remote telemetry or server transmission',
      'Single file or ZIP archive downloads'
    ],
    limitations: 'Complex SVG filters, external linked fonts, or CSS animations may be rendered as static snapshots matching the browser canvas implementation.',
    faqs: [
      {
        question: 'Does SVG to WebP preserve transparency?',
        answer: 'Yes. WebP supports full alpha transparency, so transparent vector artwork retains its clear background.'
      }
    ],
    relatedTools: ['svg-to-png', 'svg-to-jpg', 'image-inspector']
  },
  {
    slug: 'json-to-csv',
    path: '/json-to-csv/',
    name: 'JSON to CSV Converter',
    shortName: 'JSON to CSV',
    category: 'data',
    preferredSource: 'json',
    preferredTarget: 'csv',
    title: 'JSON to CSV Converter — Transform JSON Arrays to Spreadsheets | FormatFoundry',
    metaDescription: 'Convert JSON arrays of objects to CSV spreadsheets in your browser. Deterministic column ordering, quote escaping, and zero server uploads.',
    h1: 'JSON to CSV Converter',
    subtitle: 'Transform JSON array data into standardized Comma-Separated Values (CSV) spreadsheets locally with zero remote uploads.',
    badgeFrom: 'JSON',
    badgeTo: 'CSV',
    howToSteps: [
      'Upload a JSON file containing a top-level array of objects, single object, or record array wrapper.',
      'Verify CSV is selected as the target format in the staged item controls.',
      'Click Convert and download your RFC 4180-compliant CSV file.'
    ],
    supportedInputs: 'JSON (.json, application/json)',
    supportedOutputs: 'CSV (.csv, text/csv), TSV (.tsv), JSON Formatting',
    features: [
      'Supports top-level record arrays, single objects, and wrapper objects (e.g. airports.json)',
      'Deterministic header generation preserving object key order without shifting cells',
      'Converts primitive arrays (["A", "B"]) into clean single-column tables with "value" header',
      'Automatically assigns fallback headers (column_unnamed_N) for empty keys to avoid data loss',
      'Serializes nested objects and child arrays safely as valid JSON string cells',
      'Strict RFC 4180 quote escaping with output validation prior to download delivery'
    ],
    limitations: 'Heterogeneous mixed arrays containing both primitive values and objects are rejected with clear diagnostics. Large datasets exceeding 50 MB should be partitioned before conversion.',
    faqs: [
      {
        question: 'What JSON structures can this tool convert to CSV?',
        answer: 'FormatFoundry natively handles four primary JSON structures: (1) an array of flat objects, (2) a single object converted to a 1-row table, (3) wrapper objects containing a record array (such as {"airports": [...]}), and (4) an array of primitive values converted into a single-column table with a "value" header.'
      },
      {
        question: 'What happens if a JSON object has an empty key or missing properties?',
        answer: 'Empty property names are automatically assigned deterministic fallback headers like "column_unnamed_1" with a clear warning so no cell data is lost. Records with missing properties produce empty cells in the appropriate column without shifting subsequent values.'
      },
      {
        question: 'How are commas, line breaks, and quotation marks escaped in the CSV?',
        answer: 'FormatFoundry follows RFC 4180 specifications: any cell containing commas, CRLF/LF line breaks, or double quotes is enclosed in quotation marks, and inner quotes are escaped by doubling them (""). Output is validated with a delimiter parser before completion.'
      }
    ],
    relatedTools: ['csv-to-json', 'csv-to-tsv', 'json-formatter']
  },
  {
    slug: 'csv-to-json',
    path: '/csv-to-json/',
    name: 'CSV to JSON Converter',
    shortName: 'CSV to JSON',
    category: 'data',
    preferredSource: 'csv',
    preferredTarget: 'json',
    title: 'CSV to JSON Converter — Convert Spreadsheets to JSON | FormatFoundry',
    metaDescription: 'Convert CSV spreadsheets to structured JSON arrays of objects locally in your browser. Handles quotes, UTF-8 BOM, multiline cells, and zero server uploads.',
    h1: 'CSV to JSON Converter',
    subtitle: 'Parse CSV spreadsheets into structured JSON arrays of objects directly inside your browser sandbox with full data privacy.',
    badgeFrom: 'CSV',
    badgeTo: 'JSON',
    howToSteps: [
      'Drop your CSV file into the conversion workspace.',
      'Confirm JSON is selected as the output format.',
      'Click Convert to parse and download your structured JSON document.'
    ],
    supportedInputs: 'CSV (.csv, text/csv)',
    supportedOutputs: 'JSON (.json, application/json), TSV (.tsv)',
    features: [
      'Automatic UTF-8 Byte Order Mark (BOM) stripping preserving initial header names',
      'Handles quoted commas, tabs, multiline cells, and escaped quotation marks',
      'Assigns deterministic fallback headers (column_N) for empty headers with data',
      'Safely ignores empty trailing columns containing no data across all rows',
      'Deduplicates duplicate headers deterministically (e.g. name_2) to prevent data overwrite',
      'Detects uneven row widths, pads missing trailing cells with empty values, and logs row numbers',
      'Strict string preservation preventing silent coercion of identifiers or leading zeros'
    ],
    limitations: 'All cell values are preserved strictly as strings to prevent unintended coercion of leading-zero identifiers (like postal codes, phone numbers, or account numbers).',
    faqs: [
      {
        question: 'How does the parser handle empty or duplicate headers in CSV files?',
        answer: 'If a column header is empty but contains row data, FormatFoundry assigns a unique deterministic name like "column_8" and displays a non-blocking warning. Unnamed trailing columns with no data in any row are pruned. Duplicate headers are renamed (e.g. "name_2") to ensure no data is overwritten.'
      },
      {
        question: 'Does this converter preserve leading zeros and identifiers?',
        answer: 'Yes. All cell values are preserved strictly as strings. Identifiers like "00123", postal codes, and literal text are never silently coerced to numbers or other JavaScript types.'
      },
      {
        question: 'What happens if rows have uneven column counts?',
        answer: 'FormatFoundry identifies uneven rows, safely pads missing trailing columns with empty strings so cell alignment is never shifted, and displays a warning listing the specific row numbers.'
      }
    ],
    relatedTools: ['json-to-csv', 'csv-to-tsv', 'tsv-to-csv']
  },
  {
    slug: 'csv-to-tsv',
    path: '/csv-to-tsv/',
    name: 'CSV to TSV Converter',
    shortName: 'CSV to TSV',
    category: 'data',
    preferredSource: 'csv',
    preferredTarget: 'tsv',
    title: 'CSV to TSV Converter — Switch Delimiters from Commas to Tabs | FormatFoundry',
    metaDescription: 'Convert Comma-Separated Values (CSV) to Tab-Separated Values (TSV) in your browser. Accurate delimiter conversion with zero server uploads.',
    h1: 'CSV to TSV Converter',
    subtitle: 'Switch tabular delimiters from commas to tabs accurately without altering cell contents or breaking quoted fields.',
    badgeFrom: 'CSV',
    badgeTo: 'TSV',
    howToSteps: [
      'Upload a CSV file into the conversion queue.',
      'Verify TSV is selected as the destination format.',
      'Click Convert and download your tab-separated dataset.'
    ],
    supportedInputs: 'CSV (.csv, text/csv)',
    supportedOutputs: 'TSV (.tsv, text/tab-separated-values), JSON (.json)',
    features: [
      'Converts field separators from commas to tabs cleanly',
      'Maintains quoted cells containing internal commas or tabs',
      'Preserves CRLF and LF line endings accurately',
      'Instant client-side transformation'
    ],
    limitations: 'Input files must be valid delimited text. Files exceeding the 50 MB limit should be split before processing.',
    faqs: [
      {
        question: 'When should I use TSV instead of CSV?',
        answer: 'TSV is often preferred in scientific computing, data pipelines, and database import utilities because tabs rarely appear within ordinary text, reducing the need for field quotation.'
      }
    ],
    relatedTools: ['tsv-to-csv', 'csv-to-json', 'json-to-csv']
  },
  {
    slug: 'tsv-to-csv',
    path: '/tsv-to-csv/',
    name: 'TSV to CSV Converter',
    shortName: 'TSV to CSV',
    category: 'data',
    preferredSource: 'tsv',
    preferredTarget: 'csv',
    title: 'TSV to CSV Converter — Convert Tab-Separated to CSV | FormatFoundry',
    metaDescription: 'Convert TSV files to standard CSV format in your browser. Automatic quoting for commas, privacy-first processing, and zero server uploads.',
    h1: 'TSV to CSV Converter',
    subtitle: 'Transform tab-delimited files into standard comma-separated spreadsheets with RFC 4180 quoting right in your browser.',
    badgeFrom: 'TSV',
    badgeTo: 'CSV',
    howToSteps: [
      'Drag and drop your TSV file into the dropzone.',
      'Verify CSV is chosen as the target format.',
      'Click Convert to generate a standard CSV file.'
    ],
    supportedInputs: 'TSV (.tsv, text/tab-separated-values)',
    supportedOutputs: 'CSV (.csv, text/csv), JSON (.json)',
    features: [
      'Automatically quotes fields containing commas in CSV output',
      'Preserves UTF-8 encoding and multiline values',
      '100% private in-browser data processing',
      'Instant local download'
    ],
    limitations: 'Tab-delimited files with inconsistent numbers of columns per row will produce standard padded rows matching the widest header row.',
    faqs: [
      {
        question: 'What happens if a TSV cell contains commas?',
        answer: 'When converting to CSV, FormatFoundry automatically encloses any cell containing commas in quotation marks, preserving the data structure according to RFC 4180.'
      }
    ],
    relatedTools: ['csv-to-tsv', 'csv-to-json', 'json-to-csv']
  },
  {
    slug: 'markdown-to-html',
    path: '/markdown-to-html/',
    name: 'Markdown to HTML Converter',
    shortName: 'Markdown to HTML',
    category: 'text',
    preferredSource: 'markdown',
    preferredTarget: 'html',
    title: 'Markdown to HTML Converter — Compile Sanitized HTML | FormatFoundry',
    metaDescription: 'Convert Markdown documents to clean, sanitized HTML in your browser. Supports GitHub-flavored markdown, code blocks, and zero server uploads.',
    h1: 'Markdown to HTML Converter',
    subtitle: 'Compile CommonMark and GitHub-Flavored Markdown into clean, secure HTML documents locally in your browser sandbox.',
    badgeFrom: 'MD',
    badgeTo: 'HTML',
    howToSteps: [
      'Upload a Markdown (.md, .markdown) document.',
      'Confirm HTML is set as the target format.',
      'Click Convert and download your compiled, sanitized HTML file.'
    ],
    supportedInputs: 'Markdown (.md, .markdown, text/markdown)',
    supportedOutputs: 'HTML (.html, text/html)',
    features: [
      'GitHub-Flavored Markdown (tables, task lists, code fences)',
      'DOMPurify sanitization stripping dangerous scripts and attributes',
      'Clean HTML5 document structure with UTF-8 encoding',
      'Zero remote telemetry or compilation servers'
    ],
    limitations: 'Raw HTML tags inside Markdown are sanitized using strict DOMPurify rules; dangerous tags like <script>, <iframe>, and inline event handlers are stripped for security.',
    faqs: [
      {
        question: 'Is the output HTML sanitized against XSS attacks?',
        answer: 'Yes. All compiled HTML is sanitized using DOMPurify to eliminate malicious scripts, iframes, and hazardous attributes before generating the output file.'
      },
      {
        question: 'Does this converter support tables and fenced code blocks?',
        answer: 'Yes. The converter supports GitHub-Flavored Markdown specifications including markdown tables, code syntax highlighting blocks, and task lists.'
      }
    ],
    relatedTools: ['json-formatter', 'image-inspector', 'json-to-csv']
  },
  {
    slug: 'json-formatter',
    path: '/json-formatter/',
    name: 'JSON Formatter & Validator',
    shortName: 'JSON Formatter',
    category: 'text',
    preferredSource: 'json',
    preferredTarget: 'json-pretty',
    title: 'JSON Formatter & Minifier — Pretty-Print or Compress JSON | FormatFoundry',
    metaDescription: 'Format and minify JSON files locally in your browser. Syntax validation, 2-space indentation, minification, and zero server uploads.',
    h1: 'JSON Formatter & Minifier',
    subtitle: 'Format unreadable JSON into clean 2-space indented structures or compress it into a compact single-line minified file.',
    badgeFrom: 'JSON',
    badgeTo: 'PRETTY/MIN',
    howToSteps: [
      'Drag and drop a JSON file into the conversion workspace.',
      'Choose JSON (Pretty 2-space) or JSON (Minify) from the target dropdown.',
      'Click Convert to format your JSON locally and download the result.'
    ],
    supportedInputs: 'JSON (.json, application/json)',
    supportedOutputs: 'JSON Pretty (.formatted.json), JSON Minified (.min.json), CSV (.csv)',
    features: [
      'Pretty-prints with clean 2-space indentation',
      'Minifies to compact single-line JSON without whitespace',
      'Strict syntax validation reporting exact error locations',
      'Client-side privacy ensuring confidential data never leaves your device'
    ],
    limitations: 'Input must be syntactically valid JSON. Trailing commas, single-quoted strings, and unquoted keys will be flagged as syntax errors with line numbers.',
    faqs: [
      {
        question: 'Can I both pretty-print and minify JSON with this tool?',
        answer: 'Yes. Select "JSON (Pretty 2-space)" for readable formatting or "JSON (Minify)" to remove all unnecessary whitespace for compact storage.'
      },
      {
        question: 'What happens if my JSON has syntax errors?',
        answer: 'FormatFoundry validates the JSON and reports the exact syntax issue, preventing malformed data from being saved.'
      }
    ],
    relatedTools: ['json-to-csv', 'csv-to-json', 'markdown-to-html']
  },
  {
    slug: 'image-inspector',
    path: '/image-inspector/',
    name: 'Image Inspector & Metadata Tool',
    shortName: 'Image Inspector',
    category: 'inspection',
    preferredSource: null,
    preferredTarget: null,
    title: 'Image Inspector — Inspect Image Headers, Dimensions & MIME | FormatFoundry',
    metaDescription: 'Inspect image binary headers, dimensions, aspect ratio, decodability, and SVG viewBox in your browser. Fast, private, and zero server uploads.',
    h1: 'Image Inspector',
    subtitle: 'Inspect binary signature formats, pixel dimensions, aspect ratio, decodability, and SVG viewBox coordinates directly in your browser.',
    badgeFrom: 'IMAGE',
    badgeTo: 'INFO',
    howToSteps: [
      'Select or drag PNG, JPEG, WebP, or SVG files into the workspace.',
      'View the detected binary signature, browser MIME type, pixel dimensions, and aspect ratio.',
      'Check browser decodability to verify whether the image file is valid or corrupted.'
    ],
    supportedInputs: 'PNG, JPEG, WebP, SVG',
    supportedOutputs: 'Inspection diagnostics, conversion to PNG, JPG, or WebP',
    features: [
      'Distinguishes true binary signatures from misleading file extensions',
      'Extracts width, height, aspect ratio, and SVG viewBox',
      'Verifies browser decodability without file alteration',
      'Gracefully flags corrupted headers and unreadable files'
    ],
    limitations: 'Inspection examines binary magic bytes, image dimensions, and decodability. It does not extract EXIF, GPS, or color profile tags unless verified by browser rendering.',
    faqs: [
      {
        question: 'How does the inspector detect corrupted files?',
        answer: 'It compares binary header magic bytes against standard specifications and attempts browser bitmap decoding. If the header is invalid or corrupted, it clearly reports that the file cannot be decoded.'
      },
      {
        question: 'Can I also convert the image while inspecting it?',
        answer: 'Yes. Staged images remain ready for conversion into PNG, JPG, or WebP while displaying their inspection metadata.'
      }
    ],
    relatedTools: ['png-to-jpg', 'svg-to-png', 'webp-to-png']
  },
  {
    slug: 'pdf-to-text',
    path: '/pdf-to-text/',
    name: 'PDF to Text Converter',
    shortName: 'PDF to Text',
    category: 'document',
    preferredSource: 'pdf',
    preferredTarget: 'text',
    title: 'PDF to Text Converter — Extract Text from PDF In-Browser | FormatFoundry',
    metaDescription: 'Extract text content from PDF documents locally in your browser. Fast, private client-side PDF text extraction with zero server uploads.',
    h1: 'PDF to Text Converter',
    subtitle: 'Extract readable plain text from PDF documents instantly in your browser with zero server uploads or external telemetry.',
    badgeFrom: 'PDF',
    badgeTo: 'TXT',
    howToSteps: [
      'Select or drag and drop your PDF document into the staging area.',
      'Confirm Plain Text (.txt) is selected as your conversion target.',
      'Click Convert to extract all page text and download the resulting TXT file.'
    ],
    supportedInputs: 'PDF documents (.pdf)',
    supportedOutputs: 'Plain text (.txt)',
    features: [
      'High-speed in-browser PDF parsing using PDF.js',
      'Extracts text content page-by-page with structural spacing',
      'Zero server upload ensures confidential documents remain completely private',
      'Generates clean UTF-8 text files ready for search or editing'
    ],
    limitations: 'Scanned image-only PDFs containing raster scans rather than selectable text require optical character recognition (OCR), which is not performed by this purely structural extractor.',
    faqs: [
      {
        question: 'Does this tool upload my PDF to any server?',
        answer: 'No. All PDF parsing and text stream decoding execute 100% locally in your browser memory.'
      },
      {
        question: 'Can I extract text from scanned PDFs?',
        answer: 'This tool extracts digital text embedded in the PDF document. If the PDF consists solely of scanned image snapshots, OCR processing would be needed.'
      }
    ],
    relatedTools: ['pdf-to-png', 'docx-to-text', 'text-to-pdf']
  },
  {
    slug: 'pdf-to-png',
    path: '/pdf-to-png/',
    name: 'PDF to PNG Converter',
    shortName: 'PDF to PNG',
    category: 'document',
    preferredSource: 'pdf',
    preferredTarget: 'png',
    title: 'PDF to PNG Converter — Render PDF Pages as PNG Images | FormatFoundry',
    metaDescription: 'Convert PDF document pages into high-resolution PNG images in your browser. Client-side rendering with automatic ZIP archiving for multi-page documents.',
    h1: 'PDF to PNG Converter',
    subtitle: 'Render PDF pages to high-resolution PNG images directly in your browser with zero server uploads and bulk ZIP download.',
    badgeFrom: 'PDF',
    badgeTo: 'PNG',
    howToSteps: [
      'Select or drop your PDF document into the workspace.',
      'Ensure PNG is selected as your conversion target.',
      'Click Convert to render pages and download a single PNG or a multi-page ZIP archive.'
    ],
    supportedInputs: 'PDF documents (.pdf)',
    supportedOutputs: 'PNG images (.png) or bundled ZIP archive (.zip)',
    features: [
      'High-resolution 2x supersampled page rasterization',
      'Automatic multi-page bundling into organized ZIP archives',
      'Completely local browser rendering using PDF.js and Canvas',
      'Lossless PNG image export with crisp typography'
    ],
    limitations: 'Extremely large PDF files with hundreds of dense pages may take several seconds to rasterize in browser memory.',
    faqs: [
      {
        question: 'How are multi-page PDFs handled?',
        answer: 'For multi-page PDFs, each page is rendered to a distinct PNG image and all pages are packaged into a downloadable ZIP archive.'
      },
      {
        question: 'Are PDF page renders crisp and high quality?',
        answer: 'Yes. Pages are rendered at 2.0x device scale to ensure sharp fonts, vector diagrams, and illustrations.'
      }
    ],
    relatedTools: ['pdf-to-jpg', 'pdf-to-text', 'png-to-pdf']
  },
  {
    slug: 'pdf-to-jpg',
    path: '/pdf-to-jpg/',
    name: 'PDF to JPG Converter',
    shortName: 'PDF to JPG',
    category: 'document',
    preferredSource: 'pdf',
    preferredTarget: 'jpeg',
    title: 'PDF to JPG Converter — Convert PDF Pages to JPG Images | FormatFoundry',
    metaDescription: 'Convert PDF document pages to lightweight JPG images locally in your browser. Fast client-side rendering with automatic multi-page ZIP packaging.',
    h1: 'PDF to JPG Converter',
    subtitle: 'Convert PDF pages into compressed JPG images directly in your browser with zero server uploads and instant ZIP downloads.',
    badgeFrom: 'PDF',
    badgeTo: 'JPG',
    howToSteps: [
      'Drop your PDF document into the staging upload zone.',
      'Select JPG as your conversion target format.',
      'Click Convert to render pages into optimized JPG images.'
    ],
    supportedInputs: 'PDF documents (.pdf)',
    supportedOutputs: 'JPG images (.jpg) or bundled ZIP archive (.zip)',
    features: [
      'High-fidelity 2x scale canvas page rendering',
      'Solid white background matte applied to transparent page areas',
      'Compact JPEG file sizes ideal for web sharing and email',
      'Single page direct download or multi-page ZIP packaging'
    ],
    limitations: 'JPEG is a lossy compression format without alpha transparency, so all pages are composited on clean white backgrounds.',
    faqs: [
      {
        question: 'Can I convert multi-page PDF documents to JPG?',
        answer: 'Yes. Multi-page PDFs generate individually numbered JPG images bundled into a single ZIP file.'
      },
      {
        question: 'Is my document private?',
        answer: 'Completely private. The PDF never leaves your device and is processed entirely in browser memory.'
      }
    ],
    relatedTools: ['pdf-to-png', 'jpg-to-pdf', 'pdf-to-text']
  },
  {
    slug: 'png-to-pdf',
    path: '/png-to-pdf/',
    name: 'PNG to PDF Converter',
    shortName: 'PNG to PDF',
    category: 'document',
    preferredSource: 'png',
    preferredTarget: 'pdf',
    title: 'PNG to PDF Converter — Turn PNG Images into PDF Documents | FormatFoundry',
    metaDescription: 'Convert PNG images into clean, standard PDF documents directly in your browser. Fast, private, zero server uploads with aspect-ratio preserving layout.',
    h1: 'PNG to PDF Converter',
    subtitle: 'Convert PNG images into standard PDF documents in your browser with automatic dimension fitting and zero network uploads.',
    badgeFrom: 'PNG',
    badgeTo: 'PDF',
    howToSteps: [
      'Select or drag PNG images into the staging zone.',
      'Verify PDF Document is chosen as the target format.',
      'Click Convert to compile the image into a clean PDF document.'
    ],
    supportedInputs: 'PNG images (.png)',
    supportedOutputs: 'PDF documents (.pdf)',
    features: [
      'Client-side PDF generation using pdf-lib',
      'Preserves image resolution and natural aspect ratio',
      'Standard A4 page dimensioning with proportional scaling',
      'Completely private local processing without cloud uploads'
    ],
    limitations: 'Transparent pixels in PNG files are rendered over standard white PDF document pages.',
    faqs: [
      {
        question: 'How is the image sized on the PDF page?',
        answer: 'Images are placed onto standard A4 pages and scaled proportionally to fit within margins while preserving natural aspect ratios.'
      },
      {
        question: 'Is my data secure?',
        answer: 'Yes. All PDF compilation is performed client-side using JavaScript in your browser.'
      }
    ],
    relatedTools: ['jpg-to-pdf', 'webp-to-pdf', 'pdf-to-png']
  },
  {
    slug: 'jpg-to-pdf',
    path: '/jpg-to-pdf/',
    name: 'JPG to PDF Converter',
    shortName: 'JPG to PDF',
    category: 'document',
    preferredSource: 'jpeg',
    preferredTarget: 'pdf',
    title: 'JPG to PDF Converter — Convert JPG Photos to PDF Documents | FormatFoundry',
    metaDescription: 'Convert JPG photos and images into PDF documents in your browser. Fast, private client-side conversion with zero server uploads.',
    h1: 'JPG to PDF Converter',
    subtitle: 'Convert JPG images into professional PDF documents locally in your browser with zero server transmission.',
    badgeFrom: 'JPG',
    badgeTo: 'PDF',
    howToSteps: [
      'Select or drop your JPG files into the workspace.',
      'Choose PDF Document as the conversion target.',
      'Click Convert to produce a downloadable PDF file immediately.'
    ],
    supportedInputs: 'JPG/JPEG images (.jpg, .jpeg)',
    supportedOutputs: 'PDF documents (.pdf)',
    features: [
      'Native client-side JPEG embedding without recompression quality loss',
      'Automatic aspect ratio calculation and page centering',
      'Zero server upload ensures personal documents remain private',
      'Instant generation with low browser memory footprint'
    ],
    limitations: 'Input files must be valid JPEG images readable by the browser image decoder.',
    faqs: [
      {
        question: 'Does converting JPG to PDF recompress or reduce photo quality?',
        answer: 'No. The original JPEG binary stream is embedded directly into the PDF structure to prevent generational compression loss.'
      },
      {
        question: 'Can I convert scanned receipts and forms to PDF?',
        answer: 'Yes. JPG scans of documents, receipts, and photos convert cleanly into standard printable PDF files.'
      }
    ],
    relatedTools: ['png-to-pdf', 'webp-to-pdf', 'pdf-to-jpg']
  },
  {
    slug: 'webp-to-pdf',
    path: '/webp-to-pdf/',
    name: 'WebP to PDF Converter',
    shortName: 'WebP to PDF',
    category: 'document',
    preferredSource: 'webp',
    preferredTarget: 'pdf',
    title: 'WebP to PDF Converter — Convert WebP Images to PDF Online | FormatFoundry',
    metaDescription: 'Convert WebP graphics and screenshots to PDF documents locally in your browser. Pure client-side processing with zero server uploads.',
    h1: 'WebP to PDF Converter',
    subtitle: 'Convert modern WebP images into standard PDF documents directly in your browser with zero data leaving your device.',
    badgeFrom: 'WEBP',
    badgeTo: 'PDF',
    howToSteps: [
      'Drag and drop your WebP image files into the staging area.',
      'Select PDF Document as your target format.',
      'Click Convert to generate a standard PDF file instantly.'
    ],
    supportedInputs: 'WebP images (.webp)',
    supportedOutputs: 'PDF documents (.pdf)',
    features: [
      'Lossless in-browser canvas decoding and PDF embedding',
      'Fits graphics neatly onto standard A4 document pages',
      'Private and confidential with zero server telemetry',
      'Instant browser-based PDF generation'
    ],
    limitations: 'Animated WebP files will have their primary first frame rendered into the PDF document.',
    faqs: [
      {
        question: 'Does this work on modern WebP images?',
        answer: 'Yes. FormatFoundry uses browser canvas decoding to render all WebP image varieties before embedding into PDF.'
      },
      {
        question: 'Are any files uploaded to a remote server?',
        answer: 'None. Every operation takes place in your local browser sandbox.'
      }
    ],
    relatedTools: ['png-to-pdf', 'jpg-to-pdf', 'webp-to-png']
  },
  {
    slug: 'text-to-pdf',
    path: '/text-to-pdf/',
    name: 'Text to PDF Converter',
    shortName: 'Text to PDF',
    category: 'document',
    preferredSource: 'text',
    preferredTarget: 'pdf',
    title: 'Text to PDF Converter — Create Paginated PDFs from Text | FormatFoundry',
    metaDescription: 'Convert plain text files into clean, paginated PDF documents in your browser. Automatic line wrapping, page numbering, and zero server uploads.',
    h1: 'Text to PDF Converter',
    subtitle: 'Transform plain text files into paginated, professional PDF documents directly in your browser with complete privacy.',
    badgeFrom: 'TXT',
    badgeTo: 'PDF',
    howToSteps: [
      'Upload or drop your .txt plain text file into the staging area.',
      'Select PDF Document as the target format.',
      'Click Convert to generate and download a paginated PDF document.'
    ],
    supportedInputs: 'Plain text files (.txt)',
    supportedOutputs: 'PDF documents (.pdf)',
    features: [
      'Automatic word wrapping and multi-page pagination',
      'Standard margins with clean Helvetica typography',
      'Page numbering on every document page',
      'Completely offline client-side PDF construction'
    ],
    limitations: 'Plain text does not include rich font styling like bold or italics; for styled text, use Markdown to PDF.',
    faqs: [
      {
        question: 'How are long text files handled?',
        answer: 'Lines are automatically wrapped to fit margins, and new pages are created seamlessly with running page numbers.'
      },
      {
        question: 'Are my notes or text files private?',
        answer: 'Yes. The text is processed strictly in your local browser memory and never transmitted anywhere.'
      }
    ],
    relatedTools: ['markdown-to-pdf', 'pdf-to-text', 'text-to-docx']
  },
  {
    slug: 'markdown-to-pdf',
    path: '/markdown-to-pdf/',
    name: 'Markdown to PDF Converter',
    shortName: 'Markdown to PDF',
    category: 'document',
    preferredSource: 'markdown',
    preferredTarget: 'pdf',
    title: 'Markdown to PDF Converter — Render Markdown as PDF In-Browser | FormatFoundry',
    metaDescription: 'Convert Markdown files into styled PDF documents in your browser. Supports headings, bold/italic, code blocks, lists, and multi-page pagination.',
    h1: 'Markdown to PDF Converter',
    subtitle: 'Render Markdown documentation into styled PDF files directly in your browser with zero server uploads and full formatting.',
    badgeFrom: 'MD',
    badgeTo: 'PDF',
    howToSteps: [
      'Drop your .md Markdown file into the workspace.',
      'Choose PDF Document as the output format.',
      'Click Convert to generate a formatted PDF document instantly.'
    ],
    supportedInputs: 'Markdown files (.md, .markdown)',
    supportedOutputs: 'PDF documents (.pdf)',
    features: [
      'Renders H1, H2, H3 headings with hierarchical sizing',
      'Supports bullet lists, blockquotes, and code blocks',
      'Automatic page wrapping with bottom page numbers',
      'Zero server upload ensures documentation privacy'
    ],
    limitations: 'Complex raw HTML embedded within Markdown is stripped for clean PDF pagination.',
    faqs: [
      {
        question: 'Does this support standard Markdown syntax?',
        answer: 'Yes. Headings, bulleted lists, quotes, inline code, and paragraphs are formatted into styled PDF elements.'
      },
      {
        question: 'Is my Markdown document kept private?',
        answer: 'Yes. Processing occurs entirely in your browser sandbox without network requests.'
      }
    ],
    relatedTools: ['text-to-pdf', 'markdown-to-html', 'markdown-to-docx']
  },
  {
    slug: 'docx-to-html',
    path: '/docx-to-html/',
    name: 'Word to HTML Converter',
    shortName: 'Word to HTML',
    category: 'document',
    preferredSource: 'docx',
    preferredTarget: 'html',
    title: 'Word to HTML Converter — Convert DOCX to Clean HTML5 | FormatFoundry',
    metaDescription: 'Convert Microsoft Word (.docx) documents to clean, semantic HTML5 in your browser. Client-side extraction preserving headings, tables, and lists.',
    h1: 'Word to HTML Converter',
    subtitle: 'Convert Microsoft Word documents to clean semantic HTML5 directly in your browser with zero server uploads.',
    badgeFrom: 'DOCX',
    badgeTo: 'HTML',
    howToSteps: [
      'Select or drop your .docx Word file into the staging area.',
      'Ensure HTML is selected as the conversion target.',
      'Click Convert to generate clean semantic HTML markup ready for download.'
    ],
    supportedInputs: 'Microsoft Word documents (.docx)',
    supportedOutputs: 'HTML5 documents (.html)',
    features: [
      'Clean HTML output free from Microsoft Office proprietary cruft',
      'Preserves document structure including headings, tables, and lists',
      '100% in-browser conversion powered by Mammoth.js',
      'Instant download with complete confidentiality'
    ],
    limitations: 'Legacy binary .doc files (Word 97-2003) are not supported; convert them to modern .docx format before staging.',
    faqs: [
      {
        question: 'Does this produce bloated Word HTML?',
        answer: 'No. FormatFoundry uses Mammoth.js to produce clean, modern HTML5 markup without MSO styling bloat.'
      },
      {
        question: 'Can I convert Word tables and lists?',
        answer: 'Yes. Standard Word tables, bulleted lists, and numbered lists translate cleanly into semantic HTML tags.'
      }
    ],
    relatedTools: ['docx-to-markdown', 'docx-to-text', 'docx-to-pdf']
  },
  {
    slug: 'docx-to-markdown',
    path: '/docx-to-markdown/',
    name: 'Word to Markdown Converter',
    shortName: 'Word to Markdown',
    category: 'document',
    preferredSource: 'docx',
    preferredTarget: 'markdown',
    title: 'Word to Markdown Converter — Convert DOCX to Markdown | FormatFoundry',
    metaDescription: 'Convert Word DOCX documents into clean Markdown files locally in your browser. Preserves headings, bold/italics, links, and tables.',
    h1: 'Word to Markdown Converter',
    subtitle: 'Transform Word (.docx) files into clean Markdown documentation directly in your browser with zero server uploads.',
    badgeFrom: 'DOCX',
    badgeTo: 'MD',
    howToSteps: [
      'Drop your Microsoft Word (.docx) file into the converter workspace.',
      'Select Markdown (.md) as the target format.',
      'Click Convert to generate and download a clean Markdown file.'
    ],
    supportedInputs: 'Microsoft Word documents (.docx)',
    supportedOutputs: 'Markdown documentation (.md)',
    features: [
      'Preserves headings, formatting, links, blockquotes, and tables',
      'Clean GitHub Flavored Markdown (GFM) output',
      '100% client-side conversion using Mammoth and Turndown',
      'Zero server transmission protects confidential reports'
    ],
    limitations: 'Complex drawing canvas shapes and SmartArt diagrams are omitted in favor of text and structural content.',
    faqs: [
      {
        question: 'How are headings converted?',
        answer: 'Word heading styles (Heading 1, Heading 2, Heading 3) are mapped directly to standard Markdown hashes (#, ##, ###).'
      },
      {
        question: 'Are Word tables supported in Markdown?',
        answer: 'Yes. Word tables are converted into clean GitHub Flavored Markdown pipe tables.'
      }
    ],
    relatedTools: ['docx-to-html', 'docx-to-text', 'markdown-to-docx']
  },
  {
    slug: 'docx-to-text',
    path: '/docx-to-text/',
    name: 'Word to Text Converter',
    shortName: 'Word to Text',
    category: 'document',
    preferredSource: 'docx',
    preferredTarget: 'text',
    title: 'Word to Text Converter — Extract Plain Text from DOCX | FormatFoundry',
    metaDescription: 'Extract unformatted plain text from Microsoft Word (.docx) files locally in your browser. Fast, private text extraction with zero server uploads.',
    h1: 'Word to Text Converter',
    subtitle: 'Extract clean plain text from Microsoft Word documents directly in your browser with zero server telemetry.',
    badgeFrom: 'DOCX',
    badgeTo: 'TXT',
    howToSteps: [
      'Select or drop your .docx file into the staging area.',
      'Confirm Plain Text (.txt) is selected as the output format.',
      'Click Convert to extract all text paragraphs into a downloadable TXT file.'
    ],
    supportedInputs: 'Microsoft Word documents (.docx)',
    supportedOutputs: 'Plain text (.txt)',
    features: [
      'Fast extraction of all paragraphs and textual sections',
      'Strips formatting, layout bloat, and styling tags',
      'Zero network requests ensures company confidential files stay private',
      'Generates clean UTF-8 text ready for NLP, search, or storage'
    ],
    limitations: 'Extracts text content only; all fonts, colors, and layout decorations are discarded.',
    faqs: [
      {
        question: 'Can I extract text from password-protected DOCX files?',
        answer: 'Files must be unprotected so the browser can read and unzip the internal document XML.'
      },
      {
        question: 'Is my Word document uploaded anywhere?',
        answer: 'Never. Extraction runs entirely in your local browser sandbox.'
      }
    ],
    relatedTools: ['docx-to-markdown', 'docx-to-pdf', 'pdf-to-text']
  },
  {
    slug: 'docx-to-pdf',
    path: '/docx-to-pdf/',
    name: 'Word to PDF Converter',
    shortName: 'Word to PDF',
    category: 'document',
    preferredSource: 'docx',
    preferredTarget: 'pdf',
    title: 'Word to PDF Converter — Convert DOCX to PDF In-Browser | FormatFoundry',
    metaDescription: 'Convert Microsoft Word DOCX documents to PDF files locally in your browser. Fast, private client-side conversion with zero server uploads.',
    h1: 'Word to PDF Converter',
    subtitle: 'Convert Word (.docx) documents to standard PDF files directly in your browser with complete privacy and zero server uploads.',
    badgeFrom: 'DOCX',
    badgeTo: 'PDF',
    howToSteps: [
      'Drop your Microsoft Word .docx file into the upload dropzone.',
      'Select PDF Document as your target format.',
      'Click Convert to generate and download a standard PDF file.'
    ],
    supportedInputs: 'Microsoft Word documents (.docx)',
    supportedOutputs: 'PDF documents (.pdf)',
    features: [
      'Client-side DOCX parsing and PDF page construction',
      'Extracts structural headings and paragraphs into paginated PDF',
      'Zero server upload preserves enterprise document confidentiality',
      'Instant generation without subscription or queue waits'
    ],
    limitations: 'Complex desktop Word layout engines (multi-column text boxes, proprietary WordArt) are reflowed into clean paginated standard document pages.',
    faqs: [
      {
        question: 'Does Word to PDF require Microsoft Office installed?',
        answer: 'No. The conversion executes entirely in your browser using JavaScript.'
      },
      {
        question: 'Are confidential documents safe?',
        answer: 'Yes. The file is never sent over any network; all processing is local.'
      }
    ],
    relatedTools: ['docx-to-html', 'docx-to-markdown', 'text-to-pdf']
  },
  {
    slug: 'markdown-to-docx',
    path: '/markdown-to-docx/',
    name: 'Markdown to Word Converter',
    shortName: 'Markdown to Word',
    category: 'document',
    preferredSource: 'markdown',
    preferredTarget: 'docx',
    title: 'Markdown to Word Converter — Convert Markdown to DOCX | FormatFoundry',
    metaDescription: 'Convert Markdown files into formatted Microsoft Word (.docx) documents in your browser. Supports headings, bold/italics, bullet lists, and code.',
    h1: 'Markdown to Word Converter',
    subtitle: 'Transform Markdown files into Microsoft Word documents directly in your browser with zero server uploads.',
    badgeFrom: 'MD',
    badgeTo: 'DOCX',
    howToSteps: [
      'Drop your Markdown (.md) file into the converter workspace.',
      'Choose Word Document (.docx) as the output format.',
      'Click Convert to generate an editable Word document.'
    ],
    supportedInputs: 'Markdown files (.md, .markdown)',
    supportedOutputs: 'Microsoft Word documents (.docx)',
    features: [
      'Maps Markdown headings into native Word Heading 1, 2, 3 styles',
      'Preserves bold, italic, bullet lists, blockquotes, and code blocks',
      'Generates valid modern Office Open XML (.docx) files',
      'Zero server telemetry ensures your drafts remain private'
    ],
    limitations: 'Generates standard Calibri-styled Word documents that you can customize further inside Microsoft Word or Google Docs.',
    faqs: [
      {
        question: 'Can I open the resulting file in Microsoft Word and Google Docs?',
        answer: 'Yes. The output is a standard Office Open XML (.docx) document compatible with Word, Google Docs, and LibreOffice.'
      },
      {
        question: 'Are bullet lists preserved?',
        answer: 'Yes. Markdown bullets and numbered lists are converted into native Word list structures.'
      }
    ],
    relatedTools: ['docx-to-markdown', 'text-to-docx', 'markdown-to-pdf']
  },
  {
    slug: 'text-to-docx',
    path: '/text-to-docx/',
    name: 'Text to Word Converter',
    shortName: 'Text to Word',
    category: 'document',
    preferredSource: 'text',
    preferredTarget: 'docx',
    title: 'Text to Word Converter — Convert TXT to Word DOCX | FormatFoundry',
    metaDescription: 'Convert plain text files into editable Microsoft Word (.docx) documents locally in your browser. Fast, private client-side conversion.',
    h1: 'Text to Word Converter',
    subtitle: 'Convert plain text files into editable Microsoft Word documents directly in your browser with complete privacy.',
    badgeFrom: 'TXT',
    badgeTo: 'DOCX',
    howToSteps: [
      'Select or drop your .txt file into the upload zone.',
      'Select Word Document (.docx) as your conversion target.',
      'Click Convert to create and download an editable DOCX file.'
    ],
    supportedInputs: 'Plain text files (.txt)',
    supportedOutputs: 'Microsoft Word documents (.docx)',
    features: [
      'Converts text paragraphs into clean Word document structure',
      'Generates valid .docx files compatible with all Office suites',
      'Zero server uploads ensure private notes remain secure',
      'Instant generation in browser memory'
    ],
    limitations: 'Plain text inputs do not have font styling; text is formatted with clean standard typography.',
    faqs: [
      {
        question: 'Can I edit the converted file in Word?',
        answer: 'Yes. The generated .docx is fully editable in Microsoft Word, Pages, and Google Docs.'
      },
      {
        question: 'Is my text transmitted over the internet?',
        answer: 'No. The file is created locally on your device.'
      }
    ],
    relatedTools: ['markdown-to-docx', 'docx-to-text', 'text-to-pdf']
  },
  {
    slug: 'html-to-markdown',
    path: '/html-to-markdown/',
    name: 'HTML to Markdown Converter',
    shortName: 'HTML to Markdown',
    category: 'markup',
    preferredSource: 'html',
    preferredTarget: 'markdown',
    title: 'HTML to Markdown Converter — Clean HTML to GFM Markdown | FormatFoundry',
    metaDescription: 'Convert HTML markup into clean GitHub Flavored Markdown directly in your browser. Preserves headings, tables, links, images, and lists with zero uploads.',
    h1: 'HTML to Markdown Converter',
    subtitle: 'Convert HTML pages and snippets into clean GitHub Flavored Markdown directly in your browser with zero server uploads.',
    badgeFrom: 'HTML',
    badgeTo: 'MD',
    howToSteps: [
      'Drop your .html or .htm file into the staging workspace.',
      'Select Markdown (.md) as the conversion target.',
      'Click Convert to generate clean GFM Markdown instantly.'
    ],
    supportedInputs: 'HTML documents and snippets (.html, .htm)',
    supportedOutputs: 'Markdown documentation (.md)',
    features: [
      'Converts headings, paragraphs, lists, links, images, and blockquotes',
      'Full GitHub Flavored Markdown table support with alignment',
      'Powered by Turndown with GFM extensions client-side',
      '100% private in-browser conversion with zero telemetry'
    ],
    limitations: 'Complex JavaScript, inline scripts, and CSS style blocks are automatically stripped out during markup conversion.',
    faqs: [
      {
        question: 'Does this handle HTML tables?',
        answer: 'Yes. HTML tables are converted into clean GFM pipe tables.'
      },
      {
        question: 'Can I convert full web page files?',
        answer: 'Yes. Full HTML files or snippet fragments convert into clean Markdown documentation.'
      }
    ],
    relatedTools: ['markdown-to-html', 'docx-to-markdown', 'markdown-to-docx']
  },
  {
    slug: 'png-to-pptx',
    path: '/png-to-pptx/',
    name: 'PNG to PowerPoint Converter',
    shortName: 'PNG to PowerPoint',
    category: 'presentation',
    preferredSource: 'png',
    preferredTarget: 'pptx',
    title: 'PNG to PowerPoint Converter — Create PPTX Slides from PNG | FormatFoundry',
    metaDescription: 'Convert PNG images into 16:9 widescreen PowerPoint (.pptx) presentation slides locally in your browser with zero server uploads.',
    h1: 'PNG to PowerPoint Converter',
    subtitle: 'Convert PNG graphics and screenshots into PowerPoint presentation slides directly in your browser with zero server uploads.',
    badgeFrom: 'PNG',
    badgeTo: 'PPTX',
    howToSteps: [
      'Select or drop your PNG image into the staging area.',
      'Select PowerPoint (.pptx) as the conversion target.',
      'Click Convert to compile a 16:9 PowerPoint slide presentation.'
    ],
    supportedInputs: 'PNG images (.png)',
    supportedOutputs: 'PowerPoint presentations (.pptx)',
    features: [
      'Generates modern 16:9 widescreen PowerPoint slide decks',
      'Preserves image resolution with proportional aspect centering',
      '100% in-browser generation using PptxGenJS',
      'Completely private client-side processing'
    ],
    limitations: 'Transparent PNG backgrounds appear on standard slide canvas.',
    faqs: [
      {
        question: 'What slide layout is used?',
        answer: 'Slides use modern 16:9 widescreen format, centering your image to fit cleanly without distortion.'
      },
      {
        question: 'Can I open this presentation in PowerPoint and Keynote?',
        answer: 'Yes. The output is a standard OpenXML presentation compatible with PowerPoint, Google Slides, and Apple Keynote.'
      }
    ],
    relatedTools: ['jpg-to-pptx', 'webp-to-pptx', 'pptx-to-text']
  },
  {
    slug: 'jpg-to-pptx',
    path: '/jpg-to-pptx/',
    name: 'JPG to PowerPoint Converter',
    shortName: 'JPG to PowerPoint',
    category: 'presentation',
    preferredSource: 'jpeg',
    preferredTarget: 'pptx',
    title: 'JPG to PowerPoint Converter — Turn JPG Photos into Slides | FormatFoundry',
    metaDescription: 'Convert JPG photos and graphics into PowerPoint (.pptx) presentation slides in your browser. Fast, private client-side conversion with zero server uploads.',
    h1: 'JPG to PowerPoint Converter',
    subtitle: 'Turn JPG photos and charts into professional PowerPoint slides directly in your browser with complete privacy.',
    badgeFrom: 'JPG',
    badgeTo: 'PPTX',
    howToSteps: [
      'Drop your JPG photo or diagram into the upload area.',
      'Confirm PowerPoint (.pptx) is selected as the target.',
      'Click Convert to download a PowerPoint presentation instantly.'
    ],
    supportedInputs: 'JPG/JPEG images (.jpg, .jpeg)',
    supportedOutputs: 'PowerPoint presentations (.pptx)',
    features: [
      'High-resolution image embedding onto widescreen slides',
      'Automatic centering and aspect ratio preservation',
      'Compatible with Microsoft PowerPoint, Google Slides, and Keynote',
      'Zero server upload guarantees complete image confidentiality'
    ],
    limitations: 'Images exceeding slide dimensions are scaled down proportionally to ensure complete visibility within slide margins.',
    faqs: [
      {
        question: 'Does this compress my original JPG photo?',
        answer: 'No. The image is placed directly on the slide at original resolution.'
      },
      {
        question: 'Is my photo uploaded to a server?',
        answer: 'No. Slide compilation runs completely in your local browser memory.'
      }
    ],
    relatedTools: ['png-to-pptx', 'webp-to-pptx', 'pptx-to-text']
  },
  {
    slug: 'webp-to-pptx',
    path: '/webp-to-pptx/',
    name: 'WebP to PowerPoint Converter',
    shortName: 'WebP to PowerPoint',
    category: 'presentation',
    preferredSource: 'webp',
    preferredTarget: 'pptx',
    title: 'WebP to PowerPoint Converter — Convert WebP to PPTX | FormatFoundry',
    metaDescription: 'Convert WebP graphics and screenshots into PowerPoint presentation slides locally in your browser with zero server uploads.',
    h1: 'WebP to PowerPoint Converter',
    subtitle: 'Convert modern WebP images into PowerPoint slides directly in your browser with zero server transmission.',
    badgeFrom: 'WEBP',
    badgeTo: 'PPTX',
    howToSteps: [
      'Drag and drop your WebP image file into the workspace.',
      'Select PowerPoint (.pptx) as your conversion target.',
      'Click Convert to generate an editable presentation.'
    ],
    supportedInputs: 'WebP images (.webp)',
    supportedOutputs: 'PowerPoint presentations (.pptx)',
    features: [
      'Pure client-side conversion from WebP to presentation slide',
      'Standard 16:9 widescreen presentation format',
      'Aspect ratio preserving auto-scaling',
      'Completely local execution with zero network footprint'
    ],
    limitations: 'Animated WebP files are converted using their initial static frame.',
    faqs: [
      {
        question: 'Can PowerPoint open WebP slides created here?',
        answer: 'Yes. FormatFoundry transcodes WebP images into presentation-compatible slide elements supported across all PowerPoint versions.'
      },
      {
        question: 'Are any files uploaded?',
        answer: 'Zero files are uploaded; the process is 100% client-side.'
      }
    ],
    relatedTools: ['png-to-pptx', 'jpg-to-pptx', 'pptx-to-text']
  },
  {
    slug: 'text-to-pptx',
    path: '/text-to-pptx/',
    name: 'Text to PowerPoint Converter',
    shortName: 'Text to PowerPoint',
    category: 'presentation',
    preferredSource: 'text',
    preferredTarget: 'pptx',
    title: 'Text to PowerPoint Converter — Generate Slides from Text Outline | FormatFoundry',
    metaDescription: 'Convert plain text outlines into PowerPoint presentation slides in your browser. Automatic slide generation per paragraph with zero server uploads.',
    h1: 'Text to PowerPoint Converter',
    subtitle: 'Transform plain text outlines and notes into PowerPoint slides directly in your browser with complete privacy.',
    badgeFrom: 'TXT',
    badgeTo: 'PPTX',
    howToSteps: [
      'Drop your plain text file into the converter area.',
      'Select PowerPoint (.pptx) as the output format.',
      'Click Convert to generate a formatted PowerPoint slide deck.'
    ],
    supportedInputs: 'Plain text files (.txt)',
    supportedOutputs: 'PowerPoint presentations (.pptx)',
    features: [
      'Creates title slide and organized content slides from text blocks',
      'Modern 16:9 widescreen presentation layout',
      'Standard clean typography with high contrast readability',
      '100% private in-browser generation with zero network uploads'
    ],
    limitations: 'Paragraphs separated by blank lines become individual slide cards; keep text concise for best visual presentation.',
    faqs: [
      {
        question: 'How does FormatFoundry divide text into slides?',
        answer: 'Double newlines separate text sections into distinct slides, generating an introductory title slide followed by organized content cards.'
      },
      {
        question: 'Is my presentation outline uploaded anywhere?',
        answer: 'No. Everything is constructed inside your browser session.'
      }
    ],
    relatedTools: ['markdown-to-pptx', 'pptx-to-text', 'text-to-docx']
  },
  {
    slug: 'markdown-to-pptx',
    path: '/markdown-to-pptx/',
    name: 'Markdown to PowerPoint Converter',
    shortName: 'Markdown to PowerPoint',
    category: 'presentation',
    preferredSource: 'markdown',
    preferredTarget: 'pptx',
    title: 'Markdown to PowerPoint Converter — Turn Markdown into PPTX Slides | FormatFoundry',
    metaDescription: 'Convert Markdown files into structured PowerPoint (.pptx) slides in your browser. Splits on headings and bullet lists with zero server uploads.',
    h1: 'Markdown to PowerPoint Converter',
    subtitle: 'Convert Markdown documentation and briefs into PowerPoint slide decks directly in your browser with complete privacy.',
    badgeFrom: 'MD',
    badgeTo: 'PPTX',
    howToSteps: [
      'Drop your Markdown (.md) document into the staging dropzone.',
      'Choose PowerPoint (.pptx) as the target format.',
      'Click Convert to generate a presentation deck automatically.'
    ],
    supportedInputs: 'Markdown files (.md, .markdown)',
    supportedOutputs: 'PowerPoint presentations (.pptx)',
    features: [
      'Splits on H1 and H2 headings into dedicated presentation slides',
      'Translates Markdown bullet lists into native presentation bullets',
      'Professional 16:9 widescreen slide styling',
      'Zero server upload preserves proprietary presentation content'
    ],
    limitations: 'Embedded HTML tags in Markdown are stripped in favor of native PowerPoint text structures.',
    faqs: [
      {
        question: 'How are Markdown headings converted to slides?',
        answer: 'Each top-level heading (# or ##) starts a new presentation slide, with following text and bullets placed into the slide body.'
      },
      {
        question: 'Are bullet points supported on slides?',
        answer: 'Yes. Markdown list items (- or *) become structured bullet items on the generated slides.'
      }
    ],
    relatedTools: ['text-to-pptx', 'markdown-to-docx', 'pptx-to-text']
  },
  {
    slug: 'pptx-to-text',
    path: '/pptx-to-text/',
    name: 'PowerPoint to Text Extractor',
    shortName: 'PowerPoint to Text',
    category: 'presentation',
    preferredSource: 'pptx',
    preferredTarget: 'text',
    title: 'PowerPoint to Text Extractor — Extract Text from PPTX In-Browser | FormatFoundry',
    metaDescription: 'Extract text content and notes from PowerPoint (.pptx) presentations locally in your browser. Fast, private slide text extraction with zero server uploads.',
    h1: 'PowerPoint to Text Extractor',
    subtitle: 'Extract all text from PowerPoint presentation slides directly in your browser with zero server uploads or external telemetry.',
    badgeFrom: 'PPTX',
    badgeTo: 'TXT',
    howToSteps: [
      'Select or drop your PowerPoint .pptx file into the staging workspace.',
      'Confirm Plain Text (.txt) is selected as the output format.',
      'Click Convert to extract all slide text into a single downloadable text file.'
    ],
    supportedInputs: 'PowerPoint presentations (.pptx)',
    supportedOutputs: 'Plain text (.txt)',
    features: [
      'Unzips and parses all slide XML files locally using fflate',
      'Extracts text slide-by-slide with clear slide header demarcations',
      'Zero server uploads protect sensitive pitch decks and briefings',
      'Fast extraction even on presentations with dozens of slides'
    ],
    limitations: 'Extracts text elements and titles; speaker notes or embedded audio/video media are not included in the text dump.',
    faqs: [
      {
        question: 'Does this tool work on presentations with many slides?',
        answer: 'Yes. FormatFoundry rapidly unzips the presentation structure and scans each slide XML in sequence.'
      },
      {
        question: 'Are my confidential pitch decks uploaded anywhere?',
        answer: 'No. All decompression and XML parsing occur strictly inside your local browser memory.'
      }
    ],
    relatedTools: ['pdf-to-text', 'docx-to-text', 'text-to-pptx']
  }
];

export function getToolConfig(slug) {
  if (!slug || typeof slug !== 'string') {
    return null;
  }
  const clean = slug.replace(/^\/+|\/+$/g, '').toLowerCase();
  return TOOLS.find((t) => t.slug === clean) || null;
}

export function getToolsByCategory(category) {
  return TOOLS.filter((t) => t.category === category);
}
