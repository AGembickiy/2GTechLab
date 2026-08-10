import { useNuxtApp } from '#app'

import type {
  CreateOrderDto,
  OrderDto,
  OrderListParams,
  OrderParametersDto,
  UpdateOrderStatusDto,
} from '~/types/api/orders'

export class OrderService {
  private readonly baseUrl = '/v1/orders'

  private get api() {
    return useNuxtApp().$api
  }

  async listOrders(
    params?: OrderListParams,
  ): Promise<OrderDto[]> {
    const url = params
      ? `${this.baseUrl}/orders/?${new URLSearchParams(
          Object.entries(params)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => [key, String(value)]),
        ).toString()}`
      : `${this.baseUrl}/orders/`

    return await this.api(url)
  }

  async getOrderById(
    id: number,
  ): Promise<OrderDto> {
    return await this.api(
      `${this.baseUrl}/orders/${id}/`,
    )
  }

  async createOrder(
    payload: CreateOrderDto,
  ): Promise<OrderDto> {
    return await this.api(
      `${this.baseUrl}/orders/`,
      {
        method: 'POST',
        body: payload,
      },
    )
  }

  async updateOrderStatus(
    id: number,
    payload: UpdateOrderStatusDto,
  ): Promise<OrderDto> {
    return await this.api(
      `${this.baseUrl}/orders/${id}/`,
      {
        method: 'PATCH',
        body: payload,
      },
    )
  }

  async deleteOrder(
    id: number,
  ): Promise<void> {
    await this.api(
      `${this.baseUrl}/orders/${id}/`,
      {
        method: 'DELETE',
      },
    )
  }

  async createOrderParameters(
    id: number,
    payload: OrderParametersDto,
  ): Promise<OrderDto> {
    return await this.api(
      `${this.baseUrl}/orders/${id}/parameters/`,
      {
        method: 'POST',
        body: payload,
      },
    )
  }

  async submitOrder(
    id: number,
  ): Promise<OrderDto> {
    return await this.api(
      `${this.baseUrl}/orders/${id}/submit/`,
      {
        method: 'POST',
      },
    )
  }
}

export const orderService = new OrderService()