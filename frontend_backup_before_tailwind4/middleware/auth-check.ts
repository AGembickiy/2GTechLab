/**
 * Проверка аутентификации и прав доступа
 */
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/constants/roles'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo({ path: '/auth/login', query: { redirect: to.fullPath } })
  }

  // Redirect to dashboard based on role
  if (to.path === '/dashboard') {
    switch (authStore.userRole) {
      case ROLES.ADMIN:
        return navigateTo('/admin')
      case ROLES.MANAGER:
        return navigateTo('/manager')
      case ROLES.CLIENT:
        return navigateTo('/client')
      case ROLES.PARTNER:
        return navigateTo('/partner')
      default:
        return navigateTo('/')
    }
  }

  // Check if user has access to this route based on role
  const allowedRoutes: Record<string, string[]> = {
    '/admin': [ROLES.ADMIN],
    '/admin/*': [ROLES.ADMIN],
    '/manager': [ROLES.MANAGER, ROLES.ADMIN],
    '/manager/*': [ROLES.MANAGER, ROLES.ADMIN],
    '/client': [ROLES.CLIENT, ROLES.PARTNER],
    '/client/*': [ROLES.CLIENT, ROLES.PARTNER],
    '/partner': [ROLES.PARTNER, ROLES.CLIENT],
    '/partner/*': [ROLES.PARTNER, ROLES.CLIENT],
  }

  for (const [route, roles] of Object.entries(allowedRoutes)) {
    if (route.endsWith('/*')) {
      const baseRoute = route.slice(0, -2)
      if (to.path.startsWith(baseRoute) && roles.includes(authStore.userRole)) {
        return
      }
    } else if (to.path === route && roles.includes(authStore.userRole)) {
      return
    }
  }

  // If no match, redirect to user's default dashboard
  switch (authStore.userRole) {
    case ROLES.ADMIN:
      return navigateTo('/admin')
    case ROLES.MANAGER:
      return navigateTo('/manager')
    case ROLES.CLIENT:
      return navigateTo('/client')
    case ROLES.PARTNER:
      return navigateTo('/partner')
    default:
      return navigateTo('/')
  }
})
