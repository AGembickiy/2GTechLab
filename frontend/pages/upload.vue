<template>
  <div class="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
    <div class="upload-page space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 class="text-2xl font-bold text-white">Загрузка модели или эскиза</h1>
        <p class="mt-2 text-sm text-slate-400">
          Определение типа по расширению, предпросмотр, слоты материалов (до 4) и расчёт стоимости через API.
        </p>
      </div>

      <UCard>
      <input
        type="file"
        class="block w-full cursor-pointer text-sm text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-sky-500"
        accept=".stl,.obj,.fbx,.dae,.gltf,.glb,.blend,.skp,.iges,.igs,.step,.stp,.wrl,.vrml,.jpg,.jpeg,.png,.svg"
        @change="onFileSelected"
      />
      <div v-if="uploadStatus" class="status mt-3 text-sm text-slate-300">
        {{ uploadStatus }}
      </div>
    </UCard>

    <UModal v-model="showModal" fullscreen :ui="{ width: 'max-w-full', margin: 'm-0', rounded: 'rounded-none' }">
      <div class="relative flex flex-col h-screen bg-black overflow-hidden">
        <!-- Header (Floating) -->
        <div class="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-slate-900/40 backdrop-blur-md border-b border-white/5 z-20">
          <span class="font-medium text-slate-200 text-xs uppercase tracking-widest">
            {{ is3D ? '3D Preview' : 'Sketch Preview' }}
          </span>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="closeModal" />
        </div>

        <!-- Viewer (Full Screen Background) -->
        <div class="absolute inset-0 z-0">
          <ClientOnly>
            <ThreeViewer
              v-if="is3D && stlPreviewUrl"
              ref="viewerRef"
              :model-url="stlPreviewUrl"
              :slot-colors="slotColors"
              :active-slot-index="activeSlotIndex"
              :materials="materials"
              class="h-full w-full"
              @surface-click="onSurfaceClick"
              @stats-change="onStatsChange"
              @material-select="(id) => {
                const slot = slots[activeSlotIndex];
                if (slot) {
                  slot.materialId = id;
                  onMaterialChange(slot);
                }
              }"
            />
          </ClientOnly>
        </div>

        <!-- Sidebar (Floating Right) -->
        <div class="absolute right-6 top-20 bottom-6 w-80 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden p-6">
          <div class="space-y-6 overflow-y-auto grow custom-scrollbar">
            <div class="space-y-3">
              <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Слоты материалов</h3>
              <div class="grid grid-cols-1 gap-2">
                <div v-for="slot in slots" :key="slot.index" 
                  class="flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer"
                  :class="activeSlotIndex === slot.index - 1 
                    ? 'border-sky-500/50 bg-sky-500/10 ring-1 ring-sky-500/50' 
                    : 'border-white/5 bg-white/5 hover:bg-white/10'"
                  @click="activeSlotIndex = slot.index - 1"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: slotColors[slot.index-1] }" />
                    <span class="text-xs font-medium text-slate-300">Слот {{ slot.index }}</span>
                  </div>
                  <span v-if="activeSlotIndex === slot.index - 1" class="text-[10px] text-sky-400 font-bold uppercase">Active</span>
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-white/5">
              <UButton
                block
                color="primary"
                size="md"
                variant="solid"
                class="rounded-xl shadow-lg shadow-sky-500/20"
                @click="assignSelectionToActiveSlot"
              >
                Назначить выбранным
              </UButton>
            </div>

            <div class="pt-4 border-t border-white/5">
              <UButton
                block
                color="gray"
                size="md"
                variant="outline"
                class="rounded-xl"
                @click="resetToBaseState"
              >
                Сбросить
              </UButton>
            </div>

            <div class="pt-4 border-t border-white/5 space-y-4">
              <UButton 
                class="w-full justify-center rounded-xl py-3" 
                :disabled="!isFormValid || busyCalc" 
                @click="submitForSlicing"
              >
                {{ busyCalc ? 'Считаем…' : 'Рассчитать стоимость' }}
              </UButton>
              
              <div v-if="calculationResult" class="result space-y-2 text-sm text-slate-200 bg-white/5 p-4 rounded-xl border border-white/5">
                <p v-if="calculationResult.detail" class="text-rose-400 text-xs">{{ calculationResult.detail }}</p>
                <template v-else>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-400 text-xs">Стоимость:</span>
                    <span class="font-bold text-sky-400 text-lg">{{ calculationResult.total_cost != null ? `${calculationResult.total_cost.toFixed(2)} ₽` : '—' }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-400 text-xs">Время печати:</span>
                    <span class="font-medium text-slate-200">{{ calculationResult.print_time_minutes != null ? `${calculationResult.print_time_minutes} мин` : '—' }}</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MaterialPresetDto, PrintJobResultDto } from '~/composables/usePrintApi';
