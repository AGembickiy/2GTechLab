import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  app: {
    buildAssetsDir: '_nuxt', // Сохраняем привычный путь к статике
  },
  css: [
    '~/assets/css/main.css',
  ],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
    },
  },
  modules: [
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
      path: '~/components/common',
      pathPrefix: false,
    },
    {
      path: '~/components/ui',
      pathPrefix: false,
    },
    {
      path: '~/components/order',
      pathPrefix: false,
    },
    {
      path: '~/components/printers',
      pathPrefix: false,
    },
    {
      path: '~/components/three',
      pathPrefix: false,
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
  // Исключаем backend от сканирования Nuxt
  experimental: {
    typedPages: true
  },
  vite: {
  plugins: [
    tailwindcss()
  ],
  resolve: {
    noExternal: ['vue', '@vueuse/core']
  },
  optimizeDeps: {
    exclude: ['vue-demi']
  }
}
})
