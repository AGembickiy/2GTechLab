<script setup lang="ts">
const fileInput = ref<HTMLInputElement | null>(null);

const modelValue = defineModel<File | null>();
const originalFile = defineModel<File | null>('originalFile');

const isPreviewOpen = ref(false);
const isBusy = ref(false);
const errorMessage = ref<string | null>(null);
const previewUrl = ref<string | null>(null);
const previewKind = ref<'image' | 'stl' | null>(null);
const isClient = import.meta.client;

const stlCanvas = ref<HTMLCanvasElement | null>(null);
const stlCanvasWrap = ref<HTMLDivElement | null>(null);
let stlCleanup: (() => void) | null = null;

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
  if (fileInput.value) fileInput.value.value = '';
}

function resetPreview() {
  errorMessage.value = null;
  previewKind.value = null;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = null;
  if (stlCleanup) stlCleanup();
  stlCleanup = null;
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

async function initStlViewerIfNeeded() {
  if (!import.meta.client) return;
  if (!isPreviewOpen.value || previewKind.value !== 'stl' || !previewUrl.value) return;
  if (!stlCanvas.value) return;
  if (!stlCanvasWrap.value) return;

  const [{ Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, Box3, Vector3 }, { OrbitControls }, { STLLoader }, { MeshStandardMaterial, Mesh }] =
    await Promise.all([
      import('three'),
      import('three/examples/jsm/controls/OrbitControls.js'),
      import('three/examples/jsm/loaders/STLLoader.js'),
      import('three'),
    ]).then(([threeA, controls, stlLoader, threeB]) => [threeA, controls, stlLoader, threeB] as const);

  const canvas = stlCanvas.value;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

  const scene = new Scene();
  scene.add(new AmbientLight(0xffffff, 0.65));
  const dir = new DirectionalLight(0xffffff, 0.9);
  dir.position.set(3, 4, 5);
  scene.add(dir);

  const camera = new PerspectiveCamera(45, 1, 0.01, 1000);
  camera.position.set(0, 0.7, 2.2);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  const loader = new STLLoader();
  const geometry = await new Promise<any>((resolve, reject) => {
    loader.load(previewUrl.value!, resolve, undefined, reject);
  });

  const material = new MeshStandardMaterial({ color: 0x7dd3fc, metalness: 0.1, roughness: 0.55 });
  const mesh = new Mesh(geometry, material);
  scene.add(mesh);

  // Frame model
  geometry.computeBoundingBox();
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
    const parent = stlCanvasWrap.value;
    const w = parent?.clientWidth ?? 600;
    const parentH = parent?.clientHeight ?? 520;
    const desiredH = Math.floor(w * 0.62);
    const h = Math.max(120, Math.min(520, desiredH, parentH || 520));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(stlCanvasWrap.value);

  let raf = 0;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    controls.update();
    renderer.render(scene, camera);
  };
  tick();

  stlCleanup = () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    controls.dispose();
    renderer.dispose();
    geometry.dispose?.();
    material.dispose?.();
  };
}

watch([isPreviewOpen, previewKind, previewUrl], () => {
  if (stlCleanup) {
    stlCleanup();
    stlCleanup = null;
  }
  void nextTick(() => initStlViewerIfNeeded());
});
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
          base: 'fixed inset-0 z-[200] transition-opacity',
        },
        inner: 'fixed inset-0 z-[201] overflow-y-hidden overflow-x-hidden',
        container: 'flex h-full min-h-full items-stretch justify-center text-center',
        padding: 'p-4 sm:p-6',
        width: 'w-full',
        height: 'h-full',
        rounded: 'rounded-2xl',
        margin: 'm-0',
      }"
    >
      <div
        class="flex h-full flex-col overflow-x-hidden overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950 p-5 text-slate-100 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)]"
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

        <div class="mt-4 flex-1 overflow-hidden">
          <img
            v-if="previewKind === 'image' && previewUrl"
            :src="previewUrl"
            alt="preview"
            class="h-full w-full rounded-xl object-contain"
          />

          <div
            v-else-if="previewKind === 'stl' && previewUrl"
            class="flex h-full flex-col gap-3 rounded-xl border border-slate-800/70 bg-slate-950/40 p-4"
          >
            <div ref="stlCanvasWrap" class="flex-1 overflow-hidden">
              <canvas ref="stlCanvas" class="w-full rounded-lg" />
            </div>

            <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div class="text-xs text-slate-300">
                Вращение: мышь • Зум: колесо
              </div>
              <a
                :href="previewUrl"
                :download="modelValue?.name || 'model.stl'"
                class="inline-flex rounded-full bg-slate-800/60 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
              >
                Скачать STL
              </a>
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

