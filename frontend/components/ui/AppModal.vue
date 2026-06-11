<script setup lang="ts">
defineProps<{
  modelValue?: boolean
  title?: string
  cancelText?: string
  confirmText?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const isOpen = computed({
  get: () => props.modelValue ?? false,
  set: (val) => emit('update:modelValue', val)
})

function handleBackdropClick() {
  emit('cancel')
  isOpen.value = false
}

function handleConfirm() {
  emit('confirm')
  isOpen.value = false
}

function handleCancel() {
  emit('cancel')
  isOpen.value = false
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      @click.stop="handleBackdropClick"
    >
      <div
        class="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl"
        @click.stop
      >
        <slot name="header">
          <h3 class="text-xl font-bold text-white mb-4">
            {{ title }}
          </h3>
        </slot>
        
        <slot />
        
        <div class="mt-6 flex justify-end gap-3">
          <AppButton variant="secondary" @click="handleCancel">
            {{ cancelText || 'Отмена' }}
          </AppButton>
          <AppButton @click="handleConfirm">
            {{ confirmText || 'OK' }}
          </AppButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
