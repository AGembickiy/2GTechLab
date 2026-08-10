const DEFAULT_COLOR_HEX = '#7dd3fc';

/** sRGB 0..1 — для UI и логов */
export function hexToRgb01(hex: string): [number, number, number] {
  const normalized = (hex || DEFAULT_COLOR_HEX).trim().replace('#', '');
  if (normalized.length !== 6) return [0.49, 0.83, 0.99];
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return [r / 255, g / 255, b / 255];
}

/** Перевод sRGB-компоненты в linear (для буфера color при MeshStandardMaterial + ColorManagement) */
export function srgbChannelToLinear(s: number): number {
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** Linear RGB 0..1 для атрибута `geometry.attributes.color` */
export function hexToLinearRgb01(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb01(hex);
  return [srgbChannelToLinear(r), srgbChannelToLinear(g), srgbChannelToLinear(b)];
}

/**
 * Цвет грани в буфере `geometry.attributes.color`.
 * В Three.js r152+ атрибут `color` по умолчанию в SRGBColorSpace — кладём те же значения, что и в hex (0..1).
 * (Линейные значения без смены colorSpace дают «пустые» / неправильные цвета на экране.)
 */
export function rgb01ForFacePaint(slotHex: string): [number, number, number] {
  return hexToRgb01(slotHex);
}
