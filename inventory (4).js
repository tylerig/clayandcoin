// ============================================================
// SPRITES — pixel art canvas rendering & cache
// ============================================================
import { SPRITES, PAL } from '../data/narrative.js';

const _cache = {};

/** Render an 8×8 sprite key to a data URL (cached) */
export function spriteUrl(key) {
  if (_cache[key]) return _cache[key];
  const rows = SPRITES[key];
  if (!rows) return '';
  const canvas = document.createElement('canvas');
  canvas.width = 8; canvas.height = 8;
  const ctx = canvas.getContext('2d');
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const col = PAL[row[x]];
      if (col && col !== 'transparent') {
        ctx.fillStyle = col;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
  return (_cache[key] = canvas.toDataURL());
}

/**
 * Returns a data URL string (for use in <img src=…>) at the given
 * display size. Keeps image-rendering:pixelated.
 */
export function px(key, size) {
  return spriteUrl(key);
}

/**
 * Returns an <img> HTML string at the given display size.
 */
export function pxImg(key, size) {
  return `<img src="${spriteUrl(key)}" width="${size}" height="${size}" style="image-rendering:pixelated;display:block">`;
}
