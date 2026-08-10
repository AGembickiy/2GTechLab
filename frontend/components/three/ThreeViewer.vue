<template>
  <div ref="canvasWrap" class="relative w-full h-full bg-slate-900/50 overflow-hidden">
    <canvas
      ref="canvas"
      class="w-full h-full block"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
    />
    
    <!-- Убрали дебаг-инфо и переделали структуру под overlay или боковую панель если нужно -->
    <div v-if="materials.length" class="absolute right-4 top-4 w-64 max-h-[calc(100%-2rem)] overflow-y-auto p-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl flex flex-col gap-4">
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-wider">Материал</h3>
        <div class="grid grid-cols-1 gap-2">
          <button
            v-for="mat in materials"
            :key="mat.id"
            class="flex items-center gap-3 p-2 rounded-lg border transition-all text-left"
            :class="[
              activeSlotIndex === mat.id 
                ? 'border-sky-500 bg-sky-500/20 ring-1 ring-sky-500' 
                : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
            ]"
            @click="emit('material-select', mat.id)"
          >
            <div 
              class="w-4 h-4 rounded-full border border-white/20" 
              :style="{ backgroundColor: mat.color_hex }"
            />
            <span class="text-xs text-slate-200 font-medium truncate">{{ mat.name }}</span>
          </button>
        </div>
      </section>
      <slot name="controls" />
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { rgb01ForFacePaint } from '~/utils/three/colors';
import { resolveSelectionModesFromPointer } from '~/utils/three/pointerModes';
import { resolveRecolorScope } from '~/utils/three/recolorScope';
import { resolveSelectionFlow } from '~/utils/three/selectionFlow';
import { popUndoSnapshot, pushUndoSnapshot } from '~/utils/three/undoStack';
import {
  VIEWER_CLEAR_COLOR_HEX,
  VIEWER_SELECTION_OVERLAY_OPACITY,
  VIEWER_TONE_MAPPING_EXPOSURE,
} from '~/utils/three/renderConfig';

const props = withDefaults(
  defineProps<{
    modelUrl: string | null;
    modelFormat?: 'stl' | 'glb' | 'gltf' | null;
    scale?: number;
    rotationX?: number;
    rotationY?: number;
    rotationZ?: number;
    slotColors?: string[];
    activeSlotIndex?: number;
    materials?: Array<{ id: number; name: string; color_hex: string }>;
  }>(),
  {
    modelUrl: null,
    modelFormat: null,
    scale: 1,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    slotColors: () => ['#7dd3fc', '#7dd3fc', '#7dd3fc', '#7dd3fc'],
    activeSlotIndex: 0,
    materials: () => [],
  },
);

const emit = defineEmits<{
  (e: 'update:params', params: { scale: number; rotationX: number; rotationY: number; rotationZ: number }): void;
  (e: 'stats-change', stats: { selectedCount: number; paintedFaces: number; totalFaces: number; undoAvailable: boolean }): void;
  (e: 'surface-click', payload: { id: string; index: number; type: string } | null): void;
  (e: 'error', message: string): void;
  (e: 'material-select', materialId: number): void;
  (e: 'reset-to-base'): void;
}>();

const DEFAULT_COLOR_HEX = '#7dd3fc';
const SELECTION_HIGHLIGHT_HEX = '#ca8a04';
const POS_KEY_EPS = 0.001;
const POLYGON_ANGLE_DEG = 15;
const DEBUG_SELECTION = false;
const MAX_UNDO_HISTORY = 50;

let viewer: any = null;
let undoHistory: Uint8Array[] = [];

// Хранилище базовых и текущих параметров для каждой грани
interface FaceState {
  baseColor: string;
  currentColor: string;
  baseMaterial: number | null;
  currentMaterial: number | null;
}

// Массив состояний для всех граней
let faceStates: FaceState[] = [];

const canvas = ref<HTMLCanvasElement | null>(null);
const canvasWrap = ref<HTMLElement | null>(null);

const selectedSelectionIds = ref(new Set<string>());
const selectedFaceIndices = ref(new Set<number>());
const lastPicked = ref<{ id: string; index: number; type: string } | null>(null);

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let mesh: THREE.Mesh | null = null;
const keyboardState = reactive({
  shift: false,
  ctrlOrMeta: false,
});

function logSelectionDebug(message: string, payload?: Record<string, unknown>) {
  if (!DEBUG_SELECTION) return;
  if (payload) {
    console.info(`[ThreeViewer] ${message}`, payload);
    return;
  }
  console.info(`[ThreeViewer] ${message}`);
}

function logSelectionDebugFlat(message: string, payload: Record<string, unknown>) {
  if (!DEBUG_SELECTION) return;
  const flat = Object.entries(payload)
    .map(([k, v]) => `${k}=${String(v)}`)
    .join(' ');
  console.info(`[ThreeViewer] ${message} ${flat}`);
}

function updateKeyboardStateFromEvent(ev: KeyboardEvent | PointerEvent) {
  keyboardState.shift = Boolean(ev.shiftKey);
  keyboardState.ctrlOrMeta = Boolean(ev.ctrlKey || ev.metaKey);
}

function onWindowKeyDown(ev: KeyboardEvent) {
  updateKeyboardStateFromEvent(ev);
  logSelectionDebugFlat('key:down', {
    key: ev.key,
    shift: keyboardState.shift,
    ctrlOrMeta: keyboardState.ctrlOrMeta,
  });
}

function onWindowKeyUp(ev: KeyboardEvent) {
  updateKeyboardStateFromEvent(ev);
  logSelectionDebugFlat('key:up', {
    key: ev.key,
    shift: keyboardState.shift,
    ctrlOrMeta: keyboardState.ctrlOrMeta,
  });
}

function resetKeyboardState() {
  keyboardState.shift = false;
  keyboardState.ctrlOrMeta = false;
}

function getUrlExtension(url: string): string {
  const clean = url.split('?')[0]?.split('#')[0] ?? '';
  const idx = clean.lastIndexOf('.');
  if (idx === -1) return '';
  return clean.slice(idx + 1).toLowerCase();
}

