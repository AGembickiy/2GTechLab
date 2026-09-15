<script setup lang="ts">
const directions = [
  {
    title: '3D-печать',
    description:
      'Изготавливаем детали, корпуса, прототипы и готовые изделия из инженерных и декоративных материалов.',
    icon: 'cube',
  },
  {
    title: 'Прототипирование',
    description:
      'Помогаем быстро проверить конструкцию, посадки, эргономику и внешний вид изделия до запуска серии.',
    icon: 'layers',
  },
  {
    title: 'Цифровое производство',
    description:
      'Работаем с цифровыми моделями и переводим проект из CAD-среды в физическую деталь.',
    icon: 'processor',
  },
];

const advantages = [
  'Работаем с единичными изделиями и небольшими сериями',
  'Подбираем материал и параметры печати под задачу',
  'Используем 3D-предпросмотр перед изготовлением',
  'Сохраняем цифровую историю заказа и параметры модели',
];

const stages = [
  {
    number: '01',
    title: 'Загрузка модели',
    description: 'Загрузите STL, OBJ, GLB, 3MF или другой поддерживаемый формат.',
  },
  {
    number: '02',
    title: 'Настройка',
    description: 'Выберите материал, цвет, качество, количество и дополнительные операции.',
  },
  {
    number: '03',
    title: 'Производство',
    description: 'После подтверждения заказ передаётся на изготовление.',
  },
  {
    number: '04',
    title: 'Получение',
    description: 'Готовое изделие можно забрать или оформить доставку.',
  },
];
</script>

