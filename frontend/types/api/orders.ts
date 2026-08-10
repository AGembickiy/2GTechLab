export interface OrderDto {
  id: number
  status: string
  created_at: string

  [key: string]: unknown
}

export interface CreateOrderDto {
  [key: string]: unknown
}

export interface OrderParametersDto {
  [key: string]: unknown
}

export interface UpdateOrderStatusDto {
  status: string
}

export interface OrderListParams {
  page?: number
  page_size?: number
  search?: string
  status?: string

  [key: string]: string | number | boolean | undefined
}