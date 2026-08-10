import type { MaterialPresetDto } from '~/composables/usePrintApi';

export interface UploadSlot {
  index: number;
  materialId: number | null;
  material: MaterialPresetDto | null;
}

export interface UploadStats {
  selectedCount: number;
  paintedFaces: number;
  totalFaces: number;
}

export interface UploadCalculationResult {
  ready: boolean;
  status: string;
  total_cost?: number;
  print_time_minutes?: number;
  detail?: string;
  slots?: unknown;
}

export interface UploadModelState {
  jobId: number | null;
  is3D: boolean;
  previewUrl: string | null;
  imagePreviewUrl: string | null;
}

