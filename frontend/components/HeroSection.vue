<template>
  <section
    class="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gradient-to-br
      from-graphite
      via-black
      to-titanium
    "
  >
    <div class="max-w-6xl mx-auto text-center">
      <h1 class="text-6xl font-bold">
        3D Печать нового поколения
      </h1>

      <p class="mt-6 text-xl opacity-80">
        Загрузите STL → Получите стоимость → Заказите печать
      </p>

      <div class="mt-8 flex gap-4 justify-center">
        <AppButton>
          Загрузить модель
        </AppButton>

        <AppButton variant="secondary">
          Рассчитать стоимость
        </AppButton>
      </div>
    </div>
  </section>
</template>