import type { ThreeViewerSurfaceClickPayload } from '~/types/three-viewer';
import type { ComponentPublicInstance } from 'vue';

import ThreeViewer from '~/components/ThreeViewer.vue';

type SlotRow = { index: number; materialId: number | null; material: MaterialPresetDto | null };

const api = usePrintApi();
const uploadStatus = ref<string | null>(null);
const showModal = ref(false);
const is3D = ref(false);
const stlPreviewUrl = ref<string | null>(null);
const imagePreviewUrl = ref<string | null>(null);
// Добавляем переменную для отслеживания состояния рендеринга
const isRendering = ref(false);

const widthMm = ref(100);
const heightMm = ref(100);
const thicknessMm = ref(2);

const selectedSurfaces = ref<ThreeViewerSurfaceClickPayload[]>([]);
const materials = ref<MaterialPresetDto[]>([]);
const slots = reactive<SlotRow[]>([
  { index: 1, materialId: null, material: null },
  { index: 2, materialId: null, material: null },
  { index: 3, materialId: null, material: null },
  { index: 4, materialId: null, material: null },
]);

// Сохраняем базовые цвета слотов для сброса
const baseSlotColors = ref<string[]>(['#7dd3fc', '#7dd3fc', '#7dd3fc', '#7dd3fc']);
const maxSlots = 4;

const calculationResult = ref<PrintJobResultDto | null>(null);
const busyCalc = ref(false);
const activeSlotIndex = ref(0);

// Статистика по модели
const stats = ref({ selectedCount: 0, paintedFaces: 0, totalFaces: 0 });

let currentJobId: number | null = null;

const viewerRef = ref<ComponentPublicInstance | null>(null);

const slotColors = computed(() => slots.map((s) => (s.material?.color_hex ? s.material.color_hex : '#475569')));

// Функция сброса к базовому состоянию
function resetToBaseState() {
  // Сбрасываем цвета слотов к базовым значениям
  baseSlotColors.value = ['#7dd3fc', '#7dd3fc', '#7dd3fc', '#7dd3fc'];
  
  // Сбрасываем выбранные материалы в слотах
  slots.forEach(slot => {
    slot.materialId = null;
    slot.material = null;
  });
  
  // Уведомляем viewer о необходимости сброса
  nextTick(() => {
    (viewerRef.value as { resetToBaseState?: () => void } | null)?.resetToBaseState?.();
  });
}

const calcHint = computed(() => {
  if (!showModal.value) return '';
  if (is3D.value) {
    const mats = slots.filter((s) => s.material).length;
    if (mats === 0) return 'Выберите хотя бы один материал в слотах.';
    if (selectedSurfaces.value.length === 0) return 'Кликните по модели, чтобы выбрать полигон (поверхность).';
  }
  return '';
});

watch(showModal, (open) => {
  if (open) {
    void api
      .listMaterialPresets()
      .then((r) => {
        materials.value = r;
      })
      .catch(console.error);
  }
});

function onStatsChange(payload: { selectedCount: number; paintedFaces: number; totalFaces: number }) {
  stats.value = payload;
}

function onMaterialChange(slot: SlotRow) {
  const mat = materials.value.find((m) => m.id === slot.materialId);
  slot.material = mat ? { ...mat } : null;
  nextTick(() => {
    (viewerRef.value as { refreshVertexColorsFromSlots?: () => void } | null)?.refreshVertexColorsFromSlots?.();
  });
}

