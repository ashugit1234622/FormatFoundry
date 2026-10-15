import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPng(width, height, pixelFn) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

export function generateAppleTouchIcon() {
  const size = 180;
  const buf = createPng(size, size, (x, y, w, h) => {
    const bgR1 = 26, bgG1 = 44, bgB1 = 66;
    const bgR2 = 14, bgG2 = 24, bgB2 = 38;
    const gradFactor = y / h;
    let r = Math.round(bgR1 * (1 - gradFactor) + bgR2 * gradFactor);
    let g = Math.round(bgG1 * (1 - gradFactor) + bgG2 * gradFactor);
    let b = Math.round(bgB1 * (1 - gradFactor) + bgB2 * gradFactor);
    let a = 255;

    const pad = 24;
    const innerW = w - pad * 2;
    const innerH = h - pad * 2;
    const rx = 28;

    const dx = Math.max(0, Math.max(pad + rx - x, x - (pad + innerW - rx)));
    const dy = Math.max(0, Math.max(pad + rx - y, y - (pad + innerH - rx)));
    const distSq = dx * dx + dy * dy;

    if (x >= pad && x <= pad + innerW && y >= pad && y <= pad + innerH) {
      if (dx === 0 || dy === 0 || distSq <= rx * rx) {
        const borderDist = Math.min(
          Math.min(x - pad, pad + innerW - x),
          Math.min(y - pad, pad + innerH - y)
        );
        const isBorder = (dx > 0 && dy > 0)
          ? Math.abs(Math.sqrt(distSq) - rx) <= 3
          : (borderDist <= 3);

        if (isBorder) {
          r = 0; g = 229; b = 255;
        } else {
          r = 35; g = 62; b = 92;
        }

        const cx = w / 2;
        const cy = h / 2;
        const barThickness = 14;
        const barLen = 56;

        const inHBar = (Math.abs(y - cy) <= barThickness / 2) && (Math.abs(x - cx) <= barLen / 2);
        const inVBar = (Math.abs(x - cx) <= barThickness / 2) && (Math.abs(y - cy) <= barLen / 2);

        if (inHBar || inVBar) {
          r = 255; g = 255; b = 255;
        }

        const nodeRadius = 8;
        const nodes = [
          [cx - barLen / 2, cy],
          [cx + barLen / 2, cy],
          [cx, cy - barLen / 2],
          [cx, cy + barLen / 2],
          [cx, cy]
        ];

        for (const [nx, ny] of nodes) {
          const ndDistSq = (x - nx) * (x - nx) + (y - ny) * (y - ny);
          if (ndDistSq <= nodeRadius * nodeRadius) {
            r = 0; g = 229; b = 255;
          }
        }
      }
    }

    return [r, g, b, a];
  });

  const publicDir = path.resolve(rootDir, 'public');
  const distDir = path.resolve(rootDir, 'dist');
  const iconPath = path.resolve(publicDir, 'apple-touch-icon.png');
  fs.writeFileSync(iconPath, buf);

  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.resolve(distDir, 'apple-touch-icon.png'), buf);
  }

  return iconPath;
}

export function generateFaviconPng() {
  const size = 32;
  const buf = createPng(size, size, (x, y, w, h) => {
    let r = 43, g = 76, b = 111, a = 255;
    const cx = w / 2;
    const cy = h / 2;
    const inH = Math.abs(y - cy) <= 2 && Math.abs(x - cx) <= 10;
    const inV = Math.abs(x - cx) <= 2 && Math.abs(y - cy) <= 10;
    if (inH || inV) {
      r = 0; g = 229; b = 255;
    }
    return [r, g, b, a];
  });

  const publicDir = path.resolve(rootDir, 'public');
  const distDir = path.resolve(rootDir, 'dist');
  const iconPath = path.resolve(publicDir, 'favicon-32x32.png');
  fs.writeFileSync(iconPath, buf);

  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.resolve(distDir, 'favicon-32x32.png'), buf);
  }

  return iconPath;
}

if (process.argv[1] && process.argv[1].endsWith('generate-icons.js')) {
  const p1 = generateAppleTouchIcon();
  const p2 = generateFaviconPng();
  console.log(`Generated Apple touch icon at ${p1} and favicon at ${p2}`);
}
