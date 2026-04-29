export default defineNuxtPlugin(() => {
  const { hydrate } = useAdminAuth()
  hydrate()
})
