<template>
  <section class="card">
    <header style="margin: 1.5rem 1.5rem 1rem">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap">
        <div>
          <h1 class="page-title">Заказать 3D‑печать</h1>
          <p class="page-subtitle">
            Загрузите модель или отправьте эскиз — система рассчитает примерную стоимость и время печати.
          </p>
        </div>

        <button
          type="button"
          class="order-mode-toggle"
          :class="orderMode === 'sketch' ? 'order-mode-toggle--sketch' : ''"
          @click="toggleOrderMode"
        >
          <div class="order-mode-toggle__thumb" />
          <div class="order-mode-toggle__labels">
            <div
              class="order-mode-toggle__label"
              :class="orderMode === 'model' ? 'order-mode-toggle__label--active' : ''"
            >
              Есть готовая модель
            </div>
            <div
              class="order-mode-toggle__label"
              :class="orderMode === 'sketch' ? 'order-mode-toggle__label--active' : ''"
            >
              Только идея / эскиз
            </div>
          </div>
        </button>
      </div>
    </header>

    <div class="order-layout" style="padding: 0 1.5rem 1.5rem">
      <!-- Левая колонка: форма -->
      <div class="order-layout__left">
        <form @submit.prevent="submitOrder" style="display: flex; flex-direction: column; gap: 1.5rem">
          <!-- 1. Файл и модель -->
          <section
            style="
              padding: 1.25rem 1.25rem 1.5rem;
              border-radius: 1rem;
              background: rgba(15, 23, 42, 0.9);
              border: 1px solid rgba(51, 65, 85, 0.7);
            "
          >
            <h2
              style="
                margin: 0 0 0.75rem;
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--foreground);
              "
            >
              Файл и модель
            </h2>
            <p style="margin: 0 0 1.25rem; font-size: 0.9rem; color: var(--muted)">
              Поддерживаются форматы STL, OBJ, FBX, DAE, GLTF, BLEND, SKP, IGES, STEP, VRML и другие совместимые.
              После загрузки мы оценим габариты, вес и примерное время печати.
            </p>

            <div style="display: flex; flex-direction: column; gap: 1rem">
              <div>
                <label
                  for="modelFile"
                  style="display: block; margin-bottom: 0.35rem; font-size: 0.85rem; font-weight: 500"
                >
                  Файл модели <span style="color: #f97373">*</span>
                </label>
                <div
                  style="
                    position: relative;
                    padding: 0.85rem 1rem;
                    border-radius: 0.75rem;
                    border: 1px dashed rgba(148, 163, 184, 0.7);
                    background: rgba(15, 23, 42, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    cursor: pointer;
                  "
                  @click="fileInput?.click()"
                >
                  <div style="display: flex; flex-direction: column; gap: 0.25rem">
                    <span style="font-size: 0.9rem">
                      {{ modelFileName || 'Перетащите файл сюда или выберите на компьютере' }}
                    </span>
                    <span style="font-size: 0.78rem; color: var(--muted)">
                      OBJ, FBX, STL, DAE, GLTF, BLEND, SKP, IGES, STEP, VRML и др. • до 100 МБ
                    </span>
                  </div>
                  <button type="button" class="btn-primary" style="padding-inline: 1.3rem; font-size: 0.85rem">
                    Выбрать файл
                  </button>

                  <input
                    id="modelFile"
                    ref="fileInput"
                    type="file"
                    accept=".stl,.obj,.fbx,.gltf,.glb,.3mf,.dae,.blend,.skp,.iges,.igs,.step,.stp,.wrl,.vrml"
                    style="position: absolute; inset: 0; opacity: 0; pointer-events: none"
                    @change="onFileChange"
                  />
                </div>
                <p v-if="errors.modelFile" style="margin: 0.4rem 0 0; color: #fca5a5; font-size: 0.8rem">
                  {{ errors.modelFile }}
                </p>
              </div>

              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem">
                <div>
                  <label
                    for="productName"
                    style="display: block; margin-bottom: 0.35rem; font-size: 0.85rem; font-weight: 500"
                  >
                    Название изделия <span style="color: #f97373">*</span>
                  </label>
                  <input
                    id="productName"
                    v-model="form.productName"
                    type="text"
                    placeholder="Например, корпус датчика"
                    :class="['login-modal__input']"
                    style="padding-block: 0.6rem"
                  />
                  <p v-if="errors.productName" style="margin: 0.4rem 0 0; color: #fca5a5; font-size: 0.8rem">
                    {{ errors.productName }}
                  </p>
                </div>

                <div>
                  <label
                    for="copies"
                    style="display: block; margin-bottom: 0.35rem; font-size: 0.85rem; font-weight: 500"
                  >
                    Количество экземпляров <span style="color: #f97373">*</span>
                  </label>
                  <input
                    id="copies"
                    v-model.number="form.copies"
                    type="number"
                    min="1"
                    class="login-modal__input"
                    style="padding-block: 0.6rem"
                  />
                  <p v-if="errors.copies" style="margin: 0.4rem 0 0; color: #fca5a5; font-size: 0.8rem">
                    {{ errors.copies }}
                  </p>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem">
                <div>
                  <div style="font-size: 0.8rem; color: var(--muted); margin-bottom: 0.1rem">Размеры, мм</div>
                  <div style="font-size: 0.9rem">
                    {{ sizeText }}
                  </div>
                </div>
                <div>
                  <div style="font-size: 0.8rem; color: var(--muted); margin-bottom: 0.1rem">Вес, г</div>
                  <div style="font-size: 0.9rem">
                    {{ weightText }}
                  </div>
                </div>
                <div>
                  <div style="font-size: 0.8rem; color: var(--muted); margin-bottom: 0.1rem">Формат файла</div>
                  <div style="font-size: 0.9rem">
                    {{ fileFormatText }}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 2. Параметры печати -->
          <section
            style="
              padding: 1.25rem 1.25rem 1.5rem;
              border-radius: 1rem;
              background: rgba(15, 23, 42, 0.9);
              border: 1px solid rgba(51, 65, 85, 0.7);
            "
          >
            <h2
              style="
                margin: 0 0 0.75rem;
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--foreground);
              "
            >
              Параметры печати
            </h2>

            <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem">
              <div>
                <label
                  for="material"
                  style="display: block; margin-bottom: 0.35rem; font-size: 0.85rem; font-weight: 500"
                >
                  Материал <span style="color: #f97373">*</span>
                </label>
                <select
                  id="material"
                  v-model="form.material"
                  class="login-modal__input"
                  style="padding-block: 0.6rem"
                >
                  <option disabled value="">Выберите материал</option>
                  <option v-for="option in materialOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
                <p v-if="errors.material" style="margin: 0.4rem 0 0; color: #fca5a5; font-size: 0.8rem">
                  {{ errors.material }}
                </p>
              </div>

              <div>
                <label
                  for="color"
                  style="display: block; margin-bottom: 0.35rem; font-size: 0.85rem; font-weight: 500"
                >
                  Цвет <span style="color: #f97373">*</span>
                </label>
                <select
                  id="color"
                  v-model="form.color"
                  class="login-modal__input"
                  style="padding-block: 0.6rem"
                >
                  <option disabled value="">Выберите цвет</option>
                  <option v-for="option in colorOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
                <p v-if="errors.color" style="margin: 0.4rem 0 0; color: #fca5a5; font-size: 0.8rem">
                  {{ errors.color }}
                </p>
              </div>

              <div>
                <label
                  for="quality"
                  style="display: block; margin-bottom: 0.35rem; font-size: 0.85rem; font-weight: 500"
                >
                  Качество печати
                </label>
                <select
                  id="quality"
                  v-model="form.quality"
                  class="login-modal__input"
                  style="padding-block: 0.6rem"
                >
                  <option v-for="option in qualityOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div>
                <label
                  for="printType"
                  style="display: block; margin-bottom: 0.35rem; font-size: 0.85rem; font-weight: 500"
                >
                  Тип печати
                </label>
                <select
                  id="printType"
                  v-model="form.printType"
                  class="login-modal__input"
                  style="padding-block: 0.6rem"
                >
                  <option v-for="option in printTypeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>

            <div style="margin-top: 1.25rem; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem">
              <div>
                <label
                  for="postProcessing"
                  style="display: block; margin-bottom: 0.35rem; font-size: 0.85rem; font-weight: 500"
                >
                  Доп. обработка
                </label>
                <div style="display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.85rem">
                  <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer">
                    <input v-model="form.postProcessing" type="checkbox" value="sanding" />
                    Шлифовка / зачистка
                  </label>
                  <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer">
                    <input v-model="form.postProcessing" type="checkbox" value="priming" />
                    Грунтовка под покраску
                  </label>
                  <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer">
                    <input v-model="form.postProcessing" type="checkbox" value="painting" />
                    Покраска в один цвет
                  </label>
                </div>
              </div>

              <div>
                <label
                  for="comment"
                  style="display: block; margin-bottom: 0.35rem; font-size: 0.85rem; font-weight: 500"
                >
                  Комментарий к заказу
                </label>
                <textarea
                  id="comment"
                  v-model="form.comment"
                  rows="4"
                  class="login-modal__input"
                  style="resize: vertical; padding-block: 0.6rem"
                  placeholder="Особые требования к точности, форматам файлов, упаковке и т.п."
                />
              </div>
            </div>
          </section>

          <!-- 3. Контактные данные -->
          <section
            style="
              padding: 1.25rem 1.25rem 1.5rem;
              border-radius: 1rem;
              background: rgba(15, 23, 42, 0.9);
              border: 1px solid rgba(51, 65, 85, 0.7);
            "
          >
            <h2
              style="
                margin: 0 0 0.75rem;
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--foreground);
              "
            >
              Контактные данные
            </h2>

            <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem">
              <div>
                <label
                  for="name"
                  style="display: block; margin-bottom: 0.35rem; font-size: 0.85rem; font-weight: 500"
                >
                  Имя / компания <span style="color: #f97373">*</span>
                </label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  class="login-modal__input"
                  style="padding-block: 0.6rem"
                />
                <p v-if="errors.name" style="margin: 0.4rem 0 0; color: #fca5a5; font-size: 0.8rem">
                  {{ errors.name }}
                </p>
              </div>

              <div>
                <label
                  for="phone"
                  style="display: block; margin-bottom: 0.35rem; font-size: 0.85rem; font-weight: 500"
                >
                  Телефон <span style="color: #f97373">*</span>
                </label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  class="login-modal__input"
                  style="padding-block: 0.6rem"
                />
                <p v-if="errors.phone" style="margin: 0.4rem 0 0; color: #fca5a5; font-size: 0.8rem">
                  {{ errors.phone }}
                </p>
              </div>

              <div>
                <label
                  for="email"
                  style="display: block; margin-bottom: 0.35rem; font-size: 0.85rem; font-weight: 500"
                >
                  Email <span style="color: #f97373">*</span>
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  class="login-modal__input"
                  style="padding-block: 0.6rem"
                />
                <p v-if="errors.email" style="margin: 0.4rem 0 0; color: #fca5a5; font-size: 0.8rem">
                  {{ errors.email }}
                </p>
              </div>

              <div>
                <label
                  for="deliveryAddress"
                  style="display: block; margin-bottom: 0.35rem; font-size: 0.85rem; font-weight: 500"
                >
                  Адрес доставки (если нужен)
                </label>
                <input
                  id="deliveryAddress"
                  v-model="form.deliveryAddress"
                  type="text"
                  class="login-modal__input"
                  style="padding-block: 0.6rem"
                  placeholder="Город, улица, дом, офис/квартира"
                />
              </div>
            </div>
          </section>
        </form>
      </div>

      <!-- Правая колонка: расчёт -->
      <aside class="order-layout__right">
        <div
          style="
            position: sticky;
            top: 5.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          "
        >
          <section
            style="
              padding: 1.1rem 1.1rem 1.2rem;
              border-radius: 1rem;
              background: rgba(15, 23, 42, 0.98);
              border: 1px solid rgba(51, 65, 85, 0.8);
              box-shadow: 0 18px 40px rgba(15, 23, 42, 0.9);
            "
          >
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem">
              <div>
                <h2
                  style="
                    margin: 0;
                    font-size: 1.05rem;
                    font-weight: 600;
                    color: var(--foreground);
                  "
                >
                  Предварительный расчёт
                </h2>
                <p style="margin: 0.2rem 0 0; font-size: 0.8rem; color: var(--muted)">
                  Стоимость и срок по текущим параметрам.
                </p>
              </div>
            </div>

            <div
              style="
                margin: 0.75rem 0 0.9rem;
                padding: 0.7rem 0.8rem;
                border-radius: 0.75rem;
                background: radial-gradient(circle at 0 0, rgba(56, 189, 248, 0.08), transparent 60%);
                border: 1px solid rgba(51, 65, 85, 0.9);
                display: flex;
                flex-direction: column;
                gap: 0.4rem;
                font-size: 0.88rem;
              "
            >
              <div style="display: flex; justify-content: space-between; gap: 0.5rem">
                <span style="color: var(--muted)">Расход материала</span>
                <span>{{ materialUsageText }}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 0.5rem">
                <span style="color: var(--muted)">Время печати</span>
                <span>{{ printTimeText }}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 0.5rem">
                <span style="color: var(--muted)">Доп. обработка</span>
                <span>{{ postProcessingText }}</span>
              </div>
            </div>

            <div style="margin-bottom: 0.9rem">
              <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem">
                <span style="font-size: 0.9rem; color: var(--muted)">Итого</span>
                <span style="font-size: 1.3rem; font-weight: 700">
                  {{ totalPriceText }}
                </span>
              </div>
              <p style="margin: 0.3rem 0 0; font-size: 0.78rem; color: var(--muted)">
                Окончательная стоимость может отличаться после проверки модели и уточнения деталей.
              </p>
            </div>

            <button
              type="button"
              class="btn-primary"
              style="width: 100%; justify-content: center"
              :disabled="!canSubmit"
              @click="submitOrder"
            >
              Оформить заказ
            </button>

            <p v-if="submitMessage" style="margin: 0.6rem 0 0; font-size: 0.8rem; color: #bbf7d0">
              {{ submitMessage }}
            </p>
          </section>

          <section
            style="
              padding: 0.8rem 0.9rem;
              border-radius: 0.9rem;
              background: rgba(15, 23, 42, 0.95);
              border: 1px solid rgba(51, 65, 85, 0.7);
              font-size: 0.78rem;
              color: var(--muted);
            "
          >
            <strong style="display: block; margin-bottom: 0.3rem">Как считается стоимость</strong>
            <p style="margin: 0 0 0.2rem">
              На этом этапе используется упрощённый алгоритм: учёт примерного веса, выбранного материала, качества
              печати и числа экземпляров.
            </p>
            <p style="margin: 0">
              В продакшене здесь будет точный расчёт на сервере с учётом ваших принтеров, скоростей и тарифов.
            </p>
          </section>
        </div>
      </aside>
    </div>

    <!-- Модальное окно предпросмотра модели -->
    <div
      v-if="showPreviewModal"
      class="login-modal-overlay"
      @click.self="closePreviewModal"
    >
      <div class="login-modal">
        <button
          type="button"
          class="login-modal__close"
          aria-label="Закрыть предпросмотр"
          @click="closePreviewModal"
        >
          ×
        </button>

        <h2 class="page-title" style="font-size: 1.25rem; margin-bottom: 0.75rem">
          Предпросмотр модели
        </h2>
        <p class="page-subtitle" style="margin-bottom: 1rem">
          {{ modelFileName }}
        </p>

        <div
          style="
            position: relative;
            width: 100%;
            aspect-ratio: 4 / 3;
            border-radius: 0.75rem;
            border: 1px solid rgba(51, 65, 85, 0.9);
            background: radial-gradient(circle at 50% 0, rgba(56, 189, 248, 0.16), rgba(15, 23, 42, 0.95));
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--muted);
            font-size: 0.9rem;
            text-align: center;
            padding: 0.75rem;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          "
        >
          <div>
            <div style="margin-bottom: 0.5rem; font-weight: 500; color: var(--foreground)">
              Здесь будет интерактивный 3D‑просмотр модели.
            </div>
            <div>
              В следующем шаге подключим WebGL/Three.js и загрузку геометрии из вашего файла/конвертированного STL.
            </div>
          </div>
        </div>

        <button
          type="button"
          class="btn-primary"
          style="width: 100%; justify-content: center; margin-top: 1.25rem"
          @click="closePreviewModal"
        >
          Продолжить заполнение
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

