<script setup lang="ts">
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  loading?: boolean
  to?: string
  type?: 'button' | 'submit' | 'reset'
  color?: string
}

const props = defineProps<ButtonProps>()

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-3 text-sm',
  lg: 'px-6 py-4 text-lg',
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-300'

const variants = {
  primary:
    'bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-950/30 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl hover:shadow-indigo-900/30',
  secondary:
    'border border-white/10 bg-white/5 text-slate-200 backdrop-blur-md hover:border-white/20 hover:bg-white/10 hover:text-white',
}

const blockClass = props.block ? 'w-full' : ''
const disabledClass = props.loading
  ? 'cursor-not-allowed opacity-70'
  : 'disabled:cursor-not-allowed disabled:opacity-50'

const buttonClasses = [
  baseClasses,
  variants[props.variant || 'primary'],
  sizes[props.size || 'md'],
  blockClass,
  disabledClass,
]
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="buttonClasses"
  >
    <slot />
  </NuxtLink>

  <button
    v-else
    :type="type || 'button'"
    :class="buttonClasses"
    :disabled="loading"
  >
    <slot />
  </button>
</template>
