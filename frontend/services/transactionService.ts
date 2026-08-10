import { BaseService } from './baseService'

export class TransactionService extends BaseService {
  private baseUrl = '/v1/finance/transactions'

  async listTransactions(
    params?: Record<string, any>,
  ): Promise<any> {
    try {
      const url = params
        ? `${this.baseUrl}/?${new URLSearchParams(params).toString()}`
        : `${this.baseUrl}/`

      return await this.get(url)
    } catch (error) {
      console.error('List transactions error:', error)
      throw error
    }
  }

  async getTransactionById(id: number): Promise<any> {
    try {
      return await this.get(
        `${this.baseUrl}/${id}/`,
      )
    } catch (error) {
      console.error('Get transaction error:', error)
      throw error
    }
  }

  async createTransaction(payload: any): Promise<any> {
    try {
      return await this.post(
        `${this.baseUrl}/`,
        payload,
      )
    } catch (error) {
      console.error('Create transaction error:', error)
      throw error
    }
  }

  async refundTransaction(id: number): Promise<any> {
    try {
      return await this.post(
        `${this.baseUrl}/${id}/refund/`,
      )
    } catch (error) {
      console.error('Refund transaction error:', error)
      throw error
    }
  }
}

export const transactionService = new TransactionService()