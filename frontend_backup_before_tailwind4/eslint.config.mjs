import pluginVue from 'eslint-plugin-vue'
import stylistic from '@stylistic/eslint-plugin'

export default [
  ...pluginVue.configs['flat/recommended'],
  {
    ignores: [
      '**/.nuxt/**',
      '**/.output/**',
      'node_modules',
      'dist',
      'logs',
      'coverage',
      '.git',
      '**/node_modules/**'
    ],
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      'no-console': ['warn', { 'allow': ['error'] }],
      'no-debugger': 'warn',
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/quotes': ['warn', 'single'],
      '@stylistic/comma-dangle': ['warn', 'always-multiline'],
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off'
    }
  }
]
