import { mockLive, mockNodes, mockSettings } from './mock';
import type { LiveState, NodeInfo, PublicSettings } from './types';

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const payload = await response.json();
  if (payload?.status && payload.status !== 'success') throw new Error(payload.message || '请求失败');
  return payload?.data ?? payload;
}

export async function loadInitialData() {
  try {
    const [settings, nodes] = await Promise.all([
      request<PublicSettings>('/api/public'),
      request<NodeInfo[]>('/api/nodes'),
    ]);
    return { settings, nodes, live: {} as Record<string, LiveState>, demo: false };
  } catch {
    return { settings: mockSettings, nodes: mockNodes, live: mockLive, demo: true };
  }
}

type PingRecords = {
  records?: Array<{ value?: number; time?: string }>;
  tasks?: Array<{ avg?: number }>;
};

export async function loadPingLatencies(nodeIds: string[]) {
  let hasTasks = false;
  try {
    const tasks = await request<Array<Record<string, unknown>>>('/api/task/ping');
    hasTasks = Array.isArray(tasks) && tasks.some((task) => task.enabled !== false && task.disabled !== true);
  } catch {
    // 旧版 Komari 可能没有公开任务端点，保留历史记录兼容路径。
    hasTasks = true;
  }

  if (!hasTasks) {
    return { values: Object.fromEntries(nodeIds.map((uuid) => [uuid, null])) as Record<string, number | null>, hasTasks: false };
  }

  const entries = await Promise.all(nodeIds.map(async (uuid) => {
    try {
      const data = await request<PingRecords>(`/api/records/ping?uuid=${encodeURIComponent(uuid)}&hours=1`);
      const taskValues = (data.tasks || []).map((task) => Number(task.avg)).filter((value) => Number.isFinite(value) && value >= 0);
      if (taskValues.length) return [uuid, Math.round(taskValues.reduce((sum, value) => sum + value, 0) / taskValues.length)] as const;
      const latest = [...(data.records || [])].reverse().find((record) => Number(record.value) >= 0);
      return [uuid, latest ? Math.round(Number(latest.value)) : null] as const;
    } catch {
      return [uuid, null] as const;
    }
  }));
  return { values: Object.fromEntries(entries) as Record<string, number | null>, hasTasks: true };
}

export function connectLive(
  onData: (online: string[], live: Record<string, LiveState>) => void,
  onStatus: (connected: boolean) => void,
) {
  if (!location.protocol.startsWith('http')) return () => undefined;
  const interval = 2000;
  let timer: number | undefined;
  let controller: AbortController | undefined;
  let legacySocket: WebSocket | undefined;
  let stopped = false;
  let running = false;
  let requestId = 0;

  const schedule = () => {
    if (!stopped && !document.hidden) timer = window.setTimeout(refresh, interval);
  };

  const openLegacySocket = () => {
    if (legacySocket && legacySocket.readyState < WebSocket.CLOSING) return;
    const scheme = location.protocol === 'https:' ? 'wss:' : 'ws:';
    legacySocket = new WebSocket(`${scheme}//${location.host}/api/clients`);
    legacySocket.onopen = () => legacySocket?.send('get');
    legacySocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const payload = message?.data?.data ? message.data : message?.data;
        if (payload?.data && !stopped) {
          onData(payload.online ?? [], payload.data);
          onStatus(true);
        }
      } catch { /* ignore malformed legacy frames */ }
    };
    legacySocket.onerror = () => legacySocket?.close();
    legacySocket.onclose = () => { legacySocket = undefined; };
  };

  const refresh = async () => {
    if (stopped || running || document.hidden) return;
    running = true;
    controller = new AbortController();
    try {
      const response = await fetch('/api/rpc2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'common:getNodesLatestStatus', id: ++requestId }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const payload = await response.json();
      if (payload?.error) throw new Error(payload.error.message || 'RPC2 request failed');
      const result = payload?.result ?? {};
      const online: string[] = [];
      const live: Record<string, LiveState> = {};

      for (const [uuid, raw] of Object.entries(result as Record<string, Record<string, unknown>>)) {
        const value = raw || {};
        if (value.online) online.push(String(value.client || uuid));
        live[uuid] = {
          cpu: { usage: Number(value.cpu) || 0 },
          ram: { used: Number(value.ram) || 0, total: Number(value.ram_total) || 0 },
          swap: { used: Number(value.swap) || 0, total: Number(value.swap_total) || 0 },
          disk: { used: Number(value.disk) || 0, total: Number(value.disk_total) || 0 },
          network: {
            up: Number(value.net_out) || 0,
            down: Number(value.net_in) || 0,
            totalUp: Number(value.net_total_out ?? value.net_total_up) || 0,
            totalDown: Number(value.net_total_in ?? value.net_total_down) || 0,
          },
          load: {
            load1: Number(value.load) || 0,
            load5: Number(value.load5) || 0,
            load15: Number(value.load15) || 0,
          },
          connections: {
            tcp: Number(value.connections) || 0,
            udp: Number(value.connections_udp) || 0,
          },
          uptime: Number(value.uptime) || 0,
          process: Number(value.process) || 0,
          ping: Object.fromEntries(
            Object.entries((value.ping || {}) as Record<string, unknown>)
              .map(([key, ping]) => [key, Number(ping)] as const)
              .filter(([, ping]) => Number.isFinite(ping) && ping >= 0),
          ),
          updated_at: String(value.time || ''),
        };
      }

      if (!stopped) {
        legacySocket?.close();
        legacySocket = undefined;
        onData(online, live);
        onStatus(true);
      }
    } catch (error) {
      if (!stopped && !(error instanceof DOMException && error.name === 'AbortError')) {
        onStatus(false);
        openLegacySocket();
      }
    } finally {
      running = false;
      controller = undefined;
      schedule();
    }
  };

  const handleVisibility = () => {
    if (timer) window.clearTimeout(timer);
    timer = undefined;
    if (!document.hidden) void refresh();
  };

  document.addEventListener('visibilitychange', handleVisibility);
  void refresh();
  return () => {
    stopped = true;
    if (timer) window.clearTimeout(timer);
    controller?.abort();
    legacySocket?.close();
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}
