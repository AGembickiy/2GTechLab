<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
      <h2 class="text-lg font-bold text-slate-100">Роялти</h2>
      <div v-if="pending" class="mt-4 text-sm text-slate-400">Загрузка…</div>
      <div v-else-if="error" class="mt-4 text-sm text-rose-400">Не удалось загрузить роялти.</div>
      <div v-else class="mt-4 space-y-4">
        <div
          v-for="royalty in royalties"
          :key="royalty.id"
          class="rounded-lg border border-slate-800/60 bg-slate-950/30 p-4"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold text-slate-200">Модель #{{ royalty.model_id }}</p>
              <p class="text-sm text-slate-400">{{ formatDate(royalty.created_at) }}</p>
            </div>
            <div class="font-bold text-green-400">
              +{{ formatCurrency(royalty.amount) }}
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

const royalties = ref([])

async function loadRoyalties() {
  // TODO: Загрузка роялти партнера
}

onMounted(() => {
  loadRoyalties()
})

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
  }).format(amount)
}
</script>