function initScene() {
  // initScene is now handled by initViewer
}

function updateMeshTransform() {
  if (!viewer?.mesh) return;
  viewer.mesh.scale.set(props.scale, props.scale, props.scale);
  viewer.mesh.rotation.set(props.rotationX, props.rotationY, props.rotationZ);
  if (viewer.selectionOverlayMesh) {
    viewer.selectionOverlayMesh.scale.set(props.scale, props.scale, props.scale);
    viewer.selectionOverlayMesh.rotation.set(props.rotationX, props.rotationY, props.rotationZ);
  }
}

watch([() => props.scale, () => props.rotationX, () => props.rotationY, () => props.rotationZ], updateMeshTransform);


let cleanup: (() => void) | null = null;
const pointerDown = ref<{
  x: number;
  y: number;
  pointerId: number;
  shiftKey: boolean;
  ctrlOrMetaKey: boolean;
} | null>(null);
const pointerMoveThresholdPx = 12;

function emitStats() {
  emit('stats-change', {
    selectedCount: selectedSelectionIds.value.size,
    paintedFaces: viewer?.nonZeroFaceCount ?? 0,
    totalFaces: viewer?.triangleCount ?? 0,
    undoAvailable: undoHistory.length > 0,
  });
}

function slotColorHex(slotIndex: number): string {
  return props.slotColors?.[slotIndex] ?? DEFAULT_COLOR_HEX;
}

/** Короткий лог шага предпросмотра (без объектов). */
function logPreviewStep(message: string) {
  if (!import.meta.client) return;
  console.info(message);
}

function logPaintToConsole(
  kind: 'выбор' | 'покраска' | 'снятие_выделения' | 'перекраска_слота',
  detail: {
    polygonId?: number;
    mode?: 'polygon' | 'surface';
    slotIndex?: number;
    colorHex?: string;
    triangles?: number;
    slotFaces?: number;
    scope?: 'вся_модель' | 'выделение' | 'по_слоту';
  },
) {
  const n = (detail.slotIndex ?? 0) + 1;
  if (kind === 'перекраска_слота') {
    if (detail.scope === 'выделение') {
      logPreviewStep(`Предпросмотр: задан цвет слота ${n} только для выделения`);
    } else {
      logPreviewStep(`Предпросмотр: задан цвет слота ${n} для всей модели в этом слоте`);
    }
    return;
  }
  if (kind === 'снятие_выделения') {
    logPreviewStep('Предпросмотр: снято выделение');
    return;
  }
  if (kind === 'выбор') {
    if (detail.mode === 'surface') {
      logPreviewStep(`Предпросмотр: выбрана грань, слот ${n}`);
    } else {
      logPreviewStep(`Предпросмотр: выбран полигон, слот ${n}`);
    }
    return;
  }
  if (detail.mode === 'surface') {
    logPreviewStep(`Предпросмотр: выбрана грань, цвет слота ${n}`);
  } else {
    logPreviewStep(`Предпросмотр: выбран полигон, цвет слота ${n}`);
  }
}

function applySlotColorToFace(faceIndex: number, rgb01: [number, number, number]) {
  if (!viewer) return;
  const vBase = faceIndex * 3;
  const [r, g, b] = rgb01;
  const base0 = (vBase + 0) * 3;
  viewer.colorArray[base0 + 0] = r;
  viewer.colorArray[base0 + 1] = g;
  viewer.colorArray[base0 + 2] = b;
  const base1 = (vBase + 1) * 3;
  viewer.colorArray[base1 + 0] = r;
  viewer.colorArray[base1 + 1] = g;
  viewer.colorArray[base1 + 2] = b;
  const base2 = (vBase + 2) * 3;
  viewer.colorArray[base2 + 0] = r;
  viewer.colorArray[base2 + 1] = g;
  viewer.colorArray[base2 + 2] = b;
}

function markColorsDirty() {
  if (!viewer) return;
  viewer.colorAttr.needsUpdate = true;
  if (viewer.mesh?.geometry?.attributes?.color) {
    viewer.mesh.geometry.attributes.color.needsUpdate = true;
  }
  if (viewer.mesh?.material) {
    const mat = viewer.mesh.material as THREE.Material & { vertexColors?: boolean };
    if ('vertexColors' in mat) mat.vertexColors = true;
    mat.needsUpdate = true;
  }
}

function disposeSelectionOverlay() {
  if (!viewer?.selectionOverlayMesh) return;
  const overlay = viewer.selectionOverlayMesh as THREE.Mesh;
  viewer.scene?.remove(overlay);
  overlay.geometry?.dispose?.();
  const mat = overlay.material as THREE.Material | THREE.Material[] | undefined;
  if (Array.isArray(mat)) mat.forEach((m) => m.dispose?.());
  else mat?.dispose?.();
  viewer.selectionOverlayMesh = null;
}

function syncSelectionOverlay() {
  if (!viewer?.mesh || !viewer?.scene) return;
  if (!selectedFaceIndices.value.size) {
    disposeSelectionOverlay();
    return;
  }
  const posArray = viewer.positionArray as Float32Array;
  const selectedCount = selectedFaceIndices.value.size;
  const overlayPositions = new Float32Array(selectedCount * 9);
  let dst = 0;
  for (const faceIndex of selectedFaceIndices.value) {
    const src = faceIndex * 9;
    overlayPositions[dst++] = posArray[src + 0];
    overlayPositions[dst++] = posArray[src + 1];
    overlayPositions[dst++] = posArray[src + 2];
    overlayPositions[dst++] = posArray[src + 3];
    overlayPositions[dst++] = posArray[src + 4];
    overlayPositions[dst++] = posArray[src + 5];
    overlayPositions[dst++] = posArray[src + 6];
    overlayPositions[dst++] = posArray[src + 7];
    overlayPositions[dst++] = posArray[src + 8];
  }
  const overlayGeometry = new THREE.BufferGeometry();
  overlayGeometry.setAttribute('position', new THREE.Float32BufferAttribute(overlayPositions, 3));
  const overlayMaterial = new THREE.MeshBasicMaterial({
    color: SELECTION_HIGHLIGHT_HEX,
    transparent: true,
    opacity: VIEWER_SELECTION_OVERLAY_OPACITY,
    side: THREE.DoubleSide,
    depthTest: false,
    depthWrite: false,
  });
  const overlayMesh = new THREE.Mesh(overlayGeometry, overlayMaterial);
  overlayMesh.renderOrder = 999;
  overlayMesh.position.copy(viewer.mesh.position);
  overlayMesh.rotation.copy(viewer.mesh.rotation);
  overlayMesh.scale.copy(viewer.mesh.scale);
  disposeSelectionOverlay();
  viewer.scene.add(overlayMesh);
  viewer.selectionOverlayMesh = overlayMesh;
}

