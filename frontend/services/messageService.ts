import { BaseService } from './baseService'

export class MessageService extends BaseService {
  private baseUrl = '/v1/internal_messages/messages'

  async listMessages(
    params?: Record<string, any>,
  ): Promise<any> {
    try {
      const url = params
        ? `${this.baseUrl}/?${new URLSearchParams(params).toString()}`
        : `${this.baseUrl}/`

      return await this.get(url)
    } catch (error) {
      console.error('List messages error:', error)
      throw error
    }
  }

  async getMessageById(id: number): Promise<any> {
    try {
      return await this.get(
        `${this.baseUrl}/${id}/`,
      )
    } catch (error) {
      console.error('Get message error:', error)
      throw error
    }
  }

  async createMessage(payload: any): Promise<any> {
    try {
      return await this.post(
        `${this.baseUrl}/`,
        payload,
      )
    } catch (error) {
      console.error('Create message error:', error)
      throw error
    }
  }

  async markAsRead(id: number): Promise<any> {
    try {
      return await this.post(
        `${this.baseUrl}/${id}/read/`,
      )
    } catch (error) {
      console.error('Mark message as read error:', error)
      throw error
    }
  }

  async deleteMessage(id: number): Promise<void> {
    try {
      await this.delete(
        `${this.baseUrl}/${id}/`,
      )
    } catch (error) {
      console.error('Delete message error:', error)
      throw error
    }
  }
}

export const messageService = new MessageService()