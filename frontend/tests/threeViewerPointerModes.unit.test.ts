import { describe, expect, it } from 'vitest';
import { resolveSelectionModesFromPointer } from '../utils/threeViewerPointerModes';

describe('resolveSelectionModesFromPointer (клик / Shift / Ctrl)', () => {
  it('обычный клик: полигон, без мультивыбора', () => {
    expect(
      resolveSelectionModesFromPointer(
        { shiftKey: false, ctrlOrMetaKey: false },
        false,
        false,
        false,
        { shift: false, ctrlOrMeta: false },
      ),
    ).toEqual({ withMulti: false, forceSurface: false });
  });

  it('Shift+клик: мультивыбор', () => {
    expect(
      resolveSelectionModesFromPointer(
        { shiftKey: true, ctrlOrMetaKey: false },
        false,
        false,
        false,
        { shift: false, ctrlOrMeta: false },
      ),
    ).toEqual({ withMulti: true, forceSurface: false });
  });

  it('Ctrl/Cmd+клик: одна грань (поверхность)', () => {
    expect(
      resolveSelectionModesFromPointer(
        { shiftKey: false, ctrlOrMetaKey: true },
        false,
        false,
        false,
        { shift: false, ctrlOrMeta: false },
      ),
    ).toEqual({ withMulti: false, forceSurface: true });
  });

  it('Shift+Ctrl/Cmd: мультивыбор поверхностей', () => {
    expect(
      resolveSelectionModesFromPointer(
        { shiftKey: true, ctrlOrMetaKey: true },
        false,
        false,
        false,
        { shift: false, ctrlOrMeta: false },
      ),
    ).toEqual({ withMulti: true, forceSurface: true });
  });

  it('состояние клавиатуры при отпускании: Shift удерживается', () => {
    expect(
      resolveSelectionModesFromPointer(
        { shiftKey: false, ctrlOrMetaKey: false },
        true,
        false,
        false,
        { shift: false, ctrlOrMeta: false },
      ),
    ).toEqual({ withMulti: true, forceSurface: false });
  });

  it('состояние клавиатуры при отпускании: Ctrl на keyup', () => {
    expect(
      resolveSelectionModesFromPointer(
        { shiftKey: false, ctrlOrMetaKey: false },
        false,
        true,
        false,
        { shift: false, ctrlOrMeta: false },
      ),
    ).toEqual({ withMulti: false, forceSurface: true });
  });
});
