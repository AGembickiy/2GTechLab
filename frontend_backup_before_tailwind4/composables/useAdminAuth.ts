/**
 * Auth composables для админа
 */
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

export function useAdminAuth() {
  const authStore = useAuthStore()

  async function login(username: string, password: string): Promise<any> {
    return await authStore.login(username, password)
  }

  async function logout() {
    authStore.logout()
    navigateTo('/auth/login')
  }

  return {
    login,
    logout,
    isAuthenticated: computed(() => authStore.isAuthenticated),
    user: computed(() => authStore.user),
    userRole: computed(() => authStore.userRole),
  }
}
