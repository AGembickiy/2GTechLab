export interface ResolveRecolorScopeInput {
  selectedFacesCount: number;
}

export type RecolorScope = 'selection' | 'none';

export function resolveRecolorScope(input: ResolveRecolorScopeInput): RecolorScope {
  if (input.selectedFacesCount > 0) {
    return 'selection';
  }

  return 'none';
}
