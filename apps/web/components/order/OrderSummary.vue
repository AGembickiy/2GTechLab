<script setup lang="ts">
const { derived, form } = useOrderForm();

function submitOrder() {
  // пока без API — просто демо
}

const materialUsageText = computed(() => `${derived.materialUsageGrams.value} г`);
const printTimeText = computed(() => `${derived.printTimeHours.value} ч`);
</script>

<template>
  <aside class="lg:sticky lg:top-24">
    <div class="rounded-2xl border border-slate-800/70 bg-slate-900/35 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.55)]">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-sm font-semibold">Предварительный расчёт</h2>
          <p class="mt-1 text-xs text-slate-400">Стоимость и срок по текущим параметрам.</p>
        </div>
      </div>

      <div class="mt-4 rounded-xl border border-slate-800/70 bg-slate-950/25 p-4 text-sm">
        <div class="flex justify-between gap-3">
          <span class="text-slate-400">Расход материала</span>
          <span class="text-slate-100">{{ materialUsageText }}</span>
        </div>
        <div class="mt-2 flex justify-between gap-3">
          <span class="text-slate-400">Время печати</span>
          <span class="text-slate-100">{{ printTimeText }}</span>
        </div>
        <div class="mt-2 flex justify-between gap-3">
          <span class="text-slate-400">Доп. обработка</span>
          <span class="text-slate-100">{{ derived.postProcessingText }}</span>
        </div>
      </div>

      <div class="mt-4">
        <div class="flex items-end justify-between gap-3">
          <span class="text-sm text-slate-400">Итого</span>
          <span class="text-2xl font-extrabold tracking-tight text-slate-100">{{ derived.totalPriceText }}</span>
        </div>
        <p class="mt-2 text-xs text-slate-400">
          Окончательная стоимость может отличаться после проверки модели и уточнения деталей.
        </p>
      </div>

      <button
        type="button"
        class="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(37,99,235,0.30)] transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="!derived.canSubmit"
        @click="submitOrder"
      >
        Оформить заказ
      </button>
    </div>

    <div class="mt-4 rounded-2xl border border-slate-800/70 bg-slate-900/25 p-4 text-xs text-slate-400">
      <div class="font-semibold text-slate-200">Как считается стоимость</div>
      <p class="mt-2">
        На этом этапе используется упрощённый алгоритм: учёт примерного веса, выбранного материала, качества печати и
        числа экземпляров.
      </p>
      <p class="mt-2">
        В продакшене здесь будет точный расчёт на сервере с учётом ваших принтеров, скоростей и тарифов.
      </p>
    </div>
  </aside>
</template>

