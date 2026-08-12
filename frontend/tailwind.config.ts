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
        graphite: '#1f2937',
        titanium: '#6b7280',
        black: '#000000',

        primary: '#4f46e5',
        'primary-hover': '#4338ca',
        'primary-soft': 'rgba(79, 70, 229, 0.12)',

        electric: '#6366f1',
        cyantech: '#06b6d4',

        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',

        text: '#f8fafc',
        'text-soft': '#cbd5e1',
        'text-muted': '#94a3b8',

        border: 'rgba(255, 255, 255, 0.08)',
        'border-soft': 'rgba(255, 255, 255, 0.06)',
        'border-strong': 'rgba(255, 255, 255, 0.12)',
      },
    },
  },

  plugins: [],
} satisfies Config