function repaintFace(faceIndex: number) {
  if (!viewer) return;
  const slotIndex = viewer.faceSlotByFaceIndex[faceIndex];
  applySlotColorToFace(faceIndex, rgb01ForFacePaint(slotColorHex(slotIndex)));
}

function paintFaces(faceIndices: number[], slotIndex: number) {
  if (!viewer) return;
  let hasChanges = false;
  for (const faceIndex of faceIndices) {
    if (faceIndex < 0 || faceIndex >= viewer.triangleCount) continue;
    if (viewer.faceSlotByFaceIndex[faceIndex] !== slotIndex) {
      hasChanges = true;
      break;
    }
  }
  if (!hasChanges) return;
  undoHistory = pushUndoSnapshot({
    history: undoHistory,
    current: viewer.faceSlotByFaceIndex,
    maxEntries: MAX_UNDO_HISTORY,
  });
  
  const rgb01 = rgb01ForFacePaint(slotColorHex(slotIndex));
  
  for (const faceIndex of faceIndices) {
    if (faceIndex < 0 || faceIndex >= viewer.triangleCount) continue;
    
    // Обновляем состояние грани
    faceStates[faceIndex].currentColor = slotColorHex(slotIndex);
    faceStates[faceIndex].currentMaterial = slotIndex;
    
    const prevSlot = viewer.faceSlotByFaceIndex[faceIndex];
    if (prevSlot === slotIndex) continue;
    if (prevSlot === 0 && slotIndex !== 0) viewer.nonZeroFaceCount += 1;
    if (prevSlot !== 0 && slotIndex === 0) viewer.nonZeroFaceCount -= 1;
    viewer.faceSlotByFaceIndex[faceIndex] = slotIndex;
    applySlotColorToFace(faceIndex, rgb01);
  }
  markColorsDirty();
  emitStats();
}

function clearSelectionOnly() {
  if (!viewer) {
    selectedFaceIndices.value.clear();
    selectedSelectionIds.value.clear();
    emitStats();
    return;
  }
  selectedFaceIndices.value.clear();
  selectedSelectionIds.value.clear();
  syncSelectionOverlay();
  lastPicked.value = null;
  emit('surface-click', null);
  emitStats();
}

function assignSelectionToActiveSlot() {
  if (!viewer || !selectedFaceIndices.value.size) return;
  const target = Array.from(selectedFaceIndices.value);
  if (!target.length) return;
  paintFaces(target, props.activeSlotIndex);
  logPreviewStep(`Предпросмотр: выделение назначено на слот ${props.activeSlotIndex + 1}`);
  syncSelectionOverlay();
  emitStats();
}

function addSelection(selectionId: string, faces: number[]) {
  selectedSelectionIds.value.add(selectionId);
  for (const f of faces) selectedFaceIndices.value.add(f);
}

function removeSelection(selectionId: string, faces: number[]) {
  selectedSelectionIds.value.delete(selectionId);
  for (const f of faces) selectedFaceIndices.value.delete(f);
}

/** Пересчитать вершинные цвета по текущим faceSlot и props.slotColors (без смены слотов). */
function refreshVertexColorsFromSlots() {
  if (!viewer) return;
  for (let f = 0; f < viewer.triangleCount; f++) {
    repaintFace(f);
  }
  markColorsDirty();
  emitStats();
}

function paintAllToSlot(slotIndex: number) {
  if (!viewer) return;
  let hasChanges = false;
  for (let f = 0; f < viewer.triangleCount; f++) {
    if (viewer.faceSlotByFaceIndex[f] !== slotIndex) {
      hasChanges = true;
      break;
    }
  }
  if (!hasChanges) return;
  
  // Обновляем базовые параметры для всех граней
  for (let i = 0; i < faceStates.length; i++) {
    faceStates[i].baseColor = slotColorHex(slotIndex);
    faceStates[i].baseMaterial = slotIndex;
    // Текущие параметры обновляем только для неизмененных элементов
    if (faceStates[i].currentColor === faceStates[i].baseColor && 
        faceStates[i].currentMaterial === faceStates[i].baseMaterial) {
      faceStates[i].currentColor = slotColorHex(slotIndex);
      faceStates[i].currentMaterial = slotIndex;
    }
  }
  
  undoHistory = pushUndoSnapshot({
    history: undoHistory,
    current: viewer.faceSlotByFaceIndex,
    maxEntries: MAX_UNDO_HISTORY,
  });
  viewer.faceSlotByFaceIndex.fill(slotIndex);
  viewer.nonZeroFaceCount = slotIndex === 0 ? 0 : viewer.triangleCount;
  const rgb01 = rgb01ForFacePaint(slotColorHex(slotIndex));
  const [r, g, b] = rgb01;
  for (let v = 0; v < viewer.vertexCount; v++) {
    const i = v * 3;
    viewer.colorArray[i + 0] = r;
    viewer.colorArray[i + 1] = g;
    viewer.colorArray[i + 2] = b;
  }
  markColorsDirty();
  emitStats();
}

