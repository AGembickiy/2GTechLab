<template>
  <header
    class="sticky top-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-2xl"
  >
    <div class="container-main">
      <div class="flex h-[78px] items-center justify-between">

        <!-- Logo -->
        <NuxtLink
          to="/"
          class="group flex items-center gap-4"
        >
          <AppLogo size="md" />

          <div class="hidden sm:block">
            <div class="text-sm font-black tracking-[0.28em] text-white">
              TECHLAB
            </div>

            <div class="text-xs text-slate-400">
              Industrial 3D Printing
            </div>
          </div>
        </NuxtLink>


        <!-- Desktop Navigation -->
        <nav
          class="hidden items-center gap-8 lg:flex"
        >
          <NuxtLink
            v-for="item in navigationItems"
            :key="item.to"
            :to="item.to"
            class="text-sm font-medium transition-colors duration-200"
            :class="[
              route.path === item.to
                ? 'text-white'
                : 'text-slate-300 hover:text-indigo-300'
            ]"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>


        <!-- Actions -->
        <div class="flex items-center gap-5">

          <NuxtLink
            to="/auth/login"
            class="text-sm font-medium text-slate-300 transition-colors duration-200 hover:text-white"
          >
            Войти
          </NuxtLink>


          <NuxtLink
            to="/auth/register"
            class="text-sm font-semibold text-white transition-colors duration-200 hover:text-indigo-300"
          >
            Регистрация
          </NuxtLink>

        </div>

      </div>
    </div>
  </header>
</template>


<script setup lang="ts">

const route = useRoute()

const navigationItems = [
  {
    label: 'Главная',
    to: '/'
  },
  {
    label: 'Создать заказ',
    to: '/order'
  },
  {
    label: 'Каталог моделей',
    to: '/models'
  },
  {
    label: 'О компании',
    to: '/about'
  },
]

</script>