import { useAuthStore } from '@/stores/auth'

export class MessageService {
  private baseUrl = '/api/v1/internal_messages/messages'
  private authStore = useAuthStore()

  async listMessages(params?: any): Promise<any> {
    const url = params
      ? `${this.baseUrl}/?${new URLSearchParams(params).toString()}`
      : `${this.baseUrl}/`
    return await $fetch(url, {
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
    })
  }

  async getMessageById(id: number): Promise<any> {
    return await $fetch(`${this.baseUrl}/${id}/`, {
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
    })
  }

  async createMessage(payload: any): Promise<any> {
    return await $fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
      body: payload,
    })
  }

  async markAsRead(id: number): Promise<any> {
    return await $fetch(`${this.baseUrl}/${id}/read/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
    })
  }

  async deleteMessage(id: number): Promise<void> {
    await $fetch(`${this.baseUrl}/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
    })
  }
}