type OrderMode = 'model' | 'sketch';

const orderMode = ref<OrderMode>('model');

const fileInput = ref<HTMLInputElement | null>(null);
const modelFileName = ref<string>('');
const showPreviewModal = ref(false);

const form = reactive({
  productName: '',
  copies: 1,
  material: '',
  color: '',
  quality: 'standard',
  printType: 'single',
  postProcessing: [] as string[],
  comment: '',
  name: '',
  phone: '',
  email: '',
  deliveryAddress: '',
});

const errors = reactive<{
  modelFile?: string;
  productName?: string;
  copies?: string;
  material?: string;
  color?: string;
  name?: string;
  phone?: string;
  email?: string;
}>({});

const materialOptions = [
  { value: 'pla', label: 'PLA (базовый пластик)' },
  { value: 'petg', label: 'PETG (повышенная прочность)' },
  { value: 'abs', label: 'ABS (термостойкий)' },
];

const colorOptions = [
  { value: 'white', label: 'Белый' },
  { value: 'black', label: 'Чёрный' },
  { value: 'gray', label: 'Серый' },
  { value: 'custom', label: 'Другой (уточнить в комментарии)' },
];

const qualityOptions = [
  { value: 'draft', label: 'Черновое качество (быстрее, дешевле)' },
  { value: 'standard', label: 'Стандартное качество' },
  { value: 'high', label: 'Высокое качество (дольше, дороже)' },
];

