import createDOMPurify from 'dompurify';

let cachedInstance = null;

export function getSanitizer() {
  if (cachedInstance) {
    return cachedInstance;
  }

  const win = typeof window !== 'undefined' ? window : (globalThis.window || null);
  if (!win) {
    throw new Error('DOM window is not available for HTML sanitization');
  }

  cachedInstance = createDOMPurify(win);
  return cachedInstance;
}

export function sanitizeHtml(dirtyHtml, options = {}) {
  const sanitizer = getSanitizer();
  return sanitizer.sanitize(dirtyHtml != null ? dirtyHtml : '', options);
}
