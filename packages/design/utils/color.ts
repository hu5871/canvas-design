import { IRGBA } from "../types";

export const parseRGBAStr = ({ r, g, b, a }: IRGBA) => {
  return `rgba(${r},${g},${b},${a})`;
};


/**
 * normalize hex to `RRGGBB` string format
 *
 * reference: https://mp.weixin.qq.com/s/RWlsT-5wPTD7-OpMiVhqiA
 */
export const normalizeHex = (hex: string) => {
  hex = hex.toUpperCase();
  const match = hex.match(/[0-9A-F]{1,6}/);
  if (!match) {
    return '';
  }
  hex = match[0];

  if (hex.length === 6) {
    return hex;
  }
  if (hex.length === 4 || hex.length === 5) {
    hex = hex.slice(0, 3);
  }
  // ABC -> AABBCC
  if (hex.length === 3) {
    return hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  // AB => ABABAB
  // A -> AAAAAA
  return hex.padEnd(6, hex);
};

/**
 * parse hex to rgba
 * e.g. #FF0000FF -> { r: 255, g: 0, b: 0, a: 1 }
 */
export const parseHexToRGBA = (hex: string): IRGBA | null => {
  hex = normalizeHex(hex);
  if (!hex) {
    return null;
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const aStr = hex.slice(6, 8);
  const a = aStr ? parseInt(aStr, 16) / 255 : 1;
  return { r, g, b, a };
};