function resetToSlot0() {
  clearSelectionOnly();
  paintAllToSlot(0);
}

/**
 * Сброс состояния модели к базовому
 */
function resetToBaseState() {
  if (!viewer) return;
  
  // Сбрасываем состояние всех граней к базовому
  for (let i = 0; i < faceStates.length; i++) {
    faceStates[i].currentColor = faceStates[i].baseColor;
    faceStates[i].currentMaterial = faceStates[i].baseMaterial;
  }
  
  // Сбрасываем слоты на базовые значения
  for (let f = 0; f < viewer.triangleCount; f++) {
    viewer.faceSlotByFaceIndex[f] = faceStates[f].baseMaterial || 0;
  }
  
  // Обновляем статистику
  viewer.nonZeroFaceCount = viewer.faceSlotByFaceIndex.reduce(
    (count: number, slot: number) => (slot !== 0 ? count + 1 : count),
    0
  );
  
  // Обновляем цвета
  for (let f = 0; f < viewer.triangleCount; f++) {
    const baseColor = faceStates[f].baseColor;
    const rgb01 = rgb01ForFacePaint(baseColor);
    applySlotColorToFace(f, rgb01);
  }
  
  markColorsDirty();
  emitStats();
  
  // Уведомляем родительский компонент
  emit('reset-to-base');
}

/** Слоты вьювера 0..3 → списки id вида `polygon_<id>` для API (`slot_index` 1..4). */
function getSurfaceIdsGroupedBySlot(): Record<number, string[]> {
  const out: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [] };
  if (!viewer) return out;
  for (let f = 0; f < viewer.triangleCount; f++) {
    const sl = viewer.faceSlotByFaceIndex[f];
    if (sl < 0 || sl > 3) continue;
    const polyId = viewer.facePolygonByFaceIndex[f];
    const sid = `polygon_${polyId}`;
    const arr = out[sl];
    if (arr && !arr.includes(sid)) arr.push(sid);
  }
  return out;
}

/**
 * Смена цвета катушки AMS в форме.
 * Без выделения — новый оттенок у всех граней этого слота.
 * С выделением — только выделенные грани получают этот слот и новый цвет.
 */
function recolorSlot(slotIndex: number) {
  if (!viewer) return;
  const recolorScope = resolveRecolorScope({
    selectedFacesCount: selectedFaceIndices.value.size,
  });
  
  // При отсутствии выделения применяем глобальное изменение только к неизмененным элементам
  if (recolorScope === 'none') {
    const rgb01 = rgb01ForFacePaint(slotColorHex(slotIndex));
    let hasChanges = false;
    
    // Ищем элементы, которые не были изменены (их текущие параметры совпадают с базовыми)
    for (let i = 0; i < faceStates.length; i++) {
      if (faceStates[i].currentColor === faceStates[i].baseColor && 
          faceStates[i].currentMaterial === faceStates[i].baseMaterial) {
        
        // Обновляем только базовые параметры, не затрагивая измененные элементы
        faceStates[i].baseColor = slotColorHex(slotIndex);
        faceStates[i].baseMaterial = slotIndex;
        
        // Поскольку это неизмененный элемент, его текущие параметры тоже обновляем
        faceStates[i].currentColor = slotColorHex(slotIndex);
        faceStates[i].currentMaterial = slotIndex;
        
        hasChanges = true;
      }
    }
    
    if (!hasChanges) return;
    
    // Применяем изменения только к неизмененным элементам
    undoHistory = pushUndoSnapshot({
      history: undoHistory,
      current: viewer.faceSlotByFaceIndex,
      maxEntries: MAX_UNDO_HISTORY,
    });
    
    // Обновляем слоты и цвета только для неизмененных элементов
    for (let f = 0; f < viewer.triangleCount; f++) {
      if (faceStates[f].currentColor === faceStates[f].baseColor && 
          faceStates[f].currentMaterial === faceStates[f].baseMaterial) {
        
        // Обновляем слот
        viewer.faceSlotByFaceIndex[f] = slotIndex;
        
        // Обновляем цвет
        applySlotColorToFace(f, rgb01);
      }
    }
    
    // Обновляем статистику
    viewer.nonZeroFaceCount = viewer.faceSlotByFaceIndex.reduce(
      (count: number, slot: number) => (slot !== 0 ? count + 1 : count),
      0
    );
    
    markColorsDirty();
    emitStats();
    logPreviewStep(`Предпросмотр: частичное глобальное изменение цвета на слот ${slotIndex + 1} применено к неизмененным элементам`);
    return;
  }
  
  // При наличии выделения - изменяем только выделенные грани
  const rgb01 = rgb01ForFacePaint(slotColorHex(slotIndex));
  let slotFaces = 0;
  
  if (recolorScope === 'selection') {
    undoHistory = pushUndoSnapshot({
      history: undoHistory,
      current: viewer.faceSlotByFaceIndex,
      maxEntries: MAX_UNDO_HISTORY,
    });
    
    for (const f of selectedFaceIndices.value) {
      if (f < 0 || f >= viewer.triangleCount) continue;
      
      // Обновляем состояние конкретной грани
      faceStates[f].currentColor = slotColorHex(slotIndex);
      faceStates[f].currentMaterial = slotIndex;
      
      const prevSlot = viewer.faceSlotByFaceIndex[f];
      if (prevSlot !== slotIndex) {
        if (prevSlot === 0 && slotIndex !== 0) viewer.nonZeroFaceCount += 1;
        if (prevSlot !== 0 && slotIndex === 0) viewer.nonZeroFaceCount -= 1;
        viewer.faceSlotByFaceIndex[f] = slotIndex;
      }
      applySlotColorToFace(f, rgb01);
      slotFaces += 1;
    }
    
    logPaintToConsole('перекраска_слота', {
      slotIndex,
      colorHex: slotColorHex(slotIndex),
      slotFaces,
      scope: 'выделение',
    });
  }
  markColorsDirty();
  syncSelectionOverlay();
  emitStats();
}

