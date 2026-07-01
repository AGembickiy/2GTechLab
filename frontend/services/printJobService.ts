import { useAuthStore } from '@/stores/auth'

export class PrintJobService {
  private baseUrl = '/api/v1/print_service/print-jobs'
  private authStore = useAuthStore()

  async listPrintJobs(params?: any): Promise<any> {
    const url = params
      ? `${this.baseUrl}/?${new URLSearchParams(params).toString()}`
      : `${this.baseUrl}/`
    return await $fetch(url, {
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
    })
  }

  async getPrintJobById(id: number): Promise<any> {
    return await $fetch(`${this.baseUrl}/${id}/`, {
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
    })
  }

  async createPrintJob(file: File, uploadKind: 'model' | 'sketch'): Promise<any> {
    const formData = new FormData()
    formData.append('original_file', file)
    formData.append('upload_kind', uploadKind)

    return await $fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
      body: formData,
    })
  }

  async startSlicing(jobId: number, payload: any): Promise<any> {
    return await $fetch(`${this.baseUrl}/${jobId}/slice/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
      body: payload,
    })
  }

  async cancelJob(jobId: number): Promise<any> {
    return await $fetch(`${this.baseUrl}/${jobId}/cancel/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
    })
  }

  async listMaterialPresets(): Promise<any> {
    return await $fetch(`${this.baseUrl}/material-presets/`)
  }

  async createMaterialPreset(payload: any): Promise<any> {
    return await $fetch(`${this.baseUrl}/material-presets/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
      body: payload,
    })
  }
}
