<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-100">Загрузить 3D модель</h2>
        <UButton color="primary" @click="handleFileSelect">
          Выбрать файл
        </UButton>
      </div>

      <div
        v-if="!file"
        class="mt-4 rounded-lg border-2 border-dashed border-slate-700 bg-slate-950/30 p-8 text-center"
      >
        <UIcon name="i-heroicons-cloud-arrow-up" class="mx-auto h-12 w-12 text-slate-500" />
        <p class="mt-2 text-sm text-slate-400">
          Перетащите файл сюда или нажмите "Выбрать файл"
        </p>
        <p class="text-xs text-slate-500">
          Поддерживаемые форматы: STL, OBJ, 3MF, GLB
        </p>
      </div>

      <div v-else class="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-document" class="h-6 w-6 text-cyan-400" />
            <div>
              <p class="font-semibold text-slate-200">{{ file.name }}</p>
              <p class="text-sm text-slate-400">{{ formatSize(file.size) }}</p>
            </div>
          </div>
          <UButton color="red" variant="soft" @click="file = null">
            Удалить
          </UButton>
        </div>
      </div>

      <div v-if="file" class="mt-6 space-y-4">
        <div>
          <label class="mb-2 block text-xs font-semibold text-slate-200">Тип загрузки</label>
          <URadioGroup
            v-model="uploadKind"
            :options="[
              { label: '3D модель', value: 'model' },
              { label: 'Эскиз (с размерами)', value: 'sketch' },
            ]"
          />
        </div>

        <div v-if="uploadKind === 'sketch'" class="grid gap-4 sm:grid-cols-3">
          <div>
            <label class="mb-2 block text-xs font-semibold text-slate-200">Ширина (мм)</label>
            <UInput v-model="sketchWidth" type="number" step="0.1" />
          </div>
          <div>
            <label class="mb-2 block text-xs font-semibold text-slate-200">Высота (мм)</label>
            <UInput v-model="sketchHeight" type="number" step="0.1" />
          </div>
          <div>
            <label class="mb-2 block text-xs font-semibold text-slate-200">Толщина (мм)</label>
            <UInput v-model="sketchThickness" type="number" step="0.1" />
          </div>
        </div>

        <UButton
          block
          color="primary"
          :loading="submitting"
          @click="submitUpload"
        >
          Загрузить и рассчитать
        </UButton>
      </div>

      <div v-if="loading" class="mt-6 text-center">
        <p class="text-sm text-slate-400">Загрузка и обработка модели…</p>
      </div>

      <div v-if="uploadResult" class="mt-6 rounded-lg border border-slate-800 bg-slate-950/30 p-4">
        <h3 class="font-semibold text-slate-200">Результат</h3>
        <div class="mt-2 space-y-2 text-sm text-slate-300">
          <p>Время печати: {{ uploadResult.estimated_print_time_minutes }} мин</p>
          <p>Материал: {{ formatCurrency(uploadResult.material_cost) }}</p>
          <p>Общая цена: {{ formatCurrency(uploadResult.total_cost) }}</p>
        </div>
      </div>

      <div v-if="error" class="mt-4 text-sm text-rose-400">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PrintJobService } from '@/services/printJobService'

definePageMeta({
  layout: 'client',
  middleware: 'auth-check',
})

const file = ref<File | null>(null)
const uploadKind = ref<'model' | 'sketch'>('model')
const sketchWidth = ref<number | ''>('')
const sketchHeight = ref<number | ''>('')
const sketchThickness = ref<number | ''>('')
const submitting = ref(false)
const loading = ref(false)
const uploadResult = ref<any>(null)
const error = ref<string | null>(null)

const printJobService = new PrintJobService()

function handleFileSelect() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.stl,.obj,.3mf,.glb'
  input.onchange = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files[0]) {
      file.value = target.files[0]
      error.value = null
    }
  }
  input.click()
}

function formatSize(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
  }).format(amount)
}

async function submitUpload() {
  if (!file.value) {
    error.value = 'Выберите файл для загрузки'
    return
  }

  submitting.value = true
  loading.value = true
  error.value = null
  uploadResult.value = null

  try {
    const response = await printJobService.createPrintJob(file.value, uploadKind.value)

    if (uploadKind.value === 'sketch') {
      await $fetch(`/api/v1/print_service/print-jobs/${response.id}/sketch/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${useAuthStore().accessToken}`,
        },
        body: {
          width_mm: Number(sketchWidth.value),
          height_mm: Number(sketchHeight.value),
          thickness_mm: Number(sketchThickness.value),
        },
      })
    }

    uploadResult.value = response
  } catch (err: any) {
    error.value = err.message || 'Ошибка загрузки'
  } finally {
    submitting.value = false
    loading.value = false
  }
}
</script>
