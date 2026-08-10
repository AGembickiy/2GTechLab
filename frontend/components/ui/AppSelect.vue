<script setup lang="ts">
interface Option {
  value: string | number
  label: string
}

interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  options?: Option[]
  error?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
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
    <div class="relative">
      <select
        v-model="value"
        class="
          w-full
          rounded-lg
          bg-slate-800/50
          border
          px-4 py-3
          pr-10
          outline-none
          appearance-none
          transition-all
          focus:border-blue-500 focus:ring-1 focus:ring-blue-500
        "
        :class="error ? 'border-red-500' : 'border-slate-700'"
      >
        <option v-if="placeholder" value="" disabled>
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          class="w-5 h-5 text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
    <p v-if="error" class="text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>
