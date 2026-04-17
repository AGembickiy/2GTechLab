<template>
  <div class="flex flex-col">
    <HeroSlider />
    
    <UContainer class="py-12">
      <section class="flex flex-col gap-12">
        <!-- Кнопки действий -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            to="/order"
            class="flex h-14 items-center justify-center rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-lg font-black tracking-[0.15em] text-white shadow-[0_8px_30px_rgb(37,99,235,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_12px_40px_rgb(37,99,235,0.4)] active:scale-[0.98]"
          >
            ЗАКАЗАТЬ
          </NuxtLink>
          <NuxtLink
            to="/shop"
            class="flex h-14 items-center justify-center rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-lg font-black tracking-[0.15em] text-white shadow-[0_8px_30px_rgb(124,58,237,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_12px_40px_rgb(124,58,237,0.4)] active:scale-[0.98]"
          >
            КУПИТЬ
          </NuxtLink>
          <NuxtLink
            to="/models"
            class="flex h-14 items-center justify-center rounded-xl bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] text-lg font-black tracking-[0.15em] text-white shadow-[0_8px_30px_rgb(29,78,216,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_12px_40px_rgb(29,78,216,0.4)] active:scale-[0.98] sm:col-span-2 lg:col-span-1"
          >
            МОДЕЛИ
          </NuxtLink>
        </div>

        <!-- Особенности -->
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div v-for="feature in features" :key="feature.title" class="flex items-center gap-5 rounded-2xl border border-white/5 bg-[#0f172a]/40 p-6 transition-all hover:border-white/10 hover:bg-[#0f172a]/60">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-blue-400">
              <UIcon :name="feature.icon" class="h-8 w-8" />
            </div>
            <div class="flex flex-col gap-1">
              <div class="text-[13px] font-black tracking-widest uppercase text-white">{{ feature.title }}</div>
              <div class="text-sm text-slate-400 leading-tight">{{ feature.description }}</div>
            </div>
          </div>
        </div>

        <!-- Преимущества -->
        <div class="rounded-3xl border border-slate-800/40 bg-slate-900/10 p-8">
          <h2 class="text-2xl font-bold text-white mb-8">Основные преимущества сервиса</h2>
          <ul class="grid gap-6 md:grid-cols-2">
            <li v-for="benefit in benefits" :key="benefit.title" class="flex flex-col gap-2 rounded-2xl border border-slate-800/30 bg-slate-950/40 p-6 transition-all hover:border-slate-700/50">
              <div class="flex items-center gap-2">
                <div class="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                <div class="font-bold text-slate-100">{{ benefit.title }}</div>
              </div>
              <p class="text-sm leading-relaxed text-slate-400 ml-3.5">{{ benefit.description }}</p>
            </li>
          </ul>
        </div>
      </section>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const features = [
  { title: 'Разработка', description: 'Воплотим идею', icon: 'i-heroicons-pencil-square' },
  { title: 'Высшее качество', description: 'Точность, надёжность', icon: 'i-heroicons-check-badge' },
  { title: 'Изготовим в срок', description: 'Соблюдаем дедлайны', icon: 'i-heroicons-clock' },
  { title: 'Быстрая доставка', description: 'Бережно вовремя', icon: 'i-heroicons-truck' },
]

const benefits = [
  { title: 'Быстрая подготовка и подача заказа', description: 'Загрузите готовую 3D‑модель или пришлите рисунок/эскиз изделия — мы поможем довести его до печати.' },
  { title: 'Удобное редактирование и визуальный контроль', description: 'Меняйте масштаб и оценивайте объём прямо в браузере с помощью интерактивного 3D‑просмотра.' },
  { title: 'Поддержка профессиональных форматов', description: 'Поддерживаются форматы STL, OBJ, FBX, DAE, GLTF, BLEND, SKP, IGES, STEP, VRML и другие совместимые.' },
  { title: 'Помощь дизайнеров и готовность к производству', description: 'Если у вас нет модели, наши специалисты создадут её по вашим материалам и подготовят к печати.' },
]
</script>