/// <reference lib="webworker" />
// Web Worker that owns the SQLite (sql.js WASM) engine so heavy queries never
// freeze the UI. Hosts two isolated in-memory databases built from the same
// pre-generated file:
//   learning — pristine copy of the HR dataset, read-only (lessons)
//   sandbox  — free-play copy supporting DML/DDL/transactions with
//              snapshot-based single-level undo and full reset.

import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import type { Database, SqlJsStatic } from 'sql.js';
import { classifySql, splitish, friendlyError } from './queryRunner';

export type DbMode = 'learning' | 'sandbox';

export interface StatementResult {
  sql: string;
  kind: 'rows' | 'write';
  columns: string[];
  rows: unknown[][];
  totalRows: number;     // real number of rows the query produced
  truncated: boolean;    // rows[] was capped for display; the query itself ran fully
  rowsAffected: number;  // for writes
}

export interface ExecResult {
  statements: StatementResult[];
  elapsedMs: number;
  canUndo: boolean;
}

interface WorkerRequest {
  id: number;
  type: 'init' | 'exec' | 'reset' | 'undo' | 'state';
  bytes?: ArrayBuffer;
  mode?: DbMode;
  sql?: string;
  maxRows?: number;
}

let SQL: SqlJsStatic | null = null;
let baseBytes: Uint8Array | null = null;
const dbs: Partial<Record<DbMode, Database>> = {};
let sandboxSnapshot: Uint8Array | null = null;
let sandboxDirty = false;

function openFromBase(): Database {
  const db = new SQL!.Database(baseBytes!);
  db.run('PRAGMA foreign_keys = ON;');
  return db;
}

function toDisplayValue(v: unknown): unknown {
  if (v instanceof Uint8Array) return `<BLOB ${v.length} bytes>`;
  return v;
}

function execute(mode: DbMode, sql: string, maxRows: number): ExecResult {
  const db = dbs[mode];
  if (!db) throw new Error('Database not initialized');

  // Pre-flight: friendly handling of MySQL-only database commands, and the
  // learning-mode read-only guard. The user's SQL is never rewritten.
  const statements = splitish(sql);
  if (statements.length === 0) throw new Error('Nothing to execute — the input contains no SQL statement.');
  for (const stmt of statements) {
    const cls = classifySql(stmt);
    if (cls.kind === 'mysql-only') {
      throw new Error(
        'MYSQL_ONLY::CREATE DATABASE / DROP DATABASE / USE are MySQL server commands. ' +
          'The browser runs an isolated in-memory SQLite database, so there is no server or named database to switch to. ' +
          'You can query the tables directly (e.g. SELECT * FROM employees LIMIT 5).'
      );
    }
    if (cls.kind === 'blocked') {
      throw new Error('BLOCKED::ATTACH/DETACH are disabled in this educational sandbox.');
    }
    if (mode === 'learning' && cls.mutates) {
      throw new Error(
        'READONLY::The learning database is read-only so every lesson sees the same predictable data. ' +
          'Switch to Sandbox mode to run INSERT/UPDATE/DELETE/CREATE/ALTER/DROP — the sandbox is fully resettable.'
      );
    }
  }

  const willMutate = statements.some((s) => classifySql(s).mutates);
  const prevSnapshot = sandboxSnapshot;
  if (mode === 'sandbox' && willMutate) {
    // single-level undo: snapshot before the batch.
    // NOTE: sql.js export() closes & reopens the underlying handle, which
    // silently resets connection-scoped pragmas — re-enable FK enforcement.
    sandboxSnapshot = db.export();
    db.run('PRAGMA foreign_keys = ON;');
  }

  const results: StatementResult[] = [];
  const start = performance.now();

  try {
    for (const it = db.iterateStatements(sql); ; ) {
      const step = it.next();
      if (step.done) break;
      const stmt = step.value;
      try {
        const columns = stmt.getColumnNames();
        if (columns.length > 0) {
          const rows: unknown[][] = [];
          let total = 0;
          while (stmt.step()) {
            total += 1;
            if (rows.length < maxRows) {
              rows.push(stmt.get().map(toDisplayValue));
            }
          }
          results.push({
            sql: stmt.getSQL().trim(),
            kind: 'rows',
            columns,
            rows,
            totalRows: total,
            truncated: total > rows.length,
            rowsAffected: 0
          });
        } else {
          stmt.step();
          results.push({
            sql: stmt.getSQL().trim(),
            kind: 'write',
            columns: [],
            rows: [],
            totalRows: 0,
            truncated: false,
            rowsAffected: db.getRowsModified()
          });
        }
      } finally {
        stmt.free();
      }
    }
  } catch (e) {
    // If the batch failed before ANY statement completed, the database is
    // unchanged — don't burn the single undo slot on a no-op snapshot.
    if (mode === 'sandbox' && willMutate && results.length === 0) {
      sandboxSnapshot = prevSnapshot;
    }
    throw e;
  }

  if (mode === 'sandbox' && willMutate) sandboxDirty = true;

  return {
    statements: results,
    elapsedMs: performance.now() - start,
    canUndo: sandboxSnapshot !== null
  };
}

