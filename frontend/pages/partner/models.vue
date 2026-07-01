<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
      <h2 class="text-lg font-bold text-slate-100">Модели</h2>
      <div v-if="pending" class="mt-4 text-sm text-slate-400">Загрузка…</div>
      <div v-else-if="error" class="mt-4 text-sm text-rose-400">Не удалось загрузить модели.</div>
      <div v-else-if="models.length === 0" class="mt-4 text-sm text-slate-400">
        У вас пока нет моделей.
      </div>
      <div v-else class="mt-4 space-y-3">
        <div
          v-for="model in models"
          :key="model.id"
          class="rounded-lg border border-slate-800/60 bg-slate-950/30 p-4"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold text-slate-200">{{ model.name }}</p>
              <p class="text-sm text-slate-400">ID: {{ model.id }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-slate-300">{{ model.downloads }} загрузок</p>
              <p class="font-bold text-cyan-400">
                {{ formatCurrency(model.royalty) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'partner',
  middleware: 'auth-check',
})

const route = useRoute()
const router = useRouter()

const models = ref([])

async function loadModels() {
  // TODO: Загрузка моделей партнера
}

onMounted(() => {
  loadModels()
})

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
  }).format(amount)
}
</script>
