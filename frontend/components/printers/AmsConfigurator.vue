<script setup lang="ts">
interface Material {
  id: number
  name: string
  color: string
  type: string
}

const props = defineProps<{
  modelValue: number[]
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const materials = reactive<Material>([
  { id: 1, name: 'Bambu PLA Basic White', color: '#FFFFFF', type: 'PLA' },
  { id: 2, name: 'Bambu PLA Basic Black', color: '#1A1A1A', type: 'PLA' },
  { id: 3, name: 'Bambu PETG Orange', color: '#FF6600', type: 'PETG' },
  { id: 4, name: 'Bambu TPU 95A Blue', color: '#0088FF', type: 'TPU' }
])

const toggleSlot = (id: number) => {
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(id)
  if (index > -1) {
    newValue.splice(index, 1)
  } else if (newValue.length < 4) {
    newValue.push(id)
  }
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<template>
  <div class="ams-configurator space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <UIcon name="i-heroicons-cube-transparent" />
        Конфигурация AMS Lite (A1 Combo)
      </h3>
      <span class="text-xs text-gray-500">{{ modelValue.length }}/4 слота</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div 
        v-for="m in materials" 
        :key="m.id"
        @click="toggleSlot(m.id)"
        :class="[
          'relative flex items-center p-3 border rounded-xl cursor-pointer transition-all duration-200',
          modelValue.includes(m.id) 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500' 
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
        ]"
      >
        <div 
          class="w-8 h-8 rounded-full border shadow-sm mr-3 flex-shrink-0" 
          :style="{ backgroundColor: m.color }"
        ></div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">{{ m.name }}</p>
          <p class="text-xs text-gray-500">{{ m.type }}</p>
        </div>
        <div v-if="modelValue.includes(m.id)" class="absolute top-2 right-2">
          <UIcon name="i-heroicons-check-circle-20-solid" class="text-primary-500 w-5 h-5" />
        </div>
      </div>
    </div>

    <UAlert
      v-if="modelValue.length === 0"
      icon="i-heroicons-information-circle"
      color="orange"
      variant="soft"
      title="Внимание"
      description="Выберите хотя бы один материал для печати."
    />
  </div>
</template>