function undoLastAction() {
  if (!viewer) return;
  const popResult = popUndoSnapshot({ history: undoHistory });
  undoHistory = popResult.nextHistory;
  if (!popResult.snapshot) {
    emitStats();
    return;
  }
  viewer.faceSlotByFaceIndex = new Uint8Array(popResult.snapshot);
  viewer.nonZeroFaceCount = viewer.faceSlotByFaceIndex.reduce(
    (count: number, slot: number) => (slot !== 0 ? count + 1 : count),
    0,
  );
  clearSelectionOnly();
  refreshVertexColorsFromSlots();
}

function vertexPosToKeyFromArray(posArray: Float32Array, vIndex: number): string {
  const idx = vIndex * 3;
  const x = posArray[idx];
  const y = posArray[idx + 1];
  const z = posArray[idx + 2];
  return `${Math.round(x / POS_KEY_EPS)},${Math.round(y / POS_KEY_EPS)},${Math.round(z / POS_KEY_EPS)}`;
}

function pickFaceAtPointer(clientX: number, clientY: number): number | null {
  if (!viewer || !canvas.value) return null;
  const rect = canvas.value.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * 2 - 1;
  const y = -(((clientY - rect.top) / rect.height) * 2 - 1);
  viewer.raycaster.setFromCamera({ x, y }, viewer.camera);
  const intersects = viewer.raycaster.intersectObject(viewer.mesh, false);
  const hit = intersects?.[0];
  if (!hit) return null;
  const faceIndexFromHit =
    typeof hit.faceIndex === 'number'
      ? (hit.faceIndex as number)
      : typeof (hit as any).face?.a === 'number'
        ? Math.floor(((hit as any).face.a as number) / 3)
        : null;
  if (faceIndexFromHit === null) return null;
  if (faceIndexFromHit < 0 || faceIndexFromHit >= viewer.triangleCount) return null;
  return faceIndexFromHit;
}

function processSelection(clientX: number, clientY: number, withMulti: boolean, forceSurface: boolean) {
  if (!viewer || !canvas.value) return;
  try {
    logSelectionDebug('processSelection:start', {
      clientX,
      clientY,
      withMulti,
      forceSurface,
      beforeSelectedSelectionIds: selectedSelectionIds.value.size,
      beforeSelectedFaceIndices: selectedFaceIndices.value.size,
    });
    const faceIndex = pickFaceAtPointer(clientX, clientY);
    if (faceIndex === null) {
      logSelectionDebug('processSelection:no-hit', { clientX, clientY });
      logSelectionDebugFlat('processSelection:no-hit', { clientX, clientY });
      return;
    }

    const polygonId = viewer.facePolygonByFaceIndex[faceIndex];
    if (polygonId < 0) {
      logSelectionDebug('processSelection:invalid-polygon', { faceIndex, polygonId });
      logSelectionDebugFlat('processSelection:invalid-polygon', { faceIndex, polygonId });
      return;
    }

    let pickedType: 'surface' | 'polygon' = forceSurface ? 'surface' : 'polygon';
    let pickedIndex = faceIndex;
    let pickedFaces: number[] = [faceIndex];
    let pickedId = `surface_${faceIndex}`;

    if (!forceSurface) {
      pickedIndex = polygonId;
      pickedFaces = viewer.polygonFacesMap.get(polygonId) ?? [faceIndex];
      pickedId = `polygon_${polygonId}`;
    }

    logSelectionDebug('processSelection:resolved-target', {
      pickedType,
      pickedId,
      pickedIndex,
      pickedFacesCount: pickedFaces.length,
      sampleFaces: pickedFaces.slice(0, 5),
    });
    logSelectionDebugFlat('processSelection:resolved-target', {
      pickedType,
      pickedId,
      pickedIndex,
      pickedFacesCount: pickedFaces.length,
      withMulti,
      forceSurface,
    });

    const selectionFlow = resolveSelectionFlow({
      isPickedAlreadySelected: selectedSelectionIds.value.has(pickedId),
      hasAnySelection: selectedFaceIndices.value.size > 0,
      withMulti,
    });

    if (selectionFlow.action === 'remove') {
      removeSelection(pickedId, pickedFaces);
      logPaintToConsole('снятие_выделения', {
        polygonId,
        triangles: pickedFaces.length,
      });
      logSelectionDebug('processSelection:removed-selection', {
        pickedId,
        removedFacesCount: pickedFaces.length,
      });
      logSelectionDebugFlat('processSelection:removed-selection', {
        pickedId,
        removedFacesCount: pickedFaces.length,
      });
      syncSelectionOverlay();
      if (!selectedFaceIndices.value.size) {
        lastPicked.value = null;
        emit('surface-click', null);
      } else {
        const payloadOff = { id: pickedId, index: pickedIndex, type: pickedType };
        lastPicked.value = payloadOff;
        emit('surface-click', payloadOff);
      }
      emitStats();
      logSelectionDebug('processSelection:done', {
        payload: lastPicked.value,
        afterSelectedSelectionIds: selectedSelectionIds.value.size,
        afterSelectedFaceIndices: selectedFaceIndices.value.size,
        nonZeroFaceCount: viewer.nonZeroFaceCount,
      });
      logSelectionDebugFlat('processSelection:done', {
        payloadId: pickedId,
        payloadType: pickedType,
        payloadIndex: pickedIndex,
        afterSelectedSelectionIds: selectedSelectionIds.value.size,
        afterSelectedFaceIndices: selectedFaceIndices.value.size,
        nonZeroFaceCount: viewer.nonZeroFaceCount,
      });
      return;
    }

    if (selectionFlow.shouldClearBeforeAdd) {
      logSelectionDebug('processSelection:clear-before-single-select', {
        prevSelectionCount: selectedSelectionIds.value.size,
        prevFaceCount: selectedFaceIndices.value.size,
      });
      logSelectionDebugFlat('processSelection:clear-before-single-select', {
        prevSelectionCount: selectedSelectionIds.value.size,
        prevFaceCount: selectedFaceIndices.value.size,
      });
      clearSelectionOnly();
    }

    addSelection(pickedId, pickedFaces);
    logPaintToConsole('выбор', {
      polygonId,
      mode: pickedType === 'surface' ? 'surface' : 'polygon',
      slotIndex: props.activeSlotIndex,
      colorHex: slotColorHex(props.activeSlotIndex),
      triangles: pickedFaces.length,
    });
    logSelectionDebug('processSelection:added-selection', {
      pickedId,
      addedFacesCount: pickedFaces.length,
      activeSlotIndex: props.activeSlotIndex,
    });
    logSelectionDebugFlat('processSelection:added-selection', {
      pickedId,
      addedFacesCount: pickedFaces.length,
      activeSlotIndex: props.activeSlotIndex,
    });

    syncSelectionOverlay();
    const payload = { id: pickedId, index: pickedIndex, type: pickedType };
    lastPicked.value = payload;
    emit('surface-click', payload);
    emitStats();
    logSelectionDebug('processSelection:done', {
      payload,
      afterSelectedSelectionIds: selectedSelectionIds.value.size,
      afterSelectedFaceIndices: selectedFaceIndices.value.size,
      nonZeroFaceCount: viewer.nonZeroFaceCount,
    });
    logSelectionDebugFlat('processSelection:done', {
      payloadId: payload.id,
      payloadType: payload.type,
      payloadIndex: payload.index,
      afterSelectedSelectionIds: selectedSelectionIds.value.size,
      afterSelectedFaceIndices: selectedFaceIndices.value.size,
      nonZeroFaceCount: viewer.nonZeroFaceCount,
    });
  } catch (e) {
    logSelectionDebug('processSelection:error', { error: e instanceof Error ? e.message : String(e) });
    logSelectionDebugFlat('processSelection:error', { error: e instanceof Error ? e.message : String(e) });
    emit('error', e instanceof Error ? e.message : 'Ошибка выбора поверхности.');
  }
}

