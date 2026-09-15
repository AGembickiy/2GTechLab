/**
 * Auth composables для админа
 */
import { authService } from '@/services/authService'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

export function useAdminAuth() {
  const authStore = useAuthStore()

  async function login(phone: string, password: string): Promise<any> {
    return await authService.login(phone, password)
  }

  async function logout() {
    await authService.logout()
    await navigateTo('/auth/login')
  }

  return {
    login,
    logout,
    isAuthenticated: computed(() => authStore.isAuthenticated),
    user: computed(() => authStore.user),
    userRole: computed(() => authStore.userRole),
  }
}
