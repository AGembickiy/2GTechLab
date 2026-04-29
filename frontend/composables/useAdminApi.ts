export interface AdminMaterialDto {
  id: number
  name: string
  category: 'filament' | 'consumable' | 'packaging'
  material_type: string
  manufacturer: string
  supplier: string
  color_hex: string
  price_per_kg: string
  purchase_price: string | null
  weight_g: number
  actual_weight_g: number
  min_weight_g: number
  density: number
  print_temperature_c: number | null
  filament_diameter_mm: number | null
  spool_weight_g: number | null
  filament_length_m: number | null
  delivery_date: string | null
  expiration_date: string | null
  notes: string
  previous_inventory_date: string | null
  next_inventory_date: string | null
}

export interface AdminMaterialPayload {
  name: string
  category: 'filament' | 'consumable' | 'packaging'
  material_type: string
  manufacturer: string
  supplier: string
  color_hex: string
  price_per_kg: string
  purchase_price: string | null
  weight_g: number
  actual_weight_g: number
  min_weight_g: number
  print_temperature_c: number | null
  filament_diameter_mm: number | null
  spool_weight_g: number | null
  filament_length_m: number | null
  delivery_date: string | null
  expiration_date: string | null
  notes: string
  previous_inventory_date: string | null
  next_inventory_date: string | null
  density: number
}

export interface AdminPrinterDto {
  id: number
  model_name: string
  hourly_rate: string
  is_active: boolean
  last_maintenance: string | null
}

export interface AdminOrderParametersDto {
  scale: number
  rotation_x: number
  rotation_y: number
  rotation_z: number
  infill: number
  layer_height: number
}

export interface AdminOrderDto {
  id: number
  status: string
  created_at: string
  estimated_weight: number | null
  estimated_time: number | null
  final_price: string | null
  material_details: AdminMaterialDto | null
  printer_details: AdminPrinterDto | null
  parameters: AdminOrderParametersDto
}

export interface AdminUserDto {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
  date_joined: string
}

export interface AdminAnalyticsDto {
  total_revenue: number
  orders_count: number
  avg_check: number
  popular_materials: Array<{
    material__name: string | null
    count: number
  }>
}

export interface AdminFinanceDto {
  total_revenue: number
  avg_check: number
  completed_orders_count: number
  in_progress_orders_count: number
  estimated_pipeline_value: number
}

export function useAdminApi() {
  const config = useRuntimeConfig()
  const { accessToken } = useAdminAuth()

  function getHeaders(): Record<string, string> {
    if (!accessToken.value) {
      return {}
    }

    return {
      Authorization: `Bearer ${accessToken.value}`,
    }
  }

  async function listOrders(): Promise<AdminOrderDto[]> {
    return await $fetch<AdminOrderDto[]>(`${config.public.apiBase}/orders/`, {
      headers: getHeaders(),
    })
  }

  async function listMaterials(): Promise<AdminMaterialDto[]> {
    return await $fetch<AdminMaterialDto[]>(`${config.public.apiBase}/materials/`, {
      headers: getHeaders(),
    })
  }

  async function createMaterial(payload: AdminMaterialPayload): Promise<AdminMaterialDto> {
    return await $fetch<AdminMaterialDto>(`${config.public.apiBase}/materials/`, {
      method: 'POST',
      headers: getHeaders(),
      body: payload,
    })
  }

  async function updateMaterial(id: number, payload: AdminMaterialPayload): Promise<AdminMaterialDto> {
    return await $fetch<AdminMaterialDto>(`${config.public.apiBase}/materials/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: payload,
    })
  }

  async function deleteMaterial(id: number): Promise<void> {
    await $fetch(`${config.public.apiBase}/materials/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
  }

  async function listPrinters(): Promise<AdminPrinterDto[]> {
    return await $fetch<AdminPrinterDto[]>(`${config.public.apiBase}/printers/`, {
      headers: getHeaders(),
    })
  }

  async function listUsers(): Promise<AdminUserDto[]> {
    return await $fetch<AdminUserDto[]>(`${config.public.apiBase}/users/`, {
      headers: getHeaders(),
    })
  }

  async function getAnalytics(): Promise<AdminAnalyticsDto> {
    return await $fetch<AdminAnalyticsDto>(`${config.public.apiBase}/orders/analytics/`, {
      headers: getHeaders(),
    })
  }

  async function getFinance(): Promise<AdminFinanceDto> {
    return await $fetch<AdminFinanceDto>(`${config.public.apiBase}/orders/finance/`, {
      headers: getHeaders(),
    })
  }

  return {
    listOrders,
    listMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    listPrinters,
    listUsers,
    getAnalytics,
    getFinance,
  }
}
