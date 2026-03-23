/**
 * Клиент REST API Django (print pipeline).
 * Базовый URL: runtimeConfig.public.apiBase (например http://127.0.0.1:8000/api)
 */
export type MaterialPresetDto = {
  id: number;
  name: string;
  type: string;
  color_hex: string;
  density_g_per_cm3: number;
  price_per_kg: string;
};

export type SlotAssignmentDto = {
  id: number;
  slot_index: number;
  material_preset: MaterialPresetDto;
  length_mm: number | null;
  mass_g: number | null;
  cost: string | null;
};

export type PrintJobDto = {
  id: number;
  status: string;
  created_at: string;
  original_file: string | null;
  converted_stl: string | null;
  gcode_file: string | null;
  moonraker_job_id: string | null;
  last_error: string;
  slot_assignments: SlotAssignmentDto[];
};

export function usePrintApi() {
  const config = useRuntimeConfig();
  const base = computed(() => (config.public.apiBase as string).replace(/\/$/, ''));

  async function listMaterialPresets(): Promise<MaterialPresetDto[]> {
    return await $fetch<MaterialPresetDto[]>(`${base.value}/material-presets/`);
  }

  async function createPrintJob(file: File): Promise<PrintJobDto> {
    const body = new FormData();
    body.append('original_file', file, file.name);
    return await $fetch<PrintJobDto>(`${base.value}/print-jobs/`, {
      method: 'POST',
      body,
    });
  }

  async function getPrintJob(id: number): Promise<PrintJobDto> {
    return await $fetch<PrintJobDto>(`${base.value}/print-jobs/${id}/`);
  }

  async function startSlice(id: number): Promise<{ status: string; job_id: number }> {
    return await $fetch(`${base.value}/print-jobs/${id}/slice/`, { method: 'POST' });
  }

  async function getSlotAssignments(id: number): Promise<SlotAssignmentDto[]> {
    return await $fetch<SlotAssignmentDto[]>(`${base.value}/print-jobs/${id}/slot-assignments/`);
  }

  async function assignSlot(payload: {
    job_id: number;
    slot_index: number;
    material_preset_id: number;
    surface_ids?: number[];
  }) {
    return await $fetch(`${base.value}/slot-assignments/`, {
      method: 'POST',
      body: payload,
    });
  }

  async function moonrakerStatusViaBackend(): Promise<Record<string, unknown>> {
    return await $fetch(`${base.value}/moonraker/status/`);
  }

  return {
    base,
    listMaterialPresets,
    createPrintJob,
    getPrintJob,
    startSlice,
    getSlotAssignments,
    assignSlot,
    moonrakerStatusViaBackend,
  };
}
