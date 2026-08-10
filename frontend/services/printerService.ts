import { useNuxtApp } from '#app'

export class PrintJobService {
  private baseUrl = '/v1/print_service/print-jobs'

  private get api() {
    return useNuxtApp().$api
  }

  async listPrintJobs(params?: Record<string, any>): Promise<any> {
    const url = params
      ? `${this.baseUrl}/?${new URLSearchParams(params).toString()}`
      : `${this.baseUrl}/`

    return await this.api(url)
  }

  async getPrintJobById(id: number): Promise<any> {
    return await this.api(`${this.baseUrl}/${id}/`)
  }

  async createPrintJob(
    file: File,
    uploadKind: 'model' | 'sketch',
  ): Promise<any> {
    const formData = new FormData()

    formData.append('original_file', file)
    formData.append('upload_kind', uploadKind)

    return await this.api(`${this.baseUrl}/`, {
      method: 'POST',
      body: formData,
    })
  }

  async startSlicing(
    jobId: number,
    payload: any,
  ): Promise<any> {
    return await this.api(`${this.baseUrl}/${jobId}/slice/`, {
      method: 'POST',
      body: payload,
    })
  }

  async cancelJob(jobId: number): Promise<any> {
    return await this.api(`${this.baseUrl}/${jobId}/cancel/`, {
      method: 'POST',
    })
  }

  async listMaterialPresets(): Promise<any> {
    return await this.api(`${this.baseUrl}/material-presets/`)
  }

  async createMaterialPreset(payload: any): Promise<any> {
    return await this.api(`${this.baseUrl}/material-presets/`, {
      method: 'POST',
      body: payload,
    })
  }
}

export const printJobService = new PrintJobService()