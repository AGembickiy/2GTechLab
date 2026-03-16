import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  app: {
    head: {
      title: '2GTECHLAB — Платформа 3D‑печати'
    }
  },
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true
  }
});

