export interface PushUndoSnapshotInput {
  history: Uint8Array[];
  current: Uint8Array;
  maxEntries: number;
}

export interface PopUndoSnapshotInput {
  history: Uint8Array[];
}

export interface PopUndoSnapshotOutput {
  nextHistory: Uint8Array[];
  snapshot: Uint8Array | null;
}

export function pushUndoSnapshot(input: PushUndoSnapshotInput): Uint8Array[] {
  const maxEntries = Math.max(1, input.maxEntries);
  const nextHistory = [...input.history, new Uint8Array(input.current)];
  if (nextHistory.length > maxEntries) {
    nextHistory.shift();
  }
  return nextHistory;
}

export function popUndoSnapshot(input: PopUndoSnapshotInput): PopUndoSnapshotOutput {
  if (!input.history.length) {
    return {
      nextHistory: input.history,
      snapshot: null,
    };
  }

  const nextHistory = input.history.slice(0, -1);
  const snapshot = input.history[input.history.length - 1] ?? null;
  return {
    nextHistory,
    snapshot,
  };
}
