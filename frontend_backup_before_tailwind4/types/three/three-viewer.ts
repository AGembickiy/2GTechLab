export type ThreeViewerSelectionType = 'surface' | 'polygon' | 'group';

export type ThreeViewerSurfaceClickPayload = {
  id: string;
  index: number;
  type: ThreeViewerSelectionType;
  material?: any;
  color?: string;
} | null;
