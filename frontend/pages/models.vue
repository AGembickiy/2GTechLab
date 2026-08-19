<script setup lang="ts">
import { computed, ref } from 'vue';

type ModelCategory =
  | 'Все'
  | 'Функциональные'
  | 'Корпуса'
  | 'Декор'
  | 'Органайзеры'
  | 'Инженерные';

interface ModelCard {
  id: number;
  title: string;
  category: Exclude<ModelCategory, 'Все'>;
  description: string;
  meta: string;
  price: string;
  image: string;
}

const categories: ModelCategory[] = [
  'Все',
  'Функциональные',
  'Корпуса',
  'Декор',
  'Органайзеры',
  'Инженерные',
];

const activeCategory = ref<ModelCategory>('Все');

const models: ModelCard[] = [
  {
    id: 1,
    title: 'Настольный держатель',
    category: 'Функциональные',
    description: 'Компактный держатель для телефона, планшета или небольшого устройства.',
    meta: 'PLA • 92 × 78 × 68 мм',
    price: 'от 490 ₽',
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    title: 'Корпус контроллера',
    category: 'Корпуса',
    description: 'Двухкомпонентный корпус с вентиляционными прорезями и креплениями.',
    meta: 'PETG • 140 × 90 × 42 мм',
    price: 'от 890 ₽',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    title: 'Минималистичная ваза',
    category: 'Декор',
    description: 'Декоративная модель с плавной геометрией и спиральной поверхностью.',
    meta: 'PLA • 110 × 110 × 180 мм',
    price: 'от 740 ₽',
    image:
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    title: 'Модульный органайзер',
    category: 'Органайзеры',
    description: 'Система небольших модулей для рабочего стола, мастерской и инструментов.',
    meta: 'PLA • 180 × 120 × 45 мм',
    price: 'от 620 ₽',
    image:
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 5,
    title: 'Крепление для камеры',
    category: 'Инженерные',
    description: 'Регулируемое крепление с посадочными отверстиями и усиленными стенками.',
    meta: 'PETG • 118 × 72 × 54 мм',
    price: 'от 780 ₽',
    image:
      'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 6,
    title: 'Настенный кронштейн',
    category: 'Функциональные',
    description: 'Прочный компактный кронштейн для оборудования и небольших устройств.',
    meta: 'PETG • 150 × 100 × 55 мм',
    price: 'от 990 ₽',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 7,
    title: 'Защитный кожух',
    category: 'Корпуса',
    description: 'Защитная оболочка для электроники с быстрым доступом к интерфейсам.',
    meta: 'ABS • 125 × 95 × 58 мм',
    price: 'от 1 190 ₽',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 8,
    title: 'Геометрическая подставка',
    category: 'Декор',
    description: 'Акцентная интерьерная модель для рабочего стола или полки.',
    meta: 'PLA • 130 × 130 × 90 мм',
    price: 'от 560 ₽',
    image:
      'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 9,
    title: 'Лоток для крепежа',
    category: 'Органайзеры',
    description: 'Многоуровневый лоток для метизов, мелких деталей и расходников.',
    meta: 'PLA • 210 × 145 × 38 мм',
    price: 'от 680 ₽',
    image:
      'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80',
  },
];

const filteredModels = computed(() => {
  if (activeCategory.value === 'Все') {
    return models;
  }

  return models.filter((model) => model.category === activeCategory.value);
});
</script>

<template>
  <AppContainer class="py-12 md:py-16">
    <div class="mx-auto max-w-7xl">
      <section
        class="card mb-8 overflow-hidden p-4 sm:p-5"
      >
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div class="text-sm font-bold text-white">
              Фильтр по категории
            </div>

            <div class="mt-1 text-xs text-slate-500">
              Быстрый просмотр моделей по назначению
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              v-for="category in categories"
              :key="category"
              type="button"
              class="rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200"
              :class="
                activeCategory === category
                  ? 'border-indigo-400/50 bg-indigo-500/15 text-white shadow-lg shadow-indigo-950/20'
                  : 'border-white/10 bg-white/[0.025] text-slate-400 hover:border-white/20 hover:bg-white/[0.05] hover:text-white'
              "
              @click="activeCategory = category"
            >
              {{ category }}
            </button>
          </div>
        </div>
      </section>

      <section
        v-if="filteredModels.length"
        class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
      >
        <article
          v-for="model in filteredModels"
          :key="model.id"
          class="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/25 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-indigo-950/20"
        >
          <div class="relative aspect-[4/3] overflow-hidden bg-slate-950">
            <img
              :src="model.image"
              :alt="model.title"
              class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            >

            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />

            <div
              class="absolute left-4 top-4 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md"
            >
              {{ model.category }}
            </div>
          </div>

          <div class="p-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-lg font-bold tracking-tight text-white">
                  {{ model.title }}
                </h2>

                <p class="mt-2 text-sm leading-relaxed text-slate-400">
                  {{ model.description }}
                </p>
              </div>

              <div class="shrink-0 text-right">
                <div class="text-sm font-bold text-white">
                  {{ model.price }}
                </div>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-between gap-3">
              <div class="text-xs font-medium text-slate-500">
                {{ model.meta }}
              </div>

              <NuxtLink
                to="/order"
                class="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl hover:shadow-indigo-900/30"
              >
                Заказать
              </NuxtLink>
            </div>
          </div>
        </article>
      </section>

      <section
        v-else
        class="card p-10 text-center"
      >
        <h2 class="text-lg font-bold text-white">
          В этой категории пока нет моделей
        </h2>

        <p class="mt-2 text-sm text-slate-400">
          Выберите другую категорию, чтобы продолжить просмотр.
        </p>
      </section>
    </div>
  </AppContainer>
</template>