function onSurfaceClick(data: ThreeViewerSurfaceClickPayload) {
  if (!data) {
    selectedSurfaces.value = [];
    return;
  }
  const ev = typeof window !== 'undefined' ? window.event : undefined;
  const mouseEv = ev as MouseEvent | undefined;
  const isMultiSelect = !!(mouseEv && (mouseEv.ctrlKey || mouseEv.metaKey));

  if (isMultiSelect) {
    const idx = selectedSurfaces.value.findIndex((s) => s && data && s.id === data.id);
    if (idx > -1) selectedSurfaces.value.splice(idx, 1);
    else selectedSurfaces.value.push(data);
  } else {
    selectedSurfaces.value = [data];
  }
}

function assignSlotToSelection(slot: SlotRow) {
  if (!slot.material || selectedSurfaces.value.length === 0) return;
  activeSlotIndex.value = slot.index - 1;
  const v = viewerRef.value as { assignSelectionToActiveSlot?: () => void } | null;
  nextTick(() => v?.assignSelectionToActiveSlot?.());
}

function clearSlot(slot: SlotRow) {
  slot.materialId = null;
  slot.material = null;
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  uploadStatus.value = 'Загрузка…';
  calculationResult.value = null;
  try {
    const data = await api.uploadFile(file);
    currentJobId = data.job_id;
    is3D.value = data.is_3d;
    if (is3D.value && data.preview_url) {
      stlPreviewUrl.value = data.preview_url;
    } else {
      stlPreviewUrl.value = null;
    }
    if (!is3D.value) {
      if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value);
      imagePreviewUrl.value = URL.createObjectURL(file);
    } else if (imagePreviewUrl.value) {
      URL.revokeObjectURL(imagePreviewUrl.value);
      imagePreviewUrl.value = null;
    }
    uploadStatus.value = 'Готово';
    showModal.value = true;
  } catch (e: unknown) {
    const err = e as { data?: { detail?: string }; message?: string };
    uploadStatus.value = `Ошибка: ${err?.data?.detail ?? err?.message ?? 'загрузка'}`;
  } finally {
    input.value = '';
  }
}

function closeModal() {
  showModal.value = false;
}

const isFormValid = computed(() => {
  if (is3D.value) {
    return slots.filter((s) => s.material).length > 0 && selectedSurfaces.value.length > 0;
  }
  return widthMm.value > 0 && heightMm.value > 0 && thicknessMm.value > 0;
});

async function submitForSlicing() {
  if (currentJobId == null) return;
  busyCalc.value = true;
  calculationResult.value = null;
  try {
    const surfaceBySlot =
      (viewerRef.value as { getSurfaceIdsGroupedBySlot?: () => Record<number, string[]> } | null)?.getSurfaceIdsGroupedBySlot?.() ?? {
        0: [],
        1: [],
        2: [],
        3: [],
      };

    const assignments = slots
      .filter((s) => s.material)
      .map((slot) => ({
        slot_index: slot.index,
        material_preset_id: slot.material!.id,
        surface_ids: surfaceBySlot[slot.index - 1] ?? [],
      }));

    await api.startSlice(
      currentJobId,
      is3D.value
        ? { assignments }
        : {
            assignments,
            dimensions: {
              width_mm: widthMm.value,
              height_mm: heightMm.value,
              thickness_mm: thicknessMm.value,
            },
          },
    );

    for (let i = 0; i < 180; i++) {
      const r = await api.getPrintJobResult(currentJobId);
      if (r.status === 'error') {
        calculationResult.value = r;
        break;
      }
      if (r.ready && r.status === 'ready') {
        calculationResult.value = {
          ready: true,
          status: r.status,
          total_cost: r.total_cost ?? 0,
          print_time_minutes: r.print_time_minutes ?? 0,
          slots: r.slots,
        };
        break;
      }
      await new Promise((res) => setTimeout(res, 400));
    }
    if (!calculationResult.value) {
      calculationResult.value = {
        ready: false,
        status: 'timeout',
        detail: 'Не дождались ответа от сервера. Проверьте Celery или включите CELERY_EAGER=1.',
      };
    }
  } catch (e: unknown) {
    const err = e as { data?: { detail?: unknown }; message?: string };
    const detail = err?.data?.detail;
    calculationResult.value = {
      ready: true,
      status: 'error',
      detail:
        typeof detail === 'string'
          ? detail
          : `Ошибка расчёта: ${err?.message ?? JSON.stringify(detail ?? '')}`,
    };
  } finally {
    busyCalc.value = false;
  }
}
</script>
