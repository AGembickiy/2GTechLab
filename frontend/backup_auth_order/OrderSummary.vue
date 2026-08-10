<script setup lang="ts">
const { form, derived } = useOrderForm();
const { currentProject, uploadStatus } = useUploadModel();

function submitOrder() {
  // пока без API
}

const materialUsageText = computed(() => `${derived.materialUsageGrams.value} г`);

const printTimeText = computed(() => `${derived.printTimeHours.value} ч`);

const materialText = computed(() => {
  const materials: Record<string, string> = {
    pla: 'PLA',
    petg: 'PETG',
    abs: 'ABS',
    tpu: 'TPU',
  };

  return materials[form.material] ?? 'Не выбран';
});
</script>

<template>
  <aside class="lg:sticky lg:top-24">
    <div
      class="rounded-2xl border border-slate-800/70 bg-slate-900/35 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.55)]"
    >

      <div>
        <h2 class="text-sm font-semibold text-white">
          Предварительный расчёт
        </h2>

        <p class="mt-1 text-xs text-slate-400">
          Стоимость и срок по текущим параметрам.
        </p>
      </div>


      <div
        v-if="currentProject"
        class="mt-4 rounded-xl border border-blue-700/40 bg-blue-900/20 p-3 text-sm"
      >
        <div class="flex justify-between gap-3">
          <span class="text-slate-400">
            Проект
          </span>

          <span class="text-right text-slate-100">
            {{ currentProject.originalFileName }}
          </span>
        </div>


        <div class="mt-2 flex justify-between gap-3">
          <span class="text-slate-400">
            Статус
          </span>

          <span class="font-semibold text-sky-300">
            {{ uploadStatus }}
          </span>
        </div>


        <div
          v-if="currentProject.convertedFileName"
          class="mt-2 flex justify-between gap-3"
        >
          <span class="text-slate-400">
            Конвертирован
          </span>

          <span class="text-right text-green-300">
            {{ currentProject.convertedFileName }}
          </span>
        </div>
      </div>



      <div
        class="mt-4 rounded-xl border border-slate-800/70 bg-slate-950/25 p-4 text-sm"
      >

        <div class="flex justify-between gap-3">
          <span class="text-slate-400">
            Материал
          </span>

          <ClientOnly>
            <span class="text-slate-100">
              {{ materialText }}
            </span>

            <template #fallback>
              <span class="text-slate-100">
                —
              </span>
            </template>
          </ClientOnly>
        </div>



        <div class="mt-2 flex justify-between gap-3">
          <span class="text-slate-400">
            Вес детали
          </span>

          <ClientOnly>
            <span class="text-slate-100">
              {{ materialUsageText }}
            </span>

            <template #fallback>
              <span class="text-slate-100">
                —
              </span>
            </template>
          </ClientOnly>
        </div>



        <div class="mt-2 flex justify-between gap-3">
          <span class="text-slate-400">
            Время печати
          </span>

          <ClientOnly>
            <span class="text-slate-100">
              {{ printTimeText }}
            </span>

            <template #fallback>
              <span class="text-slate-100">
                —
              </span>
            </template>
          </ClientOnly>
        </div>



        <div class="mt-2 flex justify-between gap-3">
          <span class="text-slate-400">
            Доп. обработка
          </span>

          <ClientOnly>
            <span class="text-right text-slate-100">
              {{ derived.postProcessingText }}
            </span>

            <template #fallback>
              <span class="text-slate-100">
                Не выбрано
              </span>
            </template>
          </ClientOnly>
        </div>

      </div>



      <div
        class="mt-5 rounded-xl border border-slate-800/70 bg-slate-950/25 p-4"
      >

        <div class="flex items-end justify-between gap-3">

          <span class="text-sm text-slate-400">
            Итоговая цена
          </span>


          <ClientOnly>
            <span class="text-2xl font-extrabold tracking-tight text-white">
              {{ derived.totalPriceText }}
            </span>

            <template #fallback>
              <span class="text-2xl font-extrabold tracking-tight text-white">
                —
              </span>
            </template>
          </ClientOnly>

        </div>


        <p class="mt-2 text-xs text-slate-400">
          Окончательная стоимость может отличаться после проверки модели и уточнения деталей.
        </p>

      </div>



      <button
        type="button"
        class="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(37,99,235,0.30)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="!derived.canSubmit"
        @click="submitOrder"
      >
        Оформить заказ
      </button>

    </div>



    <div
      class="mt-4 rounded-2xl border border-slate-800/70 bg-slate-900/25 p-4 text-xs text-slate-400"
    >

      <div class="font-semibold text-slate-200">
        Как считается стоимость
      </div>


      <p class="mt-2">
        Расчёт учитывает примерный вес модели,
        выбранный материал, качество печати и количество экземпляров.
      </p>


      <p class="mt-2">
        После проверки модели будет выполнен точный расчёт
        с учётом параметров оборудования.
      </p>

    </div>

  </aside>
</template>