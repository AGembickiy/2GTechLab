export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,

    onRequest({ options }) {
      const auth = useAuthStore()

      options.headers = new Headers(options.headers)

      options.headers.set('Accept', 'application/json')

      const token = auth.accessToken

      if (token) {
        options.headers.set('Authorization', `Bearer ${token}`)
      }
    },

    async onResponseError({ response }) {
      if (response.status === 401) {
        const auth = useAuthStore()
        auth.logout()

        await navigateTo('/auth/login')
      }
    },
  })

  return {
    provide: {
      api,
    },
  }
})