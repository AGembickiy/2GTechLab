import { describe, expect, it } from 'vitest';
import { resolveSelectionFlow } from '../utils/threeViewerSelectionFlow';

describe('resolveSelectionFlow (двухшаговое применение цвета)', () => {
  it('повторный клик по выделенному: снимает выделение', () => {
    expect(
      resolveSelectionFlow({
        isPickedAlreadySelected: true,
        hasAnySelection: true,
        withMulti: false,
      }),
    ).toEqual({
      action: 'remove',
      shouldClearBeforeAdd: false,
      shouldApplyPaintOnAdd: false,
    });
  });

  it('обычный клик по новому участку при существующем выборе: очистка старого выделения', () => {
    expect(
      resolveSelectionFlow({
        isPickedAlreadySelected: false,
        hasAnySelection: true,
        withMulti: false,
      }),
    ).toEqual({
      action: 'add',
      shouldClearBeforeAdd: true,
      shouldApplyPaintOnAdd: false,
    });
  });

  it('Shift-мультивыбор: не очищает предыдущее выделение', () => {
    expect(
      resolveSelectionFlow({
        isPickedAlreadySelected: false,
        hasAnySelection: true,
        withMulti: true,
      }),
    ).toEqual({
      action: 'add',
      shouldClearBeforeAdd: false,
      shouldApplyPaintOnAdd: false,
    });
  });
});
