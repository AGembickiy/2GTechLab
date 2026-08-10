<script setup lang="ts">
import { converterService } from '~/services/converterService'
import { useOrderForm } from '~/composables/useOrderForm';
import type { MaterialPresetDto } from '~/composables/usePrintApi';
import type { ThreeViewerSurfaceClickPayload } from '~/types/three/three-viewer';
import {
  buildEditedGlbName,
  buildEditedStlName,
  getExtension,
  is3dLikeExtension,
} from '~/utils/fileUploadModelRules';

const { createProject } = useUploadModel()

type MaterialType = 'pla' | 'petg' | 'abs' | '';
type ColorType = 'white' | 'black' | 'gray' | 'red' | 'blue' | 'green' | 'custom' | '';

type MaterialDto = {
  id: number;
  type: Exclude<MaterialType, ''>;
  name: string;
  colorName: Exclude<ColorType, ''>;
  color: string; // hex like #RRGGBB
};

type MaterialPresetsResponse = MaterialPresetDto[] | { results?: MaterialPresetDto[] };

function normalizeHex(hex: string): string {
  const h = hex.trim().toLowerCase();
  if (!h.startsWith('#')) return h;
  if (h.length === 4) {
    return `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  }
  return h;
}

function presetToMaterialRow(p: MaterialPresetDto): MaterialDto | null {
  const raw = (p.type || 'PLA').toLowerCase();
  const type = (raw === 'pla' || raw === 'petg' || raw === 'abs' ? raw : 'pla') as Exclude<MaterialType, ''>;
  const hex = normalizeHex(p.color_hex);
  const map: Record<string, Exclude<ColorType, ''>> = {
    '#ffffff': 'white',
    '#fff': 'white',
    '#111827': 'black',
    '#000000': 'black',
    '#000': 'black',
    '#9ca3af': 'gray',
    '#ef4444': 'red',
    '#3b82f6': 'blue',
    '#22c55e': 'green',
  };
  const colorName = map[hex] ?? 'custom';
  return {
    id: p.id,
    type,
    name: p.name,
    colorName,
    color: p.color_hex,
  };
}

const fileInput = ref<HTMLInputElement | null>(null);

const modelValue = defineModel<File | null>();
const originalFile = defineModel<File | null>('originalFile');
const emit = defineEmits<{
  (e: 'surface-click', payload: ThreeViewerSurfaceClickPayload): void;
}>();

const isPreviewOpen = ref(false);
const isBusy = ref(false);
const isSavingEditedStl = ref(false);
const isStlEdited = ref(false);
const errorMessage = ref<string | null>(null);
const previewUrl = ref<string | null>(null);
const previewKind = ref<'image' | 'glb' | null>(null);
const previewModelFormat = ref<'stl' | 'glb' | 'gltf' | null>(null);
const isClient = import.meta.client;
const threeViewerRef = ref<{
  clearSelection: () => void;
  assignSelectionToActiveSlot: () => void;
  paintAllToSlot: (slotIndex: number) => void;
  resetToSlot0: () => void;
  recolorSlot: (slotIndex: number) => void;
  undoLastAction: () => void;
  refreshVertexColorsFromSlots: () => void;
  exportEditedStl: (options?: {
    scalePercent?: number;
    rotateXDeg?: number;
    rotateYDeg?: number;
    rotateZDeg?: number;
  }) => Promise<string>;
} | null>(null);

const { form } = useOrderForm();

// Painting tools (AMS preview).
const activeSlotIndex = ref<number>(0);
const paintedFacesCount = ref<number>(0);

const DEFAULT_COLOR_HEX = '#7dd3fc';

const runtimeConfig = useRuntimeConfig();
const apiBase = computed(() => (runtimeConfig.public.apiBase as string).replace(/\/$/, ''));

function logUploadStage(message: string) {
  if (!import.meta.client) return;
  console.info(message);
}

const fallbackPresets: MaterialPresetDto[] = [
  { id: -1, name: 'PLA White', type: 'PLA', color_hex: '#FFFFFF', density_g_per_cm3: 1.24, price_per_kg: '2200.00' },
  { id: -2, name: 'PLA Black', type: 'PLA', color_hex: '#111827', density_g_per_cm3: 1.24, price_per_kg: '2200.00' },
  { id: -3, name: 'PETG Gray', type: 'PETG', color_hex: '#9CA3AF', density_g_per_cm3: 1.27, price_per_kg: '2600.00' },
  { id: -4, name: 'ABS Red', type: 'ABS', color_hex: '#EF4444', density_g_per_cm3: 1.04, price_per_kg: '2800.00' },
];

const { data: presetsData, error: presetsError, refresh: refreshPresets } = useFetch<MaterialPresetsResponse>(
  () => `${apiBase.value}/material-presets/`,
  {
  server: false,
  default: () => [],
});
const presetRows = computed<MaterialPresetDto[]>(() => {
  const raw = presetsData.value;
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.results)) return raw.results;
  return [];
});
const materials = computed(() => {
  const fromApi = presetRows.value.map(presetToMaterialRow).filter(Boolean) as MaterialDto[];
  if (fromApi.length) return fromApi;
  return fallbackPresets.map(presetToMaterialRow).filter(Boolean) as MaterialDto[];
});

const selectionCount = ref(0);
const totalFaces = ref(0);
const lastPicked = ref<ThreeViewerSurfaceClickPayload>(null);
const canUndoLastAction = ref(false);

function materialLabel(type: MaterialType): string {
  switch (type) {
    case 'pla':
      return 'PLA';
    case 'petg':
      return 'PETG';
    case 'abs':
      return 'ABS';
    default:
      return '';
  }
}

function colorLabel(color: ColorType): string {
  switch (color) {
    case 'white':
      return 'Белый';
    case 'black':
      return 'Чёрный';
    case 'gray':
      return 'Серый';
    case 'red':
      return 'Красный';
    case 'blue':
      return 'Синий';
    case 'green':
      return 'Зелёный';
    case 'custom':
      return 'Другой';
    default:
      return '';
  }
}

function resolveSlotColorHex(slotIndex: number): string {
  const slot = form.amsSlots?.[slotIndex];
  if (!slot?.material || !slot?.color) return DEFAULT_COLOR_HEX;
  const found = materials.value.find((m) => m.type === slot.material && m.colorName === slot.color);
  return found?.color ?? DEFAULT_COLOR_HEX;
}

const slotMaterials = computed(() => Array.from(new Set(materials.value.map((m) => m.type))) as Array<Exclude<MaterialType, ''>>);

function colorsForType(type: Exclude<MaterialType, ''> | ''): Array<Exclude<ColorType, ''>> {
  if (!type) return [];
  return Array.from(new Set(materials.value.filter((m) => m.type === type).map((m) => m.colorName))) as Array<Exclude<ColorType, ''>>;
}

function materialColorHex(type: Exclude<MaterialType, ''> | '', color: Exclude<ColorType, ''>): string {
  if (!type) return DEFAULT_COLOR_HEX;
  const found = materials.value.find((m) => m.type === type && m.colorName === color);
  return found?.color ?? DEFAULT_COLOR_HEX;
}

const maxAmsSlots = 4;
const requestedAmsSlotsCount = ref(1);

const usedAmsSlotsCount = computed(() => {
  const usedCount = form.amsSlots.reduce((acc, slot) => (slot.material ? acc + 1 : acc), 0);
  return Math.min(maxAmsSlots, usedCount);
});

const visibleAmsSlotsCount = computed(() => {
  return Math.min(maxAmsSlots, Math.max(1, usedAmsSlotsCount.value, requestedAmsSlotsCount.value));
});

const visibleAmsSlots = computed(() => form.amsSlots.slice(0, visibleAmsSlotsCount.value));
const canAddAmsSlot = computed(() => visibleAmsSlotsCount.value < maxAmsSlots);

async function onSlotMaterialChange(slotIndex: number) {
  const slot = form.amsSlots?.[slotIndex];
  if (!slot) return;
  const nextColors = colorsForType(slot.material);
  if (!nextColors.length) {
    slot.color = '';
  } else if (!slot.color || !nextColors.includes(slot.color as Exclude<ColorType, ''>)) {
    slot.color = nextColors[0];
  }
  await nextTick();
  threeViewerRef.value?.recolorSlot(slotIndex);
  if (selectionCount.value > 0) isStlEdited.value = true;
}

async function setSlotColor(slotIndex: number, color: Exclude<ColorType, ''>) {
  const slot = form.amsSlots?.[slotIndex];
  if (!slot || !slot.material) return;
  slot.color = color;
  await nextTick();
  threeViewerRef.value?.recolorSlot(slotIndex);
  if (selectionCount.value > 0) isStlEdited.value = true;
}

function addMaterialSlot() {
  if (!canAddAmsSlot.value) return;
  const nextIndex = Math.min(maxAmsSlots - 1, visibleAmsSlotsCount.value);
  requestedAmsSlotsCount.value = Math.min(maxAmsSlots, visibleAmsSlotsCount.value + 1);
  const slot = form.amsSlots?.[nextIndex];
  if (!slot) return;

  const defaultMaterial = slotMaterials.value[0] ?? '';
  if (!slot.material && defaultMaterial) {
    slot.material = defaultMaterial;
    const nextColors = colorsForType(defaultMaterial);
    slot.color = nextColors[0] ?? '';
  }
  activeSlotIndex.value = nextIndex;
}

const canUseActiveSlot = computed(() => {
  const idx = activeSlotIndex.value;
  if (idx === 0) return true;
  const slot = form.amsSlots?.[idx];
  return Boolean(slot?.material && slot?.color);
});

watch(
  visibleAmsSlotsCount,
  (count) => {
    if (activeSlotIndex.value >= count) activeSlotIndex.value = Math.max(0, count - 1);
  },
  { immediate: true },
);

watch(
  usedAmsSlotsCount,
  (count) => {
    if (count > requestedAmsSlotsCount.value) requestedAmsSlotsCount.value = count;
  },
  { immediate: true },
);

watch(
  presetsError,
  (err) => {
    if (!err) return;
    logUploadStage(`Ошибка загрузки материалов: ${err.message}`);
  },
  { immediate: true },
);

watch(isPreviewOpen, (open) => {
  if (open && !presetRows.value.length) {
    void refreshPresets();
  }
});

const editScalePercent = ref(100);
const editRotateXDeg = ref(0);
const editRotateYDeg = ref(0);
const editRotateZDeg = ref(0);

watch(
  () => [form.amsSlots?.[0]?.material, form.amsSlots?.[0]?.color],
  ([material, color]) => {
    if (!material || !color) return;
    if (form.material !== material) form.material = material;
    if (form.color !== color) form.color = color;
  },
  { immediate: true },
);

watch(
  materials,
  (list) => {
    if (!list.length || !form.amsSlots?.length) return;
    const slot0 = form.amsSlots[0];
    if (!slot0.material) slot0.material = 'pla';
    if (!slot0.color) {
      const colors = colorsForType(slot0.material);
      slot0.color = colors[0] ?? 'white';
    }
    if (import.meta.client && isPreviewOpen.value && previewKind.value === 'glb') {
      nextTick(() => {
        threeViewerRef.value?.refreshVertexColorsFromSlots?.();
      });
    }
  },
  { immediate: true, deep: true },
);

const baseColClasses = computed(() => ({
  'flex': true,
  'flex-col': true,
  'gap-4': true,
  'rounded-xl': true,
  'border': true,
  'border-slate-800/70': true,
  'bg-slate-950/40': true,
  'p-3': true,
  'sm:p-4': true,
  'w-full': true,
  'lg:max-w-[50%]': true,
}));

function undoLastViewerAction() {
  if (!canUndoLastAction.value) return;
  threeViewerRef.value?.undoLastAction?.();
  isStlEdited.value = true;
}

function paintAllToSlot(slotIndex: number) {
  if (slotIndex < 0 || slotIndex > 3) return;
  threeViewerRef.value?.paintAllToSlot(slotIndex);
  isStlEdited.value = true;
}

function clearSelectionOnly() {
  threeViewerRef.value?.clearSelection();
  lastPicked.value = null;
  emit('surface-click', null);
}

function onViewerStatsChange(payload: { selectedCount: number; paintedFaces: number; totalFaces: number; undoAvailable: boolean }) {
  selectionCount.value = payload.selectedCount;
  paintedFacesCount.value = payload.paintedFaces;
  totalFaces.value = payload.totalFaces;
  canUndoLastAction.value = payload.undoAvailable;
  form.printType = payload.paintedFaces > 0 ? 'multi' : 'single';
}

function onViewerSurfaceClick(payload: ThreeViewerSurfaceClickPayload) {
  lastPicked.value = payload;
  if (payload) isStlEdited.value = true;
  emit('surface-click', payload);
}

function onViewerError(message: string) {
  errorMessage.value = message;
}

watch(isPreviewOpen, (open) => {
  if (!import.meta.client) return;
  const el = document.documentElement;
  const body = document.body;
  if (open) {
    el.classList.add('modal-open');
    body.classList.add('modal-open');
  } else {
    el.classList.remove('modal-open');
    body.classList.remove('modal-open');
  }
});

onBeforeUnmount(() => {
  if (!import.meta.client) return;
  document.documentElement.classList.remove('modal-open');
  document.body.classList.remove('modal-open');
});

function isImage(file: File): boolean {
  return file.type.startsWith('image/');
}

async function convert3dToGlbIfPossible(file: File): Promise<File> {

  const ext = getExtension(file.name);

  logUploadStage('Конвертация в GLB: начало');

  if (ext === 'glb') {

    logUploadStage('Конвертация в GLB: файл уже GLB, пропуск');

    return file;

  }

  if (!import.meta.client)
    return file;

  const converted = await converterService.convertToGlb(file);

  logUploadStage('Конвертация в GLB: готово');

  return converted;

}

async function onChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] ?? null;
  logUploadStage(file ? `Выбран файл: ${file.name}` : 'Файл не выбран');
  await handleSelectedFile(file);
}

function openPicker() {
  fileInput.value?.click();
}

function clearSelectedFile(event?: MouseEvent) {
  event?.preventDefault();
  event?.stopPropagation();
  isPreviewOpen.value = false;
  resetPreview();
  originalFile.value = null;
  modelValue.value = null;
  isStlEdited.value = false;
  if (fileInput.value) fileInput.value.value = '';
}

function resetPreview() {
  errorMessage.value = null;
  emit('surface-click', null);
  lastPicked.value = null;
  previewKind.value = null;
  previewModelFormat.value = null;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = null;
  selectionCount.value = 0;
  paintedFacesCount.value = 0;
  totalFaces.value = 0;
  isStlEdited.value = false;
  editScalePercent.value = 100;
  editRotateXDeg.value = 0;
  editRotateYDeg.value = 0;
  editRotateZDeg.value = 0;
}

function resetGeometryTransforms() {
  editScalePercent.value = 100;
  editRotateXDeg.value = 0;
  editRotateYDeg.value = 0;
  editRotateZDeg.value = 0;
}

function waitForPreviewClose(): Promise<void> {
  if (!isPreviewOpen.value) return Promise.resolve();
  return new Promise((resolve) => {
    const stop = watch(isPreviewOpen, (open) => {
      if (!open) {
        stop();
        resolve();
      }
    });
  });
}


async function saveEditedStlAndUseInOrder() {
  if (!modelValue.value || !threeViewerRef.value) return;
  logUploadStage('Сохранение правок модели: начало');
  isSavingEditedStl.value = true;
  errorMessage.value = null;
  try {
    const stlString = await threeViewerRef.value.exportEditedStl({
      scalePercent: editScalePercent.value,
      rotateXDeg: editRotateXDeg.value,
      rotateYDeg: editRotateYDeg.value,
      rotateZDeg: editRotateZDeg.value,
    });
    if (!stlString) throw new Error('Не удалось получить STL из предпросмотра.');
    const stlName = buildEditedStlName(modelValue.value.name);
    const blob = new Blob([stlString], { type: 'model/stl' });
    const editedStlFile = new File([blob], stlName, { type: 'model/stl' });
    const editedGlbFile = await convert3dToGlbIfPossible(editedStlFile);
    const glbName = buildEditedGlbName(modelValue.value.name);
    const normalizedGlbFile = new File([editedGlbFile], glbName, { type: 'model/gltf-binary' });

    modelValue.value = normalizedGlbFile;
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = URL.createObjectURL(normalizedGlbFile);
    previewKind.value = 'glb';
    isStlEdited.value = false;
    logUploadStage('Сохранение правок модели: готово');
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Не удалось сохранить изменённый STL.';
    logUploadStage(`Сохранение правок модели: ошибка — ${errorMessage.value ?? ''}`);
  } finally {
    isSavingEditedStl.value = false;
  }
}

async function handleSelectedFile(file: File | null) {
  logUploadStage('Обработка файла: старт');
  resetPreview();
  originalFile.value = file;
  modelValue.value = null;

  if (!file) return;

  // создаём проект сразу после выбора файла
  await createProject(file);

  isBusy.value = true;
  try {
    if (isImage(file)) {
      logUploadStage('Определён тип: изображение');
      modelValue.value = file;

      await createProject(file);

      previewKind.value = 'image';
      previewUrl.value = URL.createObjectURL(file);
      isPreviewOpen.value = true;
      logUploadStage('Открыт предпросмотр изображения');
      await waitForPreviewClose();
      return;
    }

    const ext = getExtension(file.name);
    logUploadStage(`Определено расширение: .${ext}`);
    if (!is3dLikeExtension(ext)) {
      modelValue.value = file;
      errorMessage.value = 'Файл загружен, но формат не распознан как 3D или изображение.';
      isPreviewOpen.value = true;
      logUploadStage('Неподдерживаемый формат для предпросмотра');
      await waitForPreviewClose();
      return;
    }

    const working = await convert3dToGlbIfPossible(file);

    modelValue.value = working;

    await createProject(working);

    isStlEdited.value = false;
    previewKind.value = getExtension(working.name) === 'glb' ? 'glb' : null;
    if (previewKind.value === 'glb') {
      previewUrl.value = URL.createObjectURL(working);
      previewModelFormat.value = 'glb';
    }
    isPreviewOpen.value = true;
    logUploadStage('Открыт предпросмотр 3D (GLB)');
    await waitForPreviewClose();
  } catch (e) {
    modelValue.value = file;
    errorMessage.value = e instanceof Error ? e.message : 'Не удалось обработать файл.';
    isPreviewOpen.value = true;
    logUploadStage(`Ошибка обработки файла: ${errorMessage.value ?? ''}`);
    await waitForPreviewClose();
  } finally {
    isBusy.value = false;
    logUploadStage('Обработка файла: завершено');
  }
}

</script>

<template>
  <div class="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5">
    <div class="flex items-start justify-between gap-4">
      <div>
        <div class="text-sm font-semibold">Файл модели</div>
        <div class="mt-1 text-xs text-slate-400">
          3MF, OBJ, FBX, STL, DAE, GLTF, BLEND, SKP, IGES, STEP, VRML и др. • до 100 МБ
        </div>
      </div>
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] transition hover:brightness-110"
        @click="openPicker"
      >
        {{ isBusy ? 'Обработка...' : 'Выбрать файл' }}
      </button>
    </div>

    <div class="mt-4">
      <label
        class="relative flex cursor-pointer flex-col gap-2 rounded-xl border border-dashed border-slate-600/60 bg-slate-950/30 p-4 pr-12 text-sm text-slate-200"
      >
        <span class="relative z-10 text-slate-300">
          {{ originalFile?.name ?? modelValue?.name ?? 'Перетащите файл сюда или выберите на компьютере' }}
        </span>
        <button
          v-if="originalFile || modelValue"
          type="button"
          class="absolute right-3 top-1/2 z-20 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700/70 bg-slate-950/50 text-slate-200 transition hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
          aria-label="Очистить файл"
          @click="clearSelectedFile"
        >
          <span class="text-lg leading-none">×</span>
        </button>
        <input ref="fileInput" type="file" class="absolute inset-0 z-0 opacity-0" @change="onChange" />
      </label>
    </div>
  </div>

  <ClientOnly>
    <AppModal
      v-model="isPreviewOpen"
      fullscreen
    >
      <div
        class="fixed inset-0 flex flex-col bg-slate-950 p-4 sm:p-6 overflow-hidden"
      >
        <!-- Заголовок: фиксированная высота -->
        <div class="flex shrink-0 items-start justify-between gap-4 mb-4">
          <div>
            <div class="text-sm font-semibold">Предпросмотр</div>
            <div class="mt-1 text-xs text-slate-400">
              {{ modelValue?.name ?? originalFile?.name ?? '' }}
            </div>
          </div>
          <AppButton color="gray" variant="ghost" size="sm" @click="isPreviewOpen = false">Закрыть</AppButton>
        </div>

        <!-- Ошибка: если есть -->
        <div v-if="errorMessage" class="mb-4 shrink-0 rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-200">
          {{ errorMessage }}
        </div>

        <!-- Основная рабочая область: занимает всё оставшееся место -->
        <div class="flex flex-1 min-h-0 flex-col lg:flex-row gap-4 overflow-hidden">
          
          <template v-if="previewKind === 'image' && previewUrl">
            <div class="flex-1 flex items-center justify-center bg-slate-900/50 rounded-xl overflow-hidden">
              <img
                :src="previewUrl"
                alt="preview"
                class="max-h-full max-w-full object-contain"
              />
            </div>
          </template>

          <template v-else-if="previewKind === 'glb' && previewUrl">
            <!-- Левая часть: ThreeViewer (Максимальное пространство) -->
            <div class="flex-1 min-h-0 relative rounded-xl border border-slate-800/70 bg-slate-950/40 overflow-hidden">
              <ThreeViewer
                ref="threeViewerRef"
                class="absolute inset-0 w-full h-full"
                :model-url="previewUrl"
                :model-format="previewModelFormat"
                :slot-colors="[
                  resolveSlotColorHex(0),
                  resolveSlotColorHex(1),
                  resolveSlotColorHex(2),
                  resolveSlotColorHex(3),
                ]"
                :active-slot-index="activeSlotIndex"
                @stats-change="onViewerStatsChange"
                @surface-click="onViewerSurfaceClick"
                @error="onViewerError"
              />
            </div>

            <!-- Правая часть: Инструменты (Фиксированная ширина, независимый скролл) -->
            <div class="lg:w-[400px] w-full shrink-0 flex flex-col gap-4 min-h-0 overflow-hidden">
              <div class="flex-1 overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-4">
                <div class="text-sm font-semibold">Инструменты</div>

                <!-- Секция AMS слотов -->
                <div class="rounded-xl border border-slate-800/70 bg-slate-950/30 p-3">
                  <div class="flex items-center justify-between gap-2 mb-3">
                    <div class="text-xs font-semibold text-slate-200">AMS слоты</div>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        :disabled="!canAddAmsSlot"
                        class="inline-flex items-center gap-1 rounded-lg border border-slate-700/70 bg-slate-950/20 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-950/30 disabled:opacity-50"
                        @click="addMaterialSlot"
                      >
                        <span>+ Добавить</span>
                      </button>
                      <button
                        type="button"
                        :disabled="!canUndoLastAction"
                        class="rounded-lg border border-slate-700/70 bg-slate-950/20 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-950/30 disabled:opacity-50"
                        @click="undoLastViewerAction"
                      >
                        Отменить
                      </button>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <div
                      v-for="(slot, idx) in visibleAmsSlots"
                      :key="idx"
                      class="rounded-lg border p-2 transition"
                      :class="idx === activeSlotIndex ? 'border-sky-400/70 bg-sky-400/10' : 'border-slate-800/70 bg-slate-950/20'"
                    >
                      <div class="flex items-center justify-between gap-2">
                        <div class="text-[11px] font-semibold text-slate-200">Слот {{ idx + 1 }}</div>
                        <button
                          type="button"
                          class="rounded-md border border-slate-700/70 bg-slate-950/20 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-950/30"
                          @click="activeSlotIndex = idx"
                        >
                          Выбрать
                        </button>
                      </div>

                      <div class="mt-2">
                        <div class="text-[11px] text-slate-400">Материал</div>
                        <div class="relative mt-1">
                          <select
                            v-model="slot.material"
                            class="w-full appearance-none rounded-lg border border-slate-700/70 bg-slate-900/70 px-2 py-1.5 pr-8 text-xs text-slate-100 shadow-inner outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
                            @change="onSlotMaterialChange(idx)"
                          >
                            <option disabled value="">Выберите</option>
                            <option v-for="t in slotMaterials" :key="t" :value="t">
                              {{ materialLabel(t) }}
                            </option>
                          </select>
                          <span class="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-400">▾</span>
                        </div>
                      </div>

                      <div class="mt-2">
                        <div class="text-[11px] text-slate-400">Цвета материала</div>
                        <div class="mt-1 flex flex-wrap gap-2">
                          <button
                            v-for="c in colorsForType(slot.material)"
                            :key="c"
                            type="button"
                            :title="colorLabel(c)"
                            class="h-6 w-6 rounded-full border transition hover:scale-105"
                            :class="slot.color === c ? 'border-sky-300 ring-2 ring-sky-400/50' : 'border-slate-700/80'"
                            :style="{ backgroundColor: materialColorHex(slot.material, c) }"
                            @click="setSlotColor(idx, c)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Нижняя панель: всегда видна внизу правой колонки -->
              <div class="shrink-0 rounded-xl border border-slate-800/70 bg-slate-950/30 p-3">
                <div class="mb-2 text-[10px] leading-tight text-slate-400">
                  Клик: полигон • повторный клик по выделенному — снять • Shift+клик: мультивыбор • Ctrl/Cmd: поверхность
                </div>
                <div class="flex flex-col gap-2">
                  <button
                    type="button"
                    :disabled="!isStlEdited || isSavingEditedStl"
                    class="w-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                    @click="saveEditedStlAndUseInOrder"
                  >
                    {{ isSavingEditedStl ? 'Сохранение...' : 'Использовать изменённый GLB' }}
                  </button>
                  <a
                    :href="previewUrl"
                    :download="modelValue?.name || 'model.glb'"
                    class="w-full text-center rounded-full bg-slate-800/60 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
                  >
                    Скачать GLB
                  </a>
                </div>
              </div>
            </div>
          </template>

            <div v-else class="flex-1 flex items-center justify-center rounded-xl border border-slate-800/70 bg-slate-950/40 p-4 text-xs text-slate-300">
              Для этого типа файла предпросмотр пока недоступен.
            </div>
          </div>
        </div>
      </AppModal>
    </ClientOnly>
  </template>
