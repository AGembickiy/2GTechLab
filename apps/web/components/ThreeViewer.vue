<script setup lang="ts">
import type { ThreeViewerSelectionType, ThreeViewerSurfaceClickPayload } from '~/types/three-viewer';

const props = withDefaults(
  defineProps<{
    modelUrl: string | null;
    slotColors: string[];
    activeSlotIndex: number;
  }>(),
  {
    modelUrl: null,
    slotColors: () => ['#7dd3fc', '#7dd3fc', '#7dd3fc', '#7dd3fc'],
    activeSlotIndex: 0,
  },
);

const emit = defineEmits<{
  (e: 'surface-click', payload: ThreeViewerSurfaceClickPayload): void;
  (e: 'stats-change', payload: { selectedCount: number; paintedFaces: number; totalFaces: number }): void;
  (e: 'error', message: string): void;
}>();

const DEFAULT_COLOR_HEX = '#7dd3fc';
const SELECTION_HIGHLIGHT_HEX = '#fbbf24';
const POS_KEY_EPS = 1e-4;
const POLYGON_ANGLE_DEG = 12;

const canvas = ref<HTMLCanvasElement | null>(null);
const canvasWrap = ref<HTMLDivElement | null>(null);

const selectedFaceIndices = ref<Set<number>>(new Set());
const selectedPolygonIds = ref<Set<number>>(new Set());
const lastPicked = ref<ThreeViewerSurfaceClickPayload>(null);

let viewer: {
  renderer: any;
  scene: any;
  camera: any;
  controls: any;
  raycaster: any;
  mesh: any;
  geometry: any;
  colorAttr: any;
  colorArray: Float32Array;
  positionArray: Float32Array;
  vertexCount: number;
  triangleCount: number;
  faceSlotByFaceIndex: Uint8Array;
  nonZeroFaceCount: number;
  faceNormals: Float32Array;
  vertexKeyToFacesMap: Map<string, number[]>;
  facePolygonByFaceIndex: Int32Array;
  polygonFacesMap: Map<number, number[]>;
} | null = null;

let cleanup: (() => void) | null = null;
const pointerDown = ref<{ x: number; y: number } | null>(null);
const pointerMoveThresholdPx = 12;

function emitStats() {
  emit('stats-change', {
    selectedCount: selectedPolygonIds.value.size,
    paintedFaces: viewer?.nonZeroFaceCount ?? 0,
    totalFaces: viewer?.triangleCount ?? 0,
  });
}

function hexToRgb01(hex: string): [number, number, number] {
  const normalized = (hex || DEFAULT_COLOR_HEX).trim().replace('#', '');
  if (normalized.length !== 6) return [0.49, 0.83, 0.99];
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return [r / 255, g / 255, b / 255];
}

