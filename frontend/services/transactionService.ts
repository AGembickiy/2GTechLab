import { useAuthStore } from '@/stores/auth'

export class TransactionService {
  private baseUrl = '/api/v1/finance/transactions'
  private authStore = useAuthStore()

  async listTransactions(params?: any): Promise<any> {
    const url = params
      ? `${this.baseUrl}/?${new URLSearchParams(params).toString()}`
      : `${this.baseUrl}/`
    return await $fetch(url, {
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
    })
  }

  async getTransactionById(id: number): Promise<any> {
    return await $fetch(`${this.baseUrl}/${id}/`, {
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
    })
  }

  async createTransaction(payload: any): Promise<any> {
    return await $fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
      body: payload,
    })
  }

  async refundTransaction(id: number): Promise<any> {
    return await $fetch(`${this.baseUrl}/${id}/refund/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
    })
  }
}
