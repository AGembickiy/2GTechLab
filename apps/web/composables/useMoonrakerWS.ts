/**
 * Мониторинг печати: WebSocket к Moonraker (если задан URL) или опрос Django /moonraker/status/.
 * Без Vuex — глобальное состояние через useState (Nuxt 3).
 */
export type MoonrakerPrintSnapshot = {
  raw: Record<string, unknown> | null;
  state: string | null;
  message: string | null;
  filename: string | null;
  progress: number;
  printDuration: number | null;
  printTimeLeft: number | null;
};

function extractPrintStats(result: Record<string, unknown> | null | undefined): Partial<MoonrakerPrintSnapshot> {
  if (!result || typeof result !== 'object') return {};
  const status = result.status as Record<string, unknown> | undefined;
  const printStats =
    (result.print_stats as Record<string, unknown>) ||
    (status?.print_stats as Record<string, unknown>) ||
    null;
  if (!printStats || typeof printStats !== 'object') return { raw: result as Record<string, unknown> };
  return {
    raw: result as Record<string, unknown>,
    state: (printStats.state as string) ?? null,
    message: (printStats.message as string) ?? null,
    filename: (printStats.filename as string) ?? null,
    progress: typeof printStats.progress === 'number' ? printStats.progress : 0,
    printDuration: typeof printStats.print_duration === 'number' ? printStats.print_duration : null,
    printTimeLeft: typeof printStats.print_time_left === 'number' ? printStats.print_time_left : null,
  };
}

export function useMoonrakerWS() {
  const config = useRuntimeConfig();
  const connected = useState<boolean>('moonraker-ws-connected', () => false);
  const lastError = useState<string | null>('moonraker-ws-error', () => null);
  const printSnapshot = useState<MoonrakerPrintSnapshot>('moonraker-print-snapshot', () => ({
    raw: null,
    state: null,
    message: null,
    filename: null,
    progress: 0,
    printDuration: null,
    printTimeLeft: null,
  }));

  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let rpcId = 1;

  const { moonrakerStatusViaBackend } = usePrintApi();

  function applyBackendPoll(data: Record<string, unknown>) {
    const next = extractPrintStats(data);
    printSnapshot.value = {
      ...printSnapshot.value,
      ...next,
      raw: (next.raw ?? data) as Record<string, unknown>,
    };
  }

  async function pollOnce() {
    try {
      const data = (await moonrakerStatusViaBackend()) as Record<string, unknown>;
      applyBackendPoll(data);
      lastError.value = null;
    } catch (e) {
      lastError.value = e instanceof Error ? e.message : 'poll failed';
    }
  }

  function startPolling(intervalMs = 2000) {
    if (pollTimer) return;
    void pollOnce();
    pollTimer = setInterval(() => void pollOnce(), intervalMs);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function subscribePrinterObjects() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'printer.objects.subscribe',
        params: { objects: { print_stats: null } },
        id: rpcId++,
      }),
    );
  }

  function connectWs() {
    const url = config.public.moonrakerWsUrl as string | undefined;
    if (!import.meta.client || !url) return;

    ws = new WebSocket(url);

    ws.onopen = () => {
      connected.value = true;
      lastError.value = null;
      subscribePrinterObjects();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as Record<string, unknown>;
        if (data.method === 'notify_status_update' && data.params) {
          const arr = data.params as unknown[];
          const payload = (arr?.[0] as Record<string, unknown>) || {};
          applyBackendPoll({ status: payload });
        }
      } catch {
        /* ignore */
      }
    };

    ws.onclose = () => {
      connected.value = false;
      reconnectTimer = setTimeout(() => connectWs(), 3000);
    };

    ws.onerror = () => {
      lastError.value = 'WebSocket error';
    };
  }

  function connect() {
    if (!import.meta.client) return;
    stopPolling();
    connectWs();
    if (!config.public.moonrakerWsUrl) {
      startPolling();
    }
  }

  function disconnect() {
    stopPolling();
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    ws?.close();
    ws = null;
    connected.value = false;
  }

  onBeforeUnmount(() => {
    disconnect();
  });

  return {
    connected,
    lastError,
    printSnapshot,
    connect,
    disconnect,
    pollOnce,
    startPolling,
  };
}
