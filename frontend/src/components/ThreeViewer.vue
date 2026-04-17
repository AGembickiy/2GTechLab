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
    slotColors: () => ['#3b82f6', '#f59e0b', '#ef4444', '#10b981'],
    activeSlotIndex: 0,
  },
);

const emit = defineEmits<{
  (e: 'surface-click', payload: ThreeViewerSurfaceClickPayload): void;
  (e: 'stats-change', payload: { selectedCount: number; paintedFaces: number; totalFaces: number }): void;
  (e: 'error', message: string): void;
}>();

const DEFAULT_COLOR_HEX = '#7dd3fc';
const SELECTION_HIGHLIGHT_HEX = '#facc15';
const POS_KEY_EPS = 1e-4;
const POLYGON_ANGLE_DEG = 25;

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
  requestRender: () => void;
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

function slotColorHex(slotIndex: number): string {
  return props.slotColors?.[slotIndex] ?? DEFAULT_COLOR_HEX;
}

function getFaceRgbForRender(slotIndex: number, highlighted: boolean): [number, number, number] {
  const base = hexToRgb01(slotColorHex(slotIndex));
  if (!highlighted) return base;
  // When highlighted, slightly brighten the slot color instead of using a fixed highlight color
  const brightnessFactor = 1.3;
  const result = [
    Math.min(base[0] * brightnessFactor, 1.0),
    Math.min(base[1] * brightnessFactor, 1.0),
    Math.min(base[2] * brightnessFactor, 1.0)
  ];
  console.log('getFaceRgbForRender:', { slotIndex, highlighted, base, result });
  return result;
}

function applySlotColorToFace(faceIndex: number, rgb01: [number, number, number]) {
  if (!viewer) return;
  const vBase = faceIndex * 3;
  const [r, g, b] = rgb01;
  for (let k = 0; k < 3; k++) {
    const idx = (vBase + k) * 3;
    viewer.colorArray[idx + 0] = r;
    viewer.colorArray[idx + 1] = g;
    viewer.colorArray[idx + 2] = b;
  }
  if (viewer.colorAttr) {
    viewer.colorAttr.needsUpdate = true;
    console.log('Color attribute updated for face:', faceIndex, 'with color:', rgb01);
  }
  // Принудительное обновление материала
  if (viewer.mesh && viewer.mesh.material) {
    viewer.mesh.material.needsUpdate = true;
  }
  // Запрос ререндеринга
  if (viewer && viewer.requestRender) {
    viewer.requestRender();
    console.log('Requesting render after color update');
  }
}

function repaintFace(faceIndex: number, highlighted: boolean) {
  if (!viewer) return;
  const slotIndex = viewer.faceSlotByFaceIndex[faceIndex];
  applySlotColorToFace(faceIndex, getFaceRgbForRender(slotIndex, highlighted));
  if (viewer.colorAttr) {
    viewer.colorAttr.needsUpdate = true;
  }
  if (viewer.mesh && viewer.mesh.material) {
    viewer.mesh.material.needsUpdate = true;
  }
  // Запрос ререндеринга
  if (viewer && viewer.requestRender) {
    viewer.requestRender();
    console.log('Requesting render');
  }
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
  // Ensure color attribute is properly updated
  if (viewer.colorAttr) {
    viewer.colorAttr.needsUpdate = true;
  }
  // Запрос ререндеринга
  if (viewer && viewer.requestRender) {
    viewer.requestRender();
    console.log('Requesting render');
  }
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
  // Запрос ререндеринга
  if (viewer && viewer.requestRender) {
    viewer.requestRender();
    console.log('Requesting render');
  }
  lastPicked.value = null;
  emit('surface-click', null);
  emitStats();
}

