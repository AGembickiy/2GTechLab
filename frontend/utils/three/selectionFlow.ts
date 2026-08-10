export interface ResolveSelectionFlowInput {
  isPickedAlreadySelected: boolean;
  hasAnySelection: boolean;
  withMulti: boolean;
}

export interface ResolveSelectionFlowOutput {
  action: 'add' | 'remove';
  shouldClearBeforeAdd: boolean;
  shouldApplyPaintOnAdd: boolean;
}

export function resolveSelectionFlow(input: ResolveSelectionFlowInput): ResolveSelectionFlowOutput {
  if (input.isPickedAlreadySelected) {
    return {
      action: 'remove',
      shouldClearBeforeAdd: false,
      shouldApplyPaintOnAdd: false,
    };
  }

  return {
    action: 'add',
    shouldClearBeforeAdd: !input.withMulti && input.hasAnySelection,
    // Two-step flow: click on model only selects; color click applies paint.
    shouldApplyPaintOnAdd: false,
  };
}
