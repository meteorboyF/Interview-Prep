// Main-thread client for the database worker. Handles:
//   - one-time fetch + caching of the pre-generated SQLite file
//   - request/response correlation with the worker
//   - per-query timeout with worker termination + automatic recovery
//   - status store the UI subscribes to (loading / ready / recovering / error)

import { writable, type Writable } from 'svelte/store';
import type { DbMode, ExecResult } from './databaseWorker';

export interface DbError {
  message: string;
  hint?: string;
  code?: string;
  raw?: string;
}

export interface DbStatus {
  phase: 'idle' | 'loading' | 'ready' | 'recovering' | 'error';
  detail?: string;
  rowCounts?: Record<string, number>;
}

export const DEFAULT_MAX_DISPLAY_ROWS = 500;
export const MAX_EXECUTION_MS = 15_000;
export const MAX_EXPORT_ROWS = 10_000;

const DB_URL = `${import.meta.env.BASE_URL}hr_training.sqlite`;
const META_URL = `${import.meta.env.BASE_URL}hr_training.meta.json`;

interface Pending {
  resolve: (v: unknown) => void;
  reject: (e: DbError) => void;
  timer: ReturnType<typeof setTimeout> | null;
}

class DatabaseClient {
  status: Writable<DbStatus> = writable({ phase: 'idle' });
  canUndo: Writable<boolean> = writable(false);
  sandboxDirty: Writable<boolean> = writable(false);

  private worker: Worker | null = null;
  private bytes: ArrayBuffer | null = null;
  private nextId = 1;
  private pending = new Map<number, Pending>();
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (!this.initPromise) this.initPromise = this.doInit();
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    this.status.set({ phase: 'loading', detail: 'Downloading HR dataset…' });
    try {
      if (!this.bytes) {
        const [dbRes, metaRes] = await Promise.all([fetch(DB_URL), fetch(META_URL)]);
        if (!dbRes.ok) throw new Error(`Failed to download database (HTTP ${dbRes.status}). Run \`npm run build:db\`.`);
        this.bytes = await dbRes.arrayBuffer();
        let rowCounts: Record<string, number> | undefined;
        if (metaRes.ok) rowCounts = (await metaRes.json()).rowCounts;
        this.status.set({ phase: 'loading', detail: 'Starting SQL engine…', rowCounts });
      }
      await this.spawnWorker();
      this.status.update((s) => ({ ...s, phase: 'ready', detail: undefined }));
    } catch (e) {
      this.status.set({ phase: 'error', detail: e instanceof Error ? e.message : String(e) });
      this.initPromise = null;
      throw e;
    }
  }

  private spawnWorker(): Promise<void> {
    this.worker?.terminate();
    this.failAllPending('The SQL engine was restarted.');
    this.worker = new Worker(new URL('./databaseWorker.ts', import.meta.url), { type: 'module' });
    this.worker.onmessage = (ev) => {
      const { id, ok, result, error } = ev.data;
      const p = this.pending.get(id);
      if (!p) return;
      this.pending.delete(id);
      if (p.timer) clearTimeout(p.timer);
      if (ok) p.resolve(result);
      else p.reject(error as DbError);
    };
    // init message: copy the cached bytes so the cache survives worker restarts
    return this.request({ type: 'init', bytes: this.bytes!.slice(0) }, null).then(() => {
      this.canUndo.set(false);
      this.sandboxDirty.set(false);
    });
  }

  private failAllPending(message: string) {
    for (const [, p] of this.pending) {
      if (p.timer) clearTimeout(p.timer);
      p.reject({ message });
    }
    this.pending.clear();
  }

  private request(payload: Record<string, unknown>, timeoutMs: number | null): Promise<unknown> {
    if (!this.worker) return Promise.reject({ message: 'Database not initialized yet.' } as DbError);
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer =
        timeoutMs === null
          ? null
          : setTimeout(() => {
              this.pending.delete(id);
              // Runaway query: kill the worker and rebuild from cached bytes.
              this.status.set({ phase: 'recovering', detail: 'Query exceeded the time limit — restarting the SQL engine…' });
              this.spawnWorker()
                .then(() => this.status.update((s) => ({ ...s, phase: 'ready', detail: undefined })))
                .catch((e) =>
                  this.status.set({ phase: 'error', detail: e instanceof Error ? e.message : String(e) })
                );
              reject({
                message: `Query exceeded the ${Math.round(MAX_EXECUTION_MS / 1000)}s execution limit and was terminated.`,
                hint: 'The engine was restarted; sandbox changes made before the runaway query were reset. Try adding a WHERE clause or LIMIT while experimenting.',
                code: 'TIMEOUT'
              });
            }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      const transfer = payload.bytes ? [payload.bytes as ArrayBuffer] : [];
      this.worker!.postMessage({ id, ...payload }, transfer);
    });
  }

  async exec(mode: DbMode, sql: string, maxRows = DEFAULT_MAX_DISPLAY_ROWS): Promise<ExecResult> {
    await this.init();
    const result = (await this.request({ type: 'exec', mode, sql, maxRows }, MAX_EXECUTION_MS)) as ExecResult;
    if (mode === 'sandbox') {
      this.canUndo.set(result.canUndo);
      this.refreshState();
    }
    return result;
  }

  async reset(mode: DbMode): Promise<void> {
    await this.init();
    await this.request({ type: 'reset', mode }, MAX_EXECUTION_MS);
    if (mode === 'sandbox') {
      this.canUndo.set(false);
      this.sandboxDirty.set(false);
    }
  }

  async undo(): Promise<void> {
    await this.init();
    await this.request({ type: 'undo' }, MAX_EXECUTION_MS);
    this.canUndo.set(false);
    this.refreshState();
  }

  private refreshState() {
    this.request({ type: 'state' }, null)
      .then((s) => {
        const st = s as { canUndo: boolean; sandboxDirty: boolean };
        this.canUndo.set(st.canUndo);
        this.sandboxDirty.set(st.sandboxDirty);
      })
      .catch(() => {});
  }
}

export const db = new DatabaseClient();