function assignSelectionToActiveSlot() {
  if (!viewer || !selectedFaceIndices.value.size) return;
  const target = Array.from(selectedFaceIndices.value);
  paintFaces(target, props.activeSlotIndex);
  for (const f of target) repaintFace(f, true);
  viewer.colorAttr.needsUpdate = true;
  // Принудительное обновление материала
  if (viewer.mesh && viewer.mesh.material) {
    viewer.mesh.material.needsUpdate = true;
  }
  // Запрос ререндеринга
  if (viewer && viewer.requestRender) {
    viewer.requestRender();
    console.log('Requesting render');
  }
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
  for (let i = 0; i < viewer.vertexCount; i++) {
    viewer.colorArray[i * 3 + 0] = r;
    viewer.colorArray[i * 3 + 1] = g;
    viewer.colorArray[i * 3 + 2] = b;
  }
  viewer.colorAttr.needsUpdate = true;
  // Принудительное обновление материала
  if (viewer.mesh && viewer.mesh.material) {
    viewer.mesh.material.needsUpdate = true;
  }
  // Запрос ререндеринга
  if (viewer && viewer.requestRender) {
    viewer.requestRender();
    console.log('Requesting render');
  }
  emitStats();
}

function resetToSlot0() {
  clearSelectionOnly();
  paintAllToSlot(0);
}

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

function recolorSlot(slotIndex: number) {
  if (!viewer) return;
  for (let f = 0; f < viewer.triangleCount; f++) {
    if (viewer.faceSlotByFaceIndex[f] !== slotIndex) continue;
    repaintFace(f, selectedFaceIndices.value.has(f));
  }
  viewer.colorAttr.needsUpdate = true;
  // Принудительное обновление материала
  if (viewer.mesh && viewer.mesh.material) {
    viewer.mesh.material.needsUpdate = true;
  }
  // Запрос ререндеринга
  if (viewer && viewer.requestRender) {
    viewer.requestRender();
    console.log('Requesting render');
  }
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
  const y = -((clientY - rect.top) / rect.height) * 2 + 1;
  viewer.raycaster.setFromCamera({ x, y }, viewer.camera);
  const intersects = viewer.raycaster.intersectObject(viewer.mesh, true);
  const hit = intersects?.[0];
  if (!hit) return null;
  const faceIndexFromHit = hit.faceIndex ?? null;
  if (faceIndexFromHit === null || faceIndexFromHit < 0 || faceIndexFromHit >= viewer.triangleCount) return null;
  return faceIndexFromHit;
}

