<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const sizes = {
  sm: {
    box: 'h-8 w-8 rounded-xl',
    svg: 'inset-[5px] h-[22px] w-[22px]',
    glow: 'shadow-[0_0_22px_rgba(99,102,241,0.24)]',
  },
  md: {
    box: 'h-11 w-11 rounded-2xl',
    svg: 'inset-[7px] h-[30px] w-[30px]',
    glow: 'shadow-[0_0_35px_rgba(99,102,241,0.32)]',
  },
} as const

const current = sizes[props.size]
</script>

<template>
  <div
    class="group relative shrink-0 flex items-center justify-center overflow-hidden border border-indigo-400/20 bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-400"
    :class="[current.box, current.glow]"
  >
    <svg
      viewBox="0 0 44 44"
      class="absolute"
      :class="current.svg"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 14.5 22 7l13 7.5L22 22 9 14.5Z"
        class="stroke-white/80"
        stroke-width="1.5"
        stroke-linejoin="round"
      />

      <path
        d="M9 22.5 22 30l13-7.5"
        class="stroke-white/45"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <path
        d="M9 29.5 22 37l13-7.5"
        class="stroke-white/25"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <path
        d="M22 7v15"
        class="stroke-white/70"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>



    <span
      v-if="current.dot"
      class="absolute bottom-[5px] left-1/2 z-10 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-200 shadow-[0_0_8px_rgba(103,232,249,0.9)]"
    />
  </div>
</template>
