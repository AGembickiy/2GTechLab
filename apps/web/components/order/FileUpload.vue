<script setup lang="ts">
import { useOrderForm } from '~/composables/useOrderForm';
import type { ThreeViewerSurfaceClickPayload } from '~/types/three-viewer';

type MaterialType = 'pla' | 'petg' | 'abs' | '';
type ColorType = 'white' | 'black' | 'gray' | 'custom' | '';

type MaterialDto = {
  id: number;
  type: Exclude<MaterialType, ''>;
  name: string;
  colorName: Exclude<ColorType, ''>;
  color: string; // hex like #RRGGBB
};

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
const previewKind = ref<'image' | 'stl' | null>(null);
const isClient = import.meta.client;
const threeViewerRef = ref<{
  clearSelection: () => void;
  assignSelectionToActiveSlot: () => void;
  paintAllToSlot: (slotIndex: number) => void;
  resetToSlot0: () => void;
  recolorSlot: (slotIndex: number) => void;
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

const { data: materialsData } = await useFetch<MaterialDto[]>('/api/materials', { server: false });
const materials = computed(() => materialsData.value ?? []);

const selectionCount = ref(0);
const totalFaces = ref(0);
const lastPicked = ref<ThreeViewerSurfaceClickPayload>(null);

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

const visibleAmsSlotsCount = computed(() => {
  const usedCount = form.amsSlots.reduce((acc, slot) => (slot.material ? acc + 1 : acc), 0);
  return Math.min(maxAmsSlots, Math.max(1, usedCount));
});

const visibleAmsSlots = computed(() => form.amsSlots.slice(0, visibleAmsSlotsCount.value));
const canAddAmsSlot = computed(() => visibleAmsSlotsCount.value < maxAmsSlots);

function onSlotMaterialChange(slotIndex: number) {
  const slot = form.amsSlots?.[slotIndex];
  if (!slot) return;
  const nextColors = colorsForType(slot.material);
  if (!nextColors.length) {
    slot.color = '';
  } else if (!slot.color || !nextColors.includes(slot.color as Exclude<ColorType, ''>)) {
    slot.color = nextColors[0];
  }
  threeViewerRef.value?.recolorSlot(slotIndex);
  if (slotIndex === activeSlotIndex.value && selectionCount.value > 0) {
    threeViewerRef.value?.assignSelectionToActiveSlot();
    isStlEdited.value = true;
  }
}

function setSlotColor(slotIndex: number, color: Exclude<ColorType, ''>) {
  const slot = form.amsSlots?.[slotIndex];
  if (!slot || !slot.material) return;
  slot.color = color;
  threeViewerRef.value?.recolorSlot(slotIndex);
  if (slotIndex === activeSlotIndex.value && selectionCount.value > 0) {
    threeViewerRef.value?.assignSelectionToActiveSlot();
    isStlEdited.value = true;
  }
}

function addMaterialSlot() {
  if (!canAddAmsSlot.value) return;
  const nextIndex = visibleAmsSlotsCount.value;
  const slot = form.amsSlots?.[nextIndex];
  if (!slot) return;

  const defaultMaterial = slotMaterials.value[0] ?? '';
  slot.material = defaultMaterial;
  const nextColors = colorsForType(defaultMaterial);
  slot.color = nextColors[0] ?? '';
  activeSlotIndex.value = nextIndex;
  threeViewerRef.value?.recolorSlot(nextIndex);
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
  },
  { immediate: true },
);

