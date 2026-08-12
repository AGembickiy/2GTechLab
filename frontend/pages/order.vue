<template>
  <div>
    <section class="py-12 md:py-16">
      <AppContainer>
        <div class="mb-10 text-center">
          <p
            class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400"
          >
            TechLab
          </p>

          <h1
            class="text-3xl font-bold tracking-tight text-white md:text-4xl"
          >
            Оформление заказа
          </h1>

          <p class="mx-auto mt-3 max-w-2xl text-slate-400">
            Заполните данные заказа, выберите необходимые параметры и
            проверьте итоговую информацию перед отправкой.
          </p>
        </div>

        <div
          class="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"
        >
          <OrderForm />

          <div class="xl:sticky xl:top-6">
            <OrderSummary />
          </div>
        </div>
      </AppContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
</script>
