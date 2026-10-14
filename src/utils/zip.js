import { zipSync } from 'fflate';

export function resolveUniqueFilename(filename, existingNames) {
  let name = filename && typeof filename === 'string' && filename.trim() !== ''
    ? filename.trim()
    : 'download';

  if (!existingNames.has(name)) {
    existingNames.set(name, 1);
    return name;
  }

  const count = existingNames.get(name) + 1;
  existingNames.set(name, count);

  const lastDot = name.lastIndexOf('.');
  if (lastDot > 0) {
    return `${name.slice(0, lastDot)} (${count})${name.slice(lastDot)}`;
  }
  return `${name} (${count})`;
}

export async function createZipArchive(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('No files provided for ZIP archive');
  }

  const validEntries = items.filter(
    (item) => item && item.blob instanceof Blob && item.filename
  );

  if (validEntries.length === 0) {
    throw new Error('No completed conversions available to archive');
  }

  const zipData = {};
  const seenNames = new Map();

  for (const entry of validEntries) {
    const uniqueName = resolveUniqueFilename(entry.filename, seenNames);
    try {
      const buffer = await entry.blob.arrayBuffer();
      zipData[uniqueName] = new Uint8Array(buffer);
    } catch {
      throw new Error(`Failed to read content for "${entry.filename}" during archive creation`);
    }
  }

  let zippedUint8;
  try {
    zippedUint8 = zipSync(zipData, { level: 6 });
  } catch (err) {
    throw new Error(`ZIP compression failed: ${err.message || 'Browser memory limit reached'}`);
  }

  const zipBlob = new Blob([zippedUint8], { type: 'application/zip' });

  return {
    blob: zipBlob,
    filename: 'FormatFoundry-Converted.zip',
    count: validEntries.length,
    size: zipBlob.size
  };
}