<template>
  <AppContainer class="py-12 md:py-16">
    <div class="mx-auto max-w-7xl">
      <!-- Hero -->
      <section
        class="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8 lg:p-12"
      >
        <div
          class="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"
        />
        <div
          class="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl"
        />

        <div class="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p
              class="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400"
            >
              TechLab
            </p>

            <h1
              class="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              От цифровой модели
              <span class="text-indigo-400">до готовой детали.</span>
            </h1>

            <p class="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              TechLab — цифровая лаборатория производства, где 3D-модели
              превращаются в реальные изделия, прототипы и функциональные
              компоненты.
            </p>

            <div class="mt-8 flex flex-col gap-3 sm:flex-row">
              <NuxtLink
                to="/order"
                class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl hover:shadow-indigo-900/30"
              >
                Создать заказ
              </NuxtLink>

              <NuxtLink
                to="/models"
                class="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
              >
                Смотреть модели
              </NuxtLink>
            </div>
          </div>

          <div
            class="relative min-h-[280px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-5"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-400/10" />

            <div class="relative flex h-full flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Digital production
                </span>

                <span
                  class="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-300"
                >
                  Online
                </span>
              </div>

              <div class="flex items-center justify-center py-8">
                <div
                  class="flex h-40 w-40 items-center justify-center rounded-[2rem] border border-indigo-400/20 bg-gradient-to-br from-indigo-500/20 to-cyan-400/10 shadow-2xl shadow-indigo-950/50"
                >
                  <svg
                    viewBox="0 0 120 120"
                    fill="none"
                    class="h-24 w-24 text-cyan-300"
                    aria-hidden="true"
                  >
                    <path
                      d="M60 11 103 35.5v49L60 109 17 84.5v-49L60 11Z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <path
                      d="M17 35.5 60 60l43-24.5M60 60v49"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <path
                      d="m38 48 22 12 22-12"
                      stroke="currentColor"
                      stroke-width="2"
                      opacity=".65"
                    />
                  </svg>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div class="text-lg font-black text-white">
                    3D
                  </div>
                  <div class="mt-1 text-[10px] text-slate-500">
                    модели
                  </div>
                </div>

                <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div class="text-lg font-black text-white">
                    CAD
                  </div>
                  <div class="mt-1 text-[10px] text-slate-500">
                    данные
                  </div>
                </div>

                <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div class="text-lg font-black text-white">
                    Print
                  </div>
                  <div class="mt-1 text-[10px] text-slate-500">
                    готовое
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Directions -->
      <section class="mt-8">
        <div class="mb-5">
          <h2 class="text-2xl font-bold tracking-tight text-white">
            Что мы делаем
          </h2>

          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Один цифровой процесс для прототипов, функциональных деталей и
            небольших серий.
          </p>
        </div>

        <div class="grid gap-5 md:grid-cols-3">
          <article
            v-for="direction in directions"
            :key="direction.title"
            class="rounded-2xl border border-white/10 bg-white/[0.025] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/25 hover:bg-white/[0.04]"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300"
            >
              <svg
                v-if="direction.icon === 'cube'"
                viewBox="0 0 24 24"
                fill="none"
                class="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                />
                <path
                  d="m4 7.5 8 4.5 8-4.5M12 12v9"
                  stroke="currentColor"
                  stroke-width="1.8"
                />
              </svg>

              <svg
                v-else-if="direction.icon === 'layers'"
                viewBox="0 0 24 24"
                fill="none"
                class="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="m12 4 8 4-8 4-8-4 8-4Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                />
                <path
                  d="m4 12 8 4 8-4M4 16l8 4 8-4"
                  stroke="currentColor"
                  stroke-width="1.8"
                />
              </svg>

              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                class="h-6 w-6"
                aria-hidden="true"
              >
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="2"
                  stroke="currentColor"
                  stroke-width="1.8"
                />
                <path
                  d="M8 9h8M8 12h5M8 15h8"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
              </svg>
            </div>

            <h3 class="mt-5 text-lg font-bold text-white">
              {{ direction.title }}
            </h3>

            <p class="mt-2 text-sm leading-7 text-slate-400">
              {{ direction.description }}
            </p>
          </article>
        </div>
      </section>

      <!-- Advantages -->
      <section class="mt-8 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div
          class="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-white/[0.025] to-cyan-400/5 p-6 sm:p-8"
        >
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-indigo-400">
            Почему TechLab
          </p>

          <h2 class="mt-3 text-2xl font-bold tracking-tight text-white">
            Производство без лишних шагов
          </h2>

          <p class="mt-3 text-sm leading-7 text-slate-400">
            Мы объединяем загрузку модели, настройку параметров и производство
            в одном цифровом процессе.
          </p>

          <div class="mt-6">
            <NuxtLink
              to="/order"
              class="inline-flex items-center gap-2 text-sm font-bold text-cyan-300 transition hover:text-cyan-200"
            >
              Перейти к заказу
              <span aria-hidden="true">→</span>
            </NuxtLink>
          </div>
        </div>

        <div
          class="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8"
        >
          <div class="grid gap-4 sm:grid-cols-2">
            <div
              v-for="advantage in advantages"
              :key="advantage"
              class="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div
                class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  class="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path
                    d="m6 12 4 4 8-8"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>

              <p class="text-sm leading-6 text-slate-300">
                {{ advantage }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Production stages -->
      <section class="mt-8">
        <div class="mb-5">
          <h2 class="text-2xl font-bold tracking-tight text-white">
            Как это работает
          </h2>

          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            От модели до готового изделия — четыре понятных этапа.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="stage in stages"
            :key="stage.number"
            class="relative rounded-2xl border border-white/10 bg-white/[0.025] p-5"
          >
            <div class="text-xs font-black tracking-[0.16em] text-indigo-400">
              {{ stage.number }}
            </div>

            <h3 class="mt-4 text-base font-bold text-white">
              {{ stage.title }}
            </h3>

            <p class="mt-2 text-sm leading-6 text-slate-400">
              {{ stage.description }}
            </p>
          </article>
        </div>
      </section>

      <!-- CTA -->
      <section
        class="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600/10 via-indigo-500/10 to-cyan-400/10 p-6 sm:p-8"
      >
        <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 class="text-2xl font-bold tracking-tight text-white">
              Есть модель? Давайте превратим её в изделие.
            </h2>

            <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Загрузите файл, выберите параметры печати и получите готовое
              изделие.
            </p>
          </div>

          <NuxtLink
            to="/order"
            class="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl hover:shadow-indigo-900/30"
          >
            Создать заказ
          </NuxtLink>
        </div>
      </section>
    </div>
  </AppContainer>
</template>
