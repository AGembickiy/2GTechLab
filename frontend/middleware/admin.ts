export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, hydrate } = useAdminAuth()
  hydrate()
  if (!isAuthenticated.value) {
    const redirect =
      to.path.startsWith('/admin') && to.path !== '/login'
        ? { redirect: to.fullPath }
        : undefined
    return navigateTo({ path: '/login', query: redirect })
  }
})
