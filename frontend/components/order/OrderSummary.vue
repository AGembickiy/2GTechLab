<script setup lang="ts">
import { computed, ref } from 'vue';

import { orderService } from '~/services/orderService';
import { useAuthStore } from '~/stores/auth';

const { form, derived } = useOrderForm();
const authStore = useAuthStore();

const materialUsageText = computed(
  () => `${derived.materialUsageGrams.value} г`,
);

const printTimeText = computed(
  () => `${derived.printTimeHours.value} ч`,
);

const submitting = ref(false);
const submitError = ref('');
const submittedOrder = ref<{ id: number; status: string } | null>(null);

async function submitOrder() {
  if (!derived.canSubmit.value || submitting.value) {
    return;
  }

  if (!authStore.isAuthenticated) {
    await navigateTo({
      path: '/auth/register',
      query: { redirect: '/order' },
    });
    return;
  }

  submitting.value = true;
  submitError.value = '';
  submittedOrder.value = null;

  try {
    const order = await orderService.createOrder({
      product_name: form.productName,
      copies: form.copies,
      material: form.material,
      color: form.color,
      quality: form.quality,
      print_type: form.printType,
      post_processing: form.postProcessing,
      comment: form.comment,
      name: form.name,
      phone: form.phone,
      email: form.email,
      delivery_address: form.deliveryAddress,
      file_name: form.file?.name ?? '',
    });

    const parameters = {
      product_name: form.productName,
      copies: form.copies,
      material: form.material,
      color: form.color,
      quality: form.quality,
      print_type: form.printType,
      post_processing: form.postProcessing,
      comment: form.comment,
      material_usage_grams: derived.materialUsageGrams.value,
      print_time_hours: derived.printTimeHours.value,
      total_price: derived.totalPriceRub.value,
      original_file_name: form.originalFile?.name ?? '',
      file_name: form.file?.name ?? '',
    };

    const orderWithParameters = await orderService.createOrderParameters(
      order.id,
      parameters,
    );

    const submitted = await orderService.submitOrder(
      orderWithParameters.id,
    );

    submittedOrder.value = {
      id: submitted.id,
      status: submitted.status,
    };

    form.step = 1;
  } catch (error: unknown) {
    submitError.value =
      error instanceof Error
        ? error.message
        : 'Не удалось оформить заказ.';
  } finally {
    submitting.value = false;
  }
}

</script>

<template>
  <aside class="space-y-4">
    <div
      class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl"
    >
      <div class="border-b border-white/[0.06] px-5 py-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p
              class="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-400"
            >
              Ваш заказ
            </p>

            <h2 class="text-lg font-bold tracking-tight text-white">
              Предварительный расчёт
            </h2>

            <p class="mt-1.5 text-xs leading-relaxed text-slate-500">
              Стоимость и срок по текущим параметрам заказа.
            </p>
          </div>

          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 text-white shadow-[0_0_22px_rgba(99,102,241,0.2)]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="h-5 w-5"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 2.75h9l3 3v15.5H6V2.75Z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 2.75v3h3M9 10h6M9 13.5h6M9 17h3"
              />
            </svg>
          </div>
        </div>
      </div>

      <div class="px-5 py-5">
        <div class="divide-y divide-white/[0.06]">
          <div
            class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  class="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m4 7.5 8 4.5 8-4.5M12 12v9"
                  />
                </svg>
              </div>

              <span class="text-sm text-slate-400">
                Расход материала
              </span>
            </div>

            <span class="shrink-0 text-sm font-bold text-slate-100">
              {{ materialUsageText }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-4 py-3">
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  class="h-4 w-4"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="8.5"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 7v5l3 2"
                  />
                </svg>
              </div>

              <span class="text-sm text-slate-400">
                Время печати
              </span>
            </div>

            <span class="shrink-0 text-sm font-bold text-slate-100">
              {{ printTimeText }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-4 py-3">
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  class="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M14.5 4.5a4.5 4.5 0 0 0-5.8 5.8L4 15v5h5l4.7-4.7a4.5 4.5 0 0 0 5.8-5.8l-3 3-2.8-.7-.7-2.8 3-3Z"
                  />
                </svg>
              </div>

              <span class="text-sm text-slate-400">
                Доп. обработка
              </span>
            </div>

            <span
              class="max-w-[150px] text-right text-sm font-bold text-slate-100"
            >
              {{ derived.postProcessingText }}
            </span>
          </div>
        </div>
      </div>

      <div class="mx-5 border-t border-white/[0.06] pt-5">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p
              class="text-xs font-medium uppercase tracking-wider text-slate-500"
            >
              Итого
            </p>

            <p class="mt-1 text-sm text-slate-400">
              Предварительная стоимость
            </p>
          </div>

          <span class="text-3xl font-black tracking-tight text-white">
            {{ derived.totalPriceText }}
          </span>
        </div>

        <div class="mt-4 rounded-xl bg-amber-400/5 px-3.5 py-3">
          <div class="flex gap-2.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="mt-0.5 h-4 w-4 shrink-0 text-amber-400/80"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="8.5"
              />
              <path
                stroke-linecap="round"
                d="M12 10.5v5"
              />
              <path
                stroke-linecap="round"
                d="M12 7.5h.01"
              />
            </svg>

            <p class="text-[11px] leading-relaxed text-slate-500">
              Окончательная стоимость может отличаться после проверки
              модели и уточнения деталей.
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="submitError"
        class="mx-5 mt-5 rounded-xl border border-rose-500/20 bg-rose-950/20 px-3.5 py-3 text-xs leading-relaxed text-rose-200"
      >
        {{ submitError }}
      </div>

      <div
        v-if="submittedOrder"
        class="mx-5 mt-5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-3.5 py-3 text-xs leading-relaxed text-emerald-200"
      >
        Заказ №{{ submittedOrder.id }} успешно оформлен.
      </div>

      <div class="p-5">
        <button
          type="button"
          class="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl hover:shadow-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:brightness-100"
          :disabled="!derived.canSubmit || submitting"
          @click="submitOrder"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m5 12 4 4L19 6"
            />
          </svg>

          {{ submitting ? 'Оформление...' : 'Оформить заказ' }}
        </button>
      </div>
    </div>

    <div
      class="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800/60 text-slate-300"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            class="h-4 w-4"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="8.5"
            />
            <path
              stroke-linecap="round"
              d="M12 10.5v5"
            />
            <path
              stroke-linecap="round"
              d="M12 7.5h.01"
            />
          </svg>
        </div>

        <div>
          <div class="text-sm font-bold text-slate-200">
            Как считается стоимость
          </div>

          <div class="mt-0.5 text-[11px] text-slate-500">
            Текущий принцип расчёта
          </div>
        </div>
      </div>

      <div class="mt-4 space-y-3 text-xs leading-relaxed text-slate-500">
        <p>
          На этом этапе используется упрощённый алгоритм: учитываются
          примерный вес, выбранный материал, качество печати и количество
          экземпляров.
        </p>

        <p>
          В дальнейшем здесь будет точный расчёт на сервере с учётом
          принтеров, скоростей и тарифов.
        </p>
      </div>
    </div>
  </aside>
</template>
