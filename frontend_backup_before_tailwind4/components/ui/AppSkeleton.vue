<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'card' | 'button'
  width?: string
  height?: string
}>()

const variants = {
  default: 'bg-slate-800/50',
  card: 'rounded-2xl bg-white/5 border border-white/10',
  button: 'rounded-lg bg-slate-700',
}

const widths = {
  default: 'w-full',
  card: 'w-full h-48',
  button: 'w-12 h-12',
}

const heights = {
  default: 'h-4',
  card: '',
  button: '',
}
</script>

<template>
  <div
    class="animate-pulse"
    :class="[
      variants[variant || 'default'],
      widths[variant || 'default'],
      heights[variant || 'default']
    ]"
    :style="{ height: height || undefined, width: width || undefined }"
  />
</template>
