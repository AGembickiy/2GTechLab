<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth-check',
});

const authStore = useAuthStore();

const stats = [
  {
    title: 'Заказы сегодня',
    value: '24',
    change: '+12%',
  },
  {
    title: 'Выручка',
    value: '184 500 ₽',
    change: '+8.4%',
  },
  {
    title: 'Активные пользователи',
    value: '1 284',
    change: '+5.2%',
  },
  {
    title: 'Оборудование',
    value: '7 / 9',
    change: 'загружено',
  },
];

const sections = [
  {
    title: 'Финансы',
    description: 'Выручка, расходы, платежи и финансовые показатели.',
    to: '/admin/finance',
  },
  {
    title: 'Склад',
    description: 'Материалы, остатки, расходники и поставки.',
    to: '/admin/warehouse',
  },
  {
    title: 'Пользователи',
    description: 'Клиенты, менеджеры, партнёры и администраторы.',
    to: '/admin/users',
  },
  {
    title: 'Оборудование',
    description: 'Принтеры, состояние, загрузка и обслуживание.',
    to: '/admin/equipment',
  },
  {
    title: 'Заказы',
    description: 'Все заказы студии и управление их состояниями.',
    to: '/admin/orders',
  },
  {
    title: 'Модели',
    description: 'Каталог моделей, файлы и управление библиотекой.',
    to: '/admin/models',
  },
];

const recentOrders = [
  {
    id: '#1048',
    client: 'ООО ПромТех',
    status: 'В печати',
    amount: '18 400 ₽',
  },
  {
    id: '#1047',
    client: 'Алексей К.',
    status: 'Ожидает оплаты',
    amount: '6 900 ₽',
  },
  {
    id: '#1046',
    client: 'Инженерная группа',
    status: 'Готов',
    amount: '31 200 ₽',
  },
  {
    id: '#1045',
    client: 'Мария С.',
    status: 'Новый',
    amount: '3 450 ₽',
  },
];
</script>

<template>
  <div class="space-y-6">
    <section
      class="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl"
    >
      <div
        class="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"
      />

      <div
        class="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <p
            class="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400"
          >
            TechLab Control Center
          </p>

          <h1 class="mt-2 text-3xl font-black tracking-tight text-white">
            Дашборд
          </h1>

          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Управление студией, производством, финансами, заказами и
            пользователями в одном рабочем пространстве.
          </p>
        </div>

        <div
          class="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3"
        >
          <div class="text-xs text-slate-500">
            Администратор
          </div>

          <div class="mt-1 text-sm font-bold text-emerald-300">
            {{ authStore.user?.username || 'Администратор' }}
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="stat in stats"
        :key="stat.title"
        class="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
      >
        <div class="text-xs font-medium text-slate-500">
          {{ stat.title }}
        </div>

        <div class="mt-3 flex items-end justify-between gap-3">
          <div class="text-2xl font-black text-white">
            {{ stat.value }}
          </div>

          <div class="text-xs font-bold text-emerald-300">
            {{ stat.change }}
          </div>
        </div>
      </article>
    </section>

    <section>
      <div class="mb-4">
        <h2 class="text-xl font-bold text-white">
          Управление студией
        </h2>

        <p class="mt-1 text-sm text-slate-500">
          Доступ ко всем основным рабочим разделам администратора.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="section in sections"
          :key="section.to"
          :to="section.to"
          class="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/25 hover:bg-white/[0.04]"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="text-base font-bold text-white">
                {{ section.title }}
              </h3>

              <p class="mt-2 text-sm leading-6 text-slate-400">
                {{ section.description }}
              </p>
            </div>

            <span
              class="text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-300"
            >
              →
            </span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
      <div
        class="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-white">
              Последние заказы
            </h2>

            <p class="mt-1 text-xs text-slate-500">
              Последняя активность производства
            </p>
          </div>

          <NuxtLink
            to="/admin/orders"
            class="text-xs font-bold text-cyan-300 hover:text-cyan-200"
          >
            Все заказы →
          </NuxtLink>
        </div>

        <div class="mt-5 overflow-x-auto">
          <table class="w-full min-w-[620px] text-left text-sm">
            <thead class="border-b border-white/10 text-xs text-slate-500">
              <tr>
                <th class="px-3 py-3 font-semibold">
                  Заказ
                </th>

                <th class="px-3 py-3 font-semibold">
                  Клиент
                </th>

                <th class="px-3 py-3 font-semibold">
                  Статус
                </th>

                <th class="px-3 py-3 text-right font-semibold">
                  Сумма
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="order in recentOrders"
                :key="order.id"
                class="border-b border-white/[0.05] last:border-0"
              >
                <td class="px-3 py-3 font-semibold text-white">
                  {{ order.id }}
                </td>

                <td class="px-3 py-3 text-slate-300">
                  {{ order.client }}
                </td>

                <td class="px-3 py-3 text-slate-400">
                  {{ order.status }}
                </td>

                <td class="px-3 py-3 text-right font-bold text-slate-200">
                  {{ order.amount }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        class="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
      >
        <h2 class="text-lg font-bold text-white">
          Состояние студии
        </h2>

        <div class="mt-5 space-y-4">
          <div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-400">
                Принтеры
              </span>

              <span class="font-bold text-white">
                7 / 9
              </span>
            </div>

            <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
              <div class="h-full w-[78%] rounded-full bg-indigo-500" />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between gap-3 text-sm">
              <span class="text-slate-400">
                Склад
              </span>

              <span class="text-right font-bold text-amber-300">
                12 позиций требуют внимания
              </span>
            </div>

            <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
              <div class="h-full w-[42%] rounded-full bg-amber-400" />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-400">
                Очередь заказов
              </span>

              <span class="font-bold text-cyan-300">
                18 активных
              </span>
            </div>

            <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
              <div class="h-full w-[64%] rounded-full bg-cyan-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