function resetPaintToSlot0() {
  // Return AMS UI to a single base slot so reset is visible in UI as well.
  const baseMaterial = slotMaterials.value[0] ?? '';
  const baseColor = colorsForType(baseMaterial)[0] ?? '';
  for (let i = 0; i < form.amsSlots.length; i++) {
    if (i === 0) {
      form.amsSlots[i].material = baseMaterial;
      form.amsSlots[i].color = baseColor;
    } else {
      form.amsSlots[i].material = '';
      form.amsSlots[i].color = '';
    }
  }
  activeSlotIndex.value = 0;
  threeViewerRef.value?.resetToSlot0();
  paintedFacesCount.value = 0;
  form.printType = 'single';
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

function onViewerStatsChange(payload: { selectedCount: number; paintedFaces: number; totalFaces: number }) {
  selectionCount.value = payload.selectedCount;
  paintedFacesCount.value = payload.paintedFaces;
  totalFaces.value = payload.totalFaces;
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

function getExtension(name: string): string {
  const parts = name.split('.');
  return (parts.length > 1 ? (parts.at(-1) ?? '') : '').toLowerCase();
}

function isImage(file: File): boolean {
  return file.type.startsWith('image/');
}

function is3dLikeExtension(ext: string): boolean {
  return [
    'stl',
    'obj',
    'gltf',
    'glb',
    'fbx',
    'dae',
    'blend',
    'skp',
    'igs',
    'iges',
    'step',
    'stp',
    'wrl',
    'vrml',
  ].includes(ext);
}

async function convert3dToStlIfPossible(file: File): Promise<File> {
  const ext = getExtension(file.name);
  if (ext === 'stl') return file;

  if (!import.meta.client) return file;

  // Server-assisted path: convert many 3D formats -> GLB using assimpjs (WASM on server),
  // then convert GLB -> STL on the client.
  const form = new FormData();
  form.append('file', file, file.name);

  const glbArrayBuffer = await $fetch<ArrayBuffer>('/api/convert-to-glb', {
    method: 'POST',
    body: form,
    responseType: 'arrayBuffer',
  });

  const [{ GLTFLoader }, { STLExporter }, { Scene }] = await Promise.all([
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three/examples/jsm/exporters/STLExporter.js'),
    import('three'),
  ]);

  const loader = new GLTFLoader();
  const gltf = await new Promise<any>((resolve, reject) => {
    loader.parse(glbArrayBuffer, '', resolve, reject);
  });

  const scene = new Scene();
  scene.add(gltf.scene);

  const exporter = new STLExporter();
  const stlString = exporter.parse(scene, { binary: false }) as string;
  const blob = new Blob([stlString], { type: 'model/stl' });
  return new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.stl', { type: 'model/stl' });
}

function onChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] ?? null;
  void handleSelectedFile(file);
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

function buildEditedStlName(sourceName: string): string {
  const baseName = sourceName.replace(/\.[^/.]+$/, '');
  if (baseName.endsWith('-edited')) return `${baseName}.stl`;
  return `${baseName}-edited.stl`;
}

async function saveEditedStlAndUseInOrder() {
  if (!modelValue.value || !threeViewerRef.value) return;
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
    const fileName = buildEditedStlName(modelValue.value.name);
    const blob = new Blob([stlString], { type: 'model/stl' });
    const editedFile = new File([blob], fileName, { type: 'model/stl' });

    modelValue.value = editedFile;
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = URL.createObjectURL(editedFile);
    previewKind.value = 'stl';
    isStlEdited.value = false;
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Не удалось сохранить изменённый STL.';
  } finally {
    isSavingEditedStl.value = false;
  }
}

async function handleSelectedFile(file: File | null) {
  resetPreview();
  originalFile.value = file;
  modelValue.value = null;
  if (!file) return;

  isBusy.value = true;
  try {
    if (isImage(file)) {
      modelValue.value = file;
      previewKind.value = 'image';
      previewUrl.value = URL.createObjectURL(file);
      isPreviewOpen.value = true;
      return;
    }

    const ext = getExtension(file.name);
    if (!is3dLikeExtension(ext)) {
      modelValue.value = file;
      errorMessage.value = 'Файл загружен, но формат не распознан как 3D или изображение.';
      isPreviewOpen.value = true;
      return;
    }

    const working = await convert3dToStlIfPossible(file);
    modelValue.value = working;
    isStlEdited.value = false;
    previewKind.value = getExtension(working.name) === 'stl' ? 'stl' : null;
    if (previewKind.value === 'stl') {
      previewUrl.value = URL.createObjectURL(working);
    }
    isPreviewOpen.value = true;
  } catch (e) {
    modelValue.value = file;
    errorMessage.value = e instanceof Error ? e.message : 'Не удалось обработать файл.';
    isPreviewOpen.value = true;
  } finally {
    isBusy.value = false;
  }
}

</script>

