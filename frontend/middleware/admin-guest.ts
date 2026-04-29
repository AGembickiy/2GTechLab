export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated, hydrate } = useAdminAuth()
  hydrate()
  if (isAuthenticated.value) {
    return navigateTo('/admin')
  }
})
