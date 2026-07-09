<script lang="ts">
  interface Table { section: string; columns: string[]; rows: string[][]; }
  interface Props { tables: Table[]; }
  let { tables }: Props = $props();

  let filter = $state('');
  // sort state per table index: { col, dir }
  let sorts = $state<Record<number, { col: number; dir: 1 | -1 }>>({});

  function toggleSort(ti: number, col: number) {
    const cur = sorts[ti];
    if (cur && cur.col === col) sorts = { ...sorts, [ti]: { col, dir: cur.dir === 1 ? -1 : 1 } };
    else sorts = { ...sorts, [ti]: { col, dir: 1 } };
  }

  // Rank Big-O strings for meaningful sorting.
  const RANK = ['o(1)', 'o(log n)', 'o(α', 'o(n)', 'o(n log n)', 'o(n^2)', 'o(v^2)', 'o(2^n)', 'o(n!)'];
  function complexityRank(s: string): number {
    const t = s.toLowerCase().replace(/\s+/g, ' ');
    for (let i = 0; i < RANK.length; i++) if (t.includes(RANK[i])) return i;
    return 50;
  }
  function cmp(a: string, b: string): number {
    const ra = complexityRank(a), rb = complexityRank(b);
    if (ra !== 50 || rb !== 50) return ra - rb;
    const na = parseFloat(a), nb = parseFloat(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  }

  function processed(t: Table, ti: number) {
    const q = filter.trim().toLowerCase();
    let rows = t.rows;
    if (q) rows = rows.filter((r) => r.some((c) => c.toLowerCase().includes(q)) || t.section.toLowerCase().includes(q));
    const s = sorts[ti];
    if (s) rows = [...rows].sort((r1, r2) => cmp(r1[s.col] ?? '', r2[s.col] ?? '') * s.dir);
    return rows;
  }

  const visible = $derived(
    tables.map((t, ti) => ({ t, ti, rows: processed(t, ti) })).filter((x) => x.rows.length > 0)
  );
</script>

<div class="cx">
  <div class="cx-filter">
    <input type="search" placeholder="Filter algorithms, operations, complexities…" bind:value={filter} aria-label="Filter complexity tables" />
    {#if filter}<button class="btn" onclick={() => (filter = '')}>Clear</button>{/if}
  </div>
  <p class="cx-tip">Click any column header to sort. Big-O values sort by growth rate, not alphabetically.</p>

  {#if !visible.length}
    <p class="empty">Nothing matches “{filter}”.</p>
  {/if}

  {#each visible as { t, ti, rows } (t.section)}
    <section class="cx-table-block">
      <h3 id={t.section.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}>{t.section}</h3>
      <div class="cx-scroll">
        <table>
          <thead>
            <tr>
              {#each t.columns as col, ci}
                <th onclick={() => toggleSort(ti, ci)} class:sorted={sorts[ti]?.col === ci} aria-sort={sorts[ti]?.col === ci ? (sorts[ti].dir === 1 ? 'ascending' : 'descending') : 'none'}>
                  {col}
                  <span class="arrow">{sorts[ti]?.col === ci ? (sorts[ti].dir === 1 ? '▲' : '▼') : '⇅'}</span>
                </th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each rows as row (row.join('|'))}
              <tr>{#each row as cell, ci}<td class:first={ci === 0}>{cell}</td>{/each}</tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  {/each}
</div>

<style>
  .cx-filter { display: flex; gap: 0.6rem; margin-bottom: 0.5rem; }
  .cx-filter input { flex: 1; font: inherit; padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }
  .cx-tip { font-size: 0.8rem; color: var(--text-faint); margin: 0 0 1.5rem; }
  .cx-table-block { margin-bottom: 2rem; }
  .cx-table-block h3 { margin: 0 0 0.7rem; scroll-margin-top: 5rem; }
  .cx-scroll { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-sm); }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th, td { padding: 0.55rem 0.8rem; text-align: left; border-bottom: 1px solid var(--border-soft); }
  th {
    background: var(--bg-soft); font-weight: 700; cursor: pointer; user-select: none;
    white-space: nowrap; position: sticky; top: 0;
  }
  th:hover { background: var(--border-soft); }
  th.sorted { color: var(--accent); }
  .arrow { font-size: 0.7rem; opacity: 0.6; margin-left: 0.2rem; }
  td.first { font-weight: 600; }
  tbody tr:hover td { background: var(--bg-soft); }
  tbody tr:last-child td { border-bottom: none; }
  .empty { text-align: center; color: var(--text-soft); padding: 2rem; }
</style>
