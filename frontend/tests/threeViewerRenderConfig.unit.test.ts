import { describe, expect, it } from 'vitest';
import {
  VIEWER_CLEAR_COLOR_HEX,
  VIEWER_SELECTION_OVERLAY_OPACITY,
  VIEWER_TONE_MAPPING_EXPOSURE,
} from '../utils/threeViewerRenderConfig';

describe('threeViewerRenderConfig (контраст превью)', () => {
  it('тёмный фон канваса для читаемости светлых красок', () => {
    expect(VIEWER_CLEAR_COLOR_HEX).toBeGreaterThan(0);
    expect(VIEWER_CLEAR_COLOR_HEX).toBeLessThan(0xffffff);
  });

  it('overlay выделения не полностью непрозрачный', () => {
    expect(VIEWER_SELECTION_OVERLAY_OPACITY).toBeLessThan(0.95);
    expect(VIEWER_SELECTION_OVERLAY_OPACITY).toBeGreaterThan(0.1);
  });

  it('экспозиция tone mapping умеренная', () => {
    expect(VIEWER_TONE_MAPPING_EXPOSURE).toBeGreaterThan(0.5);
    expect(VIEWER_TONE_MAPPING_EXPOSURE).toBeLessThanOrEqual(1);
  });
});
