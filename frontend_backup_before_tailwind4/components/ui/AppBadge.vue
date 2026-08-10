<script setup lang="ts">
defineProps<{
  variant?: 'success' | 'warning' | 'error' | 'info' | 'primary'
  text: string
}>()

const variants = {
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  primary: 'bg-blue-600 text-white border-blue-600',
}
</script>

<template>
  <span
    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
    :class="variants[variant || 'primary']"
  >
    {{ text }}
  </span>
</template>
