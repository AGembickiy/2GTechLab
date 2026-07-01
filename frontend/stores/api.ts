/**
 * API Store для управления API запросами
 */
import { useAuthStore } from './auth'

export const useApiStore = defineStore('api', {
  state: () => ({
    isLoading: false,
    lastError: null as string | null,
  }),
  actions: {
    async request<T>(url: string, options: Record<string, any> = {}): Promise<T> {
      const authStore = useAuthStore()
      this.isLoading = true
      this.lastError = null

      try {
        const response = await $fetch<T>(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.accessToken}`,
            ...options.headers,
          },
          ...options,
        })

        return response
      } catch (error: any) {
        this.lastError = error?.message || 'Ошибка запроса'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    async get<T>(url: string): Promise<T> {
      return this.request<T>(url, { method: 'GET' })
    },
    async post<T>(url: string, data: any): Promise<T> {
      return this.request<T>(url, { method: 'POST', body: data })
    },
    async put<T>(url: string, data: any): Promise<T> {
      return this.request<T>(url, { method: 'PUT', body: data })
    },
    async delete<T>(url: string): Promise<T> {
      return this.request<T>(url, { method: 'DELETE' })
    },
  },
})
