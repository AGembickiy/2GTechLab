import { describe, expect, it } from 'vitest';
import { hexToLinearRgb01, hexToRgb01, rgb01ForFacePaint, srgbChannelToLinear } from '../utils/threeViewerColors';

describe('hexToRgb01', () => {
  it('парсит #RRGGBB (sRGB)', () => {
    expect(hexToRgb01('#ef4444')).toEqual([239 / 255, 68 / 255, 68 / 255]);
  });

  it('fallback при неверной длине', () => {
    const fallback = hexToRgb01('#fff');
    expect(fallback.length).toBe(3);
    expect(fallback.every((x) => x >= 0 && x <= 1)).toBe(true);
  });
});

describe('srgbChannelToLinear', () => {
  it('0 и 1 на месте', () => {
    expect(srgbChannelToLinear(0)).toBe(0);
    expect(srgbChannelToLinear(1)).toBe(1);
  });
});

describe('rgb01ForFacePaint', () => {
  it('совпадает с sRGB (атрибут color в Three.js по умолчанию SRGBColorSpace)', () => {
    expect(rgb01ForFacePaint('#3b82f6')).toEqual(hexToRgb01('#3b82f6'));
    expect(rgb01ForFacePaint('#ef4444')).not.toEqual(hexToLinearRgb01('#ef4444'));
  });
});
