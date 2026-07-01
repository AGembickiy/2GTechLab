<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Test Components</h1>
    
    <AppButton>Тест кнопки</AppButton>
    <AppButton variant="secondary">Тест кнопки secondary</AppButton>
    
    <div class="mt-4">
      <AppInput v-model="text" label="Тест инпута" placeholder="Введите текст" />
    </div>
    
    <div class="mt-4">
      <AppCard>
        <div class="p-4">
          <h2 class="text-lg font-bold">Тест карточки</h2>
          <p class="text-sm text-slate-400">Это тестовый контент</p>
        </div>
      </AppCard>
    </div>
    
    <div class="mt-4">
      <AppBadge text="Тест бейджа" variant="primary" />
    </div>
    
    <div class="mt-4">
      <AppContainer>
        <p>Тест контейнера</p>
      </AppContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
const text = ref('')
</script>
