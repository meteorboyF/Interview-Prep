<script lang="ts">
  // Interactive relational-algebra playground: selection (σ) and projection (π).
  type Row = { id: number; name: string; gpa: number; major: string };
  const students: Row[] = [
    { id: 1, name: 'Ana', gpa: 3.8, major: 'CS' },
    { id: 2, name: 'Ben', gpa: 2.9, major: 'EE' },
    { id: 3, name: 'Cara', gpa: 3.4, major: 'CS' },
    { id: 4, name: 'Dan', gpa: 3.1, major: 'ME' },
    { id: 5, name: 'Eve', gpa: 2.5, major: 'EE' },
  ];
  const cols = ['id', 'name', 'gpa', 'major'] as const;

  let op = $state<'select' | 'project'>('select');
  let threshold = $state(3.0);
  let picked = $state<Record<string, boolean>>({ id: false, name: true, gpa: false, major: true });

  const keptRows = $derived(students.map((r) => ({ r, keep: r.gpa >= threshold })));
  const projCols = $derived(cols.filter((c) => picked[c]));
  const projRows = $derived.by(() => {
    const seen = new Set<string>();
    const out: Record<string, any>[] = [];
    for (const r of students) {
      const sub: Record<string, any> = {};
      projCols.forEach((c) => (sub[c] = (r as any)[c]));
      const key = JSON.stringify(sub);
      if (!seen.has(key)) { seen.add(key); out.push(sub); }
    }
    return out;
  });
  const expr = $derived(op === 'select' ? `σ gpa ≥ ${threshold.toFixed(1)} (Students)` : `π ${projCols.join(', ') || '∅'} (Students)`);
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label>Operation
      <select bind:value={op}>
        <option value="select">Selection σ (filter rows)</option>
        <option value="project">Projection π (pick columns, distinct)</option>
      </select>
    </label>
    {#if op === 'select'}
      <label>gpa ≥ <input type="range" min="2" max="4" step="0.1" bind:value={threshold} /><span class="val">{threshold.toFixed(1)}</span></label>
    {:else}
      <div class="cols">Columns:
        {#each cols as c}
          <label class="chk"><input type="checkbox" bind:checked={picked[c]} /> {c}</label>
        {/each}
      </div>
    {/if}
    <code class="expr">{expr}</code>
  </div>

  <div class="ra-stage">
    <div class="tbl">
      <div class="tbl-name">Students</div>
      <table>
        <thead><tr>{#each cols as c}<th class:dim={op === 'project' && !picked[c]}>{c}</th>{/each}</tr></thead>
        <tbody>
          {#each keptRows as { r, keep }}
            <tr class:drop={op === 'select' && !keep}>
              {#each cols as c}<td class:dim={op === 'project' && !picked[c]}>{(r as any)[c]}</td>{/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="arrow">→</div>
    <div class="tbl result">
      <div class="tbl-name">Result</div>
      {#if op === 'select'}
        <table>
          <thead><tr>{#each cols as c}<th>{c}</th>{/each}</tr></thead>
          <tbody>
            {#each keptRows.filter((x) => x.keep) as { r }}
              <tr class="match">{#each cols as c}<td>{(r as any)[c]}</td>{/each}</tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <table>
          <thead><tr>{#each projCols as c}<th>{c}</th>{/each}</tr></thead>
          <tbody>
            {#each projRows as row}
              <tr class="match">{#each projCols as c}<td>{row[c]}</td>{/each}</tr>
            {/each}
            {#if !projCols.length}<tr><td class="empty">pick a column</td></tr>{/if}
          </tbody>
        </table>
        <p class="hint">Projection removes duplicate rows (set semantics).</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .viz-toolbar { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; margin-bottom: 0.9rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  label:has(input[type='range']) { flex-direction: row; align-items: center; gap: 0.5rem; }
  .cols { display: flex; gap: 0.6rem; align-items: center; font-size: 0.8rem; color: var(--text-soft); flex-wrap: wrap; }
  .chk { flex-direction: row; align-items: center; gap: 0.2rem; }
  select { font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }
  input[type='range'] { accent-color: var(--accent); }
  .val { font-variant-numeric: tabular-nums; }
  .expr { font-size: 0.82rem; background: var(--code-bg); padding: 0.35rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-soft); color: var(--accent); font-weight: 700; }
  .ra-stage { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
  .tbl-name { font-size: 0.75rem; font-weight: 700; color: var(--accent); margin-bottom: 0.3rem; }
  table { border-collapse: collapse; font-size: 0.85rem; }
  th, td { border: 1px solid var(--border); padding: 0.25rem 0.6rem; text-align: left; transition: opacity 0.2s; }
  th { background: var(--bg-soft); font-weight: 700; }
  .dim { opacity: 0.25; }
  tr.drop { opacity: 0.3; text-decoration: line-through; }
  tr.match td { background: color-mix(in srgb, var(--viz-sorted) 15%, transparent); }
  .arrow { font-size: 1.4rem; color: var(--text-faint); }
  .empty { color: var(--text-faint); font-style: italic; }
  .hint { font-size: 0.76rem; color: var(--text-faint); margin: 0.4rem 0 0; }
</style>
