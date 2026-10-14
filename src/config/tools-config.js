export const TOOL_CATEGORIES = {
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
