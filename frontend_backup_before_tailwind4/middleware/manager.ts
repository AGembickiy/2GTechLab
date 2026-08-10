/**
 * Маршруты менеджера
 */
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/constants/roles'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (authStore.userRole !== ROLES.MANAGER) {
    return navigateTo('/')
  }
})
