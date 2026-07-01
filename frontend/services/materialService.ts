import { useAuthStore } from '@/stores/auth'

export class MaterialService {
  private baseUrl = '/api/v1/catalog/materials'
  private authStore = useAuthStore()

  async listMaterials(params?: any): Promise<any> {
    const url = params
      ? `${this.baseUrl}/?${new URLSearchParams(params).toString()}`
      : `${this.baseUrl}/`
    return await $fetch(url)
  }

  async getMaterialById(id: number): Promise<any> {
    return await $fetch(`${this.baseUrl}/${id}/`)
  }

  async createMaterial(payload: any): Promise<any> {
    return await $fetch(this.baseUrl, {
      method: 'POST',
      body: payload,
    })
  }

  async updateMaterial(id: number, payload: any): Promise<any> {
    return await $fetch(`${this.baseUrl}/${id}/`, {
      method: 'PUT',
      body: payload,
    })
  }

  async deleteMaterial(id: number): Promise<void> {
    await $fetch(`${this.baseUrl}/${id}/`, { method: 'DELETE' })
  }
}
