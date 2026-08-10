/**
 * Role checker composable
 */
import { ROLES, ROLE_PERMISSIONS, type Role } from '@/constants/roles'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

export function useRoleChecker() {
  const authStore = useAuthStore()

  const hasRole = (role: Role) => {
    return authStore.userRole === role
  }

  const hasAnyRole = (roles: Role[]) => {
    return roles.includes(authStore.userRole as Role)
  }

  const hasPermission = (permission: string) => {
    const userPermissions = ROLE_PERMISSIONS[authStore.userRole as keyof typeof ROLE_PERMISSIONS]
    return userPermissions.includes(permission)
  }

  const hasAnyPermission = (permissions: string[]) => {
    const userPermissions = ROLE_PERMISSIONS[authStore.userRole as keyof typeof ROLE_PERMISSIONS]
    return permissions.some((p) => userPermissions.includes(p))
  }

  const isAdmin = () => hasRole(ROLES.ADMIN)
  const isManager = () => hasRole(ROLES.MANAGER)
  const isClient = () => hasRole(ROLES.CLIENT)
  const isPartner = () => hasRole(ROLES.PARTNER)

  return {
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    isAdmin,
    isManager,
    isClient,
    isPartner,
    userRole: computed(() => authStore.userRole),
    user: computed(() => authStore.user),
  }
}
