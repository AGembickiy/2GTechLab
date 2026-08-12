<template>
  <div class="min-h-screen bg-gradient-to-br from-graphite via-black to-titanium text-white">
    <HeroSlider />

    <section class="relative overflow-hidden border-t border-white/5">
      <div
        class="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-indigo-500/5 to-transparent"
      />

      <AppContainer>
        <div class="py-20 lg:py-24">
          <div class="mx-auto max-w-3xl text-center">
            <div
              class="mb-4 inline-flex items-center rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-indigo-300"
            >
              Производство без лишних шагов
            </div>

            <h2 class="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Как это работает
            </h2>

            <p class="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              От загрузки модели до готового изделия — весь процесс собран в одном
              понятном маршруте.
            </p>
          </div>

          <div
            class="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
          >
            <article
              v-for="(step, index) in steps"
              :key="step.title"
              class="group relative overflow-hidden rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/20 hover:bg-white/[0.05]"
            >
              <div
                class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              <div
                class="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500 to-cyan-400 text-lg font-black text-white shadow-lg shadow-indigo-950/30"
              >
                {{ String(index + 1).padStart(2, '0') }}
              </div>

              <h3 class="mt-6 text-lg font-bold text-white">
                {{ step.title }}
              </h3>

              <p class="mt-3 text-sm leading-6 text-slate-400">
                {{ step.text }}
              </p>

              <div class="mt-6 h-px w-10 bg-gradient-to-r from-indigo-400 to-cyan-400 opacity-60" />
            </article>
          </div>

          <div class="mt-14 flex justify-center">
            <NuxtLink
              to="/order"
              class="button-primary"
            >
              Создать заказ
            </NuxtLink>
          </div>
        </div>
      </AppContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const steps = [
  {
    title: 'Модель или эскиз',
    text: 'Загрузите 3D-модель или отправьте эскиз — мы подготовим всё необходимое для производства.',
  },
  {
    title: 'Мгновенный расчёт',
    text: 'Получите ориентировочную стоимость и время изготовления без лишней переписки.',
  },
  {
    title: 'Изготовление',
    text: 'Изготовим деталь точно по согласованным параметрам и в установленный срок.',
  },
  {
    title: 'Доставка',
    text: 'Надёжно упакуем готовое изделие и отправим удобным для вас способом.',
  },
]
</script>