function processSelection(clientX: number, clientY: number, withMulti: boolean) {
  if (!viewer || !canvas.value) return;
  console.log('processSelection вызван, viewer:', viewer ? 'есть' : 'null', 'triangleCount:', viewer?.triangleCount);
  try {
    const faceIndex = pickFaceAtPointer(clientX, clientY);
    console.log('faceIndex:', faceIndex);
    if (faceIndex === null) return;

    const polygonId = viewer.facePolygonByFaceIndex[faceIndex];
    console.log('polygonId:', polygonId);
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

    // Ensure the color update is properly triggered
    if (viewer.colorAttr) {
      viewer.colorAttr.needsUpdate = true;
    }
    
    // Получаем информацию о материале и цвете
    const materialInfo = viewer.mesh.material;
    const faceColor = props.slotColors[props.activeSlotIndex] || '#3b82f6';
    
    const payload = { 
      id: `polygon_${polygonId}`, 
      index: polygonId, 
      type: 'polygon' as ThreeViewerSelectionType,
      material: {
        type: materialInfo.type,
        color: materialInfo.color?.getHexString ? `#${materialInfo.color.getHexString()}` : undefined,
        shininess: materialInfo.shininess,
        transparent: materialInfo.transparent,
        opacity: materialInfo.opacity
      },
      color: faceColor
    };
    console.log('Payload с информацией о материале и цвете:', payload);
    lastPicked.value = payload;
    emit('surface-click', payload);
    
    // Запрос ререндеринга
    if (viewer && viewer.requestRender) {
      viewer.requestRender();
    }
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
  console.log('Модель загружена:', props.modelUrl);
  const [threeA, { OrbitControls }, stlLoaderMod, gltfLoaderMod] = await Promise.all([
    import('three'),
    import('three/examples/jsm/controls/OrbitControls.js'),
    import('three/examples/jsm/loaders/STLLoader.js'),
    import('three/examples/jsm/loaders/GLTFLoader.js'),
  ]);
  const { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, Box3, Vector3, Raycaster, MeshPhongMaterial, Mesh, Float32BufferAttribute } = threeA as any;
  const { STLLoader } = stlLoaderMod as any;
  const { GLTFLoader } = gltfLoaderMod as any;

  const renderer = new WebGLRenderer({ 
    canvas: canvas.value, 
    antialias: true, 
    alpha: true,
    // Добавлены параметры для лучшей цветопередачи
    precision: 'highp',
    logarithmicDepthBuffer: true
  });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  // Улучшенные параметры рендеринга
  // renderer.outputEncoding убран, так как может конфликтовать с Nuxt/Vite
  // Вместо этого полагаемся на настройки по умолчанию и управление цветом через материал
  renderer.gammaFactor = 2.2;
  const scene = new Scene();
  // Увеличенная интенсивность окружающего света для лучшей видимости цветов
  scene.add(new AmbientLight(0xffffff, 1.0));
  // Добавлен второй направленный свет с другой позиции для более равномерного освещения
  const dir1 = new DirectionalLight(0xffffff, 0.8);
  dir1.position.set(3, 4, 5);
  scene.add(dir1);
  const dir2 = new DirectionalLight(0xffffff, 0.8);
  dir2.position.set(-3, -2, 4);
  scene.add(dir2);
  const camera = new PerspectiveCamera(45, 1, 0.01, 1000);
  const controls = new OrbitControls(camera, canvas.value);
  controls.enableDamping = true;

  // Загрузка модели по URL
  const geometry = await new Promise<any>((resolve, reject) => {
    // Определяем расширение файла
    const url = props.modelUrl!;
    const ext = url.split('.').pop()?.toLowerCase();
    
    // Создаем соответствующий загрузчик
    let loader;
    if (ext === 'stl') {
      loader = new STLLoader();
    } else if (ext === 'glb' || ext === 'gltf') {
      loader = new GLTFLoader();
    } else {
      reject(new Error(`Неподдерживаемый формат: .${ext}`));
      return;
    }
    
    // Загружаем модель
    loader.load(url, resolve, undefined, reject);
  });
  console.log('Тип геометрии:', geometry.isBufferGeometry); // Должен вывести true
  // Обработка загруженной геометрии
  let nonIndexedGeometry;
  let positionAttr;
  let vertexCount;
  let triangleCount;
  
  if (geometry.scene) {
    // Это GLTF/GLB сценой
    const scene = geometry.scene;
    // Объединяем все мешы в сцене
    const meshes = [];
    scene.traverse((child) => {
      if (child.isMesh) {
        meshes.push(child);
      }
    });
    
    if (meshes.length === 0) {
      throw new Error('Сцена не содержит мешей');
    }
    
    // Конвертируем первый меш в BufferGeometry и объединяем остальные
    const firstMesh = meshes[0];
    nonIndexedGeometry = firstMesh.geometry.isBufferGeometry 
      ? firstMesh.geometry
      : new BufferGeometry().fromGeometry(firstMesh.geometry);
    
    for (let i = 1; i < meshes.length; i++) {
      const mesh = meshes[i];
      const geom = mesh.geometry.isBufferGeometry 
        ? mesh.geometry
        : new BufferGeometry().fromGeometry(mesh.geometry);
      nonIndexedGeometry = BufferGeometryUtils.mergeBufferGeometries([nonIndexedGeometry, geom]);
    }
  } else {
    // Это прямая геометрия (например, из STL)
    nonIndexedGeometry = geometry.index ? geometry.toNonIndexed() : geometry;
  }
  
  // Теперь у нас есть единая геометрия
  positionAttr = nonIndexedGeometry.attributes.position;
  vertexCount = positionAttr.count;
  triangleCount = Math.floor(vertexCount / 3);
  console.log('Количество полигонов:', triangleCount);
  const posArray = positionAttr.array as Float32Array;

  const faceNormals = new Float32Array(triangleCount * 3);
  for (let f = 0; f < triangleCount; f++) {
    const o = f * 9;
    const ax = posArray[o + 0], ay = posArray[o + 1], az = posArray[o + 2];
    const bx = posArray[o + 3], by = posArray[o + 4], bz = posArray[o + 5];
    const cx = posArray[o + 6], cy = posArray[o + 7], cz = posArray[o + 8];
    const abx = bx - ax, aby = by - ay, abz = bz - az;
    const acx = cx - ax, acy = cy - ay, acz = cz - az;
    const nx = aby * acz - abz * acy, ny = abz * acx - abx * acz, nz = abx * acy - aby * acx;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    faceNormals[f * 3 + 0] = nx / len;
    faceNormals[f * 3 + 1] = ny / len;
    faceNormals[f * 3 + 2] = nz / len;
  }

  const vertexKeyToFacesMap = new Map<string, number[]>();
  for (let f = 0; f < triangleCount; f++) {
    for (let k = 0; k < 3; k++) {
      const key = vertexPosToKeyFromArray(posArray, f * 3 + k);
      const arr = vertexKeyToFacesMap.get(key);
      if (!arr) vertexKeyToFacesMap.set(key, [f]);
      else arr.push(f);
    }
  }

  const facePolygonByFaceIndex = new Int32Array(triangleCount).fill(-1);
  const polygonFacesMap = new Map<number, number[]>();
  const cosThreshold = Math.cos((POLYGON_ANGLE_DEG * Math.PI) / 180);
  let polygonCursor = 0;
  for (let start = 0; start < triangleCount; start++) {
    if (facePolygonByFaceIndex[start] !== -1) continue;
    const queue: number[] = [start];
    facePolygonByFaceIndex[start] = polygonCursor;
    const seedNx = faceNormals[start * 3 + 0], seedNy = faceNormals[start * 3 + 1], seedNz = faceNormals[start * 3 + 2];
    const faces: number[] = [];
    let head = 0;
    while (head < queue.length) {
      const f = queue[head++]!;
      faces.push(f);
      for (let k = 0; k < 3; k++) {
        const key = vertexPosToKeyFromArray(posArray, f * 3 + k);
        const candidates = vertexKeyToFacesMap.get(key);
        if (!candidates) continue;
        for (const nb of candidates) {
          if (facePolygonByFaceIndex[nb] !== -1) continue;
          const d = seedNx * faceNormals[nb * 3 + 0] + seedNy * faceNormals[nb * 3 + 1] + seedNz * faceNormals[nb * 3 + 2];
          if (d >= cosThreshold) {
            facePolygonByFaceIndex[nb] = polygonCursor;
            queue.push(nb);
          }
        }
      }
    }
    polygonFacesMap.set(polygonCursor, faces);
    polygonCursor++;
  }

  const colorArray = new Float32Array(vertexCount * 3);
  const baseRgb = hexToRgb01(slotColorHex(0));
  for (let v = 0; v < vertexCount; v++) {
    colorArray[v * 3 + 0] = baseRgb[0];
    colorArray[v * 3 + 1] = baseRgb[1];
    colorArray[v * 3 + 2] = baseRgb[2];
  }
  nonIndexedGeometry.setAttribute('color', new Float32BufferAttribute(colorArray, 3));

  // Создаем материал с поддержкой vertexColors
  const material = new MeshPhongMaterial({ 
    vertexColors: true, 
    flatShading: true,
    side: 2,
    shininess: 10,
    specular: 0x222222,
    transparent: true,
    opacity: 1.0,
    // Уменьшена чувствительность к бликам для лучшей видимости основного цвета
    reflectivity: 0.2,
    refractionRatio: 0.98,
    // Убедимся, что материал использует правильную кодировку
    color: 0xffffff,
    // Добавлены параметры для лучшей передачи цветов
    emissive: 0x000000,
    emissiveIntensity: 0.1
  });
  
  // Создаем меш
  const mesh = new Mesh(nonIndexedGeometry, material);
  
  // Если геометрия была из GLTF, применяем трансформацию из сцены
  if (geometry.scene) {
    mesh.position.copy(geometry.scene.position);
    mesh.rotation.copy(geometry.scene.rotation);
    mesh.scale.copy(geometry.scene.scale);
  }
  scene.add(mesh);

  nonIndexedGeometry.computeBoundingBox();
  const box = new Box3().setFromObject(mesh);
  const size = new Vector3(), center = new Vector3();
  box.getSize(size); box.getCenter(center);
  mesh.position.sub(center);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  camera.position.set(0, maxDim * 0.6, maxDim * 1.8);
  camera.updateProjectionMatrix();
  controls.target.set(0, 0, 0);
  controls.update();

  // Объявляем requestRender до использования
  const requestRender = () => {
    renderRequested = true;
  };
  
  viewer = {
    renderer, scene, camera, controls, raycaster: new Raycaster(), mesh,
    geometry: nonIndexedGeometry, colorAttr: nonIndexedGeometry.attributes.color,
    colorArray, positionArray: posArray, vertexCount, triangleCount,
    faceSlotByFaceIndex: new Uint8Array(triangleCount), nonZeroFaceCount: 0,
    faceNormals, vertexKeyToFacesMap, facePolygonByFaceIndex, polygonFacesMap,
    requestRender: requestRender
  };

  // Флаг для предотвращения бесконечного цикла рендеринга
  let renderLoopActive = false;

  const startRenderLoop = () => {
    if (renderLoopActive) return;
    renderLoopActive = true;
    
    const tick = () => {
      if (!viewer) {
        renderLoopActive = false;
        return;
      }
      
      controls.update();
      
      // Проверяем, нужно ли рендерить
      if (renderRequested) {
        renderer.render(scene, camera);
        renderRequested = false;
        console.log('Frame rendered');
      }
      
      // Запланировать следующий кадр
      requestAnimationFrame(tick);
    };
    
    tick();
  };

  const resize = () => {
    const parent = canvasWrap.value;
    if (!parent) return;
    const w = parent.clientWidth, h = parent.clientHeight || 400;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvasWrap.value!);

  let renderRequested = true;
  
  // Запускаем цикл рендеринга
  startRenderLoop();

  emitStats();
  cleanup = () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    controls.dispose();
    renderer.dispose();
    nonIndexedGeometry.dispose();
    material.dispose();
    viewer = null;
  };
}

