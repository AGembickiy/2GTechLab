<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
      <h2 class="text-lg font-bold text-slate-100">Оборудование</h2>
      <div v-if="pending" class="mt-4 text-sm text-slate-400">Загрузка…</div>
      <div v-else-if="error" class="mt-4 text-sm text-rose-400">Не удалось загрузить оборудование.</div>
      <div v-else class="mt-4 grid gap-4 sm:grid-cols-2">
        <div
          v-for="printer in printers"
          :key="printer.id"
          :class="
            printer.status === 'maintenance'
              ? 'rounded-lg border border-red-800/60 bg-red-950/20 p-4'
              : printer.status === 'printing'
                ? 'rounded-lg border border-yellow-800/60 bg-yellow-950/20 p-4'
                : 'rounded-lg border border-slate-800/60 bg-slate-950/30 p-4'
          "
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold text-slate-200">{{ printer.name }}</p>
              <p class="text-sm text-slate-400">Серийный номер: {{ printer.serial_number }}</p>
            </div>
            <div class="text-right">
              <p
                :class="
                  printer.status === 'idle'
                    ? 'text-green-400'
                    : printer.status === 'printing'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                "
              >
                {{ printerStatusLabels[printer.status] }}
              </p>
              <p class="text-xs text-slate-500">
                {{ printer.technology }} • {{ printer.get_build_volume() }}
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
  layout: 'manager',
  middleware: 'auth-check',
})

const route = useRoute()
const router = useRouter()

const printers = ref([])

const printerStatusLabels: Record<string, string> = {
  idle: 'Ожидание',
  printing: 'Печать',
  maintenance: 'Обслуживание',
}

async function loadPrinters() {
  // TODO: Загрузка оборудования менеджера
}

onMounted(() => {
  loadPrinters()
})
</script>