<template>
  <div class="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5">
    <div class="flex items-start justify-between gap-4">
      <div>
        <div class="text-sm font-semibold">Файл модели</div>
        <div class="mt-1 text-xs text-slate-400">
          OBJ, FBX, STL, DAE, GLTF, BLEND, SKP, IGES, STEP, VRML и др. • до 100 МБ
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
    <UModal
      v-if="isClient"
      v-model="isPreviewOpen"
      :ui="{
        overlay: {
          // Darken the background so underlying UI (file drop text) doesn't show through.
          base: 'fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-sm transition-opacity',
        },
        inner: 'fixed inset-0 z-[201] overflow-y-auto overflow-x-hidden',
        container: 'flex min-h-full items-center justify-center px-3 py-4 sm:px-4',
        padding: 'p-4 sm:p-6',
        width: 'w-full',
        height: 'h-full',
        rounded: 'rounded-2xl',
        margin: 'm-0',
      }"
    >
      <div
        class="mx-auto flex w-full max-w-[min(100vw-1rem,1200px)] flex-col rounded-2xl border border-slate-800/70 bg-slate-950 p-5 text-left text-slate-100 sm:p-6 max-h-[calc(100dvh-1.5rem)] min-h-0 overflow-y-auto sm:max-h-[calc(100dvh-2rem)]"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-sm font-semibold">Предпросмотр</div>
            <div class="mt-1 text-xs text-slate-400">
              {{ modelValue?.name ?? originalFile?.name ?? '' }}
            </div>
          </div>
          <UButton color="gray" variant="ghost" size="sm" @click="isPreviewOpen = false">Закрыть</UButton>
        </div>

        <div v-if="errorMessage" class="mt-4 rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-200">
          {{ errorMessage }}
        </div>

        <div class="mt-4 flex min-h-[50vh] flex-1 flex-col gap-0 overflow-visible lg:min-h-[min(520px,65vh)]">
          <img
            v-if="previewKind === 'image' && previewUrl"
            :src="previewUrl"
            alt="preview"
            class="h-full w-full rounded-xl object-contain"
          />

          <div
            v-else-if="previewKind === 'stl' && previewUrl"
            class="flex min-h-0 flex-1 flex-col gap-4 rounded-xl border border-slate-800/70 bg-slate-950/40 p-4 sm:p-5 lg:min-h-[480px] lg:flex-row lg:items-stretch"
          >
            <ThreeViewer
              ref="threeViewerRef"
              :model-url="previewUrl"
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

            <div
              class="flex w-full shrink-0 flex-col gap-4 rounded-xl border border-slate-800/50 bg-slate-950/50 p-3 sm:p-4 lg:max-h-[min(85vh,720px)] lg:min-h-0 lg:w-[380px] lg:flex-1 lg:overflow-y-auto"
            >
              <div class="text-sm font-semibold">Инструменты</div>

              <div class="rounded-xl border border-slate-800/70 bg-slate-950/30 p-3">
                <div class="flex items-center justify-between gap-2">
                  <div class="text-xs font-semibold text-slate-200">AMS слоты</div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      :disabled="!canAddAmsSlot"
                      class="inline-flex items-center gap-1 rounded-lg border border-slate-700/70 bg-slate-950/20 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-950/30 disabled:cursor-not-allowed disabled:opacity-50"
                      @click="addMaterialSlot"
                    >
                      <span class="text-sm leading-none">+</span>
                      <span>Добавить материал</span>
                    </button>
                    <button
                      type="button"
                      class="rounded-lg border border-slate-700/70 bg-slate-950/20 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-950/30"
                      @click="resetPaintToSlot0"
                    >
                      Сброс
                    </button>
                  </div>
                </div>

                <div class="mt-3 max-h-[min(40vh,360px)] space-y-2 overflow-y-auto overflow-x-hidden pr-1 sm:max-h-none">
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
                      <select
                        v-model="slot.material"
                        class="mt-1 w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-2 py-1 text-xs text-slate-100 outline-none"
                        @change="onSlotMaterialChange(idx)"
                      >
                        <option disabled value="">Выберите</option>
                        <option v-for="t in slotMaterials" :key="t" :value="t">
                          {{ materialLabel(t) }}
                        </option>
                      </select>
                    </div>

                    <div class="mt-2">
                      <div class="text-[11px] text-slate-400">Цвета материала</div>
                      <div class="mt-1 flex flex-wrap gap-2">
                        <button
                          v-for="c in colorsForType(slot.material)"
                          :key="c"
                          type="button"
                          :title="colorLabel(c)"
                          :aria-label="colorLabel(c)"
                          class="h-6 w-6 rounded-full border transition hover:scale-105"
                          :class="slot.color === c ? 'border-sky-300 ring-2 ring-sky-400/50' : 'border-slate-700/80'"
                          :style="{ backgroundColor: materialColorHex(slot.material, c) }"
                          @click="setSlotColor(idx, c)"
                        />
                        <span v-if="!slot.material" class="text-[11px] text-slate-500">Сначала выберите материал</span>
                      </div>
                    </div>

                    <div class="mt-2 flex items-center justify-between gap-2">
                      <div class="text-[11px] text-slate-400">Текущий</div>
                      <div
                        class="h-6 w-10 rounded border border-slate-700"
                        :style="{ backgroundColor: resolveSlotColorHex(idx) }"
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div class="mt-auto rounded-xl border border-slate-800/70 bg-slate-950/30 p-3">
                <div class="mb-2 text-xs text-slate-300">
                  Выбор: клик по полигону • Мультивыбор: Ctrl/Cmd+клик • Вращение: мышь • Зум: колесо
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    :disabled="!isStlEdited || isSavingEditedStl"
                    class="inline-flex rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    @click="saveEditedStlAndUseInOrder"
                  >
                    {{ isSavingEditedStl ? 'Сохранение...' : 'Использовать изменённый STL' }}
                  </button>
                  <a
                    :href="previewUrl"
                    :download="modelValue?.name || 'model.stl'"
                    class="inline-flex rounded-full bg-slate-800/60 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
                  >
                    Скачать STL
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="rounded-xl border border-slate-800/70 bg-slate-950/40 p-4 text-xs text-slate-300">
            Для этого типа файла предпросмотр пока недоступен.
          </div>
        </div>
      </div>
    </UModal>
  </ClientOnly>
</template>