function onPointerDown(ev: PointerEvent) {
  if (ev.pointerType === 'mouse' && ev.button !== 0) return;
  updateKeyboardStateFromEvent(ev);
  pointerDown.value = {
    x: ev.clientX,
    y: ev.clientY,
    pointerId: ev.pointerId,
    shiftKey: ev.shiftKey || keyboardState.shift,
    ctrlOrMetaKey: ev.ctrlKey || ev.metaKey || keyboardState.ctrlOrMeta,
  };
  if (canvas.value && canvas.value.hasPointerCapture && !canvas.value.hasPointerCapture(ev.pointerId)) {
    canvas.value.setPointerCapture(ev.pointerId);
  }
  logSelectionDebug('pointerdown', {
    pointerId: ev.pointerId,
    pointerType: ev.pointerType,
    button: ev.button,
    x: ev.clientX,
    y: ev.clientY,
    shiftKey: ev.shiftKey,
    ctrlKey: ev.ctrlKey,
    metaKey: ev.metaKey,
  });
  logSelectionDebugFlat('pointerdown:flat', {
    pointerId: ev.pointerId,
    x: ev.clientX,
    y: ev.clientY,
    shiftDown: pointerDown.value.shiftKey,
    ctrlOrMetaDown: pointerDown.value.ctrlOrMetaKey,
  });
}

function onPointerUp(ev: PointerEvent) {
  if (ev.pointerType === 'mouse' && ev.button !== 0) return;
  updateKeyboardStateFromEvent(ev);
  const down = pointerDown.value;
  if (!down) {
    logSelectionDebug('pointerup:ignored-no-pointerdown', { pointerId: ev.pointerId });
    return;
  }
  if (down.pointerId !== ev.pointerId) {
    logSelectionDebug('pointerup:ignored-pointer-mismatch', {
      expectedPointerId: down.pointerId,
      actualPointerId: ev.pointerId,
    });
    return;
  }
  const dx = Math.abs(ev.clientX - down.x);
  const dy = Math.abs(ev.clientY - down.y);
  pointerDown.value = null;
  if (canvas.value && canvas.value.hasPointerCapture?.(ev.pointerId)) {
    canvas.value.releasePointerCapture(ev.pointerId);
  }
  logSelectionDebug('pointerup', {
    pointerId: ev.pointerId,
    x: ev.clientX,
    y: ev.clientY,
    dx,
    dy,
    threshold: pointerMoveThresholdPx,
    downShiftKey: down.shiftKey,
    downCtrlOrMetaKey: down.ctrlOrMetaKey,
    upShiftKey: ev.shiftKey,
    upCtrlKey: ev.ctrlKey,
    upMetaKey: ev.metaKey,
  });
  if (dx > pointerMoveThresholdPx || dy > pointerMoveThresholdPx) {
    logSelectionDebug('pointerup:ignored-drag', { dx, dy, threshold: pointerMoveThresholdPx });
    return;
  }
  const { withMulti, forceSurface } = resolveSelectionModesFromPointer(
    { shiftKey: down.shiftKey, ctrlOrMetaKey: down.ctrlOrMetaKey },
    ev.shiftKey,
    ev.ctrlKey,
    ev.metaKey,
    keyboardState,
  );
  logSelectionDebugFlat('pointerup:mode', {
    withMulti,
    forceSurface,
    downCtrlOrMeta: down.ctrlOrMetaKey,
    upCtrlMeta: ev.ctrlKey || ev.metaKey,
    keyMulti: keyboardState.ctrlOrMeta,
    downShift: down.shiftKey,
    upShift: ev.shiftKey,
    keyShift: keyboardState.shift,
  });
  processSelection(
    ev.clientX,
    ev.clientY,
    withMulti,
    forceSurface,
  );
}

function onPointerCancel(ev: PointerEvent) {
  pointerDown.value = null;
  if (canvas.value && canvas.value.hasPointerCapture?.(ev.pointerId)) {
    canvas.value.releasePointerCapture(ev.pointerId);
  }
  logSelectionDebug('pointercancel', { pointerId: ev.pointerId });
}

