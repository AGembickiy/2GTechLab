/**
 * Admin guest middleware - только для неавторизованных пользователей
 */
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/constants/roles'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated && authStore.userRole === ROLES.ADMIN) {
    return navigateTo('/admin')
  }
})
