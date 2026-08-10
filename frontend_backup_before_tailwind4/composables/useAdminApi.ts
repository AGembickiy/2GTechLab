/**
 * API composables для админа
 */
import { useAuthStore } from '@/stores/auth'

export function useAdminApi() {
  const authStore = useAuthStore()

  async function getAnalytics() {
    return await $fetch('/api/v1/accounts/dashboard/', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    })
  }

  async function listUsers() {
    return await $fetch('/api/v1/accounts/users/', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    })
  }

  async function listOrders() {
    return await $fetch('/api/v1/orders/orders/', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    })
  }

  async function listPrinters() {
    return await $fetch('/api/v1/printers/printers/', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    })
  }

  async function listTransactions() {
    return await $fetch('/api/v1/finance/transactions/', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    })
  }

  async function listWarehouseItems() {
    return await $fetch('/api/v1/warehouse/items/', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    })
  }

  async function getWarehouseStats() {
    return await $fetch('/api/v1/warehouse/low-stock/', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    })
  }

  return {
    getAnalytics,
    listUsers,
    listOrders,
    listPrinters,
    listTransactions,
    listWarehouseItems,
    getWarehouseStats,
  }
}