const printTypeOptions = [
  { value: 'single', label: 'Один материал' },
  { value: 'multi', label: 'Несколько материалов / цветов' },
];

const sizeText = computed(() => 'Будет определено после анализа модели');
const weightText = computed(() => 'Будет определено автоматически');
const fileFormatText = computed(() => {
  if (!modelFileName.value) return 'Определится по расширению файла';
  const parts = modelFileName.value.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'Неизвестно';
});

const materialUsageGrams = computed(() => {
  const base = 50;
  const copiesFactor = Math.max(1, Number(form.copies) || 1);

  let qualityFactor = 1;
  if (form.quality === 'high') qualityFactor = 1.4;
  else if (form.quality === 'draft') qualityFactor = 0.8;

  let printTypeFactor = form.printType === 'multi' ? 1.15 : 1;

  return Math.round(base * copiesFactor * qualityFactor * printTypeFactor);
});

const printTimeHours = computed(() => {
  const baseHours = 2;
  const copiesFactor = Math.max(1, Number(form.copies) || 1);

  let qualityFactor = 1;
  if (form.quality === 'high') qualityFactor = 1.6;
  else if (form.quality === 'draft') qualityFactor = 0.8;

  return +(baseHours * copiesFactor * qualityFactor).toFixed(1);
});

