import { useAuthStore } from '@/stores/auth'

export class PrinterService {
  private baseUrl = '/api/v1/printers'
  private authStore = useAuthStore()

  async listPrinters(params?: any): Promise<any> {
    const url = params
      ? `${this.baseUrl}/printers/?${new URLSearchParams(params).toString()}`
      : `${this.baseUrl}/printers/`
    return await $fetch(url)
  }

  async getPrinterById(id: number): Promise<any> {
    return await $fetch(`${this.baseUrl}/printers/${id}/`)
  }

  async createPrinter(payload: any): Promise<any> {
    return await $fetch(`${this.baseUrl}/printers/`, {
      method: 'POST',
      body: payload,
    })
  }

  async updatePrinter(id: number, payload: any): Promise<any> {
    return await $fetch(`${this.baseUrl}/printers/${id}/`, {
      method: 'PUT',
      body: payload,
    })
  }

  async deletePrinter(id: number): Promise<void> {
    await $fetch(`${this.baseUrl}/printers/${id}/`, { method: 'DELETE' })
  }
}