self.onmessage = async (ev: MessageEvent<WorkerRequest>) => {
  const { id, type } = ev.data;
  try {
    switch (type) {
      case 'init': {
        if (!SQL) {
          SQL = await initSqlJs({ locateFile: () => wasmUrl });
        }
        baseBytes = new Uint8Array(ev.data.bytes!);
        dbs.learning?.close();
        dbs.sandbox?.close();
        dbs.learning = openFromBase();
        dbs.sandbox = openFromBase();
        sandboxSnapshot = null;
        sandboxDirty = false;
        postMessage({ id, ok: true, result: { ready: true } });
        break;
      }
      case 'exec': {
        const result = execute(ev.data.mode!, ev.data.sql!, ev.data.maxRows ?? 500);
        postMessage({ id, ok: true, result });
        break;
      }
      case 'reset': {
        const mode = ev.data.mode!;
        dbs[mode]?.close();
        dbs[mode] = openFromBase();
        if (mode === 'sandbox') {
          sandboxSnapshot = null;
          sandboxDirty = false;
        }
        postMessage({ id, ok: true, result: { reset: mode } });
        break;
      }
      case 'undo': {
        if (!sandboxSnapshot) throw new Error('Nothing to undo yet — no change has been made since the last reset.');
        dbs.sandbox?.close();
        dbs.sandbox = new SQL!.Database(sandboxSnapshot);
        dbs.sandbox.run('PRAGMA foreign_keys = ON;');
        sandboxSnapshot = null;
        postMessage({ id, ok: true, result: { undone: true } });
        break;
      }
      case 'state': {
        postMessage({
          id,
          ok: true,
          result: { canUndo: sandboxSnapshot !== null, sandboxDirty }
        });
        break;
      }
    }
  } catch (e) {
    // If an exec batch died inside an explicit transaction, roll it back so
    // the connection is usable again (mirrors "abort on error" client behavior).
    if (type === 'exec') {
      const db = dbs[ev.data.mode ?? 'sandbox'];
      try {
        db?.run('ROLLBACK;');
      } catch {
        /* no open transaction — fine */
      }
    }
    const raw = e instanceof Error ? e.message : String(e);
    // Tagged errors carry their own friendly text
    const tagged = raw.match(/^(MYSQL_ONLY|BLOCKED|READONLY)::(.*)$/s);
    if (tagged) {
      postMessage({ id, ok: false, error: { message: tagged[2], code: tagged[1] } });
    } else {
      const fr = friendlyError(raw);
      postMessage({ id, ok: false, error: { message: fr.message, hint: fr.hint, raw } });
    }
  }
};
