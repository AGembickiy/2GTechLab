<script setup lang="ts">
defineProps<{
  variant?: 'success' | 'warning' | 'error' | 'info'
  title?: string
  message?: string
  closable?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const variants = {
  success: 'bg-green-500/10 border-green-500/20 text-green-400',
  warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  error: 'bg-red-500/10 border-red-500/20 text-red-400',
  info: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
}

const show = ref(true)

function handleClose() {
  emit('close')
  show.value = false
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="
        rounded-xl
        border
        px-6 py-4
        flex
        items-start
        gap-4
        backdrop-blur-sm
      "
      :class="variants[variant || 'info']"
    >
      <div class="mt-1">
        <svg
          v-if="variant === 'success'"
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <svg
          v-else-if="variant === 'warning'"
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <svg
          v-else-if="variant === 'error'"
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <svg
          v-else
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div class="flex-1">
        <h3
          v-if="title"
          class="font-bold mb-1"
        >
          {{ title }}
        </h3>
        <p v-if="message" class="text-sm opacity-90">
          {{ message }}
        </p>
      </div>
      <button
        v-if="closable"
        @click="handleClose"
        class="opacity-70 hover:opacity-100 transition-opacity"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
