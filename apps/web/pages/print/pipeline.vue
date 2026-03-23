<template>
  <div class="mx-auto max-w-3xl space-y-6 py-2">
    <div>
      <h1 class="text-2xl font-bold">Печать: загрузка → слайсинг → статус</h1>
      <p class="mt-2 text-sm text-slate-400">
        Интеграция с Django API (<code class="text-sky-300">/api</code>) и опрос Moonraker через бэкенд или WebSocket.
      </p>
    </div>

    <UCard>
      <template #header>
        <span class="font-semibold">1. Загрузить модель</span>
      </template>
      <input type="file" accept=".stl,.obj,.3mf" class="block w-full text-sm" @change="onFile" />
      <UButton class="mt-3" :disabled="!pendingFile || busy" @click="upload">
        {{ busy ? 'Загрузка…' : 'Создать PrintJob' }}
      </UButton>
      <p v-if="job" class="mt-3 text-sm text-slate-300">Job ID: <strong>{{ job.id }}</strong> — {{ job.status }}</p>
    </UCard>

    <UCard v-if="job">
      <template #header>
        <span class="font-semibold">2. Слайсинг и расчёт</span>
      </template>
      <UButton :disabled="busy || job.status === 'slicing'" @click="runSlice">
        {{ job.status === 'slicing' ? 'Слайсинг…' : 'Запустить слайсинг (Celery)' }}
      </UButton>
      <p v-if="job.last_error" class="mt-2 text-sm text-rose-300">{{ job.last_error }}</p>
      <ul v-if="job.slot_assignments?.length" class="mt-3 space-y-1 text-sm text-slate-300">
        <li v-for="s in job.slot_assignments" :key="s.id">
          Слот {{ s.slot_index }}: {{ s.material_preset?.name }} — {{ s.mass_g }} г / {{ s.cost }} ₽
        </li>
      </ul>
    </UCard>

    <UCard>
      <template #header>
        <span class="font-semibold">3. Мониторинг (Moonraker)</span>
      </template>
      <div class="flex flex-wrap gap-2">
        <UButton size="sm" @click="monitor.connect()">Подключить опрос / WS</UButton>
        <UButton size="sm" color="gray" @click="monitor.disconnect()">Стоп</UButton>
        <UButton size="sm" variant="outline" @click="monitor.pollOnce()">Обновить раз</UButton>
      </div>
      <p class="mt-2 text-xs text-slate-500">
        WS: {{ config.public.moonrakerWsUrl || 'не задан — используется опрос /api/moonraker/status/' }}
      </p>
      <div class="mt-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-sm">
        <div>Состояние: <strong>{{ snap.state || '—' }}</strong></div>
        <div>Файл: {{ snap.filename || '—' }}</div>
        <div>Прогресс: {{ progressLabel }}</div>
        <div v-if="snap.lastError" class="text-rose-300">Ошибка: {{ snap.lastError }}</div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { PrintJobDto } from '~/composables/usePrintApi';

const config = useRuntimeConfig();
const api = usePrintApi();
const monitor = useMoonrakerWS();

const pendingFile = ref<File | null>(null);
const busy = ref(false);
const job = ref<PrintJobDto | null>(null);

const snap = computed(() => ({
  state: monitor.printSnapshot.value.state,
  filename: monitor.printSnapshot.value.filename,
  progress: monitor.printSnapshot.value.progress,
  lastError: monitor.lastError.value,
}));

const progressLabel = computed(() => {
  const p = monitor.printSnapshot.value.progress ?? 0;
  const pct = p <= 1 ? p * 100 : p;
  return `${pct.toFixed(1)}%`;
});

function onFile(ev: Event) {
  const t = ev.target as HTMLInputElement;
  pendingFile.value = t.files?.[0] ?? null;
}

async function upload() {
  if (!pendingFile.value) return;
  busy.value = true;
  try {
    job.value = await api.createPrintJob(pendingFile.value);
  } catch (e) {
    console.error(e);
  } finally {
    busy.value = false;
  }
}

let pollJob: ReturnType<typeof setInterval> | null = null;

async function refreshJob() {
  if (!job.value) return;
  try {
    job.value = await api.getPrintJob(job.value.id);
  } catch {
    /* ignore */
  }
}

async function runSlice() {
  if (!job.value) return;
  busy.value = true;
  try {
    await api.startSlice(job.value.id);
    await refreshJob();
    if (pollJob) clearInterval(pollJob);
    pollJob = setInterval(async () => {
      await refreshJob();
      if (job.value && job.value.status !== 'slicing') {
        if (pollJob) clearInterval(pollJob);
        pollJob = null;
      }
    }, 1500);
  } finally {
    busy.value = false;
  }
}

onMounted(() => {
  monitor.connect();
});

onBeforeUnmount(() => {
  if (pollJob) clearInterval(pollJob);
});
</script>
