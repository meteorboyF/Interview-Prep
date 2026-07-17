<script lang="ts">
  import { tableMeta, relatedTables } from '../db/schemaMetadata';
  import { db } from '../db/database';
  import type { ExecResult, StatementResult } from '../db/databaseWorker';
  import ResultsTable from './ResultsTable.svelte';
  import { openInPlayground } from '../stores';

  let {
    tableName,
    onselect
  }: {
    tableName: string;
    onselect?: (table: string) => void;
  } = $props();

  const meta = $derived(tableMeta(tableName));

  let rowCount: number | null = $state(null);
  let sample: StatementResult | null = $state(null);
  let sampleOpen = $state(false);
  let sampleOffset = $state(0);
  let loadError: string | null = $state(null);

  // The big attendance table is previewed in pages, never rendered fully.
  const previewLimit = 15;
  const isLarge = $derived(tableName === 'attendance');

  $effect(() => {
    tableName;
    rowCount = null;
    sample = null;
    sampleOpen = false;
    sampleOffset = 0;
    loadError = null;
    db.exec('learning', `SELECT COUNT(*) FROM ${tableName};`)
      .then((r: ExecResult) => {
        rowCount = Number(r.statements[0].rows[0][0]);
      })
      .catch((e) => (loadError = e.message));
  });

  async function loadSample(offset: number) {
    try {
      const r = await db.exec(
        'learning',
        `SELECT * FROM ${tableName} LIMIT ${previewLimit} OFFSET ${offset};`
      );
      sample = r.statements[0];
      sampleOffset = offset;
      sampleOpen = true;
      loadError = null;
    } catch (e) {
      loadError = (e as Error).message;
    }
  }

  function insertIntoEditor() {
    openInPlayground(`SELECT *\nFROM ${tableName}\nLIMIT 20;`);
  }
</script>

{#if meta}
  <div class="detail">
    <div class="head">
      <h3><code>{meta.name}</code></h3>
      <span class="muted">{rowCount === null ? '…' : rowCount.toLocaleString()} rows</span>
      <span class="spacer"></span>
      <button onclick={insertIntoEditor}>Insert into SQL editor →</button>
    </div>
    <p class="muted desc">{meta.description}</p>

    <div class="scroll panel">
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Conceptual type (MySQL)</th>
            <th>Browser type (SQLite)</th>
            <th>Nullable</th>
            <th>Key / Index</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {#each meta.columns as col}
            <tr>
              <td><code>{col.name}</code></td>
              <td class="type">{col.conceptualType}</td>
              <td class="type">{col.engineType}</td>
              <td>{col.nullable ? 'yes' : 'NOT NULL'}</td>
              <td class="badges">
                {#if col.pk}<span class="badge pk">PK</span>{/if}
                {#if col.fk}
                  <button class="linkish" onclick={() => onselect?.(col.fk!.table)} title="Go to {col.fk.table}">
                    <span class="badge fk">FK → {col.fk.table}.{col.fk.column}</span>
                  </button>
                {/if}
                {#if col.unique}<span class="badge idx">UNIQUE</span>{/if}
                {#each col.indexes ?? [] as idx}
                  <span class="badge idx" title={idx}>IDX</span>
                {/each}
              </td>
              <td class="note muted">{col.defaultValue ? `DEFAULT ${col.defaultValue}. ` : ''}{col.note ?? ''}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="row">
      <h4>Related tables</h4>
      <div class="chips">
        {#each relatedTables(tableName) as rel}
          <button onclick={() => onselect?.(rel)}>{rel}</button>
        {/each}
        {#if tableName === 'employees'}
          <span class="badge fk" title="employees.manager_id references employees.employee_id">self-reference: manager_id</span>
        {/if}
      </div>
    </div>

    <div class="row">
      <h4>Suggested queries</h4>
      <div class="chips">
        {#each meta.suggestedQueries as q}
          <button onclick={() => openInPlayground(q.sql)} title={q.sql}>{q.label} →</button>
        {/each}
      </div>
    </div>

    <div class="row">
      <h4>Sample rows</h4>
      {#if !sampleOpen}
        <button onclick={() => loadSample(0)}>
          Show sample rows{isLarge ? ` (paged ${previewLimit} at a time — this table has 20k+ rows)` : ''}
        </button>
      {:else if sample}
        <ResultsTable result={sample} pageSize={previewLimit} />
        <div class="chips">
          <button onclick={() => loadSample(Math.max(0, sampleOffset - previewLimit))} disabled={sampleOffset === 0}>
            ‹ Previous {previewLimit}
          </button>
          <button
            onclick={() => loadSample(sampleOffset + previewLimit)}
            disabled={rowCount !== null && sampleOffset + previewLimit >= rowCount}
          >
            Next {previewLimit} ›
          </button>
          <span class="muted offset">offset {sampleOffset.toLocaleString()}</span>
          <button onclick={() => (sampleOpen = false)}>Hide</button>
        </div>
      {/if}
      {#if loadError}<div class="err">{loadError}</div>{/if}
    </div>
  </div>
{/if}

<style>
  .detail {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }
  .head {
    display: flex;
    align-items: center;
    gap: 0.7rem;
  }
  .head h3 {
    margin: 0;
  }
  .head code {
    font-size: 1.05rem;
  }
  .spacer {
    flex: 1;
  }
  .desc {
    margin: 0;
    font-size: 0.88rem;
  }
  .scroll {
    overflow-x: auto;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 0.82rem;
  }
  th,
  td {
    text-align: left;
    padding: 0.4rem 0.65rem;
    border-bottom: 1px solid var(--border);
    vertical-align: top;
  }
  th {
    background: var(--panel-2);
    font-weight: 600;
    white-space: nowrap;
  }
  .type {
    font-family: var(--mono);
    font-size: 0.76rem;
    white-space: nowrap;
  }
  .badges {
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
  }
  .linkish {
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
  }
  .note {
    font-size: 0.78rem;
    max-width: 220px;
  }
  .row h4 {
    margin: 0 0 0.4rem;
    font-size: 0.85rem;
  }
  .chips {
    display: flex;
    gap: 0.45rem;
    flex-wrap: wrap;
    align-items: center;
  }
  .offset {
    font-size: 0.78rem;
  }
  .err {
    color: var(--bad);
    font-size: 0.83rem;
    margin-top: 0.4rem;
  }
</style>
