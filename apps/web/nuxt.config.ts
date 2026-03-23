import { defineNuxtConfig } from 'nuxt/config';
import { fileURLToPath } from 'node:url';

export default defineNuxtConfig({
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      /** Django REST API (print pipeline) */
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000/api',
      /** Прямой WebSocket Moonraker (опционально). Если пусто — только опрос через Django. */
      moonrakerWsUrl: process.env.NUXT_PUBLIC_MOONRAKER_WS_URL || '',
    },
  },

  css: ['~/assets/css/main.css'],

  modules: ['@nuxtjs/tailwindcss', '@nuxt/ui'],

  vite: {
    resolve: {
      alias: {
        '#app-manifest': fileURLToPath(new URL('./app-manifest', import.meta.url)),
      },
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.cjs',
    exposeConfig: true,
  },

  app: {
    head: {
      title: '2GTechLab'
    }
  },

  typescript: {
    strict: true
  }
});

