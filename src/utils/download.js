export function downloadBlob(blob, filename) {
  if (!blob || !(blob instanceof Blob)) {
    throw new TypeError('A valid Blob instance is required for download.');
  }

  const safeFilename = typeof filename === 'string' && filename.trim() ? filename.trim() : 'download';
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.style.display = 'none';
  anchor.href = url;
  anchor.download = safeFilename;
  anchor.rel = 'noopener';

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 10000);
}