async function exportEditedStl(options?: { scalePercent?: number; rotateXDeg?: number; rotateYDeg?: number; rotateZDeg?: number }) {
  if (!viewer) return '';
  const [{ STLExporter }, { Scene }, { BufferGeometry }] = await Promise.all([
    import('three/examples/jsm/exporters/STLExporter.js'),
    import('three'),
    import('three')
  ]);
  // Применяем трансформации к клону меша
  const scale = Math.max(1, options?.scalePercent ?? 100) / 100;
  mesh.scale.set(scale, scale, scale);
  mesh.rotation.set(
    ((options?.rotateXDeg ?? 0) * Math.PI) / 180,
    ((options?.rotateYDeg ?? 0) * Math.PI) / 180,
    ((options?.rotateZDeg ?? 0) * Math.PI) / 180,
  );
  mesh.updateMatrixWorld(true);
  
  // Создаем новую сцену и добавляем в нее меш
  const scene = new Scene();
  scene.add(mesh);
  
  // Экспортируем в STL
  const exporter = new STLExporter();
  return exporter.parse(scene, { binary: false }) as string;
}

watch(() => props.modelUrl, async () => {
  if (cleanup) { cleanup(); cleanup = null; }
  selectedFaceIndices.value.clear();
  selectedPolygonIds.value.clear();
  lastPicked.value = null;
  emit('surface-click', null);
  await nextTick();
  void initViewer();
}, { immediate: true });

watch(() => props.slotColors, () => {
  if (!viewer) return;
  for (let i = 0; i < 4; i++) recolorSlot(i);
  viewer.colorAttr.needsUpdate = true;
}, { deep: true });

onBeforeUnmount(() => { 
    if (cleanup) cleanup(); 
    renderLoopActive = false; // Останавливаем цикл рендеринга при уничтожении компонента
  });

defineExpose({
  clearSelection: clearSelectionOnly,
  assignSelectionToActiveSlot,
  paintAllToSlot,
  resetToSlot0,
  recolorSlot,
  exportEditedStl,
  getSurfaceIdsGroupedBySlot,
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