const materialUsageText = computed(() => `${materialUsageGrams.value} г`);

const printTimeText = computed(() => {
  if (!materialUsageGrams.value) return '—';
  return `${printTimeHours.value} ч`;
});

const postProcessingText = computed(() => {
  if (!form.postProcessing.length) return 'Не выбрано';
  const labels: Record<string, string> = {
    sanding: 'Шлифовка',
    priming: 'Грунтовка',
    painting: 'Покраска',
  };
  return form.postProcessing.map((v) => labels[v] || v).join(', ');
});

const totalPrice = computed(() => {
  if (!form.material || !form.copies) return 0;

  const baseRatePerGram: Record<string, number> = {
    pla: 5,
    petg: 6,
    abs: 7,
  };

  const materialRate = baseRatePerGram[form.material as keyof typeof baseRatePerGram] ?? 5;
  let price = materialUsageGrams.value * materialRate;

  if (form.quality === 'high') price *= 1.3;
  else if (form.quality === 'draft') price *= 0.9;

  if (form.printType === 'multi') price *= 1.15;

  if (form.postProcessing.includes('sanding')) price += 300;
  if (form.postProcessing.includes('priming')) price += 400;
  if (form.postProcessing.includes('painting')) price += 600;

  if (orderMode.value === 'sketch') {
    price *= 1.5;
  }

  return Math.round(price);
});

