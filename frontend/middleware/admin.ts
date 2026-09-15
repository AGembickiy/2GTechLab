/**
 * Admin middleware - только для авторизованных админов
 */
import { useAuthStore } from '@/stores/auth';
import { ROLES } from '@/constants/roles';

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    return navigateTo({ path: '/auth/login', query: { redirect: to.fullPath } });
  }

  if (authStore.getUserRole !== ROLES.ADMIN) {
    return navigateTo('/');
  }
});
