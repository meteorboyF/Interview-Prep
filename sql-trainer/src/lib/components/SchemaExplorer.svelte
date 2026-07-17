<script lang="ts">
  import { SCHEMA } from '../db/schemaMetadata';
  import { db } from '../db/database';
  import RelationshipDiagram from './RelationshipDiagram.svelte';
  import TableDetail from './TableDetail.svelte';

  let { initialTable = null }: { initialTable?: string | null } = $props();

  let selected: string | null = $state(null);
  let counts: Record<string, number> = $state({});

  $effect(() => {
    if (initialTable) selected = initialTable;
  });

  $effect(() => {
    // one query for all table counts
    const sql = SCHEMA.map((t) => `SELECT '${t.name}' AS t, COUNT(*) AS n FROM ${t.name}`).join('\nUNION ALL\n') + ';';
    db.exec('learning', sql)
      .then((r) => {
        const map: Record<string, number> = {};
        for (const [t, n] of r.statements[0].rows as [string, number][]) map[t] = n;
        counts = map;
      })
      .catch(() => {});
  });
</script>

<div class="explorer">
  <h2>Dataset Explorer</h2>
  <p class="muted">
    The canonical HR training dataset: ten related tables, ~25,000 rows, loaded into an in-browser SQLite database
    converted from the original MySQL/MariaDB file (<code>data/mysql/hr_training_dataset.sql</code>).
  </p>

  <RelationshipDiagram {selected} onselect={(t) => (selected = t)} />

  <div class="cards">
    {#each SCHEMA as t}
      <button class="card panel" class:active={selected === t.name} onclick={() => (selected = t.name)}>
        <div class="name"><code>{t.name}</code></div>
        <div class="count muted">{counts[t.name]?.toLocaleString() ?? '…'} rows · {t.columns.length} cols</div>
      </button>
    {/each}
  </div>

  {#if selected}
    <div class="panel detail-panel">
      <TableDetail tableName={selected} onselect={(t) => (selected = t)} />
    </div>
  {:else}
    <p class="muted">Select a table above to inspect its columns, keys, indexes and sample rows.</p>
  {/if}
</div>

<style>
  .explorer {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  h2 {
    margin: 0;
  }
  p {
    margin: 0;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.5rem;
  }
  .card {
    text-align: left;
    padding: 0.55rem 0.7rem;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .card.active {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .name code {
    background: transparent;
    border: none;
    padding: 0;
    font-weight: 600;
  }
  .count {
    font-size: 0.75rem;
  }
  .detail-panel {
    padding: 1rem;
  }
</style>
