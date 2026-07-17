<script lang="ts">
  import SqlEditor from './SqlEditor.svelte';
  import ResultsTable from './ResultsTable.svelte';
  import ExplainPlan from './ExplainPlan.svelte';
  import { db, type DbError } from '../db/database';
  import type { DbMode, ExecResult } from '../db/databaseWorker';
  import { classifySql, splitish, stripLeadingComments } from '../db/queryRunner';

  let {
    mode = 'learning',
    sql = $bindable(''),
    compact = false
  }: {
    mode?: DbMode;
    sql?: string;
    compact?: boolean;
  } = $props();

  let running = $state(false);
  let result: ExecResult | null = $state(null);
  let explainResult: ExecResult | null = $state(null);
  let error: DbError | null = $state(null);

  const firstIsSelect = $derived.by(() => {
    const stmts = splitish(sql);
    if (stmts.length === 0) return false;
    const head = stripLeadingComments(stmts[0]).slice(0, 8).toUpperCase();
    return head.startsWith('SELECT') || head.startsWith('WITH');
  });

  export async function run() {
    if (running || !sql.trim()) return;
    running = true;
    error = null;
    explainResult = null;
    try {
      result = await db.exec(mode, sql);
    } catch (e) {
      result = null;
      error = e as DbError;
    } finally {
      running = false;
    }
  }

  async function explain() {
    if (running || !sql.trim()) return;
    running = true;
    error = null;
    try {
      const stmts = splitish(sql);
      explainResult = await db.exec(mode, `EXPLAIN QUERY PLAN ${stmts[0]}`);
    } catch (e) {
      explainResult = null;
      error = e as DbError;
    } finally {
      running = false;
    }
  }

  function isExplainStatement(s: string): boolean {
    return /^\s*EXPLAIN\s+QUERY\s+PLAN/i.test(stripLeadingComments(s));
  }
</script>

<div class="qp">
  <SqlEditor bind:value={sql} onrun={run} disabled={running} rows={compact ? 5 : 8} />
  <div class="toolbar">
    <button class="primary" onclick={run} disabled={running || !sql.trim()}>
      {running ? 'Running…' : '▶ Run'} <span class="kbd">Ctrl+↵</span>
    </button>
    {#if firstIsSelect}
      <button onclick={explain} disabled={running} title="Show the SQLite execution plan for the first statement">
        Explain plan
      </button>
    {/if}
    <span class="badge mode-{mode}">{mode === 'learning' ? 'Learning DB (read-only)' : 'Sandbox DB'}</span>
    {#if result}
      <span class="elapsed muted">{result.elapsedMs.toFixed(1)} ms</span>
    {/if}
  </div>

  {#if error}
    <div class="error">
      <strong>{error.message}</strong>
      {#if error.hint}<div class="hint">{error.hint}</div>{/if}
    </div>
  {/if}

  {#if explainResult}
    {#each explainResult.statements as stmt}
      {#if stmt.kind === 'rows'}
        <ExplainPlan result={stmt} />
      {/if}
    {/each}
  {/if}

  {#if result}
    {#each result.statements as stmt, i}
      <div class="stmt">
        {#if result.statements.length > 1}
          <div class="stmt-label muted">statement {i + 1}: <code>{stmt.sql.length > 90 ? stmt.sql.slice(0, 90) + '…' : stmt.sql}</code></div>
        {/if}
        {#if stmt.kind === 'rows'}
          {#if isExplainStatement(stmt.sql)}
            <ExplainPlan result={stmt} />
          {:else}
            <ResultsTable result={stmt} />
          {/if}
        {:else}
          <div class="write-ok">
            ✓ OK — {stmt.rowsAffected} row{stmt.rowsAffected === 1 ? '' : 's'} affected
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>

<style>
  .qp {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .toolbar {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
  }
  .kbd {
    font-size: 0.68rem;
    opacity: 0.75;
    font-weight: 400;
  }
  .elapsed {
    font-size: 0.8rem;
    font-family: var(--mono);
  }
  .error {
    background: var(--bad-soft);
    border: 1px solid var(--bad);
    color: var(--bad);
    border-radius: 8px;
    padding: 0.6rem 0.85rem;
    font-size: 0.85rem;
  }
  .error .hint {
    color: var(--text);
    margin-top: 0.3rem;
    font-size: 0.82rem;
  }
  .stmt {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .stmt-label {
    font-size: 0.75rem;
  }
  .write-ok {
    background: var(--good-soft);
    color: var(--good);
    border: 1px solid var(--good);
    border-radius: 8px;
    padding: 0.45rem 0.8rem;
    font-size: 0.85rem;
    font-weight: 600;
  }
</style>
