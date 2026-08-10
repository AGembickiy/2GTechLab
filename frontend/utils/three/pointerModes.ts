/**
 * Режимы выбора для ThreeViewer:
 * - Клик: полигон
 * - Shift+клик: мультивыбор
 * - Ctrl/Cmd+клик: одна грань (поверхность)
 */
export type PointerDownSnapshot = {
  shiftKey: boolean;
  /** true если при pointerdown были Ctrl или Meta */
  ctrlOrMetaKey: boolean;
};

export type KeyboardModifierState = {
  shift: boolean;
  ctrlOrMeta: boolean;
};

export function resolveSelectionModesFromPointer(
  down: PointerDownSnapshot,
  upShift: boolean,
  upCtrl: boolean,
  upMeta: boolean,
  keyboard: KeyboardModifierState,
): { withMulti: boolean; forceSurface: boolean } {
  const withMulti = down.shiftKey || upShift || keyboard.shift;
  const forceSurface = down.ctrlOrMetaKey || upCtrl || upMeta || keyboard.ctrlOrMeta;
  return { withMulti, forceSurface };
}
