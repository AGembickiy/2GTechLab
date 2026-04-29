import { describe, expect, it } from 'vitest';
import { resolveRecolorScope } from '../utils/threeViewerRecolorScope';

describe('resolveRecolorScope (применение цвета только по выделению)', () => {
  it('когда есть выделение: применяем к выделению', () => {
    expect(resolveRecolorScope({ selectedFacesCount: 1 })).toBe('selection');
  });

  it('когда выделения нет: цвет не применяем', () => {
    expect(resolveRecolorScope({ selectedFacesCount: 0 })).toBe('none');
  });
});
