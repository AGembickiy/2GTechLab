<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}>()

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-3',
  lg: 'px-6 py-4 text-lg',
}
</script>

<template>
  <button
    class="rounded-xl transition-all duration-300 font-bold"
    :class="[
      variant === 'secondary' 
        ? 'border border-blue-500/30 bg-transparent text-blue-400 hover:bg-blue-500/10' 
        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20',
      sizes[size || 'md']
    ]"
  >
    <slot />
  </button>
</template>
