<template>
  <div class="p-8 space-y-8">
    <h1 class="text-2xl font-bold mb-4">Test Components</h1>
    
    <!-- AppButton -->
    <section>
      <h2 class="text-xl font-bold mb-4">AppButton</h2>
      <AppButton>Основная кнопка</AppButton>
      <AppButton variant="secondary">Вторичная кнопка</AppButton>
      <AppButton size="sm">Маленькая</AppButton>
      <AppButton size="lg">Большая</AppButton>
    </section>
    
    <!-- AppInput -->
    <section>
      <h2 class="text-xl font-bold mb-4">AppInput</h2>
      <div class="max-w-md">
        <AppInput v-model="text" label="Текстовое поле" placeholder="Введите текст" />
      </div>
    </section>
    
    <!-- AppSelect -->
    <section>
      <h2 class="text-xl font-bold mb-4">AppSelect</h2>
      <div class="max-w-md">
        <AppSelect
          v-model="selectedOption"
          label="Выберите материал"
          placeholder="Выберите вариант"
          :options="materialOptions"
        />
      </div>
    </section>
    
    <!-- AppTextarea -->
    <section>
      <h2 class="text-xl font-bold mb-4">AppTextarea</h2>
      <div class="max-w-md">
        <AppTextarea v-model="textarea" label="Комментарий" placeholder="Введите ваш комментарий" :rows="4" />
      </div>
    </section>
    
    <!-- AppCard -->
    <section>
      <h2 class="text-xl font-bold mb-4">AppCard</h2>
      <AppCard>
        <div class="p-4">
          <h3 class="text-lg font-bold">Информация</h3>
          <p class="text-sm text-slate-400">Это тестовая карточка с контентом</p>
        </div>
      </AppCard>
    </section>
    
    <!-- AppBadge -->
    <section>
      <h2 class="text-xl font-bold mb-4">AppBadge</h2>
      <div class="flex flex-wrap gap-2">
        <AppBadge text="Primary" variant="primary" />
        <AppBadge text="Success" variant="success" />
        <AppBadge text="Warning" variant="warning" />
        <AppBadge text="Error" variant="error" />
        <AppBadge text="Info" variant="info" />
      </div>
    </section>
    
    <!-- AppAlert -->
    <section>
      <h2 class="text-xl font-bold mb-4">AppAlert</h2>
      <div class="space-y-4 max-w-2xl">
        <AppAlert variant="success" title="Успех" message="Данные успешно сохранены" />
        <AppAlert variant="warning" title="Внимание" message="Есть непроверенные изменения" />
        <AppAlert variant="error" title="Ошибка" message="Не удалось загрузить данные" />
        <AppAlert variant="info" title="Информация" message="Новая функция доступна" />
      </div>
    </section>
    
    <!-- AppSkeleton -->
    <section>
      <h2 class="text-xl font-bold mb-4">AppSkeleton</h2>
      <div class="space-y-4 max-w-2xl">
        <AppSkeleton variant="card" />
        <div class="flex items-center gap-4">
          <AppSkeleton variant="button" />
          <AppSkeleton />
        </div>
      </div>
    </section>
    
    <!-- AppModal -->
    <section>
      <h2 class="text-xl font-bold mb-4">AppModal</h2>
      <div>
        <AppButton @click="isModalOpen = true">Открыть модальное окно</AppButton>
        <AppModal
          v-model="isModalOpen"
          title="Подтверждение"
          cancel-text="Отмена"
          confirm-text="Подтвердить"
          @confirm="handleConfirm"
          @cancel="handleCancel"
        >
          <p>Вы уверены, что хотите продолжить?</p>
        </AppModal>
      </div>
    </section>
    
    <!-- AppContainer -->
    <section>
      <h2 class="text-xl font-bold mb-4">AppContainer</h2>
      <AppContainer>
        <p>Контент внутри контейнера с максимальной шириной 7xl</p>
      </AppContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const text = ref('')
const textarea = ref('')
const selectedOption = ref('')
const isModalOpen = ref(false)

const materialOptions = [
  { value: 'PLA', label: 'PLA - Пластик' },
  { value: 'ABS', label: 'ABS - Прочный пластик' },
  { value: 'PETG', label: 'PETG - Гибкий пластик' },
  { value: 'TPU', label: 'TPU - Эластичный' },
]

function handleConfirm() {
  console.log('Подтверждено')
}

function handleCancel() {
  console.log('Отменено')
}
</script>
