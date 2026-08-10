import { useAuthStore } from '@/stores/auth'

export class OrderService {
  private baseUrl = '/api/v1/orders'
  private authStore = useAuthStore()

  async listOrders(params?: any): Promise<any> {
    const url = params
      ? `${this.baseUrl}/orders/?${new URLSearchParams(params).toString()}`
      : `${this.baseUrl}/orders/`
    return await $fetch(url, {
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
    })
  }

  async getOrderById(id: number): Promise<any> {
    return await $fetch(`${this.baseUrl}/orders/${id}/`, {
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
    })
  }

  async createOrder(payload: any): Promise<any> {
    return await $fetch(`${this.baseUrl}/orders/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
      body: payload,
    })
  }

  async updateOrderStatus(id: number, status: string): Promise<any> {
    return await $fetch(`${this.baseUrl}/orders/${id}/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
      body: { status },
    })
  }

  async deleteOrder(id: number): Promise<void> {
    await $fetch(`${this.baseUrl}/orders/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
    })
  }

  async createOrderParameters(id: number, parameters: any): Promise<any> {
    return await $fetch(`${this.baseUrl}/orders/${id}/parameters/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
      body: parameters,
    })
  }

  async submitOrder(id: number): Promise<any> {
    return await $fetch(`${this.baseUrl}/orders/${id}/submit/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.authStore.accessToken}`,
      },
    })
  }
}
