<template>
  <div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-3">
      <div
        v-for="card in summaryCards"
        :key="card.label"
        class="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4"
      >
        <p class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ card.label }}</p>
        <p class="mt-2 text-2xl font-bold text-slate-100">{{ card.value }}</p>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
      <h2 class="text-lg font-bold text-slate-100">Склад материалов</h2>
      <div v-if="pending" class="mt-4 text-sm text-slate-400">Загрузка…</div>
      <div v-else-if="error" class="mt-4 text-sm text-rose-400">Не удалось загрузить склад.</div>
      <div v-else class="mt-4 space-y-3">
        <div
          v-for="item in warehouse"
          :key="item.id"
          :class="
            item.quantity_in_stock <= item.min_threshold
              ? 'rounded-lg border border-red-800/60 bg-red-950/20 p-4'
              : 'rounded-lg border border-slate-800/60 bg-slate-950/30 p-4'
          "
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold text-slate-200">{{ item.name }}</p>
              <p class="text-sm text-slate-400">Артикул: {{ item.sku }}</p>
            </div>
            <div class="text-right">
              <p
                :class="
                  item.quantity_in_stock <= item.min_threshold
                    ? 'text-red-400 font-bold'
                    : 'text-slate-300'
                "
              >
                {{ item.quantity_in_stock }} шт.
              </p>
              <p
                :class="
                  item.quantity_in_stock <= item.min_threshold
                    ? 'text-xs text-red-300'
                    : 'text-xs text-slate-500'
                "
              >
                Минимум: {{ item.min_threshold }} шт.
              </p>
            </div>
          </div>
          <div v-if="item.quantity_in_stock <= item.min_threshold" class="mt-3">
            <UButton size="sm" color="red">
              Пополнить склад
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'manager',
  middleware: 'auth-check',
})

const route = useRoute()
const router = useRouter()

const warehouse = ref([])

const summaryCards = computed(() => [
  { label: 'Всего позиций', value: String(warehouse.value.length) },
  { label: 'Низкий остаток', value: String(warehouse.value.filter((i: any) => i.quantity_in_stock <= i.min_threshold).length) },
  { label: 'Общая цена', value: '0 ₽' },
])

async function loadWarehouse() {
  // TODO: Загрузка склада менеджера
}

onMounted(() => {
  loadWarehouse()
})
</script>
