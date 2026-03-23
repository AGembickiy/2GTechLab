export type ThreeViewerSelectionType = 'polygon';

export type ThreeViewerSurfaceClickPayload = {
  id: string;
  index: number;
  type: ThreeViewerSelectionType;
} | null;
