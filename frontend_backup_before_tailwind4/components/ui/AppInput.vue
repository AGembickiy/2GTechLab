<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'number' | 'password'
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
    <input
      :type="type || 'text'"
      v-model="value"
      :placeholder="placeholder"
      class="
        rounded-lg
        bg-slate-800/50
        border
        px-4 py-3
        transition-all
        outline-none
        placeholder:text-slate-600
        focus:border-blue-500 focus:ring-1 focus:ring-blue-500
        disabled:opacity-50
      "
      :class="error ? 'border-red-500' : 'border-slate-700'"
    />
    <p v-if="error" class="text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>
