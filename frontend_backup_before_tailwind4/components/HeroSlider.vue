<template>
  <section
    class="relative isolate flex min-h-[78vh] items-center overflow-hidden"
    aria-label="3D printing hero"
  >
    <!-- background -->
    <div class="absolute inset-0 bg-[#070b14]" />

    <!-- gradients -->
    <div
      class="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-[120px]"
    />

    <div
      class="absolute bottom-[-20%] right-[-10%] h-[420px] w-[420px] rounded-full bg-violet-600/20 blur-[140px]"
    />

    <!-- grid -->
    <div
      class="absolute inset-0 opacity-[0.04]"
      style="
        background-image:
          linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px);
        background-size: 40px 40px;
      "
    />

    <div
      class="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-20 px-6 py-24 lg:grid-cols-2 lg:px-10"
    >
      <!-- LEFT -->
      <div class="flex flex-col justify-center">
        <div
          class="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur"
        >
          <div class="h-2 w-2 rounded-full bg-cyan-400" />
          Профессиональная 3D печать
        </div>

        <h1
          class="max-w-2xl text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl"
        >
          Производство
          <span
            class="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent"
          >
            3D-моделей
          </span>
          нового уровня
        </h1>

        <p
          class="mt-8 max-w-xl text-lg leading-relaxed text-slate-400"
        >
          Высокоточная 3D-печать, моделирование и изготовление
          деталей под заказ для бизнеса, инженеров и дизайнеров.
        </p>

        <!-- CTA -->
        <div class="mt-10 flex flex-wrap gap-4">
          <NuxtLink
            to="/order"
            class="group relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_10px_40px_rgba(37,99,235,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(37,99,235,0.45)]"
          >
            Заказать печать
            <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-400/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </NuxtLink>

          <NuxtLink
            to="/models"
            class="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-200 backdrop-blur transition-all duration-300 hover:border-cyan-400/40 hover:bg-white/10"
          >
            Смотреть модели
          </NuxtLink>
        </div>

        <!-- stats -->
        <div class="mt-16 grid grid-cols-3 gap-6">
          <div>
            <div class="text-3xl font-black text-white">500+</div>
            <div class="mt-2 text-sm text-slate-500">
              Выполненных заказов
            </div>
          </div>

          <div>
            <div class="text-3xl font-black text-white">24h</div>
            <div class="mt-2 text-sm text-slate-500">
              Средний старт производства
            </div>
          </div>

          <div>
            <div class="text-3xl font-black text-white">0.08mm</div>
            <div class="mt-2 text-sm text-slate-500">
              Точность печати
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="relative hidden items-center justify-center lg:flex">
        <div class="relative h-[580px] w-full">
          <div
            v-for="(item, index) in items"
            :key="item.src"
            class="absolute overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-all duration-500"
            :style="itemStyle(index)"
            @mouseenter="onMouseEnter(index)"
            @mouseleave="onMouseLeave"
          >
            <img
              :src="item.src"
              :alt="item.alt"
              class="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const items = [
  { src: '/slider/slide-1.avif', alt: '3D printer' },
  { src: '/slider/slide-2.avif', alt: '3D detail' },
  { src: '/slider/slide-3.avif', alt: '3D vase' },
  { src: '/slider/slide-4.avif', alt: 'PLA printing' },
]

const activeIndex = ref<number | null>(null)

const onMouseEnter = (index: number) => {
  activeIndex.value = index
}

const onMouseLeave = () => {
  activeIndex.value = null
}

// Добавляем динамику в стили
const itemStyle = (index: number) => {
  const positions = [
    {
      left: '0%',
      top: '14%',
      width: '42%',
      height: '220px',
      transform: 'rotate(-8deg)',
      zIndex: 1,
    },
    {
      left: '30%',
      top: '0%',
      width: '48%',
      height: '260px',
      transform: 'rotate(6deg)',
      zIndex: 2,
    },
    {
      left: '12%',
      top: '42%',
      width: '44%',
      height: '240px',
      transform: 'rotate(4deg)',
      zIndex: 3,
    },
    {
      left: '48%',
      top: '38%',
      width: '40%',
      height: '220px',
      transform: 'rotate(-5deg)',
      zIndex: 4,
    },
  ]

  const baseStyle = positions[index]
  if (activeIndex.value === index) {
    return {
      ...baseStyle,
      transform: `${baseStyle.transform} scale(1.08)`,
      zIndex: 10,
      boxShadow: '0 25px 70px rgba(0, 0, 0, 0.5)',
    }
  }
  return baseStyle
}
</script>