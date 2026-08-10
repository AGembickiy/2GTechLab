import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        graphite: '#111827',
        titanium: '#1f2937',
        electric: '#3b82f6',
        cyantech: '#06b6d4',
      }
    }
  },
  plugins: []
} satisfies Config
