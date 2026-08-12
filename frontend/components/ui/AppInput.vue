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
  set: (val) => emit('update:modelValue', val),
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <label
      v-if="label"
      class="text-sm font-medium text-slate-300"
    >
      {{ label }}
    </label>

    <input
      v-model="value"
      :type="type || 'text'"
      :placeholder="placeholder"
      class="input-ui"
      :class="error ? 'border-red-500 focus:border-red-500' : ''"
    />

    <p
      v-if="error"
      class="text-xs text-red-400"
    >
      {{ error }}
    </p>
  </div>
</template>