const totalPriceText = computed(() => {
  if (!totalPrice.value) return '—';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(totalPrice.value);
});

const canSubmit = computed(() => {
  return Boolean(
    modelFileName.value &&
      form.productName &&
      form.copies &&
      form.material &&
      form.color &&
      form.name &&
      form.phone &&
      form.email,
  );
});

const submitMessage = ref('');

function toggleOrderMode() {
  orderMode.value = orderMode.value === 'model' ? 'sketch' : 'model';
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) {
    modelFileName.value = '';
    errors.modelFile = 'Пожалуйста, выберите файл модели.';
    return;
  }

  modelFileName.value = file.name;
  errors.modelFile = undefined;

  showPreviewModal.value = true;
}

function closePreviewModal() {
  showPreviewModal.value = false;
}

function validateForm() {
  errors.modelFile = modelFileName.value ? undefined : 'Загрузите файл модели.';
  errors.productName = form.productName ? undefined : 'Укажите название изделия.';
  errors.copies =
    !form.copies || form.copies < 1 ? 'Укажите количество экземпляров (минимум 1).' : undefined;
  errors.material = form.material ? undefined : 'Выберите материал.';
  errors.color = form.color ? undefined : 'Выберите цвет.';
  errors.name = form.name ? undefined : 'Укажите имя или компанию.';
  errors.phone = form.phone ? undefined : 'Укажите номер телефона.';
  errors.email = form.email ? undefined : 'Укажите email.';

  return !Object.values(errors).some(Boolean);
}

function submitOrder() {
  submitMessage.value = '';

  if (!validateForm()) {
    submitMessage.value = 'Проверьте обязательные поля формы.';
    return;
  }

  submitMessage.value =
    'Заявка сформирована. В реальной системе здесь будет отправка данных на сервер и присвоение номера заказа.';
}
</script>

