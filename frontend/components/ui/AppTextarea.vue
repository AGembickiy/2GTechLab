<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  rows?: number
  error?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const value = computed({
  get: () => props.modelValue ?? '',
  set: (val) => emit('update:modelValue', val)
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" class="text-sm font-medium text-slate-300">
      {{ label }}
    </label>
    <textarea
      v-model="value"
      :placeholder="placeholder"
      :rows="rows || 4"
      class="
        rounded-lg
        bg-slate-800/50
        border
        px-4 py-3
        resize-none
        outline-none
        transition-all
        placeholder:text-slate-600
        focus:border-blue-500 focus:ring-1 focus:ring-blue-500
      "
      :class="error ? 'border-red-500' : 'border-slate-700'"
    />
    <p v-if="error" class="text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>