async function initViewer() {
  if (!import.meta.client || !props.modelUrl || !canvas.value || !canvasWrap.value) return;
  const canvasEl = canvas.value;
  const [threeA, { OrbitControls }, stlLoaderMod, threeB] = await Promise.all([
    import('three'),
    import('three/examples/jsm/controls/OrbitControls.js'),
    import('three/examples/jsm/loaders/STLLoader.js'),
    import('three'),
  ]);
  const { Scene, PerspectiveCamera, WebGLRenderer, Box3, Vector3, Raycaster, ACESFilmicToneMapping } = threeA as any;
  const { STLLoader } = stlLoaderMod as any;
  const {
    MeshStandardMaterial,
    Mesh,
    Float32BufferAttribute,
    DoubleSide,
    SRGBColorSpace,
    HemisphereLight,
    DirectionalLight,
  } = threeB as any;

  if (!canvasEl || !canvasWrap.value) return;
  const renderer = new WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setClearColor(VIEWER_CLEAR_COLOR_HEX, 1);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = VIEWER_TONE_MAPPING_EXPOSURE;
  const scene = new Scene();

  const camera = new PerspectiveCamera(45, 1, 0.01, 1000);
  camera.position.set(0, 0.7, 2.2);
  const controls = new OrbitControls(camera, canvasEl);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  const ext = getUrlExtension(props.modelUrl);
  const resolvedFormat = (props.modelFormat || ext || '').toLowerCase();
  let geometry: any;
  if (resolvedFormat === 'glb' || resolvedFormat === 'gltf') {
    const loader = new GLTFLoader();
    const gltf = await new Promise<any>((resolve, reject) => loader.load(props.modelUrl!, resolve, undefined, reject));
    let firstMesh: THREE.Mesh | null = null;
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse((obj: THREE.Object3D) => {
      if (firstMesh) return;
      const maybeMesh = obj as THREE.Mesh;
      if (maybeMesh.isMesh && maybeMesh.geometry) {
        firstMesh = maybeMesh;
      }
    });
    if (!firstMesh || !firstMesh.geometry) {
      throw new Error('GLB не содержит поддерживаемой mesh-геометрии.');
    }
    geometry = firstMesh.geometry.clone();
    geometry.applyMatrix4(firstMesh.matrixWorld);
  } else {
    const loader = new STLLoader();
    geometry = await new Promise<any>((resolve, reject) => loader.load(props.modelUrl!, resolve, undefined, reject));
  }
  const nonIndexedGeometry = geometry.index ? geometry.toNonIndexed() : geometry;
  
  // Вычисляем нормали для корректного освещения
  nonIndexedGeometry.computeVertexNormals();

  const positionAttr = nonIndexedGeometry.attributes.position;
  const vertexCount = positionAttr.count;
  const triangleCount = Math.floor(vertexCount / 3);
  const colorArray = new Float32Array(vertexCount * 3);
  const baseRgb = rgb01ForFacePaint(slotColorHex(0));
  for (let v = 0; v < vertexCount; v++) {
    const i = v * 3;
    colorArray[i + 0] = baseRgb[0];
    colorArray[i + 1] = baseRgb[1];
    colorArray[i + 2] = baseRgb[2];
  }
  const colorBufferAttr = new Float32BufferAttribute(colorArray, 3);
  if ('colorSpace' in colorBufferAttr) {
    (colorBufferAttr as { colorSpace: string }).colorSpace = SRGBColorSpace;
  }
  nonIndexedGeometry.setAttribute('color', colorBufferAttr);

  const material = new MeshStandardMaterial({
    vertexColors: true,
    side: DoubleSide,
    metalness: 0.06,
    roughness: 0.42,
  });
  const mesh = new Mesh(nonIndexedGeometry, material);
  scene.add(mesh);

  nonIndexedGeometry.computeBoundingBox();
  const box = new Box3().setFromObject(mesh);
  const size = new Vector3();
  const center = new Vector3();
  box.getSize(size);
  box.getCenter(center);
  mesh.position.sub(center);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  camera.position.set(0, maxDim * 0.6, maxDim * 1.8);
  camera.near = Math.max(0.001, maxDim / 1000);
  camera.far = maxDim * 50;
  camera.updateProjectionMatrix();
  controls.target.set(0, 0, 0);
  controls.update();

  const hemi = new HemisphereLight(0xdce6f2, 0x1e293b, 0.72);
  scene.add(hemi);
  const keyLight = new DirectionalLight(0xffffff, 1.35);
  keyLight.position.set(maxDim * 1.5, maxDim * 2.4, maxDim * 1.1);
  scene.add(keyLight);
  const fillLight = new DirectionalLight(0xb4c5dc, 0.48);
  fillLight.position.set(-maxDim * 1.9, maxDim * 0.45, -maxDim * 0.7);
  scene.add(fillLight);
  const rimLight = new DirectionalLight(0xe2e8f0, 0.35);
  rimLight.position.set(0, -maxDim * 0.8, maxDim * 2.2);
  scene.add(rimLight);

  const resize = () => {
    const parent = canvasWrap.value;
    if (!parent || !renderer || !camera) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  resize();
  
  const observerTarget = canvasWrap.value;
  if (!observerTarget) {
    controls.dispose();
    renderer.dispose();
    nonIndexedGeometry.dispose?.();
    material.dispose?.();
    return;
  }
  const ro = new ResizeObserver(() => resize());
  ro.observe(observerTarget);
  
  cleanup = () => {
    ro.disconnect();
    cancelAnimationFrame(raf);
    disposeSelectionOverlay();
    renderer.dispose();
    geometry.dispose();
    material.dispose();
  };
  window.addEventListener('keydown', onWindowKeyDown);
  window.addEventListener('keyup', onWindowKeyUp);

  let raf = 0;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    controls.update();
    renderer.render(scene, camera);
  };
  tick();

  const posArray = positionAttr.array as Float32Array;
  const faceNormals = new Float32Array(triangleCount * 3);
  for (let f = 0; f < triangleCount; f++) {
    const o = f * 9;
    const ax = posArray[o + 0];
    const ay = posArray[o + 1];
    const az = posArray[o + 2];
    const bx = posArray[o + 3];
    const by = posArray[o + 4];
    const bz = posArray[o + 5];
    const cx = posArray[o + 6];
    const cy = posArray[o + 7];
    const cz = posArray[o + 8];
    const abx = bx - ax;
    const aby = by - ay;
    const abz = bz - az;
    const acx = cx - ax;
    const acy = cy - ay;
    const acz = cz - az;
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    faceNormals[f * 3 + 0] = nx / len;
    faceNormals[f * 3 + 1] = ny / len;
    faceNormals[f * 3 + 2] = nz / len;
  }

  const vertexKeyToFacesMap = new Map<string, number[]>();
  for (let f = 0; f < triangleCount; f++) {
    const vBase = f * 3;
    for (let k = 0; k < 3; k++) {
      const key = vertexPosToKeyFromArray(posArray, vBase + k);
      const arr = vertexKeyToFacesMap.get(key);
      if (!arr) vertexKeyToFacesMap.set(key, [f]);
      else arr.push(f);
    }
  }

  const facePolygonByFaceIndex = new Int32Array(triangleCount);
  facePolygonByFaceIndex.fill(-1);
  const polygonFacesMap = new Map<number, number[]>();
  const cosThreshold = Math.cos((POLYGON_ANGLE_DEG * Math.PI) / 180);
  let polygonCursor = 0;
  for (let start = 0; start < triangleCount; start++) {
    if (facePolygonByFaceIndex[start] !== -1) continue;
    const queue: number[] = [start];
    facePolygonByFaceIndex[start] = polygonCursor;
    const seedNx = faceNormals[start * 3 + 0];
    const seedNy = faceNormals[start * 3 + 1];
    const seedNz = faceNormals[start * 3 + 2];
    const faces: number[] = [];
    let head = 0;
    while (head < queue.length) {
      const f = queue[head++]!;
      faces.push(f);
      const vBase = f * 3;
      for (let k = 0; k < 3; k++) {
        const key = vertexPosToKeyFromArray(posArray, vBase + k);
        const candidates = vertexKeyToFacesMap.get(key);
        if (!candidates) continue;
        for (const nb of candidates) {
          if (facePolygonByFaceIndex[nb] !== -1) continue;
          const d =
            seedNx * faceNormals[nb * 3 + 0] +
            seedNy * faceNormals[nb * 3 + 1] +
            seedNz * faceNormals[nb * 3 + 2];
          if (d >= cosThreshold) {
            facePolygonByFaceIndex[nb] = polygonCursor;
            queue.push(nb);
          }
        }
      }
    }
    polygonFacesMap.set(polygonCursor, faces);
    polygonCursor += 1;
  }

  const colorAttrLive = nonIndexedGeometry.attributes.color as THREE.BufferAttribute;
  
  // Инициализация состояний для каждой грани
  faceStates = Array(triangleCount).fill(null).map(() => ({
    baseColor: slotColorHex(0),
    currentColor: slotColorHex(0),
    baseMaterial: null,
    currentMaterial: null
  }));
  
  viewer = {
    renderer,
    scene,
    camera,
    controls,
    raycaster: new Raycaster(),
    mesh,
    geometry: nonIndexedGeometry,
    colorAttr: colorAttrLive,
    colorArray: colorAttrLive.array as Float32Array,
    positionArray: posArray,
    vertexCount,
    triangleCount,
    faceSlotByFaceIndex: new Uint8Array(triangleCount),
    nonZeroFaceCount: 0,
    faceNormals,
    vertexKeyToFacesMap,
    facePolygonByFaceIndex,
    polygonFacesMap,
    selectionOverlayMesh: null,
  };
  undoHistory = [];
  markColorsDirty();
  emitStats();
  logPreviewStep('Предпросмотр: модель загружена');

  cleanup = () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    disposeSelectionOverlay();
    window.removeEventListener('keydown', onWindowKeyDown);
    window.removeEventListener('keyup', onWindowKeyUp);
    resetKeyboardState();
    controls.dispose();
    renderer.dispose();
    nonIndexedGeometry.dispose?.();
    material.dispose?.();
    viewer = null;
    undoHistory = [];
  };
}

