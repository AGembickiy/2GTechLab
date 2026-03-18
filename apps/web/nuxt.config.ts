import { defineNuxtConfig } from 'nuxt/config';
import { fileURLToPath } from 'node:url';

export default defineNuxtConfig({
  devtools: { enabled: true },

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

