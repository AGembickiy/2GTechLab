<template>
  <div class="flex flex-col">
    <!-- Hero Section -->
    <section class="min-h-screen flex items-center justify-center bg-gradient-to-br from-graphite via-black to-titanium py-20">
      <div class="max-w-6xl mx-auto px-6 text-center">
        <h1 class="text-6xl md:text-7xl font-bold mb-6">
          3D Печать <span class="text-blue-500">нового поколения</span>
        </h1>
        <p class="text-xl md:text-2xl text-slate-300 mb-10">
          Загрузите STL → Получите стоимость за секунды → Запустите печать
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <AppButton variant="primary">
            Загрузить модель
          </AppButton>
          <AppButton variant="secondary">
            Рассчитать стоимость
          </AppButton>
        </div>
      </div>
    </section>

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
                  <label class="text-sm font-medium text-slate-300 mb-2 block">Материал</label>
                  <select class="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500">
                    <option value="PLA">PLA</option>
                    <option value="ABS">ABS</option>
                    <option value="PETG">PETG</option>
                    <option value="TPU">TPU</option>
                  </select>
                </div>
                <div>
                  <label class="text-sm font-medium text-slate-300 mb-2 block">Заполнение</label>
                  <select class="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500">
                    <option value="5%">5%</option>
                    <option value="15%">15%</option>
                    <option value="30%">30%</option>
                    <option value="50%">50%</option>
                  </select>
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
const gallery = [
  { id: 1, title: 'Миниатюрный дрон', material: 'PLA', print_time: '4ч', price: '12€' },
  { id: 2, title: 'Корпус для электроники', material: 'ABS', print_time: '6ч', price: '18€' },
  { id: 3, title: 'Декоративная ваза', material: 'PETG', print_time: '8ч', price: '24€' },
  { id: 4, title: 'Рабочая модель шестерёнки', material: 'PLA', print_time: '3ч', price: '9€' },
  { id: 5, title: 'Спортивная бутылка', material: 'TPU', print_time: '5ч', price: '15€' },
  { id: 6, title: 'Архитектурная модель', material: 'ASA', print_time: '10ч', price: '30€' },
]
</script>