async function exportEditedStl(options?: { scalePercent?: number; rotateXDeg?: number; rotateYDeg?: number; rotateZDeg?: number }) {
  if (!viewer) return '';
  const [{ STLExporter }, { Scene }] = await Promise.all([
    import('three/examples/jsm/exporters/STLExporter.js'),
    import('three'),
  ]);
  const mesh = viewer.mesh.clone();
  const scale = Math.max(1, options?.scalePercent ?? 100) / 100;
  mesh.scale.set(scale, scale, scale);
  mesh.rotation.set(
    ((options?.rotateXDeg ?? 0) * Math.PI) / 180,
    ((options?.rotateYDeg ?? 0) * Math.PI) / 180,
    ((options?.rotateZDeg ?? 0) * Math.PI) / 180,
  );
  mesh.updateMatrixWorld(true);
  const scene = new Scene();
  scene.add(mesh);
  const exporter = new STLExporter();
  return exporter.parse(scene, { binary: false }) as string;
}

watch(
  () => props.modelUrl,
  async () => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    selectedFaceIndices.value.clear();
    selectedSelectionIds.value.clear();
    lastPicked.value = null;
    emit('surface-click', null);
    await nextTick();
    void initViewer();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (cleanup) cleanup();
});

  defineExpose({
  clearSelection: clearSelectionOnly,
  assignSelectionToActiveSlot,
  paintAllToSlot,
  resetToSlot0,
  resetToBaseState,
  recolorSlot,
  undoLastAction,
  refreshVertexColorsFromSlots,
  exportEditedStl,
  getSurfaceIdsGroupedBySlot,
});
</script>
