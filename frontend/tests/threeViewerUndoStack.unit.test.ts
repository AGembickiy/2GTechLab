import { describe, expect, it } from 'vitest';
import { popUndoSnapshot, pushUndoSnapshot } from '../utils/threeViewerUndoStack';

describe('threeViewerUndoStack', () => {
  it('pushUndoSnapshot stores independent snapshot copy', () => {
    const source = new Uint8Array([0, 1, 2]);
    const history = pushUndoSnapshot({
      history: [],
      current: source,
      maxEntries: 5,
    });

    source[0] = 9;
    expect(Array.from(history[0] ?? [])).toEqual([0, 1, 2]);
  });

  it('pushUndoSnapshot respects max entries limit', () => {
    let history: Uint8Array[] = [];
    history = pushUndoSnapshot({
      history,
      current: new Uint8Array([1]),
      maxEntries: 2,
    });
    history = pushUndoSnapshot({
      history,
      current: new Uint8Array([2]),
      maxEntries: 2,
    });
    history = pushUndoSnapshot({
      history,
      current: new Uint8Array([3]),
      maxEntries: 2,
    });

    expect(history.map((snapshot) => snapshot[0])).toEqual([2, 3]);
  });

  it('popUndoSnapshot returns last snapshot and remaining history', () => {
    const first = new Uint8Array([1]);
    const second = new Uint8Array([2]);
    const result = popUndoSnapshot({
      history: [first, second],
    });

    expect(Array.from(result.snapshot ?? [])).toEqual([2]);
    expect(result.nextHistory.length).toBe(1);
    expect(Array.from(result.nextHistory[0] ?? [])).toEqual([1]);
  });
});
