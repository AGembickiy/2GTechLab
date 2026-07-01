export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,
  app: {
    buildAssetsDir: '_nuxt', // Сохраняем привычный путь к статике
  },
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
    layouts: 'layouts',
    middleware: 'middleware',
    pages: 'pages',
    plugins: 'plugins',
  },
  components: [
    {
      path: '~/components/ui',
      prefix: 'Ui',
    },
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  typescript: {
    strict: true
  },
  nitro: {
    devProxy: {
      '/api/': {
        target: 'http://127.0.0.1:8000/api/',
        changeOrigin: true,
        prependPath: true
      },
      '/api/v1/': {
        target: 'http://127.0.0.1:8000/api/v1/',
        changeOrigin: true,
        prependPath: true
      }
    }
  },
  tailwindcss: {
    configPath: '~/tailwind.config.ts'
  }
})