function blendRgb01(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function slotColorHex(slotIndex: number): string {
  return props.slotColors?.[slotIndex] ?? DEFAULT_COLOR_HEX;
}

function getFaceRgbForRender(slotIndex: number, highlighted: boolean): [number, number, number] {
  const base = hexToRgb01(slotColorHex(slotIndex));
  if (!highlighted) return base;
  return hexToRgb01(SELECTION_HIGHLIGHT_HEX);
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

function repaintFace(faceIndex: number, highlighted: boolean) {
  if (!viewer) return;
  const slotIndex = viewer.faceSlotByFaceIndex[faceIndex];
  applySlotColorToFace(faceIndex, getFaceRgbForRender(slotIndex, highlighted));
}

function paintFaces(faceIndices: number[], slotIndex: number) {
  if (!viewer) return;
  for (const faceIndex of faceIndices) {
    if (faceIndex < 0 || faceIndex >= viewer.triangleCount) continue;
    const prevSlot = viewer.faceSlotByFaceIndex[faceIndex];
    if (prevSlot === slotIndex) continue;
    if (prevSlot === 0 && slotIndex !== 0) viewer.nonZeroFaceCount += 1;
    if (prevSlot !== 0 && slotIndex === 0) viewer.nonZeroFaceCount -= 1;
    viewer.faceSlotByFaceIndex[faceIndex] = slotIndex;
    applySlotColorToFace(faceIndex, hexToRgb01(slotColorHex(slotIndex)));
  }
  viewer.colorAttr.needsUpdate = true;
  emitStats();
}

function clearSelectionOnly() {
  if (!viewer) {
    selectedFaceIndices.value.clear();
    selectedPolygonIds.value.clear();
    emitStats();
    return;
  }
  for (const f of selectedFaceIndices.value) repaintFace(f, false);
  selectedFaceIndices.value.clear();
  selectedPolygonIds.value.clear();
  viewer.colorAttr.needsUpdate = true;
  lastPicked.value = null;
  emit('surface-click', null);
  emitStats();
}

function assignSelectionToActiveSlot() {
  if (!viewer || !selectedFaceIndices.value.size) return;
  const target = Array.from(selectedFaceIndices.value);
  if (!target.length) return;
  paintFaces(target, props.activeSlotIndex);
  for (const f of target) repaintFace(f, true);
  viewer.colorAttr.needsUpdate = true;
  emitStats();
}

function addPolygonSelection(polygonId: number, faces: number[]) {
  selectedPolygonIds.value.add(polygonId);
  for (const f of faces) selectedFaceIndices.value.add(f);
}

function removePolygonSelection(polygonId: number, faces: number[]) {
  selectedPolygonIds.value.delete(polygonId);
  for (const f of faces) selectedFaceIndices.value.delete(f);
}

function paintAllToSlot(slotIndex: number) {
  if (!viewer) return;
  viewer.faceSlotByFaceIndex.fill(slotIndex);
  viewer.nonZeroFaceCount = slotIndex === 0 ? 0 : viewer.triangleCount;
  const rgb01 = hexToRgb01(slotColorHex(slotIndex));
  const [r, g, b] = rgb01;
  for (let v = 0; v < viewer.vertexCount; v++) {
    const i = v * 3;
    viewer.colorArray[i + 0] = r;
    viewer.colorArray[i + 1] = g;
    viewer.colorArray[i + 2] = b;
  }
  viewer.colorAttr.needsUpdate = true;
  emitStats();
}

function resetToSlot0() {
  clearSelectionOnly();
  paintAllToSlot(0);
}

function recolorSlot(slotIndex: number) {
  if (!viewer) return;
  for (let f = 0; f < viewer.triangleCount; f++) {
    if (viewer.faceSlotByFaceIndex[f] !== slotIndex) continue;
    repaintFace(f, selectedFaceIndices.value.has(f));
  }
  viewer.colorAttr.needsUpdate = true;
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

function processSelection(clientX: number, clientY: number, withMulti: boolean) {
  if (!viewer || !canvas.value) return;
  try {
    const faceIndex = pickFaceAtPointer(clientX, clientY);
    if (faceIndex === null) return;

    const polygonId = viewer.facePolygonByFaceIndex[faceIndex];
    if (polygonId < 0) return;
    const polygonFaces = viewer.polygonFacesMap.get(polygonId) ?? [faceIndex];
    if (!withMulti && selectedFaceIndices.value.size > 0) {
      clearSelectionOnly();
    }

    if (withMulti && selectedPolygonIds.value.has(polygonId)) {
      removePolygonSelection(polygonId, polygonFaces);
      for (const f of polygonFaces) repaintFace(f, false);
    } else {
      addPolygonSelection(polygonId, polygonFaces);
      paintFaces(polygonFaces, props.activeSlotIndex);
      for (const f of polygonFaces) repaintFace(f, true);
    }

    viewer.colorAttr.needsUpdate = true;
    const payload = { id: `polygon_${polygonId}`, index: polygonId, type: 'polygon' as ThreeViewerSelectionType };
    lastPicked.value = payload;
    emit('surface-click', payload);
    emitStats();
  } catch (e) {
    emit('error', e instanceof Error ? e.message : 'Ошибка выбора поверхности.');
  }
}

function onPointerDown(ev: PointerEvent) {
  if (ev.pointerType === 'mouse' && ev.button !== 0) return;
  pointerDown.value = { x: ev.clientX, y: ev.clientY };
}

function onPointerUp(ev: PointerEvent) {
  if (ev.pointerType === 'mouse' && ev.button !== 0) return;
  if (!pointerDown.value) return;
  const dx = Math.abs(ev.clientX - pointerDown.value.x);
  const dy = Math.abs(ev.clientY - pointerDown.value.y);
  pointerDown.value = null;
  if (dx > pointerMoveThresholdPx || dy > pointerMoveThresholdPx) return;
  processSelection(ev.clientX, ev.clientY, ev.ctrlKey || ev.metaKey);
}

async function initViewer() {
  if (!import.meta.client || !props.modelUrl || !canvas.value || !canvasWrap.value) return;
  const [threeA, { OrbitControls }, stlLoaderMod, threeB] = await Promise.all([
    import('three'),
    import('three/examples/jsm/controls/OrbitControls.js'),
    import('three/examples/jsm/loaders/STLLoader.js'),
    import('three'),
  ]);
  const { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, Box3, Vector3, Raycaster } = threeA as any;
  const { STLLoader } = stlLoaderMod as any;
  const { MeshBasicMaterial, Mesh, Float32BufferAttribute } = threeB as any;

  const renderer = new WebGLRenderer({ canvas: canvas.value, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  const scene = new Scene();
  scene.add(new AmbientLight(0xffffff, 0.65));
  const dir = new DirectionalLight(0xffffff, 0.9);
  dir.position.set(3, 4, 5);
  scene.add(dir);
  const camera = new PerspectiveCamera(45, 1, 0.01, 1000);
  camera.position.set(0, 0.7, 2.2);
  const controls = new OrbitControls(camera, canvas.value);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  const loader = new STLLoader();
  const geometry = await new Promise<any>((resolve, reject) => loader.load(props.modelUrl!, resolve, undefined, reject));
  const nonIndexedGeometry = geometry.index ? geometry.toNonIndexed() : geometry;
  const positionAttr = nonIndexedGeometry.attributes.position;
  const vertexCount = positionAttr.count;
  const triangleCount = Math.floor(vertexCount / 3);
  const colorArray = new Float32Array(vertexCount * 3);
  const baseRgb = hexToRgb01(slotColorHex(0));
  for (let v = 0; v < vertexCount; v++) {
    const i = v * 3;
    colorArray[i + 0] = baseRgb[0];
    colorArray[i + 1] = baseRgb[1];
    colorArray[i + 2] = baseRgb[2];
  }
  nonIndexedGeometry.setAttribute('color', new Float32BufferAttribute(colorArray, 3));
  // Basic material keeps per-face colors clearly visible (no light/shading washout).
  const material = new MeshBasicMaterial({ vertexColors: true, toneMapped: false });
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

  const resize = () => {
    const parent = canvasWrap.value;
    let w = parent?.clientWidth ?? 0;
    let parentH = parent?.clientHeight ?? 0;
    if (w < 1) w = Math.min(900, Math.max(280, window.innerWidth - 80));
    if (parentH < 1) parentH = Math.min(560, Math.max(260, Math.floor(window.innerHeight * 0.42)));
    const desiredH = Math.floor(w * 0.62);
    const h = Math.max(200, Math.min(560, desiredH, parentH > 0 ? parentH : 520));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(() => resize());
  ro.observe(canvasWrap.value!);
  requestAnimationFrame(() => {
    resize();
    setTimeout(resize, 50);
    setTimeout(resize, 300);
  });

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

  viewer = {
    renderer,
    scene,
    camera,
    controls,
    raycaster: new Raycaster(),
    mesh,
    geometry: nonIndexedGeometry,
    colorAttr: nonIndexedGeometry.attributes.color,
    colorArray,
    positionArray: posArray,
    vertexCount,
    triangleCount,
    faceSlotByFaceIndex: new Uint8Array(triangleCount),
    nonZeroFaceCount: 0,
    faceNormals,
    vertexKeyToFacesMap,
    facePolygonByFaceIndex,
    polygonFacesMap,
  };
  emitStats();

  cleanup = () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    controls.dispose();
    renderer.dispose();
    nonIndexedGeometry.dispose?.();
    material.dispose?.();
    viewer = null;
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
    selectedPolygonIds.value.clear();
    lastPicked.value = null;
    emit('surface-click', null);
    await nextTick();
    void initViewer();
  },
  { immediate: true },
);

watch(
  () => props.slotColors,
  () => {
    if (!viewer) return;
    for (let i = 0; i < 4; i++) recolorSlot(i);
    viewer.colorAttr.needsUpdate = true;
  },
  { deep: true },
);

onBeforeUnmount(() => {
  if (cleanup) cleanup();
});

defineExpose({
  clearSelection: clearSelectionOnly,
  assignSelectionToActiveSlot,
  paintAllToSlot,
  resetToSlot0,
  recolorSlot,
  exportEditedStl,
});
</script>

<template>
  <div
    ref="canvasWrap"
    class="relative h-[min(42vh,320px)] w-full shrink-0 overflow-hidden rounded-lg border border-slate-700/40 bg-gradient-to-b from-slate-900 to-slate-950 lg:h-auto lg:min-h-[400px] lg:flex-1"
  >
    <div class="pointer-events-none absolute left-3 top-3 z-10 rounded-md bg-slate-950/70 px-2 py-1 text-[10px] text-slate-200">
      selected: {{ selectedPolygonIds.size }} | last: {{ lastPicked?.id || 'none' }}
    </div>
    <canvas
      ref="canvas"
      class="block h-full w-full min-h-[200px] rounded-lg"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
    />
  </div>
</template>
