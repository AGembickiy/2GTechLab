export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
    },
  },
  modules: [
    '@nuxt/ui',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxt/icon',
  ],
  dir: {
    assets: 'src/assets',
    layouts: 'layouts',
    middleware: 'middleware',
    pages: 'pages',
    plugins: 'plugins',
    public: 'public',
  },
  typescript: {
    strict: true
  },
  // Настройка прокси для API, чтобы избежать CORS ошибок
  nitro: {
    devProxy: {
      '/api/': {
        target: 'http://127.0.0.1:8000/api/',
        changeOrigin: true,
        prependPath: true
      }
    }
  }
})
