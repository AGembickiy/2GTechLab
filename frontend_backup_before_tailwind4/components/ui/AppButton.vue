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
  md: 'px-5 py-3',
  lg: 'px-6 py-4 text-lg',
}

const baseClasses = 'rounded-xl transition-all duration-300 font-bold flex items-center justify-center gap-2'

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20',
  secondary: 'border border-blue-500/30 bg-transparent text-blue-400 hover:bg-blue-500/10',
}

const blockClass = props.block ? 'w-full' : ''
const disabledClass = props.loading ? 'opacity-70 cursor-not-allowed' : ''

const buttonClasses = [
  baseClasses,
  variants[props.variant || 'primary'],
  sizes[props.size || 'md'],
  blockClass,
  disabledClass,
]
</script>

<template>
  <component
    :is="to ? 'NuxtLink' : 'button'"
    v-if="!to"
    :type="type || 'button'"
    :class="buttonClasses"
    :disabled="loading"
  >
    <slot />
  </component>
  <NuxtLink
    v-else
    :to="to"
    :class="buttonClasses"
  >
    <slot />
  </NuxtLink>
</template>
