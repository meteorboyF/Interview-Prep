<script lang="ts">
  import type { StatementResult } from '../db/databaseWorker';
  import { MAX_EXPORT_ROWS } from '../db/database';

  let {
    result,
    pageSize = 50
  }: {
    result: StatementResult;
    pageSize?: number;
  } = $props();

  let page = $state(0);

  $effect(() => {
    // reset paging when a new result arrives
    result;
    page = 0;
  });

  const pageCount = $derived(Math.max(1, Math.ceil(result.rows.length / pageSize)));
  const pageRows = $derived(result.rows.slice(page * pageSize, (page + 1) * pageSize));

  function fmt(v: unknown): string {
    if (v === null || v === undefined) return 'NULL';
    return String(v);
  }

  function exportCsv() {
    const cap = Math.min(result.rows.length, MAX_EXPORT_ROWS);
    const esc = (v: unknown) => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [result.columns.map(esc).join(',')];
    for (let i = 0; i < cap; i++) lines.push(result.rows[i].map(esc).join(','));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'query_results.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }
</script>

<div class="results">
  <div class="meta">
    <span>
      {result.totalRows.toLocaleString()} row{result.totalRows === 1 ? '' : 's'}
      {#if result.truncated}
        <span class="trunc">— showing first {result.rows.length.toLocaleString()} (display limit; the query itself ran in full)</span>
      {/if}
    </span>
    <span class="spacer"></span>
    {#if result.rows.length > 0}
      <button onclick={exportCsv} title="Export up to {MAX_EXPORT_ROWS.toLocaleString()} displayed rows as CSV">
        Export CSV{result.rows.length > MAX_EXPORT_ROWS ? ` (first ${MAX_EXPORT_ROWS.toLocaleString()})` : ''}
      </button>
    {/if}
  </div>

  {#if result.rows.length === 0}
    <div class="empty muted">Query returned no rows.</div>
  {:else}
    <div class="scroll panel">
      <table>
        <thead>
          <tr>
            <th class="rownum">#</th>
            {#each result.columns as col}
              <th>{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each pageRows as row, i}
            <tr>
              <td class="rownum">{page * pageSize + i + 1}</td>
              {#each row as cell}
                <td class:null={cell === null || cell === undefined}>{fmt(cell)}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    {#if pageCount > 1}
      <div class="pager">
        <button onclick={() => (page = 0)} disabled={page === 0}>«</button>
        <button onclick={() => (page -= 1)} disabled={page === 0}>‹ Prev</button>
        <span class="muted">page {page + 1} / {pageCount}</span>
        <button onclick={() => (page += 1)} disabled={page >= pageCount - 1}>Next ›</button>
        <button onclick={() => (page = pageCount - 1)} disabled={page >= pageCount - 1}>»</button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .results {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.82rem;
    color: var(--muted);
  }
  .trunc {
    color: var(--warn);
  }
  .spacer {
    flex: 1;
  }
  .scroll {
    overflow: auto;
    max-height: 420px;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 0.83rem;
  }
  th,
  td {
    text-align: left;
    padding: 0.35rem 0.7rem;
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
    font-family: var(--mono);
  }
  th {
    position: sticky;
    top: 0;
    background: var(--panel-2);
    font-family: var(--sans);
    font-weight: 600;
    z-index: 1;
  }
  td.null {
    color: var(--muted);
    font-style: italic;
  }
  .rownum {
    color: var(--muted);
    font-size: 0.75rem;
    text-align: right;
  }
  .pager {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.82rem;
  }
  .empty {
    padding: 0.9rem;
    border: 1px dashed var(--border);
    border-radius: 8px;
  }
</style>
