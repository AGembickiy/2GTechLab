export class PrintJobService {
  private baseUrl = '/v1/print_service/print-jobs'

  private get api() {
    return useNuxtApp().$api
  }

  async listPrintJobs(params?: Record<string, any>): Promise<any> {
    try {
      const url = params
        ? `${this.baseUrl}/?${new URLSearchParams(params).toString()}`
        : `${this.baseUrl}/`

      return await this.api(url)
    } catch (error) {
      console.error('List print jobs error:', error)
      throw error
    }
  }

  async getPrintJobById(id: number): Promise<any> {
    try {
      return await this.api(`${this.baseUrl}/${id}/`)
    } catch (error) {
      console.error('Get print job error:', error)
      throw error
    }
  }

  async createPrintJob(
    file: File,
    uploadKind: 'model' | 'sketch',
  ): Promise<any> {
    try {
      const formData = new FormData()
      formData.append('original_file', file)
      formData.append('upload_kind', uploadKind)

      return await this.api(`${this.baseUrl}/`, {
        method: 'POST',
        body: formData,
      })
    } catch (error) {
      console.error('Create print job error:', error)
      throw error
    }
  }

  async startSlicing(jobId: number, payload: any): Promise<any> {
    try {
      return await this.api(`${this.baseUrl}/${jobId}/slice/`, {
        method: 'POST',
        body: payload,
      })
    } catch (error) {
      console.error('Start slicing error:', error)
      throw error
    }
  }

  async cancelJob(jobId: number): Promise<any> {
    try {
      return await this.api(`${this.baseUrl}/${jobId}/cancel/`, {
        method: 'POST',
      })
    } catch (error) {
      console.error('Cancel print job error:', error)
      throw error
    }
  }

  async listMaterialPresets(): Promise<any> {
    try {
      return await this.api(`${this.baseUrl}/material-presets/`)
    } catch (error) {
      console.error('List material presets error:', error)
      throw error
    }
  }

  async createMaterialPreset(payload: any): Promise<any> {
    try {
      return await this.api(`${this.baseUrl}/material-presets/`, {
        method: 'POST',
        body: payload,
      })
    } catch (error) {
      console.error('Create material preset error:', error)
      throw error
    }
  }
}

export const printJobService = new PrintJobService()