<template>
  <div class="flex flex-col">
    <!-- Hero Section -->

    <HeroSlider />

    <!-- Calculator Section -->
    <section class="py-16 bg-slate-950">
      <AppContainer>
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold text-white mb-8 text-center">Калькулятор стоимости печати</h2>
          <AppCard>
            <div class="space-y-6">
              <AppInput label="Объём (см³)" type="number" placeholder="0.00" />
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <AppSelect label="Материал" v-model="selectedMaterial" :options="materials" />
                </div>
                <div>
                  <AppSelect label="Заполнение" v-model="selectedFill" :options="fills" />
                </div>
              </div>
              <AppButton variant="primary" class="w-full">
                Рассчитать стоимость
              </AppButton>
            </div>
          </AppCard>
        </div>
      </AppContainer>
    </section>

    <!-- Gallery Section -->
    <section class="py-16 bg-slate-900">
      <AppContainer>
        <h2 class="text-3xl font-bold text-white mb-8">Наши работы</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AppCard v-for="item in gallery" :key="item.id" class="group cursor-pointer hover:border-blue-500/50 transition-all">
            <div class="aspect-video rounded-xl bg-slate-800 mb-4 overflow-hidden">
              <img :src="item.image" :alt="item.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
            </div>
            <h3 class="text-lg font-bold text-white mb-2">{{ item.title }}</h3>
            <div class="flex flex-wrap gap-2">
              <AppBadge :text="item.material" variant="primary" />
              <AppBadge :text="item.print_time" variant="info" />
              <AppBadge :text="item.price" variant="success" />
            </div>
          </AppCard>
        </div>
      </AppContainer>
    </section>

    <!-- Process Section -->
    <section class="py-16 bg-gradient-to-br from-graphite via-black to-titanium">
      <AppContainer>
        <h2 class="text-3xl font-bold text-white mb-12 text-center">Как это работает</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl font-bold text-white">1</div>
            <h3 class="text-xl font-bold text-white mb-2">Загрузка</h3>
            <p class="text-slate-400">Загрузите STL или пришлите эскиз</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl font-bold text-white">2</div>
            <h3 class="text-xl font-bold text-white mb-2">Расчёт</h3>
            <p class="text-slate-400">Мы рассчитаем стоимость и срок</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl font-bold text-white">3</div>
            <h3 class="text-xl font-bold text-white mb-2">Производство</h3>
            <p class="text-slate-400">Напечатаем вашу модель</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl font-bold text-white">4</div>
            <h3 class="text-xl font-bold text-white mb-2">Доставка</h3>
            <p class="text-slate-400">Отправим по России</p>
          </div>
        </div>
      </AppContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const gallery = [
  { id: 1, title: 'Миниатюрный дрон', material: 'PLA', print_time: '4ч', price: '12€' },
  { id: 2, title: 'Корпус для электроники', material: 'ABS', print_time: '6ч', price: '18€' },
  { id: 3, title: 'Декоративная ваза', material: 'PETG', print_time: '8ч', price: '24€' },
  { id: 4, title: 'Рабочая модель шестерёнки', material: 'PLA', print_time: '3ч', price: '9€' },
  { id: 5, title: 'Спортивная бутылка', material: 'TPU', print_time: '5ч', price: '15€' },
  { id: 6, title: 'Архитектурная модель', material: 'ASA', print_time: '10ч', price: '30€' },
]

const materials = [
  { value: 'PLA', label: 'PLA - Пластик' },
  { value: 'ABS', label: 'ABS - Прочный пластик' },
  { value: 'PETG', label: 'PETG - Гибкий пластик' },
  { value: 'TPU', label: 'TPU - Эластичный' },
]

const fills = [
  { value: '5%', label: '5% - Низкое' },
  { value: '15%', label: '15% - Среднее' },
  { value: '30%', label: '30% - Высокое' },
  { value: '50%', label: '50% - Максимальное' },
]

const selectedMaterial = ref('PLA')
const selectedFill = ref('15%')
</script>
