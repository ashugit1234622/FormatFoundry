const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const JPEG_SIGNATURE = [255, 216, 255];
const RIFF_HEADER = [82, 73, 70, 70];
const WEBP_HEADER = [87, 69, 66, 80];

export function detectImageSignature(bytes) {
  if (!bytes) {
    return null;
  }

  const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const len = array.length;

  if (len >= 8) {
    let isPng = true;
    for (let i = 0; i < 8; i += 1) {
      if (array[i] !== PNG_SIGNATURE[i]) {
        isPng = false;
        break;
      }
    }
    if (isPng) {
      return 'png';
    }
  }

  if (len >= 3) {
    if (
      array[0] === JPEG_SIGNATURE[0] &&
      array[1] === JPEG_SIGNATURE[1] &&
      array[2] === JPEG_SIGNATURE[2]
    ) {
      return 'jpeg';
    }
  }

  if (len >= 12) {
    const isRiff =
      array[0] === RIFF_HEADER[0] &&
      array[1] === RIFF_HEADER[1] &&
      array[2] === RIFF_HEADER[2] &&
      array[3] === RIFF_HEADER[3];

    const isWebp =
      array[8] === WEBP_HEADER[0] &&
      array[9] === WEBP_HEADER[1] &&
      array[10] === WEBP_HEADER[2] &&
      array[11] === WEBP_HEADER[3];

    if (isRiff && isWebp) {
      return 'webp';
    }
  }

  return null;
}

export async function sniffFileImageFormat(file) {
  if (!file || typeof file.slice !== 'function' || typeof file.size !== 'number') {
    return null;
  }

  if (file.size < 3) {
    return null;
  }

  try {
    const slice = file.slice(0, 16);
    const buffer = await slice.arrayBuffer();
    return detectImageSignature(new Uint8Array(buffer));
  } catch {
    return null;
  }
}
