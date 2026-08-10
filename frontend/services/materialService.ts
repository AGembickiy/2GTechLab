import { BaseService } from './baseService'

export class MaterialService extends BaseService {
  private baseUrl = '/api/v1/catalog/materials'

  async listMaterials(params?: Record<string, any>): Promise<any> {
    try {
      const url = params
        ? `${this.baseUrl}/?${new URLSearchParams(params).toString()}`
        : `${this.baseUrl}/`

      return await this.get(url)
    } catch (error) {
      console.error('List materials error:', error)
      throw error
    }
  }

  async getMaterialById(id: number): Promise<any> {
    try {
      return await this.get(`${this.baseUrl}/${id}/`)
    } catch (error) {
      console.error('Get material error:', error)
      throw error
    }
  }

  async createMaterial(payload: any): Promise<any> {
    try {
      return await this.post(
        `${this.baseUrl}/`,
        payload,
      )
    } catch (error) {
      console.error('Create material error:', error)
      throw error
    }
  }

  async updateMaterial(
    id: number,
    payload: any,
  ): Promise<any> {
    try {
      return await this.put(
        `${this.baseUrl}/${id}/`,
        payload,
      )
    } catch (error) {
      console.error('Update material error:', error)
      throw error
    }
  }

  async deleteMaterial(id: number): Promise<void> {
    try {
      await this.delete(
        `${this.baseUrl}/${id}/`,
      )
    } catch (error) {
      console.error('Delete material error:', error)
      throw error
    }
  }
}

export const materialService = new MaterialService()