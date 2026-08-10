<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/70 backdrop-blur-sm"
          @click="close"
        />

        <!-- Container -->
        <div
          :class="fullscreen
            ? 'absolute inset-0'
            : 'absolute inset-0 flex items-center justify-center p-6'"
        >
          <div
            :class="fullscreen
              ? 'w-full h-full'
              : 'w-full max-w-4xl rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl'"
          >
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fullscreen: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function close() {
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  (value) => {
    if (typeof document === 'undefined') return

    if (value)
      document.body.style.overflow = 'hidden'
    else
      document.body.style.overflow = ''
  }
)

onUnmounted(() => {
  if (typeof document !== 'undefined')
    document.body.style.overflow = ''
})
</script>