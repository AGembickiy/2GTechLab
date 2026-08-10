/**
 * Клиент REST API Django (print pipeline).
 */
export interface MaterialPresetDto {
  id: number
  name: string
  type: string
  color_hex: string
  density_g_per_cm3: number
  price_per_kg: string
}

export interface SlotAssignmentDto {
  id: number
  slot_index: number
  material_preset: MaterialPresetDto
  length_mm: number | null
  mass_g: number | null
  cost: string | null
}

export interface PrintJobDto {
  id: number
  status: string
  upload_kind?: string
  sketch_width_mm?: number |null
  sketch_height_mm?: number | null
  sketch_thickness_mm?: number | null
  estimated_print_time_minutes?: number | null
  created_at: string
  original_file: string | null
  converted_stl: string | null
  converted_glb?: string | null
  converted_3mf?: string | null
  gcode_file: string | null
  moonraker_job_id: string | null
  last_error: string
  slot_assignments: SlotAssignmentDto[]
}

export interface UploadResponseDto {
  job_id: number
  is_3d: boolean
  is_model: boolean
  preview_url: string | null
  status: string
}

export interface SliceAssignmentPayload {
  slot_index: number
  material_preset_id: number
  surface_ids: string[]
}

export interface PrintJobResultDto {
  ready: boolean
  status: string
  total_cost?: number | null
  print_time_minutes?: number | null
  detail?: string
  slots?: Array<{
    slot_index: number
    material: string
    color: string
    length_mm: number | null
    mass_g: number | null
    cost: number
  }>
}

export function usePrintApi() {
  const { $api } = useNuxtApp()

  async function listMaterialPresets(): Promise<MaterialPresetDto[]> {
    return await $api('/material-presets/')
  }

  async function createPrintJob(file: File): Promise<PrintJobDto> {
    const body = new FormData()
    body.append('original_file', file, file.name)

    return await $api('/print-jobs/', {
      method: 'POST',
      body,
    })
  }

  async function getPrintJob(id: number): Promise<PrintJobDto> {
    return await $api(`/print-jobs/${id}/`)
  }

  async function startSlice(
    id: number,
    body?: {
      assignments?: SliceAssignmentPayload[]
      dimensions?: {
        width_mm: number
        height_mm: number
        thickness_mm: number
      } | null
    },
  ): Promise<{ status: string; job_id: number }> {
    return await $api(`/print-jobs/${id}/slice/`, {
      method: 'POST',
      body: body ?? {},
    })
  }

  async function uploadFile(file: File): Promise<UploadResponseDto> {
    const form = new FormData()
    form.append('file', file, file.name)

    return await $api('/upload/', {
      method: 'POST',
      body: form,
    })
  }

  async function getPrintJobResult(id: number): Promise<PrintJobResultDto> {
    return await $api(`/print-jobs/${id}/result/`)
  }

  async function createOrder(
    file: File,
    params: {
      infill: number
      layer_height: number
      material: string
    },
  ): Promise<any> {
    const body = new FormData()

    body.append('original_file', file, file.name)
    body.append('parameters.infill', params.infill.toString())
    body.append('parameters.layer_height', params.layer_height.toString())
    body.append('parameters.material', params.material)

    return await $api('/orders/', {
      method: 'POST',
      body,
    })
  }

  return {
    listMaterialPresets,
    createPrintJob,
    getPrintJob,
    startSlice,
    uploadFile,
    getPrintJobResult,
    createOrder,
  }